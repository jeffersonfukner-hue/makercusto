-- MakerCusto L2/L3: operações transacionais; NÃO aplicar automaticamente.
-- Escopo inicial: impressão com múltiplas saídas, sem reservas ativas na mesma ordem.
-- Confirmações armazenam deltas, nunca substituem medições anteriores.
create table if not exists public.mc_production_output_events (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.mc_workspaces(id),
 confirmation_id uuid not null,
 output_id uuid not null,
 good_delta numeric(18,4) not null check(good_delta>=0 and good_delta=trunc(good_delta)),
 failed_delta numeric(18,4) not null check(failed_delta>=0 and failed_delta=trunc(failed_delta)),
 check(good_delta+failed_delta>0),
 foreign key(confirmation_id,workspace_id) references public.mc_production_confirmations(id,workspace_id),
 foreign key(output_id,workspace_id) references public.mc_production_outputs(id,workspace_id),
 unique(confirmation_id,output_id)
);
alter table public.mc_production_output_events enable row level security;
create policy mc_production_output_events_read on public.mc_production_output_events for select to authenticated
 using(public.mc_member(workspace_id));
revoke all on public.mc_production_output_events from public,anon,authenticated;
grant select on public.mc_production_output_events to authenticated;
-- Impedir alteração direta de execução, saídas e confirmações pelo navegador.
revoke insert,update,delete,truncate on public.mc_productions,public.mc_production_outputs,
 public.mc_production_confirmations,public.mc_production_consumption,
 public.mc_production_reservations,public.mc_audit_events from public,anon,authenticated;
-- O snapshot do evento preserva exatamente o payload para replay.
alter table public.mc_production_confirmations
 add column if not exists request_payload jsonb;
alter table public.mc_productions
 add column if not exists input_provenance jsonb not null default '{}'::jsonb;

create or replace function public.mc_create_print(
 p_workspace_id uuid,p_printer_id uuid,p_outputs jsonb,p_planned_hours numeric,
 p_notes text,p_source text
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_row jsonb; v_product uuid; v_revision uuid; v_quantity numeric;
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members where workspace_id=p_workspace_id
 and user_id=auth.uid() and active and role in ('owner','manager')) then
  raise exception 'Sem autorização para registrar impressão'; end if;
 if p_printer_id is null or not exists(select 1 from public.mc_printers where workspace_id=p_workspace_id and id=p_printer_id and active) then
  raise exception 'Impressora física da oficina obrigatória'; end if;
 if p_outputs is null or jsonb_typeof(p_outputs)<>'array' or jsonb_array_length(p_outputs) not between 1 and 30 then
  raise exception 'Informe de 1 a 30 saídas'; end if;
 if p_planned_hours is not null and (p_planned_hours<0 or p_planned_hours>100000 or p_planned_hours<>round(p_planned_hours,4)) then
  raise exception 'Tempo planejado inválido'; end if;
 if length(coalesce(p_notes,''))>2000 or p_source not in ('slicer','measured','informed','estimated') then
  raise exception 'Fonte ou observação inválida'; end if;
 if (select count(distinct elem->>'product_id') from jsonb_array_elements(p_outputs) elem)<>jsonb_array_length(p_outputs) then
  raise exception 'Não repita a mesma peça; agrupe as quantidades'; end if;
 -- A execução L2 é apenas descritiva: nenhuma movimentação nem custo é lançado.
 insert into public.mc_productions(workspace_id,printer_id,status,planned_hours,notes,input_provenance)
 values(p_workspace_id,p_printer_id,'draft',p_planned_hours,nullif(btrim(p_notes),''),
 jsonb_build_object('source',p_source,'created_by',auth.uid())) returning id into v_id;
 for v_row in select value from jsonb_array_elements(p_outputs) loop
  begin v_product:=(v_row->>'product_id')::uuid; v_quantity:=(v_row->>'quantity')::numeric;
  exception when others then raise exception 'Identificador ou quantidade de saída inválido'; end;
  if v_quantity is null or v_quantity<1 or v_quantity>100000 or v_quantity<>trunc(v_quantity) then
    raise exception 'Quantidade planejada deve ser inteira positiva'; end if;
  if not exists(select 1 from public.mc_products where id=v_product and workspace_id=p_workspace_id and active and kind in ('product','component')) then
    raise exception 'Peça não pertence à oficina ou está inativa'; end if;
  select id into v_revision from public.mc_product_revisions where workspace_id=p_workspace_id and product_id=v_product
   order by revision desc limit 1;
  insert into public.mc_production_outputs(workspace_id,production_id,product_id,revision_id,planned_quantity)
  values(p_workspace_id,v_id,v_product,v_revision,v_quantity);
 end loop;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,details)
 values(p_workspace_id,'production',v_id,'create_draft',auth.uid(),jsonb_build_object('output_count',jsonb_array_length(p_outputs),'source',p_source));
 return v_id;
