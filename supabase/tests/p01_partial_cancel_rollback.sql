-- P01-E: redução parcial independente de custo/rateio. Ambiente efêmero, rollback.
begin;
do $test$
declare
 w uuid;u uuid; printer uuid; product uuid;lot uuid;
 a uuid;b uuid;oa uuid;ra uuid;rb uuid; k text;
 seen integer; left_g numeric;phys numeric;denied boolean;
begin
 select workspace_id,user_id into w,u from public.mc_members
 where active and role in ('owner','manager') limit 1;
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active and kind in ('product','component') limit 1;
 if w is null or printer is null or product is null then raise exception 'Fixtures P01-E indisponíveis';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 lot:=public.mc_register_existing_spool(w,'p01-e-'||gen_random_uuid()::text,'PETG','Bobina P01-E',100,'measured',null,'CI rollback');
 a:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',5)),null,'Redução parcial','slicer');
 b:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),null,'Outra ordem','slicer');
 select id into oa from public.mc_production_outputs where workspace_id=w and production_id=a;
 ra:=public.mc_reserve_print_lot(w,a,lot,50,'p01-e-r-a-'||gen_random_uuid()::text);
 rb:=public.mc_reserve_print_lot(w,b,lot,20,'p01-e-r-b-'||gen_random_uuid()::text);
 perform public.mc_confirm_print(w,a,'p01-e-confirm-'||gen_random_uuid()::text,
 jsonb_build_array(jsonb_build_object('output_id',oa,'good',2,'failed',1)),
 jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',30,'purge_g',0,'loss_g',0,'basis','weighed')),0.75,false);
 if (select remaining from public.mc_production_reservations where id=ra)<>20 then
 raise exception 'Reserva após consumo parcial deveria ser 20';end if;
 k:='p01-e-reduce-'||gen_random_uuid()::text;
 perform public.mc_reduce_print_plan(w,a,k,
 jsonb_build_array(jsonb_build_object('output_id',oa,'new_planned',3)),
 jsonb_build_array(jsonb_build_object('reservation_id',ra,'release_g',12)),
 'Cliente reduziu duas unidades não produzidas');
 if (select planned_quantity from public.mc_production_outputs where id=oa)<>3 then raise exception 'Planejamento não foi reduzido';end if;
 if (select confirmed_good from public.mc_production_outputs where id=oa)<>2
 or (select confirmed_failed from public.mc_production_outputs where id=oa)<>1 then raise exception 'Produção histórica foi alterada';end if;
 if (select actual_hours from public.mc_productions where id=a)<>0.75 then raise exception 'Tempo histórico foi alterado';end if;
 if (select status from public.mc_productions where id=a)<>'partial' then raise exception 'Ordem foi encerrada indevidamente';end if;
 select remaining into left_g from public.mc_production_reservations where id=ra;
 if left_g<>8 then raise exception 'Reserva deveria manter 8 g, mas ficou %',left_g;end if;
 if (select remaining from public.mc_production_reservations where id=rb)<>20 then raise exception 'Reserva alheia alterada';end if;
 select coalesce(sum(delta),0) into phys from public.mc_stock_movements where workspace_id=w and lot_id=lot;
 if phys<>70 then raise exception 'Redução parcial reverteu consumo físico: %',phys;end if;
 if (select (details->>'released_g')::numeric from public.mc_audit_events
 where workspace_id=w and entity_id=ra and action='release_partial_cancel')<>12 then raise exception 'Liberação por lote sem auditoria';end if;
 select count(*) into seen from public.mc_audit_events where workspace_id=w and entity_id=a and action='reduce_print_plan';
 perform public.mc_reduce_print_plan(w,a,k,
 jsonb_build_array(jsonb_build_object('output_id',oa,'new_planned',3)),
 jsonb_build_array(jsonb_build_object('reservation_id',ra,'release_g',12)),
 'Cliente reduziu duas unidades não produzidas');
 if (select count(*) from public.mc_audit_events where workspace_id=w and entity_id=a and action='reduce_print_plan')<>seen
 or (select remaining from public.mc_production_reservations where id=ra)<>8 then raise exception 'Replay de redução duplicou efeitos';end if;
 denied:=false;
 begin
 perform public.mc_reduce_print_plan(w,a,k,
 jsonb_build_array(jsonb_build_object('output_id',oa,'new_planned',2)),
 '[]'::jsonb,'Cliente reduziu duas unidades não produzidas');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Reuso de chave com outro payload passou';end if;
 denied:=false;
 begin
 perform public.mc_reduce_print_plan(w,a,'p01-e-under-'||gen_random_uuid()::text,
 jsonb_build_array(jsonb_build_object('output_id',oa,'new_planned',2)),
 '[]'::jsonb,'Nunca reduzir abaixo do confirmado');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Redução de planejamento abaixo do confirmado passou';end if;
 denied:=false;
 begin
 perform public.mc_reduce_print_plan(w,a,'p01-e-release-too-much-'||gen_random_uuid()::text,
 jsonb_build_array(jsonb_build_object('output_id',oa,'new_planned',2)),
 jsonb_build_array(jsonb_build_object('reservation_id',ra,'release_g',9)),
 'Excedente maior que reserva ainda ativa');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Liberação acima do saldo da reserva passou';end if;
 if (select remaining from public.mc_production_reservations where id=ra)<>8
 or (select planned_quantity from public.mc_production_outputs where id=oa)<>3 then
 raise exception 'Rejeição não reverteu a transação';end if;
 denied:=false;
 begin
 perform public.mc_reduce_print_plan(w,a,'p01-e-foreign-reserve-'||gen_random_uuid()::text,
 jsonb_build_array(jsonb_build_object('output_id',oa,'new_planned',2)),
 jsonb_build_array(jsonb_build_object('reservation_id',rb,'release_g',1)),
 'Não podemos liberar reserva de outra ordem');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Reserva de outra ordem liberada';end if;
 -- Redução para 0 unidades somente em ordem sem qualquer saída confirmada.
 perform public.mc_reduce_print_plan(w,b,'p01-e-zero-'||gen_random_uuid()::text,
 (select jsonb_build_array(jsonb_build_object('output_id',id,'new_planned',0))
 from public.mc_production_outputs where production_id=b),
 jsonb_build_array(jsonb_build_object('reservation_id',rb,'release_g',20)),
 'Remover única unidade sem produção');
 if (select remaining from public.mc_production_reservations where id=rb)<>0
 or (select status from public.mc_production_reservations where id=rb)<>'released' then
 raise exception 'Liberação total não marcou status released';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_reduce_print_plan(w,a,'p01-e-nonmember-'||gen_random_uuid()::text,
 jsonb_build_array(jsonb_build_object('output_id',oa,'new_planned',2)),
 '[]'::jsonb,'Teste de autorização de não membro');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Não membro alterou planejamento';end if;
 if has_function_privilege('anon','public.mc_reduce_print_plan(uuid,uuid,text,jsonb,jsonb,text)','EXECUTE') then
 raise exception 'anon pode reduzir planejamento';end if;
 raise notice 'P01-E: redução proporcional em peças com gramas explícitos, sem reverter consumo, auditoria, replay, rollback e RLS: APROVADO';
end
$test$;
rollback;
