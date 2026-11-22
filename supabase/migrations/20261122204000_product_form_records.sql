-- Fluxo de cadastro sem obrigar um cálculo fictício.
create or replace function public.mc_save_product_record(
 p_workspace_id uuid,p_product_id uuid,p_name text,p_kind text,p_sku text,p_description text,p_sale_price numeric
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_version int;v_rev uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members where workspace_id=p_workspace_id and user_id=auth.uid() and active and role in ('owner','manager','operator')) then raise exception 'Sem autorização na oficina';end if;
 if p_name is null or length(btrim(p_name)) not between 2 and 150 or p_kind not in ('product','component') or length(coalesce(p_sku,''))>100 or length(coalesce(p_description,''))>2000 then raise exception 'Dados do produto inválidos';end if;
 if p_sale_price is not null and (p_sale_price<0 or p_sale_price>100000000) then raise exception 'Preço inválido';end if;
 if p_product_id is null then
   insert into public.mc_products(workspace_id,name,sku,description,kind,sale_price) values(p_workspace_id,btrim(p_name),nullif(btrim(p_sku),''),nullif(btrim(p_description),''),p_kind,p_sale_price) returning id into v_id;
   v_version:=1;
 else
   perform 1 from public.mc_products where id=p_product_id and workspace_id=p_workspace_id and active and kind in ('product','component') for update;
   if not found then raise exception 'Produto não encontrado';end if;
   v_id:=p_product_id;
   update public.mc_products set name=btrim(p_name),sku=nullif(btrim(p_sku),''),description=nullif(btrim(p_description),''),kind=p_kind,sale_price=p_sale_price where id=v_id and workspace_id=p_workspace_id;
   select coalesce(max(revision),0)+1 into v_version from public.mc_product_revisions where product_id=v_id and workspace_id=p_workspace_id;
 end if;
 insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes) values(p_workspace_id,v_id,v_version,'draft','Ficha do produto revisada') returning id into v_rev;
 insert into public.mc_cost_snapshots(workspace_id,product_id,revision_id,formula_version,quantity,total_cost,cost_status,parameters)
 values(p_workspace_id,v_id,v_rev,'maker-manual-product-v1',1,null,'unknown',jsonb_build_object('origin','product-form','revision',v_version));
 return v_id;
end $$;
revoke all on function public.mc_save_product_record(uuid,uuid,text,text,text,text,numeric) from public,anon;
grant execute on function public.mc_save_product_record(uuid,uuid,text,text,text,text,numeric) to authenticated;
