begin;
do $test$
declare w uuid;u uuid;pr uuid;product uuid;p uuid;a uuid;r1 uuid;r2 uuid;key1 uuid:=gen_random_uuid();
 payload jsonb;denied boolean;
begin
 select workspace_id,user_id into w,u from public.mc_members where role='owner' and active limit 1;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into pr from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active limit 1;
 p:=public.mc_create_print(w,pr,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),1,'G12C','slicer');
 a:=public.mc_record_l4_labor(w,p,gen_random_uuid(),'Montagem',15,20,'estimated','g12c-original',null);
 r1:=public.mc_revise_l4_labor(w,p,a,a,key1,12,25,'measured','Conferência de apontamento');
 if public.mc_revise_l4_labor(w,p,a,a,key1,12,25,'measured','Conferência de apontamento')<>r1
 then raise exception 'Replay não idempotente';end if;
 denied:=false;
 begin perform public.mc_revise_l4_labor(w,p,a,a,key1,13,25,'measured','Conferência de apontamento');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Chave duplicada aceita';end if;
 denied:=false;
 begin perform public.mc_revise_l4_labor(w,p,a,a,gen_random_uuid(),14,20,'measured','Versão vencida');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Versão obsoleta aceita';end if;
 r2:=public.mc_revise_l4_labor(w,p,a,r1,gen_random_uuid(),10,30,'measured','Correção final de tempo');
 payload:=public.mc_get_l4_labor(w,p);
 if jsonb_array_length(payload->'activities')<>1
 or payload->'activities'->0->>'versionId'<>r2::text
 or (payload->'activities'->0->>'minutes')::numeric<>10
 or (payload->'activities'->0->>'hourlyRate')::numeric<>30
 or (payload->'activities'->0->'original'->>'minutes')::numeric<>15
 or jsonb_array_length(payload->'activities'->0->'revisions')<>2
 or payload->>'posting_allowed'<>'false' then raise exception 'Histórico ou valor vigente inválidos';end if;
 denied:=false;
 begin update public.mc_l4_labor_revisions set minutes=100 where id=r2;
 exception when others then denied:=true;end;
 if not denied then raise exception 'Revisão mutável';end if;
 denied:=false;
 begin delete from public.mc_l4_labor_revisions where id=r1;
 exception when others then denied:=true;end;
 if not denied then raise exception 'Revisão deletável';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_revise_l4_labor(w,p,a,r2,gen_random_uuid(),10,50,'measured','Usuário externo');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Oficina alheia autorizada';end if;
 denied:=false;
 begin perform public.mc_get_l4_labor(w,p);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Leitura externa autorizada';end if;
 if has_function_privilege('anon','public.mc_revise_l4_labor(uuid,uuid,uuid,uuid,uuid,numeric,numeric,text,text)','EXECUTE')
 then raise exception 'Revisão pública';end if;
end
$test$;
rollback;
