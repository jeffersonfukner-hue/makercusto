-- GAP01-B/F — investigação versionada: alegações e evidências, SEM regularização.
-- Somente na branch e PostgreSQL CI. Não aplicar no banco operacional sem autorização.
-- Nenhuma transição para regularized, baixa, ajuste, estorno ou custo é implementada.
create table public.mc_physical_occurrence_reviews (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.mc_workspaces(id) on delete cascade,
 occurrence_id uuid not null,
 request_key text not null check(length(request_key) between 10 and 100),
 prior_status text not null check(prior_status in ('registered','under_review','pending_decision')),
 next_status text not null check(next_status in ('under_review','pending_decision')),
 cause_hypothesis text not null check(cause_hypothesis in ('unrecorded_input','lot_change','quantity_error','other','unknown')),
 finding_note text not null check(length(btrim(finding_note)) between 10 and 2000),
 evidence_reference text,
 possible_lot_id uuid,
 author_id uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 unique(id,workspace_id),unique(workspace_id,request_key),
 foreign key(occurrence_id,workspace_id) references public.mc_physical_consumption_occurrences(id,workspace_id),
 foreign key(possible_lot_id,workspace_id) references public.mc_stock_lots(id,workspace_id),
 check(evidence_reference is null or length(evidence_reference) between 3 and 2000)
);
create index mc_occ_review_history on public.mc_physical_occurrence_reviews(workspace_id,occurrence_id,created_at,id);
alter table public.mc_physical_occurrence_reviews enable row level security;
revoke all on public.mc_physical_occurrence_reviews from public,anon,authenticated;
grant select on public.mc_physical_occurrence_reviews to authenticated;
create policy mc_occ_reviews_read on public.mc_physical_occurrence_reviews for select to authenticated using (
 exists(select 1 from public.mc_members m where m.workspace_id=mc_physical_occurrence_reviews.workspace_id
 and m.user_id=(select auth.uid()) and m.active and m.role in ('owner','manager'))
);

create or replace function public.mc_review_physical_occurrence(
 p_workspace_id uuid,p_occurrence_id uuid,p_next_status text,
 p_cause_hypothesis text,p_finding_note text,p_evidence_reference text,
 p_possible_lot_id uuid,p_request_key text
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_occ public.mc_physical_consumption_occurrences%rowtype;
 v_old public.mc_physical_occurrence_reviews%rowtype;
 v_id uuid;
 v_note text := btrim(coalesce(p_finding_note,''));
 v_evidence text := nullif(btrim(coalesce(p_evidence_reference,'')),'');
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members
  where workspace_id=p_workspace_id and user_id=auth.uid() and active
    and role in ('owner','manager')) then
  raise exception 'Sem autorização para investigar ocorrência';end if;
 if length(coalesce(p_request_key,'')) not between 10 and 100
  or p_next_status not in ('under_review','pending_decision')
  or p_cause_hypothesis not in ('unrecorded_input','lot_change','quantity_error','other','unknown')
  or length(v_note) not between 10 and 2000
  or (v_evidence is not null and length(v_evidence) not between 3 and 2000) then
  raise exception 'Dados de investigação inválidos';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 select * into v_old from public.mc_physical_occurrence_reviews
  where workspace_id=p_workspace_id and request_key=p_request_key;
 if found then
  if v_old.occurrence_id=p_occurrence_id and v_old.next_status=p_next_status
    and v_old.cause_hypothesis=p_cause_hypothesis
    and v_old.finding_note=v_note
    and v_old.evidence_reference is not distinct from v_evidence
    and v_old.possible_lot_id is not distinct from p_possible_lot_id then return v_old.id;end if;
  raise exception 'Chave de investigação reutilizada com conteúdo diferente';end if;
 select * into v_occ from public.mc_physical_consumption_occurrences
  where workspace_id=p_workspace_id and id=p_occurrence_id for update;
 if not found then raise exception 'Ocorrência não encontrada na oficina';end if;
 if not (
  (v_occ.status='registered' and p_next_status='under_review') or
  (v_occ.status='under_review' and p_next_status='pending_decision') or
  (v_occ.status='pending_decision' and p_next_status='under_review')
 ) then raise exception 'Transição de acompanhamento não permitida';end if;
 if p_possible_lot_id is not null and not exists(
  select 1 from public.mc_stock_lots l join public.mc_inventory_items i
  on i.workspace_id=l.workspace_id and i.id=l.item_id
  where l.id=p_possible_lot_id and l.workspace_id=p_workspace_id
   and i.kind='filament' and i.base_unit='g'
 ) then raise exception 'Possível lote não pertence à oficina';end if;
 insert into public.mc_physical_occurrence_reviews(
  workspace_id,occurrence_id,request_key,prior_status,next_status,
  cause_hypothesis,finding_note,evidence_reference,possible_lot_id,author_id)
 values(p_workspace_id,p_occurrence_id,p_request_key,v_occ.status,p_next_status,
  p_cause_hypothesis,v_note,v_evidence,p_possible_lot_id,auth.uid()) returning id into v_id;
 update public.mc_physical_consumption_occurrences set status=p_next_status
 where workspace_id=p_workspace_id and id=p_occurrence_id;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,details)
 values(p_workspace_id,'physical_occurrence_review',v_id,'record_investigation',auth.uid(),
  jsonb_build_object('occurrence_id',p_occurrence_id,'previous_status',v_occ.status,
  'next_status',p_next_status,'cause_hypothesis',p_cause_hypothesis,
  'finding_note',v_note,'evidence_reference',v_evidence,'possible_lot_id',p_possible_lot_id,
  'request_key',p_request_key,'inventory_effect','none','financial_effect','none',
  'decision','not_approved'));
 return v_id;
end $$;
revoke all on function public.mc_review_physical_occurrence(uuid,uuid,text,text,text,text,uuid,text) from public,anon;
grant execute on function public.mc_review_physical_occurrence(uuid,uuid,text,text,text,text,uuid,text) to authenticated;

create or replace function public.mc_list_physical_occurrence_reviews(p_workspace_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select case when exists(select 1 from public.mc_members m
  where m.workspace_id=p_workspace_id and m.user_id=auth.uid() and m.active
  and m.role in ('owner','manager')) then
 coalesce((select jsonb_agg(jsonb_build_object(
  'id',r.id,'occurrence_id',r.occurrence_id,'prior_status',r.prior_status,
  'next_status',r.next_status,'cause_hypothesis',r.cause_hypothesis,
  'finding_note',r.finding_note,'evidence_reference',r.evidence_reference,
  'possible_lot_id',r.possible_lot_id,'possible_lot_label',l.label,
  'author_id',r.author_id,'created_at',r.created_at) order by r.created_at,r.id)
 from public.mc_physical_occurrence_reviews r
 left join public.mc_stock_lots l on l.id=r.possible_lot_id and l.workspace_id=r.workspace_id
 where r.workspace_id=p_workspace_id),'[]'::jsonb) else '[]'::jsonb end
$$;
revoke all on function public.mc_list_physical_occurrence_reviews(uuid) from public,anon;
grant execute on function public.mc_list_physical_occurrence_reviews(uuid) to authenticated;
