-- Aplicada ao projeto MakerCusto em 21/11/2026. Salva produto, revisão e snapshot atomicamente.
create or replace function public.mc_save_calculated_product(
 p_workspace_id uuid,p_name text,p_kind text,p_sku text,p_description text,
 p_sale_price numeric,p_quantity numeric,p_total_cost numeric,p_parameters jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_product uuid; v_revision uuid;
begin
 if v_user is null then raise exception 'Faça login para salvar um produto'; end if;
 if not exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id and m.user_id=v_user and m.active and m.role in ('owner','manager','operator')) then raise exception 'Sem permissão para salvar nesta oficina'; end if;
 if p_name is null or length(btrim(p_name))<2 or length(btrim(p_name))>150 then raise exception 'Nome do produto deve ter entre 2 e 150 caracteres'; end if;
 if p_kind not in ('product','component','kit') or p_kind is null then raise exception 'Tipo de produto inválido'; end if;
 if p_sale_price is null or p_sale_price<0 or p_sale_price>100000000 then raise exception 'Preço inválido'; end if;
 if p_quantity is null or p_quantity<1 or p_quantity>1000000 or p_quantity<>trunc(p_quantity) then raise exception 'Quantidade inválida'; end if;
 if p_total_cost is null or p_total_cost<0 or p_total_cost>100000000 then raise exception 'Custo inválido'; end if;
 if p_parameters is null or jsonb_typeof(p_parameters)<>'object' or octet_length(p_parameters::text)>65536 then raise exception 'Parâmetros inválidos'; end if;
 if length(coalesce(p_sku,''))>100 or length(coalesce(p_description,''))>2000 then raise exception 'Texto muito longo'; end if;
 insert into public.mc_products(workspace_id,name,sku,kind,description,sale_price)
 values(p_workspace_id,btrim(p_name),nullif(btrim(p_sku),''),p_kind,nullif(btrim(p_description),''),round(p_sale_price,2)) returning id into v_product;
 insert into public.mc_product_revisions(workspace_id,product_id,revision,state,notes)
 values(p_workspace_id,v_product,1,'draft','Versão inicial criada na calculadora') returning id into v_revision;
 insert into public.mc_cost_snapshots(workspace_id,product_id,revision_id,formula_version,currency,quantity,total_cost,cost_status,parameters)
 values(p_workspace_id,v_product,v_revision,'maker-v1','BRL',p_quantity,round(p_total_cost,2),'estimated',p_parameters);
 return v_product;
end $$;
revoke all on function public.mc_save_calculated_product(uuid,text,text,text,text,numeric,numeric,numeric,jsonb) from public,anon;
grant execute on function public.mc_save_calculated_product(uuid,text,text,text,text,numeric,numeric,numeric,jsonb) to authenticated;
revoke execute on function public.mc_create_workspace(text) from public,anon;
revoke execute on function public.mc_finance(uuid) from public,anon;
revoke execute on function public.mc_member(uuid) from public,anon;
revoke execute on function public.mc_role(uuid) from public,anon;
