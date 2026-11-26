-- L1: inventário de bobina física pré-existente, sem compra/fornecedor fictício.
create or replace function public.mc_register_existing_spool(
 p_workspace_id uuid,p_idempotency_key text,p_filament_name text,p_label text,
 p_grams numeric,p_quantity_basis text,p_remaining_cost numeric,p_notes text
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_event uuid;v_filament uuid;v_item uuid;v_lot uuid;v_old record;v_cost_status text;
begin
 if auth.uid() is null or not exists(
  select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')
 ) then raise exception 'Sem autorização para inventariar bobina'; end if;
 if p_idempotency_key is null or length(p_idempotency_key) not between 10 and 100 then raise exception 'Chave da operação inválida'; end if;
 if p_filament_name is null or length(btrim(p_filament_name)) not between 3 and 150 then raise exception 'Nome do filamento inválido'; end if;
 if p_label is null or length(btrim(p_label)) not between 2 and 150 then raise exception 'Identificação da bobina inválida'; end if;
 if p_grams is null or p_grams<=0 or p_grams>1000000 or p_grams<>round(p_grams,3) then raise exception 'Massa física em gramas inválida'; end if;
 if p_quantity_basis not in ('measured','estimated','informed') then raise exception 'Fonte da quantidade inválida'; end if;
 if p_remaining_cost is not null and (p_remaining_cost<0 or p_remaining_cost>100000000 or p_remaining_cost<>round(p_remaining_cost,2)) then raise exception 'Custo do saldo inválido'; end if;
 if length(coalesce(p_notes,''))>1000 then raise exception 'Observação acima do limite'; end if;
 v_cost_status:=case when p_remaining_cost is null then 'unknown' else 'estimated' end;
 select e.id,event_lot.id as lot_id,event_lot.initial_quantity,event_lot.initial_cost_total,
 event_lot.cost_status,event_lot.label,event_lot.notes as lot_notes,event_filament.name as filament_name
 into v_old
 from public.mc_stock_events e
 join public.mc_stock_movements mov on mov.event_id=e.id and mov.workspace_id=e.workspace_id
 join public.mc_stock_lots event_lot on event_lot.id=mov.lot_id and event_lot.workspace_id=mov.workspace_id
 join public.mc_inventory_items inventory on inventory.id=mov.item_id and inventory.workspace_id=mov.workspace_id
 join public.mc_filaments event_filament on event_filament.id=inventory.filament_id and event_filament.workspace_id=inventory.workspace_id
 where e.workspace_id=p_workspace_id and e.idempotency_key=p_idempotency_key
 limit 1;
 if found then
  if v_old.initial_quantity=p_grams and v_old.initial_cost_total is not distinct from p_remaining_cost
    and v_old.cost_status=v_cost_status and v_old.label=btrim(p_label) and v_old.filament_name=btrim(p_filament_name)
    and v_old.lot_notes='Origem da quantidade: '||p_quantity_basis||'. '||coalesce(p_notes,'')
  then return v_old.lot_id; end if;
  raise exception 'Chave de operação reutilizada com conteúdo diferente';
 end if;
 insert into public.mc_stock_events(workspace_id,event_type,idempotency_key,reason,created_by)
 values(p_workspace_id,'initial',p_idempotency_key,'Inventário de bobina física pré-existente, sem compra presumida',auth.uid())
 returning id into v_event;
 insert into public.mc_filaments(workspace_id,name,notes)
 values(p_workspace_id,btrim(p_filament_name),nullif(btrim(coalesce(p_notes,'')),''))
 returning id into v_filament;
 insert into public.mc_inventory_items(workspace_id,kind,name,base_unit,filament_id)
 values(p_workspace_id,'filament',btrim(p_filament_name),'g',v_filament) returning id into v_item;
 insert into public.mc_stock_lots(workspace_id,item_id,label,origin,initial_quantity,initial_cost_total,cost_status,notes)
 values(p_workspace_id,v_item,btrim(p_label),'initial_inventory',p_grams,p_remaining_cost,v_cost_status,
  'Origem da quantidade: '||p_quantity_basis||'. '||coalesce(p_notes,'')) returning id into v_lot;
 insert into public.mc_stock_movements(workspace_id,event_id,item_id,lot_id,delta,unit_cost_snapshot)
 values(p_workspace_id,v_event,v_item,v_lot,p_grams,case when p_remaining_cost is null then null else p_remaining_cost/p_grams end);
 return v_lot;
end $$;
revoke all on function public.mc_register_existing_spool(uuid,text,text,text,numeric,text,numeric,text) from public,anon;
grant execute on function public.mc_register_existing_spool(uuid,text,text,text,numeric,text,numeric,text) to authenticated;


-- Movimentos, eventos e origem/custo de lotes são auditáveis e não podem
-- receber UPDATE/DELETE/TRUNCATE do cliente; operações por RPC validada.
revoke insert,update,delete,truncate,trigger on
 public.mc_stock_events,public.mc_stock_movements,public.mc_stock_lots
 from anon,authenticated,public;
