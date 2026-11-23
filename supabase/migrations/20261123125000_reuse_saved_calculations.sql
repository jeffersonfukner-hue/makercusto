-- MakerCusto: selecionar cálculos próprios para reutilizar parâmetros (não altera snapshot).
-- Somente branch/CI. Conjuntos com mesa mista seguem com rateio P05 pendente.
create or replace function public.mc_list_saved_calculations(p_workspace_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select case when exists(select 1 from public.mc_members m
  where m.workspace_id=p_workspace_id and m.user_id=auth.uid()
    and m.active and m.role in ('owner','manager','operator')) then
 coalesce((select jsonb_agg(jsonb_build_object(
  'product_id',p.id,'name',p.name,'kind',p.kind,'sku',p.sku,
  'snapshot_id',snap.id,'unit_cost',round(snap.total_cost/nullif(snap.quantity,0),4),
  'saved_input',snap.parameters->'saved_input',
  'saved_at',snap.confirmed_at
 ) order by snap.confirmed_at desc,p.name,p.id)
 from public.mc_products p
 join lateral (
  select s.id,s.total_cost,s.quantity,s.parameters,s.confirmed_at
  from public.mc_cost_snapshots s
  where s.workspace_id=p.workspace_id and s.product_id=p.id
   and s.parameters->>'origin'='calculator'
   and jsonb_typeof(s.parameters->'saved_input')='object'
  order by s.confirmed_at desc,s.id desc limit 1
 ) snap on true
 where p.workspace_id=p_workspace_id and p.kind in ('component','product')
  and p.active),'[]'::jsonb) else '[]'::jsonb end
$$;
revoke all on function public.mc_list_saved_calculations(uuid) from public,anon;
grant execute on function public.mc_list_saved_calculations(uuid) to authenticated;
