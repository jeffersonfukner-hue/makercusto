-- P07: isolated evidence, non-overlap, no stock or financial posting.
begin;
do $test$
declare w uuid;u uuid;printer uuid;product uuid;p uuid;report jsonb;denied boolean;stock_before bigint;cost_before bigint;measurement uuid;replayed uuid;revision uuid;revision_key uuid:=gen_random_uuid();
begin
 select m.workspace_id,m.user_id into w,u from public.mc_members m where m.active and m.role in ('owner','manager')
 and exists(select 1 from public.mc_printers where workspace_id=m.workspace_id and active)
 and exists(select 1 from public.mc_products where workspace_id=m.workspace_id and active) limit 1;
 if w is null then raise exception 'Fixture P07 ausente';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active limit 1;
 p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),1,'P07 teste','slicer');
 select count(*) into stock_before from public.mc_stock_movements;
 select count(*) into cost_before from public.mc_cost_snapshots;
 perform public.mc_register_energy_tariff(w,'P07 teste',1.03,'2026-11-01','2026-12-01','conta teste');
 perform public.mc_record_energy_interval(w,p,'2026-11-23 10:00-03','2026-11-23 10:10-03','heating',null,'maker_estimate','teste',null,600);
 perform public.mc_record_energy_interval(w,p,'2026-11-23 10:10-03','2026-11-23 10:30-03','pause','unknown','unknown',null,null,null);
 report:=public.mc_get_energy_evidence(w,p);
 if jsonb_array_length(report->'intervals')<>2 or jsonb_array_length(report->'tariffs')<>1 or report->>'posting_allowed'<>'false' or report->>'printer_id'<>printer::text then raise exception 'Evidência incorreta: %',report;end if;
 denied:=false;
 begin perform public.mc_register_energy_tariff(w,'sobreposta',2,'2026-11-20','2026-12-05','teste'); exception when others then denied:=true;end;
 if not denied then raise exception 'Tarifa sobreposta aceita';end if;
 denied:=false;
 begin perform public.mc_record_energy_interval(w,p,'2026-11-23 10:05-03','2026-11-23 10:15-03','printing',null,'measured','teste',1,null);exception when others then denied:=true;end;
 if not denied then raise exception 'Intervalo sobreposto aceito';end if;
 measurement:=public.mc_record_integral_energy(w,p,'2026-11-23 10:00-03','2026-11-23 10:30-03',0.91,'medidor teste');
 replayed:=public.mc_record_integral_energy(w,p,'2026-11-23 10:00-03','2026-11-23 10:30-03',0.91,'medidor teste');
 if measurement<>replayed then raise exception 'Medição integral duplicada';end if;
 report:=public.mc_get_integral_energy(w,p);
 if report->'measurement'->>'id'<>measurement::text or (report->'measurement'->>'kwh')::numeric<>0.91
 or report->>'posting_allowed'<>'false' then raise exception 'Medição integral incorreta';end if;
 denied:=false;
 begin perform public.mc_record_integral_energy(w,p,'2026-11-23 10:00-03','2026-11-23 10:30-03',1.91,'medidor teste');exception when others then denied:=true;end;
 if not denied then raise exception 'Medição original sobrescrita';end if;
 revision:=public.mc_revise_integral_energy(w,p,measurement,revision_key,0.95,'medidor corrigido','leitura conferida');
 replayed:=public.mc_revise_integral_energy(w,p,measurement,revision_key,0.95,'medidor corrigido','leitura conferida');
 if revision<>replayed then raise exception 'Revisão duplicada';end if;
 report:=public.mc_get_integral_energy(w,p);
 if (report->'original'->>'kwh')::numeric<>0.91 or (report->'measurement'->>'kwh')::numeric<>0.95
 or report->'measurement'->>'id'<>revision::text or jsonb_array_length(report->'revisions')<>1 then raise exception 'Histórico de revisão incorreto';end if;
 denied:=false;
 begin perform public.mc_revise_integral_energy(w,p,measurement,gen_random_uuid(),0.99,'medidor','versão obsoleta');exception when others then denied:=true;end;
 if not denied then raise exception 'Revisão obsoleta aceita';end if;
 denied:=false;
 begin perform public.mc_revise_integral_energy(w,p,revision,revision_key,0.99,'medidor','chave divergente');exception when others then denied:=true;end;
 if not denied then raise exception 'Reutilização divergente aceita';end if;
 denied:=false;
 begin perform public.mc_record_energy_interval(w,p,'2026-11-23 10:30-03','2026-11-23 10:31-03','printing',null,'measured','teste',0.01,null);exception when others then denied:=true;end;
 if not denied then raise exception 'Fase fora do período integral aceita';end if;
 denied:=false;
 begin update public.mc_p07_integral_measurements set kwh=7 where id=measurement;exception when others then denied:=true;end;
 if not denied then raise exception 'Alteração direta da medição aceita';end if;
 denied:=false;
 begin delete from public.mc_p07_integral_revisions where id=revision;exception when others then denied:=true;end;
 if not denied then raise exception 'Exclusão de revisão aceita';end if;
 if stock_before<>(select count(*) from public.mc_stock_movements) or cost_before<>(select count(*) from public.mc_cost_snapshots) then raise exception 'P07 alterou financeiro ou estoque';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_get_energy_evidence(w,p);exception when others then denied:=true;end;
 if not denied then raise exception 'Acesso externo aceito';end if;
 denied:=false;
 begin perform public.mc_get_integral_energy(w,p);exception when others then denied:=true;end;
 if not denied then raise exception 'Medição acessível a terceiro';end if;
 if has_function_privilege('anon','public.mc_record_integral_energy(uuid,uuid,timestamptz,timestamptz,numeric,text)','EXECUTE')
 or has_function_privilege('anon','public.mc_get_integral_energy(uuid,uuid)','EXECUTE') then raise exception 'RPC integral pública';end if;
 denied:=false;
 begin perform public.mc_revise_integral_energy(w,p,revision,gen_random_uuid(),0.99,'medidor','terceiro');exception when others then denied:=true;end;
 if not denied then raise exception 'Revisão de terceiro aceita';end if;
 if has_function_privilege('anon','public.mc_revise_integral_energy(uuid,uuid,uuid,uuid,numeric,text,text)','EXECUTE') then raise exception 'RPC de revisão pública';end if;
 if has_function_privilege('anon','public.mc_get_energy_evidence(uuid,uuid)','EXECUTE') then raise exception 'RPC pública';end if;
end $test$;
rollback;
