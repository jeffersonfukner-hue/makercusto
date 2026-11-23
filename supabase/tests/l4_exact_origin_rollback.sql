-- L4-P06: origem financeira capturada como razão exata, sem fechar produção.
begin;
do $test$
declare w uuid;u uuid;printer uuid;product uuid;p uuid;lot uuid;unknown_lot uuid;
 data jsonb;origin jsonb;before_count bigint;after_count bigint; denied boolean;
 old_id uuid;current_total numeric;
begin
 select m.workspace_id,m.user_id into w,u from public.mc_members m
 where m.active and m.role in ('owner','manager')
 and exists(select 1 from public.mc_printers where workspace_id=m.workspace_id and active)
 and exists(select 1 from public.mc_products where workspace_id=m.workspace_id and active)
 limit 1;
 if w is null then raise exception 'Fixture L4 precisa de oficina';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active limit 1;
 lot:=public.mc_register_existing_spool(w,'l4-origin-k-'||gen_random_uuid()::text,
  'PETG teste','Lote com custo 1/3',3,'measured',1.00,'custo ilustrativo');
 unknown_lot:=public.mc_register_existing_spool(w,'l4-origin-u-'||gen_random_uuid()::text,
  'PETG teste','Lote sem preço',40,'informed',null,'custo desconhecido');
 p:=public.mc_create_print(w,printer,
  jsonb_build_array(jsonb_build_object('product_id',product,'quantity',3)),
  1,'Testar snapshot de origem financeira','slicer');
 perform public.mc_confirm_print(w,p,'l4-origin-consumption-01','[]'::jsonb,
  jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',1.000,'purge_g',0,'loss_g',0,'basis','weighed'),
    jsonb_build_object('lot_id',unknown_lot,'model_g',0.5,'purge_g',0,'loss_g',0,'basis','estimated')),
  null,false);
 data:=public.mc_get_l4_exact_origins(w,p);
 if data->>'read_only'<>'true' or data->>'financially_final'<>'false'
  or (data->>'historical_rows_without_capture')::integer<>0
  or jsonb_array_length(data->'origins')<>2 then
  raise exception 'Snapshot exato incompleto: %',data;end if;
 select value into origin from jsonb_array_elements(data->'origins') value
 where value->>'lot_id'=lot::text;
 if origin->>'status'<>'estimated' or (origin->>'original_quantity_g')::numeric<>3
  or (origin->>'original_total_cost_brl')::numeric<>1
  or (origin->>'model_g')::numeric<>1 then
  raise exception 'A razão financeira não preservou lote original: %',origin;end if;
 -- Multiplicar antes da divisão é necessário: 1g de 3g por R$1,00 = R$0,333...
 if (origin->>'model_g')::numeric*(origin->>'original_total_cost_brl')::numeric
     /(origin->>'original_quantity_g')::numeric <> 1::numeric/3::numeric then
  raise exception 'Valor exato incompatível';end if;
 select value into origin from jsonb_array_elements(data->'origins') value
 where value->>'lot_id'=unknown_lot::text;
 if origin->>'status'<>'unknown' or origin->'original_total_cost_brl'<>'null'::jsonb then
  raise exception 'Origem desconhecida virou custo zero';end if;
 select count(*) into before_count from public.mc_l4_exact_consumption_origins;
 old_id:=(data->'origins'->0->>'consumption_id')::uuid;
 begin
  update public.mc_l4_exact_consumption_origins set original_total_cost_brl=99 where consumption_id=old_id;
  raise exception 'Imutabilidade não bloqueou UPDATE';
 exception when others then
  if sqlerrm='Imutabilidade não bloqueou UPDATE' then raise;end if;
 end;
 begin
  delete from public.mc_l4_exact_consumption_origins where consumption_id=old_id;
  raise exception 'Imutabilidade não bloqueou DELETE';
 exception when others then
  if sqlerrm='Imutabilidade não bloqueou DELETE' then raise;end if;
 end;
 select count(*) into after_count from public.mc_l4_exact_consumption_origins;
 if before_count<>after_count then raise exception 'Origens históricas modificadas';end if;
 -- Repetição da mesma chave não cria segunda captura e preserva o mesmo evento.
 perform public.mc_confirm_print(w,p,'l4-origin-consumption-01','[]'::jsonb,
  jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',1.000,'purge_g',0,'loss_g',0,'basis','weighed'),
    jsonb_build_object('lot_id',unknown_lot,'model_g',0.5,'purge_g',0,'loss_g',0,'basis','estimated')),
  null,false);
 if (select count(*) from public.mc_l4_exact_consumption_origins)<>before_count then
  raise exception 'Replay de confirmação criou captura duplicada';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_get_l4_exact_origins(w,p);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Consulta inter-oficina indevidamente permitida';end if;
 if has_function_privilege('anon','public.mc_get_l4_exact_origins(uuid,uuid)','EXECUTE') then
  raise exception 'RPC de origem pública indevida';end if;
 raise notice 'L4-P06: origem congelada, exatidão, desconhecido, replays, imutabilidade e RLS aprovados';
end
$test$;
rollback;
