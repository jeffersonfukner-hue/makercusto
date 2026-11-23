-- GAP01-B/F: histórico apensado e estados sem regularização. CI DESCARTÁVEL, ROLLBACK.
begin;
do $gap_review$
declare w uuid;u uuid;printer uuid;product uuid;p uuid;lot uuid;occ uuid;
 r1 uuid;r2 uuid;r3 uuid;k text;
 stock_before bigint;stock_after bigint;balance_before numeric;balance_after numeric;
 consumption_before bigint;consumption_after bigint;
 audit_before bigint;audit_after bigint; denied boolean;
 original_quantity numeric;original_note text;
begin
 select m.workspace_id,m.user_id into w,u from public.mc_members m
 where m.active and m.role in ('owner','manager')
 and exists(select 1 from public.mc_printers where workspace_id=m.workspace_id and active)
 and exists(select 1 from public.mc_products where workspace_id=m.workspace_id and active and kind in ('product','component'))
 limit 1;
 if w is null then raise exception 'Fixture GAP01-B/F ausente';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active and kind in ('product','component') limit 1;
 p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),null,'GAP01 investigation','slicer');
 lot:=public.mc_register_existing_spool(w,'gap01-review-'||gen_random_uuid()::text,'PETG','Bobina GAP01-review',80,'measured',null,'custo não conhecido');
 occ:=public.mc_record_physical_occurrence(w,p,'PETG da oficina',100,'weighed','2026-11-21T10:00:00Z',
 'Foi observada pesagem de 100 g, mas estoque contábil insuficiente.',lot,'Registro de pesagem no caderno',
 'Bobina indicada como hipótese sem confirmação','gap01-review-occ-'||gen_random_uuid()::text);
 select quantity_g,source_note into original_quantity,original_note from public.mc_physical_consumption_occurrences where id=occ;
 select count(*) into stock_before from public.mc_stock_movements where workspace_id=w;
 select count(*) into consumption_before from public.mc_production_consumption where workspace_id=w;
 select coalesce(sum(delta),0) into balance_before from public.mc_stock_movements where workspace_id=w and lot_id=lot;
 select count(*) into audit_before from public.mc_audit_events where workspace_id=w and action='record_investigation';
 k:='gap01-investigation-'||gen_random_uuid()::text;
 r1:=public.mc_review_physical_occurrence(w,occ,'under_review','unrecorded_input',
  'Hipótese em análise: pode existir entrada física anterior sem registro.',
  'Conferir pesagem manuscrita',lot,k);
 if r1 is distinct from public.mc_review_physical_occurrence(w,occ,'under_review','unrecorded_input',
  'Hipótese em análise: pode existir entrada física anterior sem registro.',
  'Conferir pesagem manuscrita',lot,k) then raise exception 'Replay da investigação duplicou evento';end if;
 if (select status from public.mc_physical_consumption_occurrences where id=occ)<>'under_review'
  or (select count(*) from public.mc_physical_occurrence_reviews where occurrence_id=occ)<>1
 then raise exception 'Status de investigação ou replay incorreto';end if;
 denied:=false;
 begin perform public.mc_review_physical_occurrence(w,occ,'pending_decision','lot_change',
   'Outro payload sob mesma chave deve ser recusado.',null,lot,k);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Chave divergente foi aceita';end if;
 denied:=false;
 begin perform public.mc_review_physical_occurrence(w,occ,'under_review','quantity_error',
   'Estado igual ao atual não é nova transição.',null,null,'gap01-duplicate-status-key');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Transição sem mudança de estado foi aceita';end if;
 r2:=public.mc_review_physical_occurrence(w,occ,'pending_decision','unknown',
 'A origem da diferença ainda não foi comprovada; necessita decisão específica.',
 null,null,'gap01-pending-'||gen_random_uuid()::text);
 if (select status from public.mc_physical_consumption_occurrences where id=occ)<>'pending_decision'
 then raise exception 'Ocorrência pendente de decisão não registrada';end if;
 denied:=false;
 begin perform public.mc_review_physical_occurrence(w,occ,'regularized','unknown',
 'Regularização sem aprovação jamais pode ocorrer por investigação.',null,null,'gap01-forbidden-reg-'||gen_random_uuid()::text);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Fluxo de investigação autorizou regularização';end if;
 r3:=public.mc_review_physical_occurrence(w,occ,'under_review','lot_change',
 'Nova investigação é permitida, sem apagar as anteriores.',null,lot,
 'gap01-reopen-'||gen_random_uuid()::text);
 if (select count(*) from public.mc_physical_occurrence_reviews where occurrence_id=occ)<>3
 then raise exception 'Histórico não acumulado em três eventos';end if;
 if (select prior_status from public.mc_physical_occurrence_reviews where id=r3)<>'pending_decision'
 then raise exception 'Status anterior do retorno à análise incorreto';end if;
 if (select quantity_g from public.mc_physical_consumption_occurrences where id=occ)<>original_quantity
 or (select source_note from public.mc_physical_consumption_occurrences where id=occ)<>original_note
 then raise exception 'Investigação modificou evidência física original';end if;
 select count(*) into stock_after from public.mc_stock_movements where workspace_id=w;
 select count(*) into consumption_after from public.mc_production_consumption where workspace_id=w;
 select coalesce(sum(delta),0) into balance_after from public.mc_stock_movements where workspace_id=w and lot_id=lot;
 if stock_before<>stock_after or consumption_before<>consumption_after
 or balance_before<>balance_after or balance_after<>80 then
 raise exception 'Investigação gerou movimentação de material ou custo';end if;
 select count(*) into audit_after from public.mc_audit_events where workspace_id=w and action='record_investigation';
 if audit_after<>audit_before+3 then raise exception 'Auditoria não registra exatamente três eventos';end if;
 if (select count(*) from public.mc_physical_occurrence_reviews where workspace_id=w
  and author_id=u and occurrence_id=occ)<>3 then
 raise exception 'Histórico de autor inexistente';end if;
 denied:=false;
 begin perform public.mc_review_physical_occurrence(w,occ,'pending_decision','lot_change',
 'Lote desconhecido não pode ser inventado ou emprestado.',null,gen_random_uuid(),
 'gap01-invalid-lot-'||gen_random_uuid()::text);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Lote impossível foi aceito';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 if public.mc_list_physical_occurrence_reviews(w)<>'[]'::jsonb
 then raise exception 'Não membro acessou histórico de outra oficina';end if;
 denied:=false;
 begin perform public.mc_review_physical_occurrence(w,occ,'pending_decision','unknown',
 'Não membro não tem acesso a investigação da oficina.',null,null,
 'gap01-nonmember-'||gen_random_uuid()::text);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Não membro alterou investigação';end if;
 if has_table_privilege('authenticated','public.mc_physical_occurrence_reviews','INSERT')
 or has_table_privilege('authenticated','public.mc_physical_occurrence_reviews','UPDATE')
 or has_table_privilege('authenticated','public.mc_physical_occurrence_reviews','DELETE')
 or has_table_privilege('anon','public.mc_physical_occurrence_reviews','SELECT')
 or has_function_privilege('anon','public.mc_review_physical_occurrence(uuid,uuid,text,text,text,text,uuid,text)','EXECUTE')
 then raise exception 'Permissões inseguras';end if;
 raise notice 'GAP01-B/F: hipóteses e evidências imutáveis, três estados auditados, replay seguro, isolamento, nenhuma baixa: APROVADOS (ROLLBACK)';
end
$gap_review$;
rollback;
