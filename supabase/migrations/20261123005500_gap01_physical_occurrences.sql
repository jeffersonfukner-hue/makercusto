-- MakerCusto GAP01-A (parcial): ocorrência física observada, ainda sem baixa contábil.
-- Somente branch e CI descartável. Aplicação no Supabase operacional exige autorização separada.
-- Não autoriza regularização, custo, entrada de estoque, liberação de reservas ou aprovação excepcional.
create table public.mc_physical_consumption_occurrences (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.mc_workspaces(id) on delete cascade,
 production_id uuid not null,
 possible_lot_id uuid,
 material_name text not null check(length(btrim(material_name)) between 2 and 150),
 quantity_g numeric(18,3) not null check(quantity_g>0 and quantity_g<=1000000),
 quantity_basis text not null check(quantity_basis in ('weighed','slicer','informed','other')),
 observed_at timestamptz not null,
 source_note text not null check(length(btrim(source_note)) between 10 and 1000),
 evidence_reference text,
 possible_origin_note text,
 reported_by uuid not null references auth.users(id),
 idempotency_key text not null check(length(idempotency_key) between 10 and 100),
 status text not null default 'registered'
  check(status in ('registered','under_review','pending_decision')),
 created_at timestamptz not null default now(),
 unique(id,workspace_id),
 unique(workspace_id,idempotency_key),
 foreign key(production_id,workspace_id) references public.mc_productions(id,workspace_id),
 foreign key(possible_lot_id,workspace_id) references public.mc_stock_lots(id,workspace_id),
 check(evidence_reference is null or length(evidence_reference) between 3 and 2000),
 check(possible_origin_note is null or length(possible_origin_note) between 3 and 1000)
);
create index mc_physical_occurrences_workspace_time on public.mc_physical_consumption_occurrences(workspace_id,created_at desc);
create index mc_physical_occurrences_production on public.mc_physical_consumption_occurrences(workspace_id,production_id);

alter table public.mc_physical_consumption_occurrences enable row level security;
revoke all on public.mc_physical_consumption_occurrences from public,anon,authenticated;
grant select on public.mc_physical_consumption_occurrences to authenticated;
create policy mc_physical_occurrences_read on public.mc_physical_consumption_occurrences
 for select to authenticated using (
 exists(select 1 from public.mc_members m where m.workspace_id=mc_physical_consumption_occurrences.workspace_id
  and m.user_id=(select auth.uid()) and m.active and m.role in ('owner','manager'))
);

