-- P01-A/B: regression only in disposable CI, fully rolled back.
begin;
do $lifecycle$
declare w uuid; u uuid; printer uuid; product uuid; lot uuid;
 a uuid; b uuid; oa uuid; ra uuid; rb uuid; k text;
 bal numeric; count_before integer; count_after integer; denied boolean;
begin
 select workspace_id,user_id into w,u from public.mc_members
 where active and role in ('owner','manager') limit 1;
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active
  and kind in ('component','product') limit 1;
 if w is null or printer is null or product is null then
  raise exception 'Fixtures P01-A/B ausentes'; end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 lot:=public.mc_register_existing_spool(w,'p01-life-lot-'||gen_random_uuid()::text,
  'PETG de teste','Bobina ciclo P01',100,'measured',null,'rollback CI');
 a:=public.mc_create_print(w,printer,
   jsonb_build_array(jsonb_build_object('product_id',product,'quantity',2)),
   null,'Impressão para cancelamento','slicer');
 b:=public.mc_create_print(w,printer,
   jsonb_build_array(jsonb_build_object('product_id',product,'quantity',2)),
   null,'Outra impressão','slicer');
 select id into oa from public.mc_production_outputs where production_id=a;
 ra:=public.mc_reserve_print_lot(w,a,lot,40,'p01-life-res-a-'||gen_random_uuid()::text);
 rb:=public.mc_reserve_print_lot(w,b,lot,30,'p01-life-res-b-'||gen_random_uuid()::text);
 -- Data vencida sinaliza revisão, nunca libera reserva e não altera estoque.
 perform public.mc_set_print_reservation_due(w,ra,'2020-01-01 00:00:00+00'::timestamptz);
 if (select due_at from public.mc_production_reservations where id=ra)
   is distinct from '2020-01-01 00:00:00+00'::timestamptz then
  raise exception 'Prazo opcional P01-B não salvo'; end if;
 select count(*) into count_before from public.mc_audit_events
 where workspace_id=w and entity_id=ra and action='set_review_due';
 perform public.mc_set_print_reservation_due(w,ra,'2020-01-01 00:00:00+00'::timestamptz);
 select count(*) into count_after from public.mc_audit_events
 where workspace_id=w and entity_id=ra and action='set_review_due';
 if count_before<>count_after then raise exception 'Retry duplicou auditoria de prazo'; end if;
 if (select remaining from public.mc_production_reservations where id=ra)<>40 then
  raise exception 'Prazo vencido liberou saldo sem autorização'; end if;
 select coalesce(sum(delta),0) into bal from public.mc_stock_movements
  where workspace_id=w and lot_id=lot;
 if bal<>100 then raise exception 'Prazo movimentou estoque'; end if;
 -- Consumo parcial de 15 g e uma boa, preservado mesmo após cancelamento.
 perform public.mc_confirm_print(w,a,'p01-life-confirm-'||gen_random_uuid()::text,
  jsonb_build_array(jsonb_build_object('output_id',oa,'good',1,'failed',0)),
  jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',15,'purge_g',0,
   'loss_g',0,'basis','weighed')),0.75,false);
 if (select remaining from public.mc_production_reservations where id=ra)<>25 then
  raise exception 'Reserva não foi conciliada antes do cancelamento'; end if;
 k:='p01-life-cancel-'||gen_random_uuid()::text;
 perform public.mc_cancel_print(w,a,k,'Cancelamento após consumo parcial real');
 if (select status from public.mc_productions where id=a)<>'cancelled' then
  raise exception 'Ordem não foi cancelada'; end if;
 if (select remaining from public.mc_production_reservations where id=ra)<>0
    or (select status from public.mc_production_reservations where id=ra)<>'released' then
  raise exception 'Sobra de 25 g não foi liberada'; end if;
 if (select remaining from public.mc_production_reservations where id=rb)<>30 then
  raise exception 'Cancelamento mexeu na reserva da outra ordem'; end if;
 if (select confirmed_good from public.mc_production_outputs where id=oa)<>1 then
  raise exception 'Cancelamento apagou histórico de peças boas'; end if;
 if (select actual_hours from public.mc_productions where id=a)<>0.75 then
  raise exception 'Cancelamento apagou tempo real'; end if;
 select coalesce(sum(delta),0) into bal from public.mc_stock_movements
 where workspace_id=w and lot_id=lot;
 if bal<>85 then raise exception 'Cancelamento devolveu ao estoque material extrudado: %',bal; end if;
 if (select count(*) from public.mc_audit_events where workspace_id=w
     and entity_id=ra and action='release_on_cancel')<>1 then
  raise exception 'Liberação não auditada exatamente uma vez'; end if;
 if (select (details->'released_reservations'->0->>'released_g')::numeric
   from public.mc_audit_events where workspace_id=w and entity_id=a
   and action='cancel_print')<>25 then
  raise exception 'Auditoria não reflete liberação de 25 g'; end if;
 select count(*) into count_before from public.mc_audit_events where workspace_id=w
  and action='cancel_print' and entity_id=a;
 perform public.mc_cancel_print(w,a,k,'Cancelamento após consumo parcial real');
 select count(*) into count_after from public.mc_audit_events where workspace_id=w
  and action='cancel_print' and entity_id=a;
 if count_before<>count_after then raise exception 'Replay de cancelamento duplicou auditoria'; end if;
 denied:=false;
 begin perform public.mc_cancel_print(w,a,k,'Justificativa diferente não permitida');
 exception when others then denied:=true; end;
 if not denied then raise exception 'Chave de cancelamento permitiu novo payload'; end if;
 denied:=false;
 begin perform public.mc_confirm_print(w,a,'p01-life-after-cancel-'||gen_random_uuid()::text,
  '[]'::jsonb,jsonb_build_array(jsonb_build_object('lot_id',lot,
   'model_g',1,'purge_g',0,'loss_g',0,'basis','weighed')),null,false);
 exception when others then denied:=true; end;
 if not denied then raise exception 'Impressão cancelada aceitou nova baixa'; end if;
 denied:=false;
 begin perform public.mc_set_print_reservation_due(w,ra,now());
 exception when others then denied:=true; end;
 if not denied then raise exception 'Reserva liberada aceitou alteração de vencimento'; end if;
 -- Reagendar e limpar o prazo de uma reserva ativa não libera seu saldo.
 perform public.mc_set_print_reservation_due(w,rb,'2035-01-01 00:00:00+00'::timestamptz);
 perform public.mc_set_print_reservation_due(w,rb,null);
 if (select due_at from public.mc_production_reservations where id=rb) is not null
 or (select remaining from public.mc_production_reservations where id=rb)<>30 then
  raise exception 'Limpeza do prazo afetou reserva'; end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_cancel_print(w,b,'p01-unauth-cancel-001','Acesso não autorizado à ordem');
 exception when others then denied:=true; end;
 if not denied then raise exception 'Não membro conseguiu cancelar impressão'; end if;
 denied:=false;
 begin perform public.mc_set_print_reservation_due(w,rb,null);
 exception when others then denied:=true; end;
 if not denied then raise exception 'Não membro alterou prazo de reserva'; end if;
 if has_function_privilege('anon','public.mc_cancel_print(uuid,uuid,text,text)','EXECUTE')
 or has_function_privilege('anon','public.mc_set_print_reservation_due(uuid,uuid,timestamptz)','EXECUTE') then
  raise exception 'anon com EXECUTE indevido nas novas RPCs'; end if;
 raise notice 'P01-A/B: cancelamento idempotente, liberação auditada, histórico preservado, prazo opcional sem baixa e autorização: APROVADOS (ROLLBACK)';
end
$lifecycle$;
rollback;
