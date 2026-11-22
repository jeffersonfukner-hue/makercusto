-- MakerCusto: conjunto de peças fabricadas, atômico e isolado por oficina.
create or replace function public.mc_create_assembly(
 p_workspace_id uuid, p_name text, p_sku text, p_description text,
 p_sale_price numeric, p_parts jsonb
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare
 v_product uuid; v_revision uuid; v_part uuid; v_part_revision uuid;
 v_entry jsonb; v_name text; v_qty numeric; v_notes text; v_grams numeric; v_count int; v_unit_cost numeric; v_all boolean:=true; v_total numeric:=0; v_cost_text text;
begin
 if auth.uid() is null or not exists (
  select 1 from public.mc_members m where m.workspace_id=p_workspace_id and m.user_id=auth.uid()
  and m.active and m.role in ('owner','manager','operator')
 ) then raise exception 'Sem autorização para cadastrar nesta oficina'; end if;
 if p_name is null or length(btrim(p_name)) not between 2 and 150 then raise exception 'Nome do conjunto inválido'; end if;
 if length(coalesce(p_sku,''))>100 or length(coalesce(p_description,''))>2000 then raise exception 'Texto muito longo'; end if;
 if p_sale_price is not null and (p_sale_price<0 or p_sale_price>100000000) then raise exception 'Preço de venda inválido'; end if;
 if p_parts is null or jsonb_typeof(p_parts)<>'array' then raise exception 'Peças devem ser uma lista'; end if;
 v_count := jsonb_array_length(p_parts);
 if v_count<2 or v_count>30 or octet_length(p_parts::text)>25000 then raise exception 'Informe entre 2 e 30 peças'; end if;
 -- Toda validação acontece antes da primeira escrita.
 for v_entry in select value from jsonb_array_elements(p_parts)
 loop
  if jsonb_typeof(v_entry)<>'object' then raise exception 'Peça inválida'; end if;
  v_name:=nullif(btrim(v_entry->>'name'),'');
  if v_name is null or length(v_name)>150 then raise exception 'Informe o nome de cada peça (máximo 150 caracteres)'; end if;
  if coalesce(v_entry->>'quantity','') !~ '^[0-9]{1,6}$' then raise exception 'Quantidade inteira inválida'; end if;
  v_qty:=(v_entry->>'quantity')::numeric;
  if v_qty<1 or v_qty>100000 then raise exception 'Quantidade inválida'; end if;
  if length(coalesce(v_entry->>'notes',''))>1000 then raise exception 'Observação muito longa'; end if;
  if v_entry ? 'grams' and v_entry->>'grams' is not null and v_entry->>'grams'<>'' then
   if (v_entry->>'grams') !~ '^[0-9]{1,7}(\.[0-9]{1,3})?$' then raise exception 'Peso inválido'; end if;
   v_grams:=(v_entry->>'grams')::numeric;
   if v_grams>100000 then raise exception 'Peso acima do limite'; end if;
  end if;
  v_cost_text:=nullif(v_entry->>'unit_cost','');
  if v_cost_text is not null and (v_cost_text !~ '^[0-9]{1,8}([.][0-9]{1,2})? or v_cost_text::numeric>100000000) then raise exception 'Custo por peça inválido';end if;
 end loop;
 insert into public.mc_products(workspace_id,name,sku,kind,description,sale_price)
 values(p_workspace_id,btrim(p_name),nullif(btrim(p_sku),''),'kit',nullif(btrim(p_description),''),p_sale_price)
 returning id into v_product;
 insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes)
 values(p_workspace_id,v_product,1,'draft','Conjunto de peças fabricadas') returning id into v_revision;
 for v_entry in select value from jsonb_array_elements(p_parts)
 loop
  v_name:=btrim(v_entry->>'name');
  v_qty:=(v_entry->>'quantity')::numeric;
  v_notes:=nullif(btrim(coalesce(v_entry->>'notes','')),'');
  v_cost_text:=nullif(v_entry->>'unit_cost','');
  if v_cost_text is null then v_all:=false; else v_unit_cost:=round(v_cost_text::numeric,2);v_total:=v_total+v_unit_cost*v_qty;end if;
  insert into public.mc_products(workspace_id,name,kind,description)
   values(p_workspace_id,v_name,'component',v_notes) returning id into v_part;
  insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes)
   values(p_workspace_id,v_part,1,'draft','Componente do conjunto') returning id into v_part_revision;
  insert into public.mc_product_components(workspace_id,revision_id,component_product_id,quantity,unit,notes)
   values(p_workspace_id,v_revision,v_part,v_qty,'unit',v_notes);
  insert into public.mc_cost_snapshots(workspace_id,product_id,revision_id,formula_version,quantity,total_cost,cost_status,parameters)
   values(p_workspace_id,v_part,v_part_revision,'maker-assembly-manual-v2',1,case when v_cost_text is null then null else v_unit_cost end,
    case when v_cost_text is null then 'unknown' else 'estimated' end,
    jsonb_build_object('origin','manual-component-revision','assembly_id',v_product,'revision',1,'grams',nullif(v_entry->>'grams',''),'notes',v_notes));
 end loop;
 insert into public.mc_cost_snapshots(workspace_id,product_id,revision_id,formula_version,quantity,total_cost,cost_status,parameters)
 values(p_workspace_id,v_product,v_revision,'maker-assembly-manual-v2',1,case when v_all then round(v_total,2) else null end,case when v_all then 'estimated' else 'unknown' end,
  jsonb_build_object('origin','assembly','parts_count',v_count,'pricing_status',case when v_all then 'user_informed' else 'not_calculated' end));
 return v_product;