create or replace function public.mc_record_physical_occurrence(
 p_workspace_id uuid,p_production_id uuid,p_material_name text,p_quantity_g numeric,
 p_quantity_basis text,p_observed_at timestamptz,p_source_note text,
 p_possible_lot_id uuid,p_evidence_reference text,p_possible_origin_note text,p_idempotency_key text
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 v_id uuid;
 v_previous public.mc_physical_consumption_occurrences%rowtype;
 v_material text := btrim(coalesce(p_material_name,''));
 v_source text := btrim(coalesce(p_source_note,''));
 v_evidence text := nullif(btrim(coalesce(p_evidence_reference,'')),'');
 v_origin text := nullif(btrim(coalesce(p_possible_origin_note,'')),'');
 v_print public.mc_productions%rowtype;
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m
  where m.workspace_id=p_workspace_id and m.user_id=auth.uid() and m.active
  and m.role in ('owner','manager')) then
  raise exception 'Sem autorização para registrar ocorrência física'; end if;
 if length(coalesce(p_idempotency_key,'')) not between 10 and 100 then
  raise exception 'Chave idempotente inválida';end if;
 if length(v_material) not between 2 and 150 or length(v_source) not between 10 and 1000
 or p_quantity_g is null or p_quantity_g<=0 or p_quantity_g>1000000
 or p_quantity_g<>round(p_quantity_g,3)
 or p_quantity_basis is null or p_quantity_basis not in ('weighed','slicer','informed','other')
 or p_observed_at is null or p_observed_at>now()+interval '5 minutes'
 or (v_evidence is not null and length(v_evidence) not between 3 and 2000)
 or (v_origin is not null and length(v_origin) not between 3 and 1000)
 then raise exception 'Dados da ocorrência inválidos';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 select * into v_previous from public.mc_physical_consumption_occurrences
 where workspace_id=p_workspace_id and idempotency_key=p_idempotency_key;
 if found then
  if v_previous.production_id=p_production_id and v_previous.material_name=v_material
   and v_previous.quantity_g=p_quantity_g and v_previous.quantity_basis=p_quantity_basis
   and v_previous.observed_at=p_observed_at and v_previous.source_note=v_source
   and v_previous.possible_lot_id is not distinct from p_possible_lot_id
   and v_previous.evidence_reference is not distinct from v_evidence
   and v_previous.possible_origin_note is not distinct from v_origin then
   return v_previous.id;end if;
  raise exception 'Chave reutilizada com dados diferentes';end if;
 select * into v_print from public.mc_productions
 where id=p_production_id and workspace_id=p_workspace_id for key share;
 if not found or v_print.kind<>'print' then
  raise exception 'Impressão inválida para ocorrência';end if;
 if p_possible_lot_id is not null and not exists(
  select 1 from public.mc_stock_lots l join public.mc_inventory_items i
    on i.id=l.item_id and i.workspace_id=l.workspace_id
  where l.id=p_possible_lot_id and l.workspace_id=p_workspace_id
   and i.kind='filament' and i.base_unit='g') then
  raise exception 'Bobina possível não pertence à oficina';end if;
 insert into public.mc_physical_consumption_occurrences (
  workspace_id,production_id,material_name,quantity_g,quantity_basis,
  observed_at,source_note,possible_lot_id,evidence_reference,
  possible_origin_note,reported_by,idempotency_key)
 values(p_workspace_id,p_production_id,v_material,p_quantity_g,p_quantity_basis,
  p_observed_at,v_source,p_possible_lot_id,v_evidence,v_origin,auth.uid(),p_idempotency_key)
 returning id into v_id;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,details)
 values(p_workspace_id,'physical_consumption_occurrence',v_id,'record_pending',auth.uid(),
  jsonb_build_object('production_id',p_production_id,'material_name',v_material,
   'quantity_g',p_quantity_g,'quantity_basis',p_quantity_basis,'observed_at',p_observed_at,
   'possible_lot_id',p_possible_lot_id,'source_note',v_source,
   'evidence_reference',v_evidence,'possible_origin_note',v_origin,
   'idempotency_key',p_idempotency_key,'inventory_effect','none',
   'cost_snapshot','not_confirmed'));
 return v_id;
end $$;
revoke all on function public.mc_record_physical_occurrence(
 uuid,uuid,text,numeric,text,timestamptz,text,uuid,text,text,text) from public,anon;
grant execute on function public.mc_record_physical_occurrence(
 uuid,uuid,text,numeric,text,timestamptz,text,uuid,text,text,text) to authenticated;

-- A consulta é apenas leitura. Nenhuma transição de status é liberada neste lote.
create or replace function public.mc_list_physical_occurrences(p_workspace_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select case when exists (
  select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')
 ) then coalesce((select jsonb_agg(jsonb_build_object(
  'id',o.id,'production_id',o.production_id,'material_name',o.material_name,
  'quantity_g',o.quantity_g,'quantity_basis',o.quantity_basis,'observed_at',o.observed_at,
  'source_note',o.source_note,'possible_lot_id',o.possible_lot_id,
  'possible_lot_label',l.label,'evidence_reference',o.evidence_reference,
  'possible_origin_note',o.possible_origin_note,'status',o.status,
  'reported_by',o.reported_by,'created_at',o.created_at) order by o.created_at desc)
 from public.mc_physical_consumption_occurrences o
 left join public.mc_stock_lots l on l.id=o.possible_lot_id and l.workspace_id=o.workspace_id
 where o.workspace_id=p_workspace_id),'[]'::jsonb) else '[]'::jsonb end
$$;
revoke all on function public.mc_list_physical_occurrences(uuid) from public,anon;
grant execute on function public.mc_list_physical_occurrences(uuid) to authenticated;
