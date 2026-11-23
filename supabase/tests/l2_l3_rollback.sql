-- MakerCusto L2/L3: ensaio reversível para banco de teste com migração aplicada.
-- NÃO EXECUTAR no banco operacional sem janela de homologação.
-- Executar como administrador SQL; JWT simulado testa a lógica das RPCs, não substitui token real/RLS E2E.
-- A transação termina SEMPRE em ROLLBACK, mesmo com asserts bem-sucedidos.
begin;
do $test$
declare
 v_ws uuid; v_user uuid; v_printer uuid; v_product uuid; v_output uuid;
 v_lot uuid; v_print uuid; v_confirm uuid; v_replayed uuid;
 v_before numeric; v_after numeric; v_count integer; v_denied boolean;
 v_key text := 'l3-test-'||gen_random_uuid()::text;
begin
 select m.workspace_id,m.user_id into v_ws,v_user
 from public.mc_members m
 where m.active and m.role in ('owner','manager')
   and exists(select 1 from public.mc_printers p where p.workspace_id=m.workspace_id and p.active)
   and exists(select 1 from public.mc_products p where p.workspace_id=m.workspace_id and p.kind in ('component','product') and p.active)
 limit 1;
 if v_ws is null then raise exception 'Pré-requisito de teste: oficina com gestor, impressora física e peça'; end if;
 select id into v_printer from public.mc_printers where workspace_id=v_ws and active limit 1;
 select id into v_product from public.mc_products where workspace_id=v_ws and active and kind in ('component','product') limit 1;
 perform set_config('request.jwt.claim.sub',v_user::text,true);

 v_lot:=public.mc_register_existing_spool(v_ws,'l3-lot-'||gen_random_uuid()::text,
 'PETG de teste reversível','Bobina QA',12.500,'measured',null,'somente rollback');
 select coalesce(sum(delta),0) into v_before from public.mc_stock_movements where workspace_id=v_ws and lot_id=v_lot;
 if v_before<>12.500 then raise exception 'L1: saldo de fixture inesperado'; end if;

 v_print:=public.mc_create_print(v_ws,v_printer,
 jsonb_build_array(jsonb_build_object('product_id',v_product,'quantity',2)),null,'ensaio rollback','slicer');
 select id into v_output from public.mc_production_outputs
 where workspace_id=v_ws and production_id=v_print limit 1;
 select coalesce(sum(delta),0) into v_after from public.mc_stock_movements where workspace_id=v_ws and lot_id=v_lot;
 if v_after<>v_before then raise exception 'L2 baixou estoque prematuramente'; end if;

 v_confirm:=public.mc_confirm_print(v_ws,v_print,v_key,
 jsonb_build_array(jsonb_build_object('output_id',v_output,'good',1,'failed',0)),
 jsonb_build_array(jsonb_build_object('lot_id',v_lot,'model_g',5.125,'purge_g',0,'loss_g',0,'basis','weighed')),
 null,false);
 v_replayed:=public.mc_confirm_print(v_ws,v_print,v_key,
 jsonb_build_array(jsonb_build_object('output_id',v_output,'good',1,'failed',0)),
 jsonb_build_array(jsonb_build_object('lot_id',v_lot,'model_g',5.125,'purge_g',0,'loss_g',0,'basis','weighed')),
 null,false);
 if v_confirm is distinct from v_replayed then raise exception 'Replay criou outra confirmação'; end if;
 select count(*) into v_count from public.mc_production_confirmations where workspace_id=v_ws and idempotency_key=v_key;
 if v_count<>1 then raise exception 'Replay duplicou confirmações'; end if;
 select coalesce(sum(delta),0) into v_after from public.mc_stock_movements where workspace_id=v_ws and lot_id=v_lot;
 if v_after<>7.375 then raise exception 'L3 baixou quantidade incorreta: %',v_after; end if;

 v_denied:=false;
 begin
 perform public.mc_confirm_print(v_ws,v_print,v_key,
  jsonb_build_array(jsonb_build_object('output_id',v_output,'good',1,'failed',0)),
  jsonb_build_array(jsonb_build_object('lot_id',v_lot,'model_g',1,'purge_g',0,'loss_g',0,'basis','weighed')),
  null,false);
 exception when others then v_denied:=true; end;
 if not v_denied then raise exception 'Payload divergente com mesma chave foi aceito'; end if;

 v_denied:=false;
 begin
 perform public.mc_confirm_print(v_ws,v_print,'l3-insufficient-'||gen_random_uuid()::text,
  '[]'::jsonb,
  jsonb_build_array(jsonb_build_object('lot_id',v_lot,'model_g',100,'purge_g',0,'loss_g',0,'basis','weighed')),
  null,false);
 exception when others then v_denied:=true; end;
 if not v_denied then raise exception 'Baixa com saldo negativo foi aceita'; end if;
 select coalesce(sum(delta),0) into v_after from public.mc_stock_movements where workspace_id=v_ws and lot_id=v_lot;
 if v_after<>7.375 then raise exception 'Tentativa rejeitada alterou estoque'; end if;

 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 v_denied:=false;
 begin perform public.mc_create_print(v_ws,v_printer,
  jsonb_build_array(jsonb_build_object('product_id',v_product,'quantity',1)),
  null,'não autorizado','slicer');
 exception when others then v_denied:=true; end;
 if not v_denied then raise exception 'Usuário estranho criou impressão'; end if;
 if has_function_privilege('anon','public.mc_create_print(uuid,uuid,jsonb,numeric,text,text)','EXECUTE')
 or has_function_privilege('anon','public.mc_confirm_print(uuid,uuid,text,jsonb,jsonb,numeric,boolean)','EXECUTE')
 then raise exception 'anon indevidamente autorizado'; end if;
 raise notice 'L2/L3: asserts de criação sem baixa, baixa incremental, replay, payload divergente, saldo e autoria aprovados (ROLLBACK)';
end
$test$;
rollback;
