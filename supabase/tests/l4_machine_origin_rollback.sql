begin;
do $test$
declare w uuid;u uuid;printer uuid;product uuid;p uuid;data jsonb;denied boolean;
begin
 select workspace_id,user_id into w,u from public.mc_members where role='owner' and active limit 1;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active limit 1;
 update public.mc_printers set purchase_price=3500,lifetime_hours=3000,maintenance_per_hour=0.5 where id=printer;
 p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),2,'Teste G11B','slicer');
 update public.mc_printers set purchase_price=9999,lifetime_hours=9000 where id=printer;
 data:=public.mc_get_l4_machine_origin(w,p);
 if (data->'origin'->>'purchase_price')::numeric is distinct from 3500::numeric
 or (data->'origin'->>'lifetime_hours')::numeric is distinct from 3000::numeric
 or (data->'origin'->>'maintenance_per_hour')::numeric is distinct from 0.5::numeric
 or data->>'posting_allowed' is distinct from 'false'
 or data->>'printer_matches' is distinct from 'true'
 or data->'actual_hours' is distinct from 'null'::jsonb then
  raise exception 'Origem histórica inválida: %',data;end if;
 denied:=false;
 begin update public.mc_l4_machine_origins set purchase_price=1 where production_id=p;
 exception when others then denied:=true;end;
 if not denied then raise exception 'UPDATE indevido';end if;
 denied:=false;
 begin delete from public.mc_l4_machine_origins where production_id=p;
 exception when others then denied:=true;end;
 if not denied then raise exception 'DELETE indevido';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_get_l4_machine_origin(w,p);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Acesso indevido';end if;
 if has_function_privilege('anon','public.mc_get_l4_machine_origin(uuid,uuid)','EXECUTE') then
  raise exception 'RPC pública indevida';end if;
end
$test$;
rollback;