end $$;
revoke all on function public.mc_create_assembly(uuid,text,text,text,numeric,jsonb) from public,anon;
grant execute on function public.mc_create_assembly(uuid,text,text,text,numeric,jsonb) to authenticated;

 or v_cost_text::numeric>100000000) then raise exception 'Custo por peça inválido';end if;
 end loop;
 insert into public.mc_products(workspace_id,name,sku,kind,description,sale_price)
 values(p_workspace_id,btrim(p_name),nullif(btrim(p_sku),''),'kit',nullif(btrim(p_description),''),p_sale_price)
 returning id into v_product;
 insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes)
 values(p_workspace_id,v_product,1,'draft','Conjunto de peças fabricadas') returning id into v_revision;
 for v_entry in select value from jsonb_array_elements(p_parts)
 loop
  v_name:=btrim(v_entry->>'name');
  v_qty:=(v_entry->>'quantity')::numeric;
  v_notes:=nullif(btrim(coalesce(v_entry->>'notes','')),'');
  v_cost_text:=nullif(v_entry->>'unit_cost','');
  if v_cost_text is null then v_all:=false; else v_unit_cost:=round(v_cost_text::numeric,2);v_total:=v_total+v_unit_cost*v_qty;end if;
  insert into public.mc_products(workspace_id,name,kind,description)
   values(p_workspace_id,v_name,'component',v_notes) returning id into v_part;
  insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes)
   values(p_workspace_id,v_part,1,'draft','Componente do conjunto') returning id into v_part_revision;
  insert into public.mc_product_components(workspace_id,revision_id,component_product_id,quantity,unit,notes)
   values(p_workspace_id,v_revision,v_part,v_qty,'unit',v_notes);
  insert into public.mc_cost_snapshots(workspace_id,product_id,revision_id,formula_version,quantity,total_cost,cost_status,parameters)
   values(p_workspace_id,v_part,v_part_revision,'maker-assembly-manual-v2',1,case when v_cost_text is null then null else v_unit_cost end,
    case when v_cost_text is null then 'unknown' else 'estimated' end,
    jsonb_build_object('origin','manual-component-revision','assembly_id',v_product,'revision',1,'grams',nullif(v_entry->>'grams',''),'notes',v_notes));
 end loop;
 insert into public.mc_cost_snapshots(workspace_id,product_id,revision_id,formula_version,quantity,total_cost,cost_status,parameters)
 values(p_workspace_id,v_product,v_revision,'maker-assembly-manual-v2',1,case when v_all then round(v_total,2) else null end,case when v_all then 'estimated' else 'unknown' end,
  jsonb_build_object('origin','assembly','parts_count',v_count,'pricing_status',case when v_all then 'user_informed' else 'not_calculated' end));
 return v_product;
end $$;
revoke all on function public.mc_create_assembly(uuid,text,text,text,numeric,jsonb) from public,anon;
grant execute on function public.mc_create_assembly(uuid,text,text,text,numeric,jsonb) to authenticated;

