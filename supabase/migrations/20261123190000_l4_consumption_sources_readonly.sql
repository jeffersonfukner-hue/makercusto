-- L4-R01: fontes históricas para prévia. Consulta SOMENTE LEITURA.
-- A precisão do preço unitário histórico é a de mc_confirm_print (6 decimais);
-- valores derivados NÃO são snapshots financeiros finais P06.
create or replace function public.mc_get_print_consumption_sources(
 p_workspace_id uuid,p_production_id uuid
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_lines jsonb;
begin
 if auth.uid() is null or not exists (
  select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')
 ) then raise exception 'Sem autorização para consultar fontes de custo';end if;
 if not exists(select 1 from public.mc_productions p where p.workspace_id=p_workspace_id
  and p.id=p_production_id) then raise exception 'Impressão inexistente nesta oficina';end if;
 select coalesce(jsonb_agg(jsonb_build_object(
  'consumption_id',c.id,'confirmation_id',c.confirmation_id,
  'lot_id',c.lot_id,'lot_label',l.label,
  'cost_status',coalesce(l.cost_status,'unknown'),
  'quantity_basis',c.quantity_basis,
  'model_g',c.model_quantity::text,
  'purge_g',c.purge_quantity::text,
  'loss_g',c.loss_quantity::text,
  'unit_cost_snapshot',c.unit_cost_snapshot::text,
  'model_cost_brl',case when c.unit_cost_snapshot is null then null else (c.model_quantity*c.unit_cost_snapshot)::text end,
  'purge_cost_brl',case when c.unit_cost_snapshot is null then null else (c.purge_quantity*c.unit_cost_snapshot)::text end,
  'loss_cost_brl',case when c.unit_cost_snapshot is null then null else (c.loss_quantity*c.unit_cost_snapshot)::text end,
  'author_id',pc.author_id,
  'confirmed_at',pc.confirmed_at,
  'precision_note','Preço unitário histórico limitado a 6 casas decimais; valor apenas indicativo até snapshot P06'
 ) order by pc.confirmed_at,c.id),'[]'::jsonb) into v_lines
 from public.mc_production_consumption c
 join public.mc_production_confirmations pc
  on pc.id=c.confirmation_id and pc.workspace_id=c.workspace_id
 left join public.mc_stock_lots l on l.id=c.lot_id and l.workspace_id=c.workspace_id
 where c.workspace_id=p_workspace_id and pc.production_id=p_production_id;
 return jsonb_build_object('execution_id',p_production_id,'read_only',true,
  'financially_final',false,'snapshot_precision','unit_cost_snapshot:6dp',
  'lines',v_lines);
end $$;
revoke all on function public.mc_get_print_consumption_sources(uuid,uuid) from public,anon;
grant execute on function public.mc_get_print_consumption_sources(uuid,uuid) to authenticated;
