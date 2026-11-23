-- MakerCusto P01 (parte): reservas lógicas opcionais e consumo conciliado.
-- NÃO executar no Supabase operacional sem autorização específica nova.
-- Fluxos de conclusão, cancelamento parcial e conciliação excepcional permanecem bloqueados.
-- P01: idempotência de registro de reserva e rastreabilidade por lote.
-- Reservas são lógicas e não alteram mc_stock_movements.
alter table public.mc_production_reservations
 add column if not exists request_key text;
create unique index if not exists mc_reservation_request_key_unique
 on public.mc_production_reservations(workspace_id,request_key) where request_key is not null;
create unique index if not exists mc_reservation_one_active_per_lot
 on public.mc_production_reservations(workspace_id,production_id,lot_id) where status='active' and lot_id is not null;
create index if not exists mc_reservation_active_lot_lookup
 on public.mc_production_reservations(workspace_id,lot_id) where status='active';

create or replace function public.mc_reserve_print_lot(
 p_workspace_id uuid,p_production_id uuid,p_lot_id uuid,
 p_quantity_g numeric,p_request_key text
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_original public.mc_production_reservations%rowtype;
 v_lot public.mc_stock_lots%rowtype;v_production public.mc_productions%rowtype;
 v_physical numeric;v_reserved numeric;
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members
  where workspace_id=p_workspace_id and user_id=auth.uid() and active and role in ('owner','manager')) then
  raise exception 'Sem autorização para reservar material'; end if;
 if length(coalesce(p_request_key,'')) not between 10 and 100 then
  raise exception 'Chave idempotente de reserva inválida'; end if;
 if p_quantity_g is null or p_quantity_g<=0 or p_quantity_g>1000000 or p_quantity_g<>round(p_quantity_g,3) then
  raise exception 'Quantidade de reserva inválida'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 select * into v_original from public.mc_production_reservations
 where workspace_id=p_workspace_id and request_key=p_request_key;
 if found then
  if v_original.production_id=p_production_id and v_original.lot_id=p_lot_id
   and v_original.quantity=p_quantity_g then return v_original.id; end if;
  raise exception 'Chave de reserva reutilizada com payload diferente'; end if;
 select * into v_production from public.mc_productions
 where id=p_production_id and workspace_id=p_workspace_id for update;
 if not found or v_production.kind<>'print' or v_production.status in ('completed','failed','cancelled') then
  raise exception 'Impressão não encontrada ou encerrada'; end if;
 select * into v_lot from public.mc_stock_lots
 where id=p_lot_id and workspace_id=p_workspace_id for update;
 if not found or not exists (select 1 from public.mc_inventory_items i
  where i.id=v_lot.item_id and i.workspace_id=p_workspace_id
  and i.kind='filament' and i.base_unit='g') then raise exception 'Bobina inválida para reserva'; end if;
 if exists(select 1 from public.mc_production_reservations
  where workspace_id=p_workspace_id and production_id=p_production_id
   and lot_id=p_lot_id and status='active') then
  raise exception 'Já existe reserva ativa desta bobina nesta impressão'; end if;
 select coalesce(sum(delta),0) into v_physical from public.mc_stock_movements
  where workspace_id=p_workspace_id and lot_id=p_lot_id;
 select coalesce(sum(remaining),0) into v_reserved from public.mc_production_reservations
  where workspace_id=p_workspace_id and lot_id=p_lot_id and status='active';
 if v_physical-v_reserved<p_quantity_g then
  raise exception 'Saldo disponível insuficiente para reservar a bobina %',v_lot.label; end if;
 insert into public.mc_production_reservations(workspace_id,production_id,item_id,lot_id,
  quantity,remaining,status,request_key)
 values(p_workspace_id,p_production_id,v_lot.item_id,p_lot_id,p_quantity_g,p_quantity_g,'active',p_request_key)
 returning id into v_id;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,details)
 values(p_workspace_id,'production_reservation',v_id,'reserve',auth.uid(),
  jsonb_build_object('production_id',p_production_id,'lot_id',p_lot_id,
   'quantity_g',p_quantity_g,'request_key',p_request_key));
 return v_id;
end $$;
revoke all on function public.mc_reserve_print_lot(uuid,uuid,uuid,numeric,text) from public,anon;
grant execute on function public.mc_reserve_print_lot(uuid,uuid,uuid,numeric,text) to authenticated;


