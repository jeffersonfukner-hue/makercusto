-- Aceita cancelamento, redução e troca sem motivo e preserva o evento original.

create or replace function public.mc_cancel_print(
 p_workspace_id uuid,p_production_id uuid,p_request_key text,p_reason text
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 v_reason text := nullif(btrim(p_reason),'');
 v_prod public.mc_productions%rowtype;
        v_prior public.mc_audit_events%rowtype;
        v_res public.mc_production_reservations%rowtype;
        v_released jsonb := '[]'::jsonb;
begin
 if auth.uid() is null or not exists(
  select 1 from public.mc_members where workspace_id=p_workspace_id
  and user_id=auth.uid() and active and role in ('owner','manager')
 ) then raise exception 'Sem autorização para cancelar impressão'; end if;
 if length(coalesce(p_request_key,'')) not between 10 and 100 then
  raise exception 'Chave idempotente de cancelamento inválida'; end if;
 if v_reason is not null and length(v_reason) not between 10 and 1000 then
  raise exception 'Motivo, se informado, deve ter de 10 a 1000 caracteres'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 select * into v_prior from public.mc_audit_events
 where workspace_id=p_workspace_id and entity='production'
  and action='cancel_print' and details->>'request_key'=p_request_key
 order by occurred_at desc limit 1;
 if found then
   if v_prior.entity_id=p_production_id and (v_prior.details->>'reason') is not distinct from v_reason then
    return p_production_id; end if;
   raise exception 'Chave de cancelamento reutilizada com payload diferente';
 end if;
 select * into v_prod from public.mc_productions
 where workspace_id=p_workspace_id and id=p_production_id for update;
 if not found or v_prod.kind<>'print' or v_prod.status in ('completed','failed','cancelled') then
  raise exception 'Impressão inexistente ou já encerrada'; end if;
 for v_res in select * from public.mc_production_reservations
  where workspace_id=p_workspace_id and production_id=p_production_id
    and status='active' and remaining>0 order by id for update loop
  v_released:=v_released||jsonb_build_array(jsonb_build_object(
   'reservation_id',v_res.id,'lot_id',v_res.lot_id,'released_g',v_res.remaining));
  update public.mc_production_reservations set status='released',remaining=0
   where id=v_res.id and workspace_id=p_workspace_id;
  insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,details)
  values(p_workspace_id,'production_reservation',v_res.id,'release_on_cancel',auth.uid(),
   jsonb_build_object('production_id',p_production_id,'lot_id',v_res.lot_id,
    'remaining_before_g',v_res.remaining,'released_g',v_res.remaining,
    'request_key',p_request_key));
 end loop;
 update public.mc_productions set status='cancelled',end_at=now()
  where workspace_id=p_workspace_id and id=p_production_id;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,reason,details)
 values(p_workspace_id,'production',p_production_id,'cancel_print',auth.uid(),v_reason,
  jsonb_build_object('request_key',p_request_key,'reason',v_reason,
  'previous_status',v_prod.status,'released_reservations',v_released));
 return p_production_id;
end $$;

