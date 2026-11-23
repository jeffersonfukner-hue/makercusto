-- MakerCusto: S01/S04 — conjunto reutiliza peças existentes pelo ID da oficina.
-- Somente branch/CI. NÃO aplicar ao Supabase operacional sem autorização específica.
-- Uma placa pode produzir várias peças diferentes; nenhum rateio de mesa é inferido.
create unique index if not exists mc_product_components_id_workspace_unique
 on public.mc_product_components(id,workspace_id);
create table if not exists public.mc_assembly_part_snapshots (
 workspace_id uuid not null references public.mc_workspaces(id) on delete cascade,
 component_row_id uuid not null,
 component_product_id uuid not null,
 component_name_at_revision text not null,
 source_snapshot_id uuid,
 grams_per_unit numeric(18,3) check (grams_per_unit >= 0),
 cost_per_unit numeric(18,4) check (cost_per_unit >= 0),
 cost_status text not null check (cost_status in ('unknown','estimated','known')),
 source_type text not null check (source_type in ('linked_product','inline_entry')),
 created_at timestamptz not null default now(),
 primary key(component_row_id),
 foreign key(component_row_id,workspace_id)
   references public.mc_product_components(id,workspace_id),
 foreign key(component_product_id,workspace_id)
   references public.mc_products(id,workspace_id),
 foreign key(source_snapshot_id,workspace_id)
   references public.mc_cost_snapshots(id,workspace_id)
);
create index if not exists mc_assembly_part_snapshots_workspace_product
 on public.mc_assembly_part_snapshots(workspace_id,component_product_id);
alter table public.mc_assembly_part_snapshots enable row level security;
revoke all on public.mc_assembly_part_snapshots from public,anon,authenticated;
grant select on public.mc_assembly_part_snapshots to authenticated;
create policy mc_assembly_part_snapshots_read on public.mc_assembly_part_snapshots
 for select to authenticated using (
 exists(select 1 from public.mc_members m where m.workspace_id=mc_assembly_part_snapshots.workspace_id
 and m.user_id=(select auth.uid()) and m.active));

