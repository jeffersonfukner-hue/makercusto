-- L4-G02 — dossiê read-only por execução, RLS/autorização e bloqueios.
begin;
do $test$
declare w uuid;u uuid;printer uuid;product uuid;p uuid;
 lot uuid;unknown uuid;output_id uuid;report jsonb;report2 jsonb;
 checklist jsonb;review jsonb;review_id uuid;denied boolean;
 reviews_before bigint;reviews_after bigint;stock_before bigint;stock_after bigint;
 audit_before bigint;audit_after bigint;final_before bigint;final_after bigint;
begin
 select m.workspace_id,m.user_id into w,u from public.mc_members m
 where m.active and m.role in ('owner','manager')
 and exists(select 1 from public.mc_printers where workspace_id=m.workspace_id and active)
 and exists(select 1 from public.mc_products where workspace_id=m.workspace_id and active)
 limit 1;
 if w is null then raise exception 'Fixture L4 G02 ausente';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active limit 1;
 p:=public.mc_create_print(w,printer,
 jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),
 1,'Auditar dossiê de prontidão','slicer');
 report:=public.mc_get_l4_close_readiness(w,p,null);
 if report->>'status'<>'pending' or report->>'posting_allowed'<>'false'
 or not(report->'blockers' ? 'NO_REVIEW')
 or not(report->'blockers' ? 'NO_CONFIRMED_OUTPUTS')
 or not(report->'blockers' ? 'NO_CONFIRMED_CONSUMPTION')
 or (report->>'categories_pending')::int<>6 then
  raise exception 'Revisão vazia marcada como pronta: %',report;end if;
 lot:=public.mc_register_existing_spool(w,'l4-readiness-known-'||gen_random_uuid()::text,
  'PETG teste','Bobina de origem estimada',100,'measured',12.00,'valor estimado');
 unknown:=public.mc_register_existing_spool(w,'l4-readiness-unknown-'||gen_random_uuid()::text,
  'PETG teste','Bobina de origem sem custo',100,'informed',null,'preço desconhecido');
 select id into output_id from public.mc_production_outputs
 where workspace_id=w and production_id=p limit 1;
 perform public.mc_confirm_print(w,p,'l4-readiness-confirm-001',
  jsonb_build_array(jsonb_build_object('output_id',output_id,'good',1,'failed',0)),
  jsonb_build_array(
   jsonb_build_object('lot_id',lot,'model_g',10,'purge_g',1,'loss_g',0,'basis','weighed'),
   jsonb_build_object('lot_id',unknown,'model_g',5,'purge_g',0,'loss_g',0,'basis','estimated')
  ),null,false);
 checklist:=jsonb_build_array(
 jsonb_build_object('category','energy','status','pending','reason','Medição elétrica não disponível'),
 jsonb_build_object('category','machine','status','supported','reason','Documentação identificada','source_reference','machine-test-001'),
 jsonb_build_object('category','labor','status','not_applicable','reason','Sem trabalho manual'),
 jsonb_build_object('category','accessory','status','not_applicable','reason','Sem acessórios instalados'),
 jsonb_build_object('category','tool','status','not_applicable','reason','Sem ferramentas extras'),
 jsonb_build_object('category','other','status','not_applicable','reason','Sem outras despesas'));
 review:=public.mc_submit_l4_close_review(w,p,'l4-readiness-review-001',checklist);
 review_id:=(review->>'review_id')::uuid;
 select count(*) into reviews_before from public.mc_l4_close_reviews;
 select count(*) into stock_before from public.mc_stock_movements;
 select count(*) into audit_before from public.mc_audit_events;
 select count(*) into final_before from public.mc_cost_snapshots;
 report:=public.mc_get_l4_close_readiness(w,p,null);
 report2:=public.mc_get_l4_close_readiness(w,p,review_id);
 if report<>report2 or report->>'review_id'<>review_id::text
 or (report->>'consumption_rows')::int<>2
 or (report->>'exact_origin_missing')::int<>0
 or (report->>'cost_estimated')::int<>1
 or (report->>'cost_unknown')::int<>1
 or (report->>'categories_pending')::int<>1
 or (report->>'categories_not_applicable_declared')::int<>4
 or jsonb_array_length(report->'sources')<>2
 or not(report->'blockers' ? 'UNKNOWN_SOURCE_COST')
 or not(report->'blockers' ? 'ESTIMATED_SOURCE_COST')
 or not(report->'blockers' ? 'UNREVIEWED_COST_CATEGORIES')
 or not(report->'blockers' ? 'FINAL_ALLOCATION_NOT_IMPLEMENTED')
 or report->>'financially_final'<>'false'
 or report->>'posting_allowed'<>'false' then
 raise exception 'Dossiê não conserva bloqueios reais: %',report;end if;
 select count(*) into reviews_after from public.mc_l4_close_reviews;
 select count(*) into stock_after from public.mc_stock_movements;
 select count(*) into audit_after from public.mc_audit_events;
 select count(*) into final_after from public.mc_cost_snapshots;
 if reviews_before<>reviews_after or stock_before<>stock_after
 or audit_before<>audit_after or final_before<>final_after then
  raise exception 'Consulta de prontidão alterou dados financeiros';end if;
 denied:=false;
 begin
  perform public.mc_get_l4_close_readiness(w,p,gen_random_uuid());
 exception when others then denied:=true;end;
 if not denied then raise exception 'Revisão de outro local aceito';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_get_l4_close_readiness(w,p,review_id);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Membro alheio consultou os dados';end if;
 if has_function_privilege('anon','public.mc_get_l4_close_readiness(uuid,uuid,uuid)','EXECUTE')
 then raise exception 'RPC de dossiê disponível ao público';end if;
 raise notice 'L4-G02: dossiê pendente, origem, categorias, isolamento, sem mutações APROVADO';
end $test$;
rollback;
