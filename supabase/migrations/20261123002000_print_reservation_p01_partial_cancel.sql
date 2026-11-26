-- MakerCusto — P01-E parcial: redução do planejamento com liberação explícita de reserva.
-- Apenas branch/CI. NÃO aplicar à base operacional sem autorização específica.
-- Os gramas liberados são informados por lote; NÃO inferir massa por peça nem
-- reverter histórico de consumo, custo, tempo ou eventos confirmados.

create or replace function public.mc_reduce_print_plan(
 p_workspace_id uuid,p_production_id uuid,p_request_key text,
 p_output_changes jsonb,p_reservation_releases jsonb,p_reason text
) returns uuid language plpgsql security definer set search_path='' as $$
declare
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
 if length(btrim(coalesce(p_reason,''))) not between 10 and 1000 then
  raise exception 'Justificativa obrigatória (10 a 1000 caracteres)'; end if;
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
   'reason',btrim(p_reason));
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
    auth.uid(),btrim(p_reason),jsonb_build_object(
    'production_id',p_production_id,'lot_id',v_res.lot_id,
    'remaining_before_g',v_res.remaining,'released_g',v_release,
    'remaining_after_g',v_res.remaining-v_release,'request_key',p_request_key));
 end loop;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,reason,details)
 values(p_workspace_id,'production',p_production_id,'reduce_print_plan',
   auth.uid(),btrim(p_reason),jsonb_build_object(
    'request_key',p_request_key,'request_payload',v_payload,
    'output_changes',v_changes,'reservation_releases',v_releases));
 return p_production_id;
end $$;
revoke all on function public.mc_reduce_print_plan(uuid,uuid,text,jsonb,jsonb,text) from public,anon;
grant execute on function public.mc_reduce_print_plan(uuid,uuid,text,jsonb,jsonb,text) to authenticated;
