-- Conjuntos revisáveis: manter composições e snapshots históricos imutáveis.
create or replace function public.mc_update_assembly(
 p_workspace_id uuid,p_product_id uuid,p_name text,p_sku text,p_description text,
 p_sale_price numeric,p_parts jsonb
) returns integer language plpgsql security definer set search_path='' as $$
declare v_rev integer;v_rev_id uuid;v_entry jsonb;v_part uuid;v_old uuid;v_n text;v_qty numeric;v_notes text;v_grams numeric;v_unit_cost numeric;v_all boolean:=true;v_sum numeric:=0;v_price_text text;v_gtext text;v_count integer;v_seen uuid[]:='{}';v_amount numeric;
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id and m.user_id=auth.uid() and m.active and m.role in ('owner','manager','operator')) then raise exception 'Sem autorização nesta oficina';end if;
 perform 1 from public.mc_products p where p.id=p_product_id and p.workspace_id=p_workspace_id and p.kind='kit' and p.active for update;
 if not found then raise exception 'Conjunto não encontrado'; end if;
 if p_name is null or length(btrim(p_name)) not between 2 and 150 or length(coalesce(p_sku,''))>100 or length(coalesce(p_description,''))>2000 then raise exception 'Dados do conjunto inválidos';end if;
 if p_sale_price is not null and (p_sale_price<0 or p_sale_price>100000000) then raise exception 'Preço de venda inválido';end if;
 if p_parts is null or jsonb_typeof(p_parts)<>'array' then raise exception 'Lista de peças inválida';end if;
 v_count:=jsonb_array_length(p_parts);
 if v_count<2 or v_count>30 or octet_length(p_parts::text)>25000 then raise exception 'Informe entre 2 e 30 peças';end if;
 select coalesce(max(revision),0)+1 into v_rev from public.mc_product_revisions where workspace_id=p_workspace_id and product_id=p_product_id;
 -- Validar a lista inteira antes de criar a revisão.
 for v_entry in select value from jsonb_array_elements(p_parts) loop
  v_n:=nullif(btrim(v_entry->>'name'),'');
  if v_n is null or length(v_n)>150 or length(coalesce(v_entry->>'notes',''))>1000 then raise exception 'Nome/observação de peça inválido';end if;
  if coalesce(v_entry->>'quantity','') !~ '^[0-9]{1,6}$' then raise exception 'Quantidade inválida';end if;
  v_qty:=(v_entry->>'quantity')::numeric;
  if v_qty<1 or v_qty>100000 then raise exception 'Quantidade inválida';end if;
  v_gtext:=nullif(v_entry->>'grams','');
  if v_gtext is not null and (v_gtext !~ '^[0-9]{1,6}(\.[0-9]{1,3})?$' or v_gtext::numeric>100000) then raise exception 'Peso inválido';end if;
  v_price_text:=nullif(v_entry->>'unit_cost','');
  if v_price_text is not null and (v_price_text !~ '^[0-9]{1,8}(\.[0-9]{1,2})?$' or v_price_text::numeric>100000000) then raise exception 'Custo por peça inválido';end if;
  if nullif(v_entry->>'id','') is not null then
   begin v_part:=(v_entry->>'id')::uuid;exception when invalid_text_representation then raise exception 'Identificador de peça inválido';end;
   if v_part=any(v_seen) then raise exception 'Peça repetida';end if;
   if not exists(select 1 from public.mc_product_components c join public.mc_product_revisions r on r.id=c.revision_id where c.workspace_id=p_workspace_id and r.product_id=p_product_id and c.component_product_id=v_part) then raise exception 'Peça não pertence ao conjunto';end if;
   v_seen:=array_append(v_seen,v_part);
  end if;
 end loop;
 update public.mc_products set name=btrim(p_name),sku=nullif(btrim(p_sku),''),description=nullif(btrim(p_description),''),sale_price=p_sale_price where id=p_product_id and workspace_id=p_workspace_id;
 insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes) values(p_workspace_id,p_product_id,v_rev,'draft','Composição revisada') returning id into v_rev_id;
 for v_entry in select value from jsonb_array_elements(p_parts) loop
  v_n:=btrim(v_entry->>'name');v_qty:=(v_entry->>'quantity')::numeric;
  v_notes:=nullif(btrim(coalesce(v_entry->>'notes','')),'');
  v_part:=nullif(v_entry->>'id','')::uuid;
  if v_part is null then
    insert into public.mc_products(workspace_id,name,kind,description) values(p_workspace_id,v_n,'component',v_notes) returning id into v_part;
    insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes) values(p_workspace_id,v_part,1,'draft','Peça criada na revisão do conjunto');
  else
    update public.mc_products set name=v_n,description=v_notes where id=v_part and workspace_id=p_workspace_id;
  end if;
  insert into public.mc_product_components(workspace_id,revision_id,component_product_id,quantity,unit,notes)
    values(p_workspace_id,v_rev_id,v_part,v_qty,'unit',v_notes);
  v_price_text:=nullif(v_entry->>'unit_cost','');v_gtext:=nullif(v_entry->>'grams','');
  if v_price_text is null then
    v_all:=false;
  else
    v_unit_cost:=round(v_price_text::numeric,2);v_sum:=v_sum+v_unit_cost*v_qty;
  end if;
  insert into public.mc_cost_snapshots(workspace_id,product_id,formula_version,quantity,total_cost,cost_status,parameters)
   values(p_workspace_id,v_part,'maker-assembly-manual-v2',1,case when v_price_text is null then null else v_unit_cost end,
    case when v_price_text is null then 'unknown' else 'estimated' end,
    jsonb_build_object('origin','manual-component-revision','assembly_id',p_product_id,'revision',v_rev,'grams',v_gtext,'notes',v_notes,'cost_source',case when v_price_text is null then 'unknown' else 'user_informed' end));
 end loop;
 insert into public.mc_cost_snapshots(workspace_id,product_id,revision_id,formula_version,quantity,total_cost,cost_status,parameters)
  values(p_workspace_id,p_product_id,v_rev_id,'maker-assembly-manual-v2',1,
   case when v_all then round(v_sum,2) else null end,case when v_all then 'estimated' else 'unknown' end,
   jsonb_build_object('origin','assembly-revision','revision',v_rev,'parts_count',v_count,'cost_source','user_informed'));
 return v_rev;