create or replace function public.mc_list_component_library(p_workspace_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select case when exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
 and m.user_id=auth.uid() and m.active) then
 coalesce((select jsonb_agg(jsonb_build_object(
  'id',p.id,'name',p.name,'sku',p.sku,
  'unit_cost',case when s.quantity>0 then round(s.total_cost/s.quantity,4) else null end,
  'grams',case
    when s.quantity>0 and jsonb_typeof(s.parameters#>'{calculated_result,modelGrams}')='number'
    then round((s.parameters#>>'{calculated_result,modelGrams}')::numeric/s.quantity,3)
    when s.quantity>0 and jsonb_typeof(s.parameters#>'{saved_input,grams}')='number'
    then round((s.parameters#>>'{saved_input,grams}')::numeric/s.quantity,3)
    else null end,
  'cost_source',case when s.id is null then 'unknown' else 'snapshot' end
 ) order by p.name,p.id)
 from public.mc_products p
 left join lateral (
  select x.id,x.quantity,x.total_cost,x.parameters
  from public.mc_cost_snapshots x
  where x.workspace_id=p.workspace_id and x.product_id=p.id
  and x.parameters->>'assembly_id' is null
  and x.total_cost is not null
  order by x.confirmed_at desc,x.id desc limit 1
 ) s on true
 where p.workspace_id=p_workspace_id and p.kind in ('component','product') and p.active),'[]'::jsonb)
 else '[]'::jsonb end
$$;
revoke all on function public.mc_list_component_library(uuid) from public,anon;
grant execute on function public.mc_list_component_library(uuid) to authenticated;

create or replace function public.mc_save_assembly_linked(
 p_workspace_id uuid,p_product_id uuid,p_name text,p_sku text,p_description text,
 p_sale_price numeric,p_parts jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 v_kit uuid;v_rev uuid;v_revision integer;v_row uuid;
 v_entry jsonb;v_component uuid;v_component_name text;v_source uuid;
 v_name text;v_notes text;v_qty numeric;v_grams numeric;v_cost numeric;
 v_total numeric:=0;v_all boolean:=true;v_status text;
 v_count integer;v_is_linked boolean;
 v_snapshot public.mc_cost_snapshots%rowtype;
 v_saved_grams text;v_cost_text text;v_grams_text text;
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m
  where m.workspace_id=p_workspace_id and m.user_id=auth.uid() and m.active
   and m.role in ('owner','manager','operator')) then
  raise exception 'Sem autorização para compor conjunto'; end if;
 if p_name is null or length(btrim(p_name)) not between 2 and 150
 or length(coalesce(p_sku,''))>100 or length(coalesce(p_description,''))>2000
 or (p_sale_price is not null and (p_sale_price<0 or p_sale_price>100000000))
 then raise exception 'Dados do conjunto inválidos';end if;
 if p_parts is null or jsonb_typeof(p_parts)<>'array' then raise exception 'Composição inválida';end if;
 v_count:=jsonb_array_length(p_parts);
 if v_count not between 2 and 30 or octet_length(p_parts::text)>30000
 then raise exception 'Conjunto deve ter entre duas e trinta linhas'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 if p_product_id is null then
  insert into public.mc_products(workspace_id,name,sku,kind,description,sale_price)
   values(p_workspace_id,btrim(p_name),nullif(btrim(coalesce(p_sku,'')),''),
   'kit',nullif(btrim(coalesce(p_description,'')),''),p_sale_price)
  returning id into v_kit;
  v_revision:=1;
 else
  perform 1 from public.mc_products
  where id=p_product_id and workspace_id=p_workspace_id and kind='kit' and active for update;
  if not found then raise exception 'Conjunto não encontrado';end if;
  v_kit:=p_product_id;
  update public.mc_products set name=btrim(p_name),sku=nullif(btrim(coalesce(p_sku,'')),''),
   description=nullif(btrim(coalesce(p_description,'')),''),sale_price=p_sale_price
  where workspace_id=p_workspace_id and id=v_kit;
  select coalesce(max(revision),0)+1 into v_revision from public.mc_product_revisions
   where workspace_id=p_workspace_id and product_id=v_kit;
 end if;
 insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes)
  values(p_workspace_id,v_kit,v_revision,'draft','Composição com referências de peças reutilizáveis')
 returning id into v_rev;
 for v_entry in select value from jsonb_array_elements(p_parts) loop
  if jsonb_typeof(v_entry)<>'object' or coalesce(v_entry->>'quantity','') !~ '^[0-9]{1,6}$'
  then raise exception 'Linha ou quantidade inválida';end if;
  v_qty:=(v_entry->>'quantity')::numeric;
  if v_qty<1 or v_qty>100000 then raise exception 'Quantidade de peça inválida';end if;
  v_notes:=nullif(btrim(coalesce(v_entry->>'notes','')),'');
  if length(coalesce(v_notes,''))>1000 then raise exception 'Observações muito longas';end if;
  v_is_linked:=nullif(v_entry->>'product_id','') is not null;
  v_component:=null;
  v_source:=null;
  v_cost:=null;
  v_grams:=null;
  if v_is_linked then
   begin v_component:=(v_entry->>'product_id')::uuid;
   exception when others then raise exception 'ID da peça inválido';end;
   select name into v_component_name from public.mc_products
   where id=v_component and workspace_id=p_workspace_id and active and kind='component';
   if not found then raise exception 'Peça inexistente, não ativa ou de outra oficina';end if;
   select * into v_snapshot from public.mc_cost_snapshots x
   where x.workspace_id=p_workspace_id and x.product_id=v_component
   and x.total_cost is not null and x.parameters->>'assembly_id' is null
   order by x.confirmed_at desc,x.id desc limit 1;
   if found then
    v_source:=v_snapshot.id;
    if v_snapshot.quantity>0 then
     v_cost:=round(v_snapshot.total_cost/v_snapshot.quantity,4);
     v_saved_grams:=v_snapshot.parameters#>>'{calculated_result,modelGrams}';
     if v_saved_grams is null then
      v_saved_grams:=v_snapshot.parameters#>>'{saved_input,grams}';
     end if;
     if v_saved_grams ~ '^[0-9]{1,8}(\.[0-9]{1,6})?$' then
      v_grams:=round(v_saved_grams::numeric/v_snapshot.quantity,3);
     end if;
    end if;
   end if;
   v_status:=case when v_cost is null then 'unknown' else 'estimated' end;
  else
   v_name:=btrim(coalesce(v_entry->>'name',''));
   if length(v_name) not between 2 and 150 then
    raise exception 'Informe nome válido para peça nova';end if;
   v_cost_text:=nullif(v_entry->>'unit_cost','');
   v_grams_text:=nullif(v_entry->>'grams','');
   if v_cost_text is not null and
    (v_cost_text !~ '^[0-9]{1,8}(\.[0-9]{1,4})?$' or v_cost_text::numeric>100000000)
    then raise exception 'Custo por unidade inválido';end if;
   if v_grams_text is not null and
    (v_grams_text !~ '^[0-9]{1,6}(\.[0-9]{1,3})?$' or v_grams_text::numeric>100000)
    then raise exception 'Peso por unidade inválido';end if;
   v_cost:=v_cost_text::numeric;
   v_grams:=v_grams_text::numeric;
   v_status:=case when v_cost is null then 'unknown' else 'estimated' end;
   v_component_name:=v_name;
   insert into public.mc_products(workspace_id,name,kind,description)
   values(p_workspace_id,v_name,'component',v_notes) returning id into v_component;
   insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes)
   values(p_workspace_id,v_component,1,'draft','Peça manual criada na composição');
   insert into public.mc_cost_snapshots(
    workspace_id,product_id,formula_version,quantity,total_cost,cost_status,parameters)
   values(p_workspace_id,v_component,'maker-assembly-inline-v3',1,
    v_cost,v_status,jsonb_build_object('origin','manual-component-revision',
    'assembly_id',v_kit,'revision',v_revision,'grams',v_grams,'notes',v_notes));
  end if;
  insert into public.mc_product_components(
   workspace_id,revision_id,component_product_id,quantity,unit,notes)
  values(p_workspace_id,v_rev,v_component,v_qty,'unit',v_notes) returning id into v_row;
  insert into public.mc_assembly_part_snapshots(
   workspace_id,component_row_id,component_product_id,component_name_at_revision,source_snapshot_id,
   grams_per_unit,cost_per_unit,cost_status,source_type)
  values(p_workspace_id,v_row,v_component,v_component_name,v_source,v_grams,v_cost,v_status,
   case when v_is_linked then 'linked_product' else 'inline_entry' end);
  if v_cost is null then v_all:=false;
  else v_total:=v_total+v_cost*v_qty;end if;
 end loop;
 insert into public.mc_cost_snapshots(
  workspace_id,product_id,revision_id,formula_version,quantity,total_cost,cost_status,parameters)
 values(p_workspace_id,v_kit,v_rev,'maker-assembly-linked-v3',1,
  case when v_all then round(v_total,2) else null end,
  case when v_all then 'estimated' else 'unknown' end,
  jsonb_build_object('origin','assembly-revision','revision',v_revision,
    'parts_count',v_count,'cost_source','per-part-immutable-snapshot',
    'same_plate_cost_allocation','not_inferred'));
 return v_kit;
end $$;
revoke all on function public.mc_save_assembly_linked(uuid,uuid,text,text,text,numeric,jsonb)
 from public,anon;
grant execute on function public.mc_save_assembly_linked(uuid,uuid,text,text,text,numeric,jsonb)
 to authenticated;

create or replace function public.mc_list_assemblies(p_workspace_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
select coalesce(jsonb_agg(
 jsonb_build_object(
  'id',p.id,'name',p.name,'sku',p.sku,'description',p.description,
  'sale_price',p.sale_price,'created_at',p.created_at,
  'revision',r.revision,'total_cost',cost.total_cost,
  'cost_status',coalesce(cost.cost_status,'unknown'),
  'parts',(select coalesce(jsonb_agg(jsonb_build_object(
   'id',piece.id,'product_id',case when aps.source_type='linked_product' then piece.id else null end,
   'name',coalesce(aps.component_name_at_revision,piece.name),'quantity',cp.quantity,'notes',cp.notes,
   'grams',coalesce(aps.grams_per_unit::text,legacy.parameters->>'grams'),
   'unit_cost',coalesce(aps.cost_per_unit,legacy.total_cost),
   'cost_source',case when aps.source_type='linked_product' then 'linked'
    when aps.source_type='inline_entry' then 'manual' else 'legacy' end
  ) order by cp.id),'[]'::jsonb)
  from public.mc_product_components cp
  join public.mc_products piece on piece.id=cp.component_product_id
   and piece.workspace_id=cp.workspace_id
  left join public.mc_assembly_part_snapshots aps
   on aps.component_row_id=cp.id and aps.workspace_id=cp.workspace_id
  left join lateral (
    select s.parameters,s.total_cost from public.mc_cost_snapshots s
    where aps.component_row_id is null and s.workspace_id=cp.workspace_id
     and s.product_id=piece.id and s.parameters->>'assembly_id'=p.id::text
     and (s.parameters->>'revision')::int=r.revision
    order by s.confirmed_at desc,s.id desc limit 1
  ) legacy on true
  where cp.revision_id=r.id and cp.workspace_id=p_workspace_id)
 ) order by p.created_at desc),'[]'::jsonb)
from public.mc_products p
join lateral (
 select id,revision from public.mc_product_revisions
 where product_id=p.id and workspace_id=p_workspace_id
 order by revision desc limit 1
) r on true
left join lateral (
 select total_cost,cost_status from public.mc_cost_snapshots
 where product_id=p.id and workspace_id=p_workspace_id and revision_id=r.id
 order by confirmed_at desc,id desc limit 1
) cost on true
where p.workspace_id=p_workspace_id and p.kind='kit' and p.active
and exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
 and m.user_id=auth.uid() and m.active)
$$;
revoke all on function public.mc_list_assemblies(uuid) from public,anon;
grant execute on function public.mc_list_assemblies(uuid) to authenticated;
