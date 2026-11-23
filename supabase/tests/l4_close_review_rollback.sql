-- L4-G01: revisão financeira PENDENTE, transacional e idempotente. ROLLBACK.
begin;
do $test$
declare w uuid;u uuid;printer uuid;product uuid;p uuid;lot uuid;
 evidence jsonb;result_a jsonb;result_b jsonb;review_id uuid;
 start_stock bigint;end_stock bigint;start_snapshot bigint;end_snapshot bigint;
 denied boolean;rows_count integer;
begin
 select m.workspace_id,m.user_id into w,u from public.mc_members m
 where m.active and m.role in ('owner','manager')
 and exists(select 1 from public.mc_printers where workspace_id=m.workspace_id and active)
 and exists(select 1 from public.mc_products where workspace_id=m.workspace_id and active)
 limit 1;
 if w is null then raise exception 'Fixture L4 G01 ausente';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active limit 1;
 lot:=public.mc_register_existing_spool(w,'l4-review-lot-'||gen_random_uuid()::text,
  'PETG teste','Lote revisão',100,'measured',15.00,'Estimativa de teste');
 p:=public.mc_create_print(w,printer,
  jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),
  1,'Revisão sem fechamento definitivo','slicer');
 select count(*) into start_snapshot from public.mc_cost_snapshots;
 select count(*) into start_stock from public.mc_stock_movements;
 evidence:=jsonb_build_array(
 jsonb_build_object('category','energy','status','pending','reason','Energia ainda não medida'),
 jsonb_build_object('category','machine','status','supported','reason','Ficha de depreciação verificada','source_reference','ref-machine-001'),
 jsonb_build_object('category','labor','status','not_applicable','reason','Sem trabalho de montagem'),
 jsonb_build_object('category','accessory','status','not_applicable','reason','Sem acessórios envolvidos'),
 jsonb_build_object('category','tool','status','not_applicable','reason','Sem ferramenta empregada'),
 jsonb_build_object('category','other','status','not_applicable','reason','Nenhum outro custo'));
 -- Nenhuma solicitação é aceita sem saída confirmada.
 denied:=false;
 begin
  perform public.mc_submit_l4_close_review(w,p,'l4-review-first-key',evidence);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Revisão sem saída confirmada permitida';end if;
 select id into review_id from public.mc_production_outputs where workspace_id=w and production_id=p limit 1;
 perform public.mc_confirm_print(w,p,'l4-review-confirmation',
 jsonb_build_array(jsonb_build_object('output_id',review_id,'good',1,'failed',0)),
 jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',10,'purge_g',1,'loss_g',0,'basis','weighed')),
 null,false);
 select count(*) into start_stock from public.mc_stock_movements;
 result_a:=public.mc_submit_l4_close_review(w,p,'l4-review-first-key',evidence);
 result_b:=public.mc_submit_l4_close_review(w,p,'l4-review-first-key',evidence);
 if result_a->>'status'<>'pending' or result_a->'report'->>'financially_final'<>'false'
 or result_a->'report'->>'posting_allowed'<>'false'
 or result_a->'report'->>'unreviewed_categories'<>'1'
 or result_a->'report'->>'estimated_cost_sources'<>'1'
 or result_b->>'replayed'<>'true'
 or result_a->>'review_id' is distinct from result_b->>'review_id' then
  raise exception 'Revisão indevidamente finalizada ou replay inválido: %, %',result_a,result_b;end if;
 select count(*) into rows_count from public.mc_l4_close_reviews
 where workspace_id=w and production_id=p;
 if rows_count<>1 then raise exception 'Idempotência gerou revisões duplicadas';end if;
 denied:=false;
 begin
  perform public.mc_submit_l4_close_review(w,p,'l4-review-first-key',
   jsonb_set(evidence,'{0,reason}','"Energia diferente da primeira solicitação"'::jsonb));
 exception when others then denied:=true;end;
 if not denied then raise exception 'Idempotência aceitou payload divergente';end if;
 denied:=false;
 begin
  perform public.mc_submit_l4_close_review(w,p,'l4-review-other-key',
   evidence-'0');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Checklist incompleto aceito';end if;
 denied:=false;
 begin
  update public.mc_l4_close_reviews set status='pending'
  where id=(result_a->>'review_id')::uuid;
 exception when others then denied:=true;end;
 if not denied then raise exception 'UPDATE da revisão histórica aceito';end if;
 denied:=false;
 begin
  delete from public.mc_l4_close_reviews where id=(result_a->>'review_id')::uuid;
 exception when others then denied:=true;end;
 if not denied then raise exception 'DELETE da revisão histórica aceito';end if;
 select count(*) into end_snapshot from public.mc_cost_snapshots;
 select count(*) into end_stock from public.mc_stock_movements;
 if start_snapshot<>end_snapshot or start_stock<>end_stock then
  raise exception 'Revisão escreveu custo final ou estoque';end if;
 if (select status from public.mc_productions where id=p)='completed'
 then raise exception 'Revisão encerrou execução';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_submit_l4_close_review(w,p,'l4-review-cross-user',evidence);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Usuário de outra oficina enviou revisão';end if;
 if has_function_privilege('anon','public.mc_submit_l4_close_review(uuid,uuid,text,jsonb)','EXECUTE')
 then raise exception 'RPC pública indevida';end if;
 raise notice 'L4-G01: atômico, idempotente, imutável, limitado por oficina, sem fechamento e sem alteração financeira APROVADO';
end
$test$;
rollback;
