-- GAP01-C: proposta auditável SEM movimento físico/financeiro. Apenas CI com rollback.
begin;
do $test$
declare w uuid;u uuid;printer uuid;product uuid;p uuid;occ uuid;lot uuid;
 proposal uuid;replay uuid;before_stock bigint;after_stock bigint;
 before_consumption bigint;after_consumption bigint;before_res numeric;after_res numeric;
 before_audit bigint;after_audit bigint;denied boolean;
begin
 select m.workspace_id,m.user_id into w,u from public.mc_members m
 where m.active and m.role in ('owner','manager')
 and exists(select 1 from public.mc_printers where workspace_id=m.workspace_id and active)
 and exists(select 1 from public.mc_products where workspace_id=m.workspace_id and active and kind in ('product','component'))
 limit 1;
 if w is null then raise exception 'Fixture GAP01-C indisponível';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active and kind in ('product','component') limit 1;
 p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),null,'Proposta GAP01-C','slicer');
 lot:=public.mc_register_existing_spool(w,'gap01-c-'||gen_random_uuid()::text,'PETG teste','Bobina GAP01-C',80,'measured',null,'valor não informado');
 occ:=public.mc_record_physical_occurrence(w,p,'PETG físico',100,'weighed','2026-11-21T10:00:00Z',
 'Pesagem observada de 100 g com 80 g cadastrados.',lot,'Anotação da balança','Origem não confirmada',
 'gap01-c-occ-'||gen_random_uuid()::text);
 denied:=false;
 begin perform public.mc_propose_inventory_adjustment(w,occ,lot,50,'unrecorded_physical_input',
  'Entrada física anterior a confirmar','Apenas rascunho sem prova de aprovação',
  'Nota de pesagem em arquivo','gap01-c-early-'||gen_random_uuid()::text);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Proposta sem investigação foi aceita';end if;
 perform public.mc_review_physical_occurrence(w,occ,'under_review','unrecorded_input',
 'Verificar possibilidade de entrada física sem lançamento.','Caderno de pesagem',lot,
 'gap01-c-investigate-'||gen_random_uuid()::text);
 select count(*) into before_stock from public.mc_stock_movements where workspace_id=w;
 select count(*) into before_consumption from public.mc_production_consumption where workspace_id=w;
 select coalesce(sum(remaining),0) into before_res from public.mc_production_reservations where workspace_id=w;
 select count(*) into before_audit from public.mc_audit_events where workspace_id=w and entity='inventory_adjustment_proposal';
 proposal:=public.mc_propose_inventory_adjustment(w,occ,lot,50,'unrecorded_physical_input',
 'Aferição de entrada física anterior sem registro',
 'Sugerir cinquenta gramas, aguardando decisão humana',
 'Registro de pesagem em papel','gap01-c-propose-001');
 replay:=public.mc_propose_inventory_adjustment(w,occ,lot,50,'unrecorded_physical_input',
 'Aferição de entrada física anterior sem registro',
 'Sugerir cinquenta gramas, aguardando decisão humana',
 'Registro de pesagem em papel','gap01-c-propose-001');
 if replay is distinct from proposal then raise exception 'Replay duplicou proposta';end if;
 if (select status from public.mc_inventory_adjustment_proposals where id=proposal)<>'pending_decision'
 then raise exception 'Proposta foi aprovada indevidamente';end if;
 if (select quantity_g from public.mc_physical_consumption_occurrences where id=occ)<>100
 or (select status from public.mc_physical_consumption_occurrences where id=occ)<>'under_review'
 then raise exception 'Observação original foi alterada';end if;
 if (select count(*) from public.mc_inventory_adjustment_proposals where workspace_id=w and occurrence_id=occ)<>1
 then raise exception 'Replay duplicou linha';end if;
 denied:=false;
 begin perform public.mc_propose_inventory_adjustment(w,occ,lot,51,'unrecorded_physical_input',
 'Aferição de entrada física anterior sem registro',
 'Sugerir cinquenta gramas, aguardando decisão humana',
 'Registro de pesagem em papel','gap01-c-propose-001');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Reuso divergente de chave aceito';end if;
 denied:=false;
 begin perform public.mc_propose_inventory_adjustment(w,occ,lot,0,'verified_count_error',
 'Erro de contagem identificado por operador','Apenas proposta para auditoria',
 'Pesagem número cinco','gap01-c-zero-001');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Proposta zero foi aceita';end if;
 denied:=false;
 begin perform public.mc_propose_inventory_adjustment(w,occ,gen_random_uuid(),10,'verified_count_error',
 'Origem ainda não identificada oficialmente','Apenas proposta aguardando análise',
 'Referência do inventário','gap01-c-invalid-lot-001');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Proposta com lote inexistente aceita';end if;
 denied:=false;
 begin perform public.mc_propose_inventory_adjustment(w,occ,lot,1.1234,'verified_count_error',
 'Ajuste fracionário indevido por arredondamento','Apenas proposta aguardando análise',
 'Referência do inventário','gap01-c-precision-001');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Gramas com precisão excessiva aceitos';end if;
 select count(*) into after_stock from public.mc_stock_movements where workspace_id=w;
 select count(*) into after_consumption from public.mc_production_consumption where workspace_id=w;
 select coalesce(sum(remaining),0) into after_res from public.mc_production_reservations where workspace_id=w;
 select count(*) into after_audit from public.mc_audit_events where workspace_id=w and entity='inventory_adjustment_proposal';
 if before_stock<>after_stock or before_consumption<>after_consumption
 or before_res<>after_res or after_audit<>before_audit+1 then
 raise exception 'Proposta gerou movimento ou auditoria duplicada';end if;
 if (select coalesce(sum(delta),0) from public.mc_stock_movements where workspace_id=w and lot_id=lot)<>80
 then raise exception 'Proposta alterou saldo: deveria permanecer 80 g';end if;
 if (select cost_status from public.mc_stock_lots where id=lot)<>'unknown'
 then raise exception 'Custo desconhecido foi inventado';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 if public.mc_list_inventory_adjustment_proposals(w)<>'[]'::jsonb then
 raise exception 'Não membro leu propostas alheias';end if;
 denied:=false;
 begin perform public.mc_propose_inventory_adjustment(w,occ,lot,5,'verified_count_error',
 'Origem de contagem possivelmente incorreta','Sem autorização para apresentar proposta',
 'Documento de inventário','gap01-c-no-member-001');
 exception when others then denied:=true;end;
 if not denied then raise exception 'Não membro registrou proposta';end if;
 if has_table_privilege('authenticated','public.mc_inventory_adjustment_proposals','INSERT')
 or has_table_privilege('authenticated','public.mc_inventory_adjustment_proposals','UPDATE')
 or has_table_privilege('authenticated','public.mc_inventory_adjustment_proposals','DELETE')
 or has_table_privilege('anon','public.mc_inventory_adjustment_proposals','SELECT')
 or has_function_privilege('anon','public.mc_propose_inventory_adjustment(uuid,uuid,uuid,numeric,text,text,text,text,text)','EXECUTE')
 then raise exception 'Permissões de proposta inseguras';end if;
 raise notice 'GAP01-C: 50 g propostos, 80 g reais, nenhuma baixa nem custo, auditoria, replay, isolamento, sem aprovação: APROVADO';
end
$test$;
rollback;
