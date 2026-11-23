-- Somente PostgreSQL efêmero no CI. Rollback sem alterar dados externos.
begin;
do $test$
declare w uuid;u uuid;pid uuid;rid uuid;old_snapshot uuid;new_snapshot uuid;wrong_w uuid;
 old_cost numeric;denied boolean;rev_count integer;
begin
 select workspace_id,user_id into w,u from public.mc_members
 where active and role in ('owner','manager') limit 1;
 if w is null then raise exception 'Fixture CI sem membro autorizado';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 pid:=public.mc_save_calculated_product(w,'Estrela grande','component','EST-G','',12,1,2.50,
 '{"saved_input":{"grams":25},"calculated_result":{"modelGrams":25}}'::jsonb);
 select id,total_cost into old_snapshot,old_cost from public.mc_cost_snapshots
 where workspace_id=w and product_id=pid order by confirmed_at,id limit 1;
 rid:=public.mc_append_product_calculation(w,pid,'11111111-2222-4333-8444-555555555555'::uuid,19,1,3.75,
 '{"saved_input":{"grams":30},"calculated_result":{"modelGrams":30}}'::jsonb);
 if rid<>pid or (select count(*) from public.mc_products where id=pid)<>1
 then raise exception 'Criou produto duplicado ou mudou identificador';end if;
 if (select count(*) from public.mc_product_revisions where product_id=pid)<>2
 then raise exception 'Não criou uma única nova revisão';end if;
 if (select total_cost from public.mc_cost_snapshots where id=old_snapshot)<>old_cost
 then raise exception 'Alterou custo histórico';end if;
 if (select sale_price from public.mc_products where id=pid)<>19
 then raise exception 'Não atualizou preço explícito';end if;
 select id into new_snapshot from public.mc_cost_snapshots
 where product_id=pid and id<>old_snapshot;
 perform public.mc_append_product_calculation(w,pid,'11111111-2222-4333-8444-555555555555'::uuid,19,1,3.75,
 '{"saved_input":{"grams":30},"calculated_result":{"modelGrams":30}}'::jsonb);
 if (select count(*) from public.mc_product_revisions where product_id=pid)<>2
 or (select count(*) from public.mc_cost_snapshots where product_id=pid)<>2
 then raise exception 'Reenvio duplicou revisão ou snapshot';end if;
 denied:=false;
 begin
 perform public.mc_append_product_calculation(w,pid,gen_random_uuid(),19,0,3,
 '{"saved_input":{},"calculated_result":{}}'::jsonb);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Quantidade inválida aceita';end if;
 denied:=false;
 begin
 perform public.mc_append_product_calculation(w,gen_random_uuid(),gen_random_uuid(),19,1,3,
 '{"saved_input":{},"calculated_result":{}}'::jsonb);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Produto inexistente aceito';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin
 perform public.mc_append_product_calculation(w,pid,gen_random_uuid(),19,1,3,
 '{"saved_input":{},"calculated_result":{}}'::jsonb);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Usuário externo atualizou ficha';end if;
 if has_function_privilege('anon','public.mc_append_product_calculation(uuid,uuid,uuid,numeric,numeric,numeric,jsonb)','EXECUTE')
 then raise exception 'RPC acessível anonimamente';end if;
 raise notice 'CALC-REV: mesmo ID, revisão, idempotência, histórico e acesso: APROVADO';
end
$test$;
rollback;