create or replace function public.mc_reduce_print_plan(
 p_workspace_id uuid,p_production_id uuid,p_request_key text,
 p_output_changes jsonb,p_reservation_releases jsonb,p_reason text
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 v_reason text := nullif(btrim(p_reason),'');
 v_prod public.mc_productions%rowtype;
 v_prior public.mc_audit_events%rowtype;
 v_output public.mc_production_outputs%rowtype;
 v_res public.mc_production_reservations%rowtype;
 v_row jsonb;v_quantity numeric;v_release numeric;
 v_changes jsonb := '[]'::jsonb;v_releases jsonb := '[]'::jsonb;
 v_payload jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members
 where workspace_id=p_workspace_id and user_id=auth.uid()
 and active and role in ('owner','manager')) then
  raise exception 'Sem autorização para reduzir planejamento'; end if;
 if length(coalesce(p_request_key,'')) not between 10 and 100 then
  raise exception 'Chave idempotente inválida'; end if;
 if v_reason is not null and length(v_reason) not between 10 and 1000 then
  raise exception 'Motivo, se informado, deve ter de 10 a 1000 caracteres'; end if;
 if p_output_changes is null or jsonb_typeof(p_output_changes)<>'array'
  or jsonb_array_length(p_output_changes) not between 1 and 30
  or p_reservation_releases is null or jsonb_typeof(p_reservation_releases)<>'array'
  or jsonb_array_length(p_reservation_releases)>30 then
  raise exception 'Reduções de peças e liberações de reserva inválidas'; end if;
 if exists(select 1 from jsonb_array_elements(p_output_changes) x
   where jsonb_typeof(x->'new_planned')<>'number')
  or exists(select 1 from jsonb_array_elements(p_reservation_releases) x
   where jsonb_typeof(x->'release_g')<>'number') then
  raise exception 'Quantidades devem ser numéricas'; end if;
 v_payload:=jsonb_build_object('production',p_production_id,
   'output_changes',p_output_changes,'reservation_releases',p_reservation_releases,
   'reason',v_reason);
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 select * into v_prior from public.mc_audit_events
 where workspace_id=p_workspace_id and entity='production' and action='reduce_print_plan'
   and details->>'request_key'=p_request_key order by occurred_at desc limit 1;
 if found then
  if v_prior.entity_id=p_production_id and v_prior.details->'request_payload'=v_payload then
    return p_production_id; end if;
  raise exception 'Chave reutilizada com payload diferente'; end if;
 select * into v_prod from public.mc_productions
 where workspace_id=p_workspace_id and id=p_production_id for update;
 if not found or v_prod.kind<>'print' or v_prod.status in ('completed','failed','cancelled') then
  raise exception 'Impressão inexistente ou encerrada'; end if;
 if (select count(distinct x->>'output_id') from jsonb_array_elements(p_output_changes) x)
    <>jsonb_array_length(p_output_changes)
 or (select count(distinct x->>'reservation_id') from jsonb_array_elements(p_reservation_releases) x)
    <>jsonb_array_length(p_reservation_releases) then
  raise exception 'Linhas duplicadas'; end if;
 for v_row in select value from jsonb_array_elements(p_output_changes) loop
  begin
   select * into v_output from public.mc_production_outputs
    where workspace_id=p_workspace_id and production_id=p_production_id
     and id=(v_row->>'output_id')::uuid for update;
   v_quantity:=(v_row->>'new_planned')::numeric;
  exception when others then raise exception 'Saída ou quantidade inválida'; end;
  if not found or v_quantity is null or v_quantity<0
   or v_quantity<>trunc(v_quantity) or v_quantity>=v_output.planned_quantity
   or v_quantity<v_output.confirmed_good+v_output.confirmed_failed then
   raise exception 'Novo planejamento não pode superar o atual nem reduzir peças já confirmadas'; end if;
  update public.mc_production_outputs set planned_quantity=v_quantity
   where workspace_id=p_workspace_id and id=v_output.id;
  v_changes:=v_changes||jsonb_build_array(jsonb_build_object(
    'output_id',v_output.id,'old_planned',v_output.planned_quantity,
    'new_planned',v_quantity,'confirmed_good',v_output.confirmed_good,
    'confirmed_failed',v_output.confirmed_failed));
 end loop;
 for v_row in select value from jsonb_array_elements(p_reservation_releases) loop
  begin
   select * into v_res from public.mc_production_reservations
    where workspace_id=p_workspace_id and production_id=p_production_id
     and id=(v_row->>'reservation_id')::uuid and status='active' for update;
   v_release:=(v_row->>'release_g')::numeric;
  exception when others then raise exception 'Reserva ou quantidade inválida'; end;
  if not found or v_release is null or v_release<=0
   or v_release<>round(v_release,3) or v_release>v_res.remaining then
   raise exception 'Gramas a liberar excedem o restante da reserva ou têm precisão inválida'; end if;
  update public.mc_production_reservations
    set remaining=remaining-v_release,
        status=case when remaining=v_release then 'released' else 'active' end
    where id=v_res.id and workspace_id=p_workspace_id;
  v_releases:=v_releases||jsonb_build_array(jsonb_build_object(
    'reservation_id',v_res.id,'lot_id',v_res.lot_id,
    'remaining_before_g',v_res.remaining,'released_g',v_release,
    'remaining_after_g',v_res.remaining-v_release));
  insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,reason,details)
  values(p_workspace_id,'production_reservation',v_res.id,'release_partial_cancel',
    auth.uid(),v_reason,jsonb_build_object(
    'production_id',p_production_id,'lot_id',v_res.lot_id,
    'remaining_before_g',v_res.remaining,'released_g',v_release,
    'remaining_after_g',v_res.remaining-v_release,'request_key',p_request_key));
 end loop;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,reason,details)
 values(p_workspace_id,'production',p_production_id,'reduce_print_plan',
   auth.uid(),v_reason,jsonb_build_object(
    'request_key',p_request_key,'request_payload',v_payload,
    'output_changes',v_changes,'reservation_releases',v_releases));
 return p_production_id;
