-- MakerCusto P01-A/P01-B: cancelamento preservando histórico e prazo de revisão opcional.
-- Migração exclusivamente preparada na branch. NÃO aplicar ao Supabase real sem autorização específica.
-- Não habilita encerramento financeiro, estornos, cancelamento parcial nem ajuste de inventário.
alter table public.mc_production_reservations
  add column if not exists due_at timestamptz;

-- Prazo é marcador para revisão humana, nunca gatilho automático de liberação.
create or replace function public.mc_set_print_reservation_due(
  p_workspace_id uuid,p_reservation_id uuid,p_due_at timestamptz
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_res public.mc_production_reservations%rowtype;
        v_production public.mc_productions%rowtype;
begin
 if auth.uid() is null or not exists(
   select 1 from public.mc_members where workspace_id=p_workspace_id
   and user_id=auth.uid() and active and role in ('owner','manager')
 ) then raise exception 'Sem autorização para alterar prazo de reserva'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 select * into v_res from public.mc_production_reservations
 where id=p_reservation_id and workspace_id=p_workspace_id for update;
 if not found or v_res.status<>'active' then
   raise exception 'Reserva ativa não encontrada'; end if;
 select * into v_production from public.mc_productions
 where id=v_res.production_id and workspace_id=p_workspace_id for update;
 if not found or v_production.status in ('completed','failed','cancelled') then
   raise exception 'Não modificar prazo de ordem encerrada'; end if;
 if v_res.due_at is distinct from p_due_at then
   update public.mc_production_reservations set due_at=p_due_at where id=p_reservation_id;
   insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,details)
   values(p_workspace_id,'production_reservation',p_reservation_id,'set_review_due',auth.uid(),
    jsonb_build_object('old_due_at',v_res.due_at,'new_due_at',p_due_at,
     'production_id',v_res.production_id,'remaining_g',v_res.remaining));
 end if;
 return p_reservation_id;
end $$;
revoke all on function public.mc_set_print_reservation_due(uuid,uuid,timestamptz) from public,anon;
grant execute on function public.mc_set_print_reservation_due(uuid,uuid,timestamptz) to authenticated;

-- Cancelamento de ordem aberta: preservar todas as baixas/saídas, liberar somente o
-- restante lógico das reservas e registrar histórico por lote e pelo operador.
create or replace function public.mc_cancel_print(
 p_workspace_id uuid,p_production_id uuid,p_request_key text,p_reason text
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_prod public.mc_productions%rowtype;
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
 if length(btrim(coalesce(p_reason,''))) not between 10 and 1000 then
  raise exception 'Justificativa de cancelamento obrigatória (10 a 1000 caracteres)'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text,0));
 select * into v_prior from public.mc_audit_events
 where workspace_id=p_workspace_id and entity='production'
  and action='cancel_print' and details->>'request_key'=p_request_key
 order by occurred_at desc limit 1;
 if found then
   if v_prior.entity_id=p_production_id and v_prior.details->>'reason'=btrim(p_reason) then
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
 values(p_workspace_id,'production',p_production_id,'cancel_print',auth.uid(),btrim(p_reason),
  jsonb_build_object('request_key',p_request_key,'reason',btrim(p_reason),
  'previous_status',v_prod.status,'released_reservations',v_released));
 return p_production_id;
end $$;
revoke all on function public.mc_cancel_print(uuid,uuid,text,text) from public,anon;
grant execute on function public.mc_cancel_print(uuid,uuid,text,text) to authenticated;

-- Reexposição somente para leitura: data de revisão disponível na UI da oficina.
create or replace function public.mc_list_print_reservations(p_workspace_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select case when exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')) then
 coalesce((select jsonb_agg(jsonb_build_object(
  'id',r.id,'production_id',r.production_id,'lot_id',r.lot_id,'lot_label',l.label,
  'quantity',r.quantity,'remaining',r.remaining,'status',r.status,
  'due_at',r.due_at,'review_overdue',r.due_at is not null and r.due_at<now()
    and r.status='active','created_at',r.created_at)
  order by r.created_at desc) from public.mc_production_reservations r
  left join public.mc_stock_lots l on l.workspace_id=r.workspace_id and l.id=r.lot_id
  where r.workspace_id=p_workspace_id),'[]'::jsonb) else '[]'::jsonb end
$$;
revoke all on function public.mc_list_print_reservations(uuid) from public,anon;
grant execute on function public.mc_list_print_reservations(uuid) to authenticated;
