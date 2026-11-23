-- GAP01-D/E — Dossiê de análise exclusivamente consultivo.
-- Não cria estorno, ajuste, aprovação, movimento de estoque ou alteração em reservas.
-- Disponibilidade é fotografia da consulta e não autoriza baixa posterior.
create or replace function public.mc_get_physical_occurrence_dossier(
 p_workspace_id uuid,p_occurrence_id uuid
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
 v_occ public.mc_physical_consumption_occurrences%rowtype;
 v_physical numeric;v_reserved numeric;v_own_reserved numeric;v_other_reserved numeric;
 v_lot text;v_lines jsonb;v_reservations jsonb;
 v_proposals jsonb;v_history jsonb;
begin
 if auth.uid() is null or not exists (
  select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')
 ) then raise exception 'Sem autorização para analisar conciliação'; end if;
 select * into v_occ from public.mc_physical_consumption_occurrences o
 where o.id=p_occurrence_id and o.workspace_id=p_workspace_id;
 if not found then raise exception 'Ocorrência não encontrada nesta oficina';end if;
 select coalesce(jsonb_agg(jsonb_build_object(
   'consumption_id',c.id,'confirmation_id',c.confirmation_id,
   'lot_id',c.lot_id,'lot_label',l.label,
   'model_g',c.model_quantity,'purge_g',c.purge_quantity,
   'loss_g',c.loss_quantity,'total_g',c.model_quantity+c.purge_quantity+c.loss_quantity,
   'unit_cost_snapshot',c.unit_cost_snapshot,'confirmed_at',pc.confirmed_at,
   'confirmation_status',pc.status,'author_id',pc.author_id
 ) order by pc.confirmed_at,c.id),'[]'::jsonb) into v_lines
 from public.mc_production_consumption c
 join public.mc_production_confirmations pc
 on pc.id=c.confirmation_id and pc.workspace_id=c.workspace_id
 left join public.mc_stock_lots l on l.id=c.lot_id and l.workspace_id=c.workspace_id
 where c.workspace_id=p_workspace_id and pc.production_id=v_occ.production_id;
 select coalesce(jsonb_agg(jsonb_build_object(
  'reservation_id',r.id,'production_id',r.production_id,'lot_id',r.lot_id,
  'remaining_g',r.remaining,'quantity_g',r.quantity,'status',r.status,
  'belongs_to_occurrence_production',r.production_id=v_occ.production_id
 ) order by r.created_at,r.id),'[]'::jsonb) into v_reservations
 from public.mc_production_reservations r
 where r.workspace_id=p_workspace_id and r.status='active'
  and r.lot_id=v_occ.possible_lot_id;
 if v_occ.possible_lot_id is not null then
  select l.label into v_lot from public.mc_stock_lots l
  where l.workspace_id=p_workspace_id and l.id=v_occ.possible_lot_id;
  select coalesce(sum(m.delta),0) into v_physical from public.mc_stock_movements m
   where m.workspace_id=p_workspace_id and m.lot_id=v_occ.possible_lot_id;
  select coalesce(sum(r.remaining),0),
   coalesce(sum(r.remaining) filter(where r.production_id=v_occ.production_id),0),
   coalesce(sum(r.remaining) filter(where r.production_id<>v_occ.production_id),0)
   into v_reserved,v_own_reserved,v_other_reserved
  from public.mc_production_reservations r
  where r.workspace_id=p_workspace_id and r.lot_id=v_occ.possible_lot_id and r.status='active';
 end if;
 select coalesce(jsonb_agg(jsonb_build_object(
  'proposal_id',p.id,'lot_id',p.lot_id,'proposed_delta_g',p.proposed_delta_g,
  'status',p.status,'evidence_reference',p.evidence_reference,
  'created_at',p.created_at) order by p.created_at,p.id),'[]'::jsonb)
 into v_proposals from public.mc_inventory_adjustment_proposals p
 where p.workspace_id=p_workspace_id and p.occurrence_id=v_occ.id;
 select coalesce(jsonb_agg(jsonb_build_object(
  'review_id',r.id,'prior_status',r.prior_status,'next_status',r.next_status,
  'cause_hypothesis',r.cause_hypothesis,'evidence_reference',r.evidence_reference,
  'created_at',r.created_at) order by r.created_at,r.id),'[]'::jsonb)
 into v_history from public.mc_physical_occurrence_reviews r
 where r.workspace_id=p_workspace_id and r.occurrence_id=v_occ.id;
 return jsonb_build_object(
  'occurrence_id',v_occ.id,'production_id',v_occ.production_id,
  'status',v_occ.status,'observed_quantity_g',v_occ.quantity_g,
  'possible_lot_id',v_occ.possible_lot_id,'possible_lot_label',v_lot,
  'lot_verification','unverified','snapshot_type','read_only_current_state',
  'physical_g',v_physical,'reserved_g',v_reserved,
  'own_reserved_g',v_own_reserved,'other_reserved_g',v_other_reserved,
  'unreserved_g',case when v_physical is null then null else v_physical-v_reserved end,
  'reservations',v_reservations,'confirmed_consumption_lines',v_lines,
  'investigation_history',v_history,'pending_adjustment_proposals',v_proposals,
  'possible_compensation_review','manual_review_only',
  'reversible_quantity_g',null,'financial_adjustment',null,
  'inventory_effect','none','approval','not_available',
  'warning','Consumo confirmado nao prova devolucao fisica; vinculacao de movimentos e dependencia posterior nao verificadas'
 );
end $$;
revoke all on function public.mc_get_physical_occurrence_dossier(uuid,uuid) from public,anon;
grant execute on function public.mc_get_physical_occurrence_dossier(uuid,uuid) to authenticated;
