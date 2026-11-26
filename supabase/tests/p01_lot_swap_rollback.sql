-- P01-D: troca atômica de reserva e preços históricos por lote; CI efêmero.
begin;
do $test$
declare
 w uuid; u uuid; printer uuid; product uuid;
 lot_a uuid;lot_b uuid; lot_small uuid;lot_foreign uuid;
 p uuid;other_p uuid;old_res uuid;new_res uuid; other_res uuid;
 after_a numeric;after_b numeric;denied boolean; k text;
 count_a integer;count_b integer; old_snap numeric;new_snap numeric;
 audit_before integer;audit_after integer;
begin
 select workspace_id,user_id into w,u from public.mc_members
 where active and role in ('owner','manager') limit 1;
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active and kind in ('component','product') limit 1;
 if w is null or printer is null or product is null then raise exception 'Fixtures P01-D ausentes';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 lot_a:=public.mc_register_existing_spool(w,'p01-d-a-'||gen_random_uuid()::text,
  'PETG de teste A','Bobina A',1000,'measured',68,'CI, custo hipotético');
 lot_b:=public.mc_register_existing_spool(w,'p01-d-b-'||gen_random_uuid()::text,
  'PETG de teste B','Bobina B',1000,'measured',73,'CI, custo hipotético');
 lot_small:=public.mc_register_existing_spool(w,'p01-d-s-'||gen_random_uuid()::text,
  'PETG de teste C','Bobina C',20,'measured',null,'CI, custo desconhecido');
 p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',2)),
  null,'Troca de bobina P01-D','slicer');
 other_p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),
  null,'Ordem alheia P01-D','slicer');
 old_res:=public.mc_reserve_print_lot(w,p,lot_a,300,'p01-d-hold-a-'||gen_random_uuid()::text);
 perform public.mc_confirm_print(w,p,'p01-d-consume-a-'||gen_random_uuid()::text,'[]'::jsonb,
  jsonb_build_array(jsonb_build_object('lot_id',lot_a,'model_g',180,'purge_g',0,
  'loss_g',0,'basis','weighed')),null,false);
 select unit_cost_snapshot into old_snap from public.mc_production_consumption
 where workspace_id=w and lot_id=lot_a and confirmation_id in
  (select id from public.mc_production_confirmations where production_id=p);
 if old_snap<>0.068 then raise exception 'Preço histórico A inválido: %',old_snap;end if;
 k:='p01-d-swap-'||gen_random_uuid()::text;
 new_res:=public.mc_swap_print_reserved_lot(w,p,old_res,lot_b,120,120,k,
 'Troca física registrada e reserva remanescente transferida');
 if (select status from public.mc_production_reservations where id=old_res)<>'released'
    or (select remaining from public.mc_production_reservations where id=old_res)<>0 then
  raise exception 'Sobra de A não liberada';end if;
 if (select remaining from public.mc_production_reservations where id=new_res)<>120 then
  raise exception 'Nova reserva B não registrada';end if;
 select coalesce(sum(delta),0) into after_a from public.mc_stock_movements where workspace_id=w and lot_id=lot_a;
 select coalesce(sum(delta),0) into after_b from public.mc_stock_movements where workspace_id=w and lot_id=lot_b;
 if after_a<>820 or after_b<>1000 then
  raise exception 'Troca de reserva não pode movimentar estoque A % B %',after_a,after_b;end if;
 -- Replay exato não cria segunda reserva nem duplica auditoria.
 select count(*) into audit_before from public.mc_audit_events
 where workspace_id=w and action='swap_reserved_lot' and entity_id=p;
 if public.mc_swap_print_reserved_lot(w,p,old_res,lot_b,120,120,k,
 'Troca física registrada e reserva remanescente transferida') is distinct from new_res then
  raise exception 'Replay de troca retornou reserva diferente';end if;
 select count(*) into audit_after from public.mc_audit_events
 where workspace_id=w and action='swap_reserved_lot' and entity_id=p;
 if audit_before<>audit_after then raise exception 'Replay duplicou auditoria';end if;
 denied:=false;
 begin perform public.mc_swap_print_reserved_lot(w,p,old_res,lot_b,120,121,k,
 'Troca física registrada e reserva remanescente transferida');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Payload divergente reutilizou chave';end if;
 perform public.mc_confirm_print(w,p,'p01-d-consume-b-'||gen_random_uuid()::text,'[]'::jsonb,
  jsonb_build_array(jsonb_build_object('lot_id',lot_b,'model_g',120,'purge_g',0,
  'loss_g',0,'basis','weighed')),null,false);
 select unit_cost_snapshot into new_snap from public.mc_production_consumption
 where workspace_id=w and lot_id=lot_b and confirmation_id in
  (select id from public.mc_production_confirmations where production_id=p);
 if new_snap<>0.073 then raise exception 'Preço histórico B inválido: %',new_snap;end if;
 select count(*) into count_a from public.mc_production_consumption
 where workspace_id=w and lot_id=lot_a and confirmation_id in
  (select id from public.mc_production_confirmations where production_id=p);
 select count(*) into count_b from public.mc_production_consumption
 where workspace_id=w and lot_id=lot_b and confirmation_id in
  (select id from public.mc_production_confirmations where production_id=p);
 if count_a<>1 or count_b<>1 then
  raise exception 'Consumos não permaneceram separados por lote A % B %',count_a,count_b;end if;
 if (select unit_cost_snapshot from public.mc_production_consumption where workspace_id=w
  and lot_id=lot_a and confirmation_id in
  (select id from public.mc_production_confirmations where production_id=p))<>old_snap then
  raise exception 'Troca sobrescreveu preço histórico A';end if;
 select coalesce(sum(delta),0) into after_a from public.mc_stock_movements where workspace_id=w and lot_id=lot_a;
 select coalesce(sum(delta),0) into after_b from public.mc_stock_movements where workspace_id=w and lot_id=lot_b;
 if after_a<>820 or after_b<>880 then raise exception 'Baixas físicas não correspondem a cada bobina';end if;
 -- Custo hipotético por lote: 180*0.068 + 120*0.073 = 21,00.
 if (select sum((model_quantity+purge_quantity+loss_quantity)*unit_cost_snapshot)
  from public.mc_production_consumption where workspace_id=w and confirmation_id in
  (select id from public.mc_production_confirmations where production_id=p))<>21 then
  raise exception 'Total histórico por bobina não corresponde a 21';end if;
 -- A troca de uma reserva deve proteger outra ordem e a disponibilidade da nova bobina.
 other_res:=public.mc_reserve_print_lot(w,other_p,lot_a,100,'p01-d-other-'||gen_random_uuid()::text);
 denied:=false;
 begin perform public.mc_swap_print_reserved_lot(w,p,other_res,lot_small,10,10,
  'p01-d-other-swap-'||gen_random_uuid()::text,'Proibida reserva de outra ordem');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Troca de reserva alheia aprovada';end if;
 -- Nova reserva no mesmo lote da ordem não deve sobrescrever reserva existente.
 denied:=false;
 begin perform public.mc_swap_print_reserved_lot(w,other_p,other_res,lot_a,5,5,
  'p01-d-same-'||gen_random_uuid()::text,'Lote de origem e destino iguais');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Troca para mesma bobina aprovada';end if;
 denied:=false;
 begin perform public.mc_swap_print_reserved_lot(w,other_p,other_res,lot_small,5,21,
  'p01-d-insufficient-'||gen_random_uuid()::text,'Bobina substituta sem saldo');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Troca acima da capacidade da bobina nova foi aceita';end if;
 if (select remaining from public.mc_production_reservations where id=other_res)<>100 then
  raise exception 'Rejeição não reverteu reserva de origem';end if;
 -- Liberação parcial de origem deixa o restante da reserva ativo.
 perform public.mc_swap_print_reserved_lot(w,other_p,other_res,lot_small,20,15,
  'p01-d-partial-'||gen_random_uuid()::text,'Liberar somente vinte gramas da origem');
 if (select remaining from public.mc_production_reservations where id=other_res)<>80
  or (select status from public.mc_production_reservations where id=other_res)<>'active' then
  raise exception 'Troca parcial liberou demais a origem';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_swap_print_reserved_lot(w,other_p,other_res,lot_b,5,5,
  'p01-d-foreign-'||gen_random_uuid()::text,'Usuário sem acesso à oficina');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Não membro trocou reserva';end if;
 if has_function_privilege('anon',
  'public.mc_swap_print_reserved_lot(uuid,uuid,uuid,uuid,numeric,numeric,text,text)','EXECUTE') then
  raise exception 'RPC disponível a anon';end if;
 raise notice 'P01-D: troca atômica, liberação parcial, replay, autorização, custos históricos por lote e estoque preservado: APROVADO';
end
$test$;
rollback;
