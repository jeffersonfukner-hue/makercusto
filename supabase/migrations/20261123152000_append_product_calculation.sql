-- MakerCusto: adicionar cálculo como revisão do MESMO produto/peça.
-- Somente GitHub/CI. Não aplicar no banco operacional sem autorização expressa.
create or replace function public.mc_append_product_calculation(
 p_workspace_id uuid,p_product_id uuid,p_request_key uuid,
 p_sale_price numeric,p_quantity numeric,p_total_cost numeric,p_parameters jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v_rev uuid;v_version integer;v_existing uuid;
begin
 if v_user is null or not exists(
  select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=v_user and m.active and m.role in ('owner','manager','operator')
 ) then raise exception 'Sem permissão para revisar o cálculo nesta oficina';end if;
 if p_request_key is null then raise exception 'Identificador da operação obrigatório';end if;
 if p_sale_price is null or p_sale_price<0 or p_sale_price>100000000
 or p_quantity is null or p_quantity<1 or p_quantity>1000000
 or p_quantity<>trunc(p_quantity)
 or p_total_cost is null or p_total_cost<0 or p_total_cost>100000000
 or p_parameters is null or jsonb_typeof(p_parameters)<>'object'
 or octet_length(p_parameters::text)>65536
 or jsonb_typeof(p_parameters->'saved_input')<>'object'
 or jsonb_typeof(p_parameters->'calculated_result')<>'object'
 then raise exception 'Parâmetros de cálculo inválidos';end if;
 perform 1 from public.mc_products p
 where p.id=p_product_id and p.workspace_id=p_workspace_id and p.active
 and p.kind in ('product','component') for update;
 if not found then raise exception 'Peça ou produto não encontrado nesta oficina';end if;
 -- A trava da ficha serializa revisões e requisições repetidas.
 select s.id into v_existing from public.mc_cost_snapshots s
 where s.workspace_id=p_workspace_id and s.product_id=p_product_id
 and s.parameters->>'append_request_key'=p_request_key::text
 order by s.confirmed_at desc,s.id desc limit 1;
 if v_existing is not null then return p_product_id;end if;
 select coalesce(max(revision),0)+1 into v_version
 from public.mc_product_revisions
 where workspace_id=p_workspace_id and product_id=p_product_id;
 insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes)
 values(p_workspace_id,p_product_id,v_version,'draft','Novo cálculo da ficha existente')
 returning id into v_rev;
 insert into public.mc_cost_snapshots(
  workspace_id,product_id,revision_id,formula_version,currency,
  quantity,total_cost,cost_status,parameters
 ) values(
  p_workspace_id,p_product_id,v_rev,'maker-v1','BRL',
  p_quantity,round(p_total_cost,2),'estimated',
  (p_parameters-'append_request_key')||jsonb_build_object(
   'append_request_key',p_request_key::text,'origin','calculator',
   'calculation_action','revision',
   'revision',v_version)
 );
 update public.mc_products set sale_price=round(p_sale_price,2)
 where id=p_product_id and workspace_id=p_workspace_id;
 return p_product_id;
end $$;
revoke all on function public.mc_append_product_calculation(uuid,uuid,uuid,numeric,numeric,numeric,jsonb)
 from public,anon;
grant execute on function public.mc_append_product_calculation(uuid,uuid,uuid,numeric,numeric,numeric,jsonb)
 to authenticated;