create or replace function public.mc_confirm_print(
 p_workspace_id uuid,p_production_id uuid,p_idempotency_key text,
 p_outputs jsonb,p_consumptions jsonb,p_actual_hours numeric,p_finish boolean default false
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_production public.mc_productions%rowtype;v_payload jsonb;
 v_old record;v_row jsonb;v_output public.mc_production_outputs%rowtype;
 v_lot public.mc_stock_lots%rowtype;v_good numeric;v_failed numeric;
 v_model numeric;v_purge numeric;v_loss numeric;v_total numeric;v_balance numeric;
 v_reserved numeric;v_own_reserved numeric;v_others_reserved numeric;
 v_covered numeric;v_excess numeric;v_excesses jsonb := '[]'::jsonb;
 v_event uuid;v_item uuid;v_basis text;v_cost numeric;
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members where workspace_id=p_workspace_id
 and user_id=auth.uid() and active and role in ('owner','manager')) then
  raise exception 'Sem autorização para confirmar produção'; end if;
 if length(coalesce(p_idempotency_key,'')) not between 10 and 100 then raise exception 'Chave idempotente inválida'; end if;
 if p_outputs is null or p_consumptions is null or jsonb_typeof(p_outputs) <> 'array' or jsonb_typeof(p_consumptions)<>'array'
  or jsonb_array_length(p_outputs)>30 or jsonb_array_length(p_consumptions)>30 then
  raise exception 'Deltas de saída/consumo inválidos'; end if;
 if jsonb_array_length(p_outputs)=0 and jsonb_array_length(p_consumptions)=0 then raise exception 'Confirmação vazia'; end if;
 if p_actual_hours is not null and (p_actual_hours<0 or p_actual_hours>100000 or p_actual_hours<>round(p_actual_hours,4)) then
  raise exception 'Tempo incremental inválido'; end if;
 v_payload:=jsonb_build_object('production',p_production_id,'outputs',p_outputs,'consumptions',p_consumptions,
  'actual_hours',p_actual_hours,'finish',coalesce(p_finish,false));
 -- Serialização de confirmações da mesma oficina: evita corridas entre ordens e lotes.
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 select * into v_old from public.mc_production_confirmations
  where workspace_id=p_workspace_id and idempotency_key=p_idempotency_key;
 if found then
  if v_old.request_payload=v_payload then return v_old.id; end if;
  raise exception 'Chave reutilizada com payload diferente'; end if;
 select * into v_production from public.mc_productions
 where id=p_production_id and workspace_id=p_workspace_id for update;
 if not found or v_production.status in ('completed','failed','cancelled') then
  raise exception 'Execução inexistente ou encerrada'; end if;
 -- A reserva da própria ordem não bloqueia o consumo; a de outra ordem é protegida.
 -- Conciliamos cada lote na mesma transação com lock de oficina e de lote.
 if (select count(distinct elem->>'output_id') from jsonb_array_elements(p_outputs) elem)<>jsonb_array_length(p_outputs)
 or (select count(distinct elem->>'lot_id') from jsonb_array_elements(p_consumptions) elem)<>jsonb_array_length(p_consumptions) then
  raise exception 'Linhas duplicadas na confirmação'; end if;
 -- Não permitir fechar uma execução mista sem rateio confirmado; deixar pendente L4.
 if coalesce(p_finish,false) then
  raise exception 'Encerramento definitivo exige conciliação/rateio (L4); confirmação incremental permitida'; end if;
 insert into public.mc_production_confirmations(workspace_id,production_id,idempotency_key,author_id,request_payload)
 values(p_workspace_id,p_production_id,p_idempotency_key,auth.uid(),v_payload) returning id into v_id;
 for v_row in select value from jsonb_array_elements(p_outputs) loop
  begin
   select * into v_output from public.mc_production_outputs
   where id=(v_row->>'output_id')::uuid and production_id=p_production_id and workspace_id=p_workspace_id for update;
   v_good:=(v_row->>'good')::numeric;v_failed:=(v_row->>'failed')::numeric;
  exception when others then raise exception 'Saída ou delta inválido'; end;
  if not found or v_good is null or v_failed is null or v_good<0 or v_failed<0 or
   v_good<>trunc(v_good) or v_failed<>trunc(v_failed) or v_good+v_failed=0 then
   raise exception 'Saída ou quantidades inválidas'; end if;
  if v_output.confirmed_good+v_output.confirmed_failed+v_good+v_failed>v_output.planned_quantity then
   raise exception 'Quantidade excede planejamento; regularização necessária'; end if;
  insert into public.mc_production_output_events(workspace_id,confirmation_id,output_id,good_delta,failed_delta)
  values(p_workspace_id,v_id,v_output.id,v_good,v_failed);
  update public.mc_production_outputs set confirmed_good=confirmed_good+v_good,confirmed_failed=confirmed_failed+v_failed
  where id=v_output.id;
 end loop;
 for v_row in select value from jsonb_array_elements(p_consumptions) loop
  begin
   select * into v_lot from public.mc_stock_lots
    where id=(v_row->>'lot_id')::uuid and workspace_id=p_workspace_id for update;
   v_model:=(v_row->>'model_g')::numeric;v_purge:=(v_row->>'purge_g')::numeric;
   v_loss:=(v_row->>'loss_g')::numeric;v_basis:=v_row->>'basis';
  exception when others then raise exception 'Bobina ou quantidade inválida'; end;
  if not found or v_lot.item_id is null or not exists (select 1 from public.mc_inventory_items i where i.workspace_id=p_workspace_id and i.id=v_lot.item_id and i.kind='filament' and i.base_unit='g') or v_basis is null or v_basis not in ('weighed','slicer','estimated')
   or v_model is null or v_purge is null or v_loss is null
   or v_model<0 or v_purge<0 or v_loss<0
   or v_model<>round(v_model,3) or v_purge<>round(v_purge,3) or v_loss<>round(v_loss,3)
   or v_model+v_purge+v_loss=0 then raise exception 'Consumo inválido'; end if;
  v_total:=v_model+v_purge+v_loss;
  select coalesce(sum(delta),0) into v_balance from public.mc_stock_movements
   where workspace_id=p_workspace_id and lot_id=v_lot.id;
  select coalesce(sum(remaining),0),
         coalesce(sum(remaining) filter(where production_id=p_production_id),0),
         coalesce(sum(remaining) filter(where production_id<>p_production_id),0)
   into v_reserved,v_own_reserved,v_others_reserved
   from public.mc_production_reservations
   where workspace_id=p_workspace_id and lot_id=v_lot.id and status='active';
  -- Consumo próprio pode usar a reserva própria, nunca a de terceiros.
  if v_balance-v_others_reserved<v_total then
   raise exception 'Saldo disponível insuficiente ou reservado para outra ordem: bobina %',v_lot.label; end if;
  v_covered:=least(v_total,v_own_reserved);
  v_excess:=v_total-v_covered;
  if v_excess>0 and v_own_reserved>0 then
   v_excesses:=v_excesses || jsonb_build_array(jsonb_build_object(
    'lot_id',v_lot.id,'reserved_g',v_own_reserved,'excess_g',v_excess));
  end if;
  -- Só a fração consumida da própria reserva é debitada; sobra fica ativa até encerramento.
  if v_covered>0 then
   update public.mc_production_reservations
   set remaining=remaining-v_covered,
       status=case when remaining=v_covered then 'fulfilled' else 'active' end
   where workspace_id=p_workspace_id and production_id=p_production_id
    and lot_id=v_lot.id and status='active' and remaining>=v_covered;
   if not found then raise exception 'Reserva da ordem inconsistente; requer conciliação'; end if;
  end if;
  v_cost:=case when v_lot.initial_cost_total is null then null else
   round(v_lot.initial_cost_total/nullif(v_lot.initial_quantity,0),6) end;
  insert into public.mc_production_consumption(workspace_id,confirmation_id,item_id,lot_id,
   model_quantity,purge_quantity,loss_quantity,quantity_basis,unit_cost_snapshot)
  values(p_workspace_id,v_id,v_lot.item_id,v_lot.id,v_model,v_purge,v_loss,v_basis,v_cost);
  insert into public.mc_stock_events(workspace_id,event_type,idempotency_key,reason,created_by)
  values(p_workspace_id,'production',p_idempotency_key||':'||v_lot.id::text,
   'Baixa por confirmação '||v_id::text,auth.uid()) returning id into v_event;
  insert into public.mc_stock_movements(workspace_id,event_id,item_id,lot_id,delta,unit_cost_snapshot)
  values(p_workspace_id,v_event,v_lot.item_id,v_lot.id,-v_total,v_cost);
 end loop;
 update public.mc_productions set status='partial',
  actual_hours=case when p_actual_hours is null then actual_hours else coalesce(actual_hours,0)+p_actual_hours end
 where id=p_production_id;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,details)
 values(p_workspace_id,'production_confirmation',v_id,'confirm_incremental',auth.uid(),
  v_payload || jsonb_build_object('reservation_excesses',v_excesses));
 -- Snapshot de confirmação, não de custeio conciliado; sem atribuir valor monetário inventado.
 -- L4 exige snapshot financeiro completo antes do encerramento definitivo.
 return v_id;
end $$;
revoke all on function public.mc_confirm_print(uuid,uuid,text,jsonb,jsonb,numeric,boolean) from public,anon;
grant execute on function public.mc_confirm_print(uuid,uuid,text,jsonb,jsonb,numeric,boolean) to authenticated;



-- UI de reserva: apenas leitura das reservas da própria oficina.
create or replace function public.mc_list_print_reservations(p_workspace_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select case when exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')) then
 coalesce((select jsonb_agg(jsonb_build_object(
  'id',r.id,'production_id',r.production_id,'lot_id',r.lot_id,'lot_label',l.label,
  'quantity',r.quantity,'remaining',r.remaining,'status',r.status,'created_at',r.created_at)
  order by r.created_at desc) from public.mc_production_reservations r
  left join public.mc_stock_lots l on l.workspace_id=r.workspace_id and l.id=r.lot_id
  where r.workspace_id=p_workspace_id),'[]'::jsonb) else '[]'::jsonb end
$$;
revoke all on function public.mc_list_print_reservations(uuid) from public,anon;
grant execute on function public.mc_list_print_reservations(uuid) to authenticated;
