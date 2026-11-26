-- L4-R01: fonte monetária histórica, isolada por oficina, sem escrita.
begin;
do $test$
declare w uuid; u uuid; printer uuid; product uuid; known_lot uuid; unknown_lot uuid; p uuid;
 data jsonb; c jsonb; initial_movement bigint; final_movement bigint;
 initial_audit bigint;final_audit bigint; denied boolean:=false;
begin
 select m.workspace_id,m.user_id into w,u from public.mc_members m
 where m.active and m.role in ('owner','manager')
 and exists(select 1 from public.mc_printers where workspace_id=m.workspace_id and active)
 and exists(select 1 from public.mc_products where workspace_id=m.workspace_id and active and kind in ('product','component'))
 limit 1;
 if w is null then raise exception 'Fixture L4 ausente';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active and kind in ('product','component') limit 1;
 known_lot:=public.mc_register_existing_spool(w,'l4-read-known-'||gen_random_uuid()::text,
  'PETG teste','Bobina conhecida',80,'measured',5.12,'Valor informado pela oficina');
 unknown_lot:=public.mc_register_existing_spool(w,'l4-read-unknown-'||gen_random_uuid()::text,
  'PETG teste','Bobina sem custo',80,'informed',null,'Sem preço de aquisição');
 p:=public.mc_create_print(w,printer,
  jsonb_build_array(jsonb_build_object('product_id',product,'quantity',2)),
  2,'L4 sem rateio final','slicer');
 perform public.mc_confirm_print(w,p,'l4-read-confirmation','[]'::jsonb,
  jsonb_build_array(
   jsonb_build_object('lot_id',known_lot,'model_g',15,'purge_g',2,'loss_g',1,'basis','weighed'),
   jsonb_build_object('lot_id',unknown_lot,'model_g',3,'purge_g',0,'loss_g',0,'basis','estimated')
  ),null,false);
 select count(*) into initial_movement from public.mc_stock_movements;
 select count(*) into initial_audit from public.mc_audit_events;
 data:=public.mc_get_print_consumption_sources(w,p);
 if data->>'read_only'<>'true' or data->>'financially_final'<>'false'
  or data->>'snapshot_precision'<>'unit_cost_snapshot:6dp'
  or jsonb_array_length(data->'lines')<>2 then
  raise exception 'Contrato de consulta L4 inválido: %',data;
 end if;
 select value into c from jsonb_array_elements(data->'lines') value
 where value->>'lot_id'=known_lot::text;
 if c->>'cost_status'<>'estimated' or (c->>'model_cost_brl')::numeric<>0.96
  or (c->>'purge_cost_brl')::numeric<>0.128 or (c->>'loss_cost_brl')::numeric<>0.064
  or (c->>'unit_cost_snapshot')::numeric<>0.064 or c->>'consumption_id' is null then
  raise exception 'Custos por categoria incorretos: %',c;
 end if;
 select value into c from jsonb_array_elements(data->'lines') value
 where value->>'lot_id'=unknown_lot::text;
 if c->>'cost_status'<>'unknown'
  or c->'model_cost_brl'<>'null'::jsonb
  or c->'unit_cost_snapshot'<>'null'::jsonb then
  raise exception 'Custo desconhecido inventado: %',c;
 end if;
 select count(*) into final_movement from public.mc_stock_movements;
 select count(*) into final_audit from public.mc_audit_events;
 if initial_movement<>final_movement or initial_audit<>final_audit then
  raise exception 'Consulta alterou estoque ou auditoria';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 begin
  perform public.mc_get_print_consumption_sources(w,p);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Leitura cruzada de oficina indevida';end if;
 if has_function_privilege('anon','public.mc_get_print_consumption_sources(uuid,uuid)','EXECUTE') then
  raise exception 'RPC read-only pública sem autorização';end if;
 raise notice 'L4: fonte por lote, ausência de preço, RLS e nenhuma escrita APROVADO';
end $test$;
rollback;
