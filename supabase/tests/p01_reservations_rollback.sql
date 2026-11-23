-- P01 core: optional logical reservations and reconciliation, in disposable CI only.
-- No writes survive: transaction is rolled back.
begin;
do $p01$
declare
 w uuid; u uuid; printer uuid; prod uuid; lot uuid;
 a uuid; b uuid; c uuid; ra uuid; rb uuid; ra_replay uuid; oa uuid;
 bal numeric; reserved numeric; cnt integer; denied boolean; excess jsonb;
 key_a text := 'p01-ra-'||gen_random_uuid()::text;
 key_b text := 'p01-rb-'||gen_random_uuid()::text;
 key_1 text := 'p01-consume1-'||gen_random_uuid()::text;
begin
 select m.workspace_id,m.user_id into w,u from public.mc_members m
 where m.active and m.role in ('owner','manager')
 and exists(select 1 from public.mc_printers where workspace_id=m.workspace_id and active)
 and exists(select 1 from public.mc_products where workspace_id=m.workspace_id and active and kind in ('product','component'))
 limit 1;
 if w is null then raise exception 'Fixture da oficina P01 indisponível'; end if;
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into prod from public.mc_products where workspace_id=w and active and kind in ('product','component') limit 1;
 perform set_config('request.jwt.claim.sub',u::text,true);
 lot:=public.mc_register_existing_spool(w,'p01-lot-'||gen_random_uuid()::text,'PETG QA P01',
 'Bobina P01',100,'measured',null,'rollback CI');
 a:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',prod,'quantity',1)),null,'Ordem A','slicer');
 b:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',prod,'quantity',1)),null,'Ordem B','slicer');
 c:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',prod,'quantity',1)),null,'Ordem C','slicer');
 select id into oa from public.mc_production_outputs where production_id=a and workspace_id=w;
 ra:=public.mc_reserve_print_lot(w,a,lot,30,key_a);
 ra_replay:=public.mc_reserve_print_lot(w,a,lot,30,key_a);
 if ra is distinct from ra_replay then raise exception 'Reserva idempotente duplicou registro'; end if;
 rb:=public.mc_reserve_print_lot(w,b,lot,60,key_b);
 select coalesce(sum(delta),0) into bal from public.mc_stock_movements where workspace_id=w and lot_id=lot;
 select coalesce(sum(remaining),0) into reserved from public.mc_production_reservations
 where workspace_id=w and lot_id=lot and status='active';
 if bal<>100 or reserved<>90 then raise exception 'Reserva alterou estoque físico (%), reservas (%)',bal,reserved; end if;
 denied:=false;
 begin perform public.mc_reserve_print_lot(w,c,lot,11,'p01-over-'||gen_random_uuid()::text);
 exception when others then denied:=true; end;
 if not denied then raise exception 'Reserva acima da disponibilidade foi aceita'; end if;
 denied:=false;
 begin perform public.mc_reserve_print_lot(w,a,lot,31,key_a);
 exception when others then denied:=true; end;
 if not denied then raise exception 'Replay de reserva com outro payload foi aceito'; end if;
 denied:=false;
 begin perform public.mc_reserve_print_lot(w,a,lot,2,'p01-duplicate-'||gen_random_uuid()::text);
 exception when others then denied:=true; end;
 if not denied then raise exception 'Reserva ativa duplicada na mesma ordem/lote'; end if;
 perform public.mc_confirm_print(w,a,key_1,
 jsonb_build_array(jsonb_build_object('output_id',oa,'good',1,'failed',0)),
 jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',20,'purge_g',0,'loss_g',0,'basis','weighed')),
 null,false);
 perform public.mc_confirm_print(w,a,key_1,
 jsonb_build_array(jsonb_build_object('output_id',oa,'good',1,'failed',0)),
 jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',20,'purge_g',0,'loss_g',0,'basis','weighed')),
 null,false);
 select remaining into bal from public.mc_production_reservations where id=ra;
 if bal<>10 then raise exception 'Consumo parcial não conciliou reserva (remaining=%)',bal; end if;
 select count(*) into cnt from public.mc_production_confirmations where workspace_id=w and idempotency_key=key_1;
 if cnt<>1 then raise exception 'Replay de baixa reservada duplicou confirmação'; end if;
 -- A ordem A ainda aberta mantém 10 g reservados; a de B permanece 60 g.
 denied:=false;
 begin perform public.mc_reserve_print_lot(w,c,lot,11,'p01-over2-'||gen_random_uuid()::text);
 exception when others then denied:=true; end;
 if not denied then raise exception 'Sobra da reserva parcial foi liberada prematuramente'; end if;
 -- Excedente de 5 g: A tinha 10 g de reserva, saldo livre era 10 g.
 perform public.mc_confirm_print(w,a,'p01-excess-'||gen_random_uuid()::text,'[]'::jsonb,
 jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',15,'purge_g',0,'loss_g',0,'basis','weighed')),
 null,false);
 if (select remaining from public.mc_production_reservations where id=ra)<>0
  or (select status from public.mc_production_reservations where id=ra)<>'fulfilled' then
  raise exception 'Reserva consumida não foi marcada como fulfilled'; end if;
 select details->'reservation_excesses' into excess from public.mc_audit_events
  where workspace_id=w and entity='production_confirmation' and details ? 'reservation_excesses'
 order by created_at desc limit 1;
 if excess is null or jsonb_array_length(excess)<>1 or (excess->0->>'excess_g')::numeric<>5 then
  raise exception 'Excedente de 5 g não auditado: %',excess; end if;
 -- Protege reserva de B: saldo físico 65 g, comprometidos 60 g.
 denied:=false;
 begin perform public.mc_confirm_print(w,a,'p01-steal-'||gen_random_uuid()::text,'[]'::jsonb,
 jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',6,'purge_g',0,'loss_g',0,'basis','weighed')),
 null,false);
 exception when others then denied:=true; end;
 if not denied then raise exception 'Baixa apropriou reserva da ordem B'; end if;
 perform public.mc_confirm_print(w,b,'p01-b-'||gen_random_uuid()::text,'[]'::jsonb,
 jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',60,'purge_g',0,'loss_g',0,'basis','weighed')),
 null,false);
 select coalesce(sum(delta),0) into bal from public.mc_stock_movements where workspace_id=w and lot_id=lot;
 if bal<>5 then raise exception 'Saldo físico após conciliação incorreto: %',bal; end if;
 if (select status from public.mc_production_reservations where id=rb)<>'fulfilled' then
  raise exception 'Reserva B não concluída'; end if;
 perform public.mc_reserve_print_lot(w,c,lot,5,'p01-final-'||gen_random_uuid()::text);
 denied:=false;
 begin perform public.mc_reserve_print_lot(w,a,lot,1,'p01-last-'||gen_random_uuid()::text);
 exception when others then denied:=true; end;
 if not denied then raise exception 'Reserva ignorou os últimos 5 g já comprometidos'; end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_reserve_print_lot(w,a,lot,1,'p01-foreign-'||gen_random_uuid()::text);
 exception when others then denied:=true; end;
 if not denied then raise exception 'Usuário estranho reservou bobina'; end if;
 if has_function_privilege('anon','public.mc_reserve_print_lot(uuid,uuid,uuid,numeric,text)','EXECUTE') then
  raise exception 'anon executa reserva'; end if;
 raise notice 'P01: reservas sem baixa, limites, partial, replay, excedente, proteção de outra ordem e RLS aprovados (ROLLBACK)';
end
$p01$;
rollback;