end $$;
revoke all on function public.mc_create_print(uuid,uuid,jsonb,numeric,text,text) from public,anon;
grant execute on function public.mc_create_print(uuid,uuid,jsonb,numeric,text,text) to authenticated;

create or replace function public.mc_confirm_print(
 p_workspace_id uuid,p_production_id uuid,p_idempotency_key text,
 p_outputs jsonb,p_consumptions jsonb,p_actual_hours numeric,p_finish boolean default false
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_production public.mc_productions%rowtype;v_payload jsonb;
 v_old record;v_row jsonb;v_output public.mc_production_outputs%rowtype;
 v_lot public.mc_stock_lots%rowtype;v_good numeric;v_failed numeric;
 v_model numeric;v_purge numeric;v_loss numeric;v_total numeric;v_balance numeric;
 v_reserved numeric;v_event uuid;v_item uuid;v_basis text;v_cost numeric;
begin
 if auth.uid() is null or not exists(select 1 from public.mc_members where workspace_id=p_workspace_id
 and user_id=auth.uid() and active and role in ('owner','manager')) then
  raise exception 'Sem autorização para confirmar produção'; end if;
 if length(coalesce(p_idempotency_key,'')) not between 10 and 100 then raise exception 'Chave idempotente inválida'; end if;
 if jsonb_typeof(p_outputs) <> 'array' or jsonb_typeof(p_consumptions)<>'array'
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
 if exists(select 1 from public.mc_production_reservations where workspace_id=p_workspace_id
 and production_id=p_production_id and status='active') then
  raise exception 'Reserva ativa: conciliação de reservas ainda não habilitada nesta versão'; end if;
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
  if not found or v_lot.item_id is null or v_basis not in ('weighed','slicer','estimated')
   or v_model is null or v_purge is null or v_loss is null
   or v_model<0 or v_purge<0 or v_loss<0
   or v_model<>round(v_model,3) or v_purge<>round(v_purge,3) or v_loss<>round(v_loss,3)
   or v_model+v_purge+v_loss=0 then raise exception 'Consumo inválido'; end if;
  v_total:=v_model+v_purge+v_loss;
  select coalesce(sum(delta),0) into v_balance from public.mc_stock_movements
   where workspace_id=p_workspace_id and lot_id=v_lot.id;
  select coalesce(sum(remaining),0) into v_reserved from public.mc_production_reservations
   where workspace_id=p_workspace_id and lot_id=v_lot.id and status='active';
  if v_balance-v_reserved<v_total then raise exception 'Saldo disponível insuficiente: bobina %',v_lot.label; end if;
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
  actual_hours=coalesce(actual_hours,0)+coalesce(p_actual_hours,0)
 where id=p_production_id;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,details)
 values(p_workspace_id,'production_confirmation',v_id,'confirm_incremental',auth.uid(),v_payload);
 -- Snapshot de confirmação, não de custeio conciliado; sem atribuir valor monetário inventado.
 -- L4 exige snapshot financeiro completo antes do encerramento definitivo.
 return v_id;
end $$;
revoke all on function public.mc_confirm_print(uuid,uuid,text,jsonb,jsonb,numeric,boolean) from public,anon;
grant execute on function public.mc_confirm_print(uuid,uuid,text,jsonb,jsonb,numeric,boolean) to authenticated;

create or replace function public.mc_list_prints(p_workspace_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select case when exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')) then
 coalesce((select jsonb_agg(jsonb_build_object(
 'id',p.id,'status',p.status,'printer_id',p.printer_id,'printer_name',pr.name,
 'planned_hours',p.planned_hours,'actual_hours',p.actual_hours,'notes',p.notes,'created_at',p.created_at,
 'outputs',coalesce((select jsonb_agg(jsonb_build_object('id',o.id,'product_id',o.product_id,
  'name',prod.name,'planned',o.planned_quantity,'good',o.confirmed_good,'failed',o.confirmed_failed))
 from public.mc_production_outputs o join public.mc_products prod on prod.id=o.product_id
 where o.production_id=p.id and o.workspace_id=p.workspace_id),'[]'::jsonb))
 order by p.created_at desc) from public.mc_productions p
 left join public.mc_printers pr on pr.id=p.printer_id and pr.workspace_id=p.workspace_id
 where p.workspace_id=p_workspace_id),'[]'::jsonb) else '[]'::jsonb end
$$;
revoke all on function public.mc_list_prints(uuid) from public,anon;
grant execute on function public.mc_list_prints(uuid) to authenticated;
