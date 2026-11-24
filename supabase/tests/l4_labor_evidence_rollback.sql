begin;
do $test$
declare w uuid;u uuid;printer uuid;product uuid;p uuid;k uuid:=gen_random_uuid();a uuid;b uuid;s uuid;data jsonb;denied boolean;
begin
 select workspace_id,user_id into w,u from public.mc_members where role='owner' and active limit 1;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active limit 1;
 p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),1,'Teste G12B','slicer');
 insert into public.mc_services(workspace_id,name,unit,rate) values(w,'Acabamento','hour',20) returning id into s;
 a:=public.mc_record_l4_labor(w,p,k,'Acabamento',15,20,'measured','registro-1',s);
 update public.mc_services set rate=30 where id=s;
 b:=public.mc_record_l4_labor(w,p,k,'Acabamento',15,20,'measured','registro-1',s);
 if a is distinct from b then raise exception 'Replay duplicado';end if;
 data:=public.mc_get_l4_labor(w,p);
 if jsonb_array_length(data->'activities')<>1 or (data->'activities'->0->>'hourlyRate')::numeric<>20
 or data->>'posting_allowed'<>'false' then raise exception 'Histórico inválido';end if;
 denied:=false;
 begin perform public.mc_record_l4_labor(w,p,gen_random_uuid(),'Acabamento',15,30,'measured','REGISTRO-1',s);
 exception when unique_violation then denied:=true;end;
 if not denied then raise exception 'Duplicidade indevida';end if;
 denied:=false;
 begin update public.mc_l4_labor_evidence set hourly_rate=99 where id=a;
 exception when others then denied:=true;end;
 if not denied then raise exception 'UPDATE indevido';end if;
 denied:=false;
 begin delete from public.mc_l4_labor_evidence where id=a;
 exception when others then denied:=true;end;
 if not denied then raise exception 'DELETE indevido';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_get_l4_labor(w,p);exception when others then denied:=true;end;
 if not denied then raise exception 'Acesso indevido';end if;
 if has_function_privilege('anon','public.mc_get_l4_labor(uuid,uuid)','EXECUTE') then raise exception 'RPC pública';end if;
end
$test$;
rollback;
