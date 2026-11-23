-- MakerCusto P01-D: trocar reserva entre bobinas, preservar eventos e preços históricos.
-- PREPARADA SOMENTE NA BRANCH; não executar no Supabase operacional sem autorização específica.
-- A operação altera SOMENTE reservas lógicas; o consumo físico continua exclusivamente
-- na mc_confirm_print, com linhas individuais por lote e unit_cost_snapshot original.
create or replace function public.mc_swap_print_reserved_lot(
 p_workspace_id uuid,p_production_id uuid,p_old_reservation_id uuid,
 p_new_lot_id uuid,p_release_g numeric,p_new_reserve_g numeric,
 p_request_key text,p_reason text
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 v_old public.mc_production_reservations%rowtype;
 v_new_lot public.mc_stock_lots%rowtype;
 v_prod public.mc_productions%rowtype;
 v_previous public.mc_audit_events%rowtype;
 v_new_reservation uuid;
 v_physical numeric;v_held numeric;
 v_request jsonb;
begin
 if auth.uid() is null or not exists(
  select 1 from public.mc_members where workspace_id=p_workspace_id
   and user_id=auth.uid() and active and role in ('owner','manager')
 ) then raise exception 'Sem autorização para trocar reserva de bobina'; end if;
 if length(coalesce(p_request_key,'')) not between 10 and 100 then
  raise exception 'Chave idempotente inválida';end if;
 if length(btrim(coalesce(p_reason,''))) not between 10 and 1000 then
  raise exception 'Justificativa obrigatória (10 a 1000 caracteres)';end if;
 if p_release_g is null or p_release_g<=0 or p_release_g<>round(p_release_g,3)
    or p_new_reserve_g is null or p_new_reserve_g<=0
    or p_new_reserve_g>1000000 or p_new_reserve_g<>round(p_new_reserve_g,3) then
  raise exception 'Gramas inválidos: informe quantidades positivas com até três casas decimais';end if;
 v_request:=jsonb_build_object(
  'production_id',p_production_id,'old_reservation_id',p_old_reservation_id,
  'new_lot_id',p_new_lot_id,'release_g',p_release_g,'new_reserve_g',p_new_reserve_g,
  'reason',btrim(p_reason));
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 select * into v_previous from public.mc_audit_events
 where workspace_id=p_workspace_id and entity='production'
  and action='swap_reserved_lot' and details->>'request_key'=p_request_key
 order by occurred_at desc limit 1;
 if found then
  if v_previous.entity_id=p_production_id and v_previous.details->'request_payload'=v_request then
   return (v_previous.details->>'new_reservation_id')::uuid;end if;
  raise exception 'Chave de troca reutilizada com payload diferente';
 end if;
 select * into v_prod from public.mc_productions
 where id=p_production_id and workspace_id=p_workspace_id for update;
 if not found or v_prod.kind<>'print'
  or v_prod.status in ('completed','failed','cancelled') then
  raise exception 'Impressão inexistente ou encerrada';end if;
 select * into v_old from public.mc_production_reservations
 where workspace_id=p_workspace_id and production_id=p_production_id
  and id=p_old_reservation_id and status='active' for update;
 if not found then raise exception 'Reserva de origem não encontrada ou não ativa';end if;
 if v_old.lot_id=p_new_lot_id then
  raise exception 'Bobina substituta deve ser diferente da origem';end if;
 if p_release_g>v_old.remaining then
  raise exception 'Liberação excede a reserva de origem remanescente';end if;
 select * into v_new_lot from public.mc_stock_lots
 where workspace_id=p_workspace_id and id=p_new_lot_id for update;
 if not found or not exists(select 1 from public.mc_inventory_items i
  where i.workspace_id=p_workspace_id and i.id=v_new_lot.item_id
   and i.kind='filament' and i.base_unit='g') then
  raise exception 'Bobina substituta inválida';end if;
 if exists(select 1 from public.mc_production_reservations
  where workspace_id=p_workspace_id and production_id=p_production_id
   and lot_id=p_new_lot_id and status='active') then
  raise exception 'Já há reserva ativa da ordem na bobina substituta';end if;
 select coalesce(sum(delta),0) into v_physical from public.mc_stock_movements
 where workspace_id=p_workspace_id and lot_id=p_new_lot_id;
 select coalesce(sum(remaining),0) into v_held from public.mc_production_reservations
 where workspace_id=p_workspace_id and lot_id=p_new_lot_id and status='active';
 if v_physical-v_held<p_new_reserve_g then
  raise exception 'Saldo disponível insuficiente para reservar bobina substituta';end if;
 -- Transferência lógica e atômica, sem tocar em estoque ou snapshots financeiros.
 update public.mc_production_reservations
 set remaining=remaining-p_release_g,
     status=case when remaining=p_release_g then 'released' else 'active' end
 where workspace_id=p_workspace_id and id=v_old.id;
 insert into public.mc_production_reservations(
  workspace_id,production_id,item_id,lot_id,quantity,remaining,status,request_key)
 values(p_workspace_id,p_production_id,v_new_lot.item_id,p_new_lot_id,
  p_new_reserve_g,p_new_reserve_g,'active',p_request_key)
 returning id into v_new_reservation;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,reason,details)
 values(p_workspace_id,'production_reservation',v_old.id,'release_on_lot_swap',auth.uid(),btrim(p_reason),
 jsonb_build_object('production_id',p_production_id,'old_lot_id',v_old.lot_id,
  'new_lot_id',p_new_lot_id,'remaining_before_g',v_old.remaining,
  'released_g',p_release_g,'remaining_after_g',v_old.remaining-p_release_g,
  'request_key',p_request_key));
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,reason,details)
 values(p_workspace_id,'production_reservation',v_new_reservation,'reserve_on_lot_swap',
  auth.uid(),btrim(p_reason),jsonb_build_object(
  'production_id',p_production_id,'lot_id',p_new_lot_id,'quantity_g',p_new_reserve_g,
  'request_key',p_request_key));
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,reason,details)
 values(p_workspace_id,'production',p_production_id,'swap_reserved_lot',auth.uid(),btrim(p_reason),
 jsonb_build_object('request_key',p_request_key,'request_payload',v_request,
  'new_reservation_id',v_new_reservation,'old_remaining_after_g',v_old.remaining-p_release_g));
 return v_new_reservation;
end $$;
revoke all on function public.mc_swap_print_reserved_lot(uuid,uuid,uuid,uuid,numeric,numeric,text,text) from public,anon;
grant execute on function public.mc_swap_print_reserved_lot(uuid,uuid,uuid,uuid,numeric,numeric,text,text) to authenticated;
