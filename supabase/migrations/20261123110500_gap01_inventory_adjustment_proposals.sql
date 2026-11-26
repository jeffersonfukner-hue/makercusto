-- GAP01-C: propostas auditáveis de correção de inventário, SEM executar qualquer ajuste.
-- Apenas branch/CI. Nenhuma RPC de aprovar, executar, estornar ou alterar saldos.
create table public.mc_inventory_adjustment_proposals (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.mc_workspaces(id) on delete cascade,
 occurrence_id uuid not null,
 lot_id uuid not null,
 proposed_delta_g numeric(18,3) not null
   check(proposed_delta_g <> 0 and abs(proposed_delta_g) <= 1000000),
 cause text not null check(cause in ('unrecorded_physical_input','verified_count_error')),
 origin_note text not null check(length(btrim(origin_note)) between 10 and 2000),
 justification text not null check(length(btrim(justification)) between 10 and 2000),
 evidence_reference text not null check(length(btrim(evidence_reference)) between 3 and 2000),
 request_key text not null check(length(request_key) between 10 and 100),
 proposed_by uuid not null references auth.users(id),
 status text not null default 'pending_decision' check(status='pending_decision'),
 created_at timestamptz not null default now(),
 unique(id,workspace_id),unique(workspace_id,request_key),
 foreign key(occurrence_id,workspace_id) references public.mc_physical_consumption_occurrences(id,workspace_id),
 foreign key(lot_id,workspace_id) references public.mc_stock_lots(id,workspace_id)
);
create index mc_inventory_adjustment_proposals_by_occurrence
 on public.mc_inventory_adjustment_proposals(workspace_id,occurrence_id,created_at desc);
alter table public.mc_inventory_adjustment_proposals enable row level security;
revoke all on public.mc_inventory_adjustment_proposals from public,anon,authenticated;
grant select on public.mc_inventory_adjustment_proposals to authenticated;
create policy mc_inventory_adjustment_proposals_select on public.mc_inventory_adjustment_proposals
for select to authenticated using (
 exists(select 1 from public.mc_members m
 where m.workspace_id=mc_inventory_adjustment_proposals.workspace_id
 and m.user_id=(select auth.uid()) and m.active and m.role in ('owner','manager'))
);

create or replace function public.mc_propose_inventory_adjustment(
 p_workspace_id uuid,p_occurrence_id uuid,p_lot_id uuid,p_delta_g numeric,
 p_cause text,p_origin_note text,p_justification text,p_evidence_reference text,
 p_request_key text
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_existing public.mc_inventory_adjustment_proposals%rowtype;
 v_occ public.mc_physical_consumption_occurrences%rowtype;
 v_id uuid;
 v_origin text:=btrim(coalesce(p_origin_note,''));
 v_why text:=btrim(coalesce(p_justification,''));
 v_evidence text:=btrim(coalesce(p_evidence_reference,''));
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m
 where m.workspace_id=p_workspace_id and m.user_id=auth.uid() and m.active
 and m.role in ('owner','manager')) then
  raise exception 'Sem autorização para registrar proposta';end if;
 if length(coalesce(p_request_key,'')) not between 10 and 100
  or p_delta_g is null or p_delta_g=0 or abs(p_delta_g)>1000000
  or p_delta_g<>round(p_delta_g,3)
  or p_cause not in ('unrecorded_physical_input','verified_count_error')
  or length(v_origin) not between 10 and 2000
  or length(v_why) not between 10 and 2000
  or length(v_evidence) not between 3 and 2000 then
  raise exception 'Dados insuficientes para uma proposta verificável';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 select * into v_existing from public.mc_inventory_adjustment_proposals
 where workspace_id=p_workspace_id and request_key=p_request_key;
 if found then
  if v_existing.occurrence_id=p_occurrence_id and v_existing.lot_id=p_lot_id
  and v_existing.proposed_delta_g=p_delta_g and v_existing.cause=p_cause
  and v_existing.origin_note=v_origin and v_existing.justification=v_why
  and v_existing.evidence_reference=v_evidence then return v_existing.id;end if;
  raise exception 'Chave de proposta reutilizada com conteúdo diferente';end if;
 select * into v_occ from public.mc_physical_consumption_occurrences
 where workspace_id=p_workspace_id and id=p_occurrence_id for update;
 if not found or v_occ.status not in ('under_review','pending_decision') then
  raise exception 'Ocorrência precisa estar em investigação antes da proposta';end if;
 if not exists(select 1 from public.mc_physical_occurrence_reviews r
   where r.workspace_id=p_workspace_id and r.occurrence_id=p_occurrence_id) then
  raise exception 'Proposta exige histórico de investigação';end if;
 if not exists(select 1 from public.mc_stock_lots l
  join public.mc_inventory_items i on i.workspace_id=l.workspace_id and i.id=l.item_id
  where l.workspace_id=p_workspace_id and l.id=p_lot_id
  and i.kind='filament' and i.base_unit='g') then
  raise exception 'Proposta exige bobina cadastrada na própria oficina';end if;
 insert into public.mc_inventory_adjustment_proposals(
 workspace_id,occurrence_id,lot_id,proposed_delta_g,cause,origin_note,
 justification,evidence_reference,request_key,proposed_by)
 values(p_workspace_id,p_occurrence_id,p_lot_id,p_delta_g,p_cause,v_origin,
 v_why,v_evidence,p_request_key,auth.uid()) returning id into v_id;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,details)
 values(p_workspace_id,'inventory_adjustment_proposal',v_id,'propose_pending',auth.uid(),
 jsonb_build_object('occurrence_id',p_occurrence_id,'lot_id',p_lot_id,
 'delta_g',p_delta_g,'cause',p_cause,'origin_note',v_origin,
 'justification',v_why,'evidence_reference',v_evidence,
 'request_key',p_request_key,'approved',false,
 'inventory_effect','none','financial_effect','none'));
 return v_id;
end $$;
revoke all on function public.mc_propose_inventory_adjustment(
 uuid,uuid,uuid,numeric,text,text,text,text,text) from public,anon;
grant execute on function public.mc_propose_inventory_adjustment(
 uuid,uuid,uuid,numeric,text,text,text,text,text) to authenticated;

create or replace function public.mc_list_inventory_adjustment_proposals(p_workspace_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select case when exists(select 1 from public.mc_members m
 where m.workspace_id=p_workspace_id and m.user_id=auth.uid() and m.active
 and m.role in ('owner','manager')) then
 coalesce((select jsonb_agg(jsonb_build_object(
 'id',p.id,'occurrence_id',p.occurrence_id,'lot_id',p.lot_id,'lot_label',l.label,
 'proposed_delta_g',p.proposed_delta_g,'cause',p.cause,'origin_note',p.origin_note,
 'justification',p.justification,'evidence_reference',p.evidence_reference,
 'status',p.status,'proposed_by',p.proposed_by,'created_at',p.created_at)
 order by p.created_at desc,p.id) from public.mc_inventory_adjustment_proposals p
 join public.mc_stock_lots l on l.id=p.lot_id and l.workspace_id=p.workspace_id
 where p.workspace_id=p_workspace_id),'[]'::jsonb) else '[]'::jsonb end
$$;
revoke all on function public.mc_list_inventory_adjustment_proposals(uuid) from public,anon;
grant execute on function public.mc_list_inventory_adjustment_proposals(uuid) to authenticated;
