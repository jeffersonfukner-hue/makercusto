-- Regressão descartável. Depende do fixture de CI L2/L3.
begin;
-- O bootstrap de CI tem permissões mínimas. O Supabase já expõe estes acessos.
grant usage on schema auth to authenticated;
grant select on public.mc_audit_events to authenticated;

do $test$
declare
 w constant uuid := 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
 owner_id constant uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 other_user constant uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 printer constant uuid := 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
 product constant uuid := 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
 p uuid;output_id uuid;source_lot uuid;target_lot uuid;reservation uuid;
 original_event uuid;reason_given_event uuid;new_res uuid;changes jsonb;denied boolean;
begin
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',5)),null,'Impressão teste','slicer');
 select id into strict output_id from public.mc_production_outputs where production_id=p;
 changes:=jsonb_build_array(jsonb_build_object('output_id',output_id,'new_planned',4));
 source_lot:=public.mc_register_existing_spool(w,'optional-source-00001','PETG','Origem',100,'measured',null,null);
 target_lot:=public.mc_register_existing_spool(w,'optional-target-00001','PETG','Destino',100,'measured',null,null);
 reservation:=public.mc_reserve_print_lot(w,p,source_lot,50,'optional-reserve-00001');
 perform public.mc_reduce_print_plan(w,p,'optional-reduce-00001',changes,'[]','');
 perform public.mc_reduce_print_plan(w,p,'optional-reduce-00001',changes,'[]',null);
 new_res:=public.mc_swap_print_reserved_lot(w,p,reservation,target_lot,10,10,'optional-swap-00001',null);
 if public.mc_swap_print_reserved_lot(w,p,reservation,target_lot,10,10,'optional-swap-00001',' ')<>new_res then
  raise exception 'Reenvio da troca devolveu outra reserva';
 end if;
 perform public.mc_reduce_print_plan(w,p,'optional-reduce-00002',
  jsonb_build_array(jsonb_build_object('output_id',output_id,'new_planned',3)),'[]','Motivo original preservado');
 perform public.mc_cancel_print(w,p,'optional-cancel-00001',null);
 perform public.mc_cancel_print(w,p,'optional-cancel-00001',' ');
 if (select count(*) from public.mc_audit_events where entity_id=p and reason is null
     and action in ('cancel_print','reduce_print_plan','swap_reserved_lot'))<>3 then
  raise exception 'Ações sem motivo ausentes ou duplicadas';
 end if;
 select id into strict original_event from public.mc_audit_events where entity_id=p and action='cancel_print';
 select id into strict reason_given_event from public.mc_audit_events where entity_id=p and reason='Motivo original preservado';

 execute 'set local role authenticated';
 insert into public.mc_print_audit_notes(audit_event_id,workspace_id,reason)
  values (original_event,w,'Cliente confirmou a desistência');
 insert into public.mc_print_audit_notes(audit_event_id,workspace_id,reason)
  values (original_event,w,'Tentativa de substituir o motivo') on conflict(audit_event_id) do nothing;
 if (select count(*) from public.mc_print_audit_notes where audit_event_id=original_event
     and reason='Cliente confirmou a desistência' and added_by=owner_id and added_at is not null)<>1 then
  raise exception 'Complemento original ou autoria ausentes';
 end if;
 denied:=false;
 begin
  insert into public.mc_print_audit_notes(audit_event_id,workspace_id,reason)
   values(reason_given_event,w,'Tentativa de alterar o original');
 exception when insufficient_privilege then denied:=true;
 end;
 if not denied then raise exception 'Complemento permitido em evento com motivo original'; end if;
 perform set_config('request.jwt.claim.sub',other_user::text,true);
 if exists(select 1 from public.mc_print_audit_notes where audit_event_id=original_event) then
  raise exception 'Complemento visível a usuário externo';
 end if;
 denied:=false;
 begin
  insert into public.mc_print_audit_notes(audit_event_id,workspace_id,reason)
   values(original_event,w,'Tentativa fora da oficina') on conflict(audit_event_id) do nothing;
 exception when insufficient_privilege then denied:=true;
 end;
 if not denied then raise exception 'Complemento aceito fora da oficina'; end if;
 execute 'reset role';
 if exists(select 1 from public.mc_audit_events where id=original_event and reason is not null) then
  raise exception 'Motivo original foi reescrito';
 end if;
end
$test$;
rollback;