end $$;
revoke all on function public.mc_update_assembly(uuid,uuid,text,text,text,numeric,jsonb) from public,anon;
grant execute on function public.mc_update_assembly(uuid,uuid,text,text,text,numeric,jsonb) to authenticated;

create or replace function public.mc_list_assemblies(p_workspace_id uuid)
returns jsonb language sql stable security definer set search_path=''
as $$
select coalesce(jsonb_agg(
 jsonb_build_object('id',p.id,'name',p.name,'sku',p.sku,'description',p.description,'sale_price',p.sale_price,'created_at',p.created_at,
 'revision',r.revision,'total_cost',cost.total_cost,'cost_status',coalesce(cost.cost_status,'unknown'),
 'parts',(select coalesce(jsonb_agg(jsonb_build_object(
  'id',piece.id,'name',piece.name,'quantity',cp.quantity,'notes',cp.notes,
  'grams',case when ps.parameters->>'grams' is null then null else ps.parameters->>'grams' end,
  'unit_cost',ps.total_cost
 ) order by cp.id),'[]'::jsonb)
 from public.mc_product_components cp
 join public.mc_products piece on piece.id=cp.component_product_id and piece.workspace_id=cp.workspace_id
 left join lateral (select s.parameters,s.total_cost from public.mc_cost_snapshots s where s.workspace_id=cp.workspace_id and s.product_id=piece.id and s.parameters->>'assembly_id'=p.id::text and (s.parameters->>'revision')::int=r.revision order by s.confirmed_at desc,s.id desc limit 1) ps on true
 where cp.revision_id=r.id and cp.workspace_id=p_workspace_id)
 ) order by p.created_at desc),'[]'::jsonb)
from public.mc_products p
join lateral (select id,revision from public.mc_product_revisions where product_id=p.id and workspace_id=p_workspace_id order by revision desc limit 1) r on true
left join lateral (select total_cost,cost_status from public.mc_cost_snapshots where product_id=p.id and workspace_id=p_workspace_id and revision_id=r.id order by confirmed_at desc,id desc limit 1) cost on true
where p.workspace_id=p_workspace_id and p.kind='kit' and p.active
and exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id and m.user_id=auth.uid() and m.active)
$$;
revoke all on function public.mc_list_assemblies(uuid) from public,anon;
grant execute on function public.mc_list_assemblies(uuid) to authenticated;