end $$;

create or replace function public.mc_swap_print_reserved_lot(
 p_workspace_id uuid,p_production_id uuid,p_old_reservation_id uuid,
 p_new_lot_id uuid,p_release_g numeric,p_new_reserve_g numeric,
 p_request_key text,p_reason text
) returns uuid language plpgsql security definer set search_path='' as $$
declare
 v_reason text := nullif(btrim(p_reason),'');
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
 if v_reason is not null and length(v_reason) not between 10 and 1000 then
  raise exception 'Motivo, se informado, deve ter de 10 a 1000 caracteres';end if;
 if p_release_g is null or p_release_g<=0 or p_release_g<>round(p_release_g,3)
    or p_new_reserve_g is null or p_new_reserve_g<=0
    or p_new_reserve_g>1000000 or p_new_reserve_g<>round(p_new_reserve_g,3) then
  raise exception 'Gramas inválidos: informe quantidades positivas com até três casas decimais';end if;
 v_request:=jsonb_build_object(
  'production_id',p_production_id,'old_reservation_id',p_old_reservation_id,
  'new_lot_id',p_new_lot_id,'release_g',p_release_g,'new_reserve_g',p_new_reserve_g,
  'reason',v_reason);
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
 values(p_workspace_id,'production_reservation',v_old.id,'release_on_lot_swap',auth.uid(),v_reason,
 jsonb_build_object('production_id',p_production_id,'old_lot_id',v_old.lot_id,
  'new_lot_id',p_new_lot_id,'remaining_before_g',v_old.remaining,
  'released_g',p_release_g,'remaining_after_g',v_old.remaining-p_release_g,
  'request_key',p_request_key));
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,reason,details)
 values(p_workspace_id,'production_reservation',v_new_reservation,'reserve_on_lot_swap',
  auth.uid(),v_reason,jsonb_build_object(
  'production_id',p_production_id,'lot_id',p_new_lot_id,'quantity_g',p_new_reserve_g,
  'request_key',p_request_key));
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,reason,details)
 values(p_workspace_id,'production',p_production_id,'swap_reserved_lot',auth.uid(),v_reason,
 jsonb_build_object('request_key',p_request_key,'request_payload',v_request,
  'new_reservation_id',v_new_reservation,'old_remaining_after_g',v_old.remaining-p_release_g));
 return v_new_reservation;
end $$;

create table public.mc_print_audit_notes (
 audit_event_id uuid primary key references public.mc_audit_events(id) on delete cascade,
 workspace_id uuid not null references public.mc_workspaces(id) on delete cascade,
 reason text not null check (length(btrim(reason)) between 10 and 1000),
 added_by uuid not null default auth.uid() references auth.users(id),
 added_at timestamptz not null default now()
);
alter table public.mc_print_audit_notes enable row level security;
revoke all on public.mc_print_audit_notes from public, anon, authenticated;
grant select on public.mc_print_audit_notes to authenticated;
grant insert(audit_event_id,workspace_id,reason) on public.mc_print_audit_notes to authenticated;
create policy mc_print_audit_notes_read on public.mc_print_audit_notes
 for select to authenticated using (public.mc_member(workspace_id));
create policy mc_print_audit_notes_insert on public.mc_print_audit_notes
 for insert to authenticated with check (
  added_by=(select auth.uid()) and public.mc_role(workspace_id) in ('owner','manager') and exists (
   select 1 from public.mc_audit_events e
   where e.id=mc_print_audit_notes.audit_event_id and e.workspace_id=mc_print_audit_notes.workspace_id
    and e.entity='production' and e.action in ('cancel_print','reduce_print_plan','swap_reserved_lot')
    and nullif(btrim(e.reason),'') is null
  )
 );
