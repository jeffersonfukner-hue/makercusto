-- GAP01-A: ocorrência observada é registro pendente, não baixa de estoque.
-- Rodar somente no PostgreSQL efêmero do CI; a transação termina em ROLLBACK.
begin;
do $gap$
declare
 w uuid; u uuid; printer uuid; product uuid; p uuid; other_p uuid;
 lot uuid; id1 uuid; id2 uuid; at_time timestamptz := '2026-11-21T10:00:00Z';
 balance_before numeric; balance_after numeric; events_before bigint; events_after bigint;
 consumes_before bigint; consumes_after bigint; audit_before bigint; audit_after bigint;
 deny boolean; foreign_workspace uuid; foreign_lot uuid;
begin
 select m.workspace_id,m.user_id into w,u from public.mc_members m
  where m.active and m.role in ('owner','manager')
   and exists(select 1 from public.mc_printers where workspace_id=m.workspace_id and active)
   and exists(select 1 from public.mc_products where workspace_id=m.workspace_id and active
       and kind in ('product','component')) limit 1;
 if w is null then raise exception 'Fixture GAP01 não encontrada';end if;
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active and kind in ('product','component') limit 1;
 perform set_config('request.jwt.claim.sub',u::text,true);
 p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',2)),
  null,'Observação GAP01','slicer');
 lot:=public.mc_register_existing_spool(w,'gap01-lot-'||gen_random_uuid()::text,'PETG teste','Bobina GAP01',80,'measured',null,'sem custo presumido');
 select coalesce(sum(delta),0) into balance_before from public.mc_stock_movements where workspace_id=w and lot_id=lot;
 select count(*) into events_before from public.mc_stock_events where workspace_id=w;
 select count(*) into consumes_before from public.mc_production_consumption where workspace_id=w;
 select count(*) into audit_before from public.mc_audit_events
  where workspace_id=w and entity='physical_consumption_occurrence';
 id1:=public.mc_record_physical_occurrence(w,p,'PETG de origem incerta',100,'weighed',at_time,
  'Massa física observada em balança, aferição do operador.',lot,'pesagem manuscrita 2026-11-21',
  'Possível bobina informada, ainda sem comprovação','gap01-record-001');
 id2:=public.mc_record_physical_occurrence(w,p,'PETG de origem incerta',100,'weighed',at_time,
  'Massa física observada em balança, aferição do operador.',lot,'pesagem manuscrita 2026-11-21',
  'Possível bobina informada, ainda sem comprovação','gap01-record-001');
 if id1 is distinct from id2 then raise exception 'Retry GAP01 duplicou ocorrência';end if;
 select coalesce(sum(delta),0) into balance_after from public.mc_stock_movements where workspace_id=w and lot_id=lot;
 select count(*) into events_after from public.mc_stock_events where workspace_id=w;
 select count(*) into consumes_after from public.mc_production_consumption where workspace_id=w;
 select count(*) into audit_after from public.mc_audit_events
  where workspace_id=w and entity='physical_consumption_occurrence';
 if balance_before<>80 or balance_after<>balance_before or events_after<>events_before
    or consumes_after<>consumes_before then
  raise exception 'Ocorrência GAP01 indevidamente movimentou estoque ou consumo';end if;
 if audit_after<>audit_before+1 then raise exception 'Auditoria GAP01 duplicada ou ausente';end if;
 if (select status from public.mc_physical_consumption_occurrences where id=id1)<>'registered' then
  raise exception 'Registro não está pendente';end if;
 if (select quantity_g from public.mc_physical_consumption_occurrences where id=id1)<>100 then
  raise exception 'Massa observada alterada';end if;
 if (select cost_status from public.mc_stock_lots where id=lot)<>'unknown' then
  raise exception 'Custo desconhecido foi inferido';end if;
 -- Possível origem pode ser nula, sem fabricar estoque ou lote.
 perform public.mc_record_physical_occurrence(w,p,'Material sem lote conhecido',17.125,'informed',at_time,
  'Relato do operador, origem material não identificada.',null,null,null,'gap01-record-no-lot-001');
 if (select count(*) from public.mc_physical_consumption_occurrences
   where workspace_id=w and production_id=p)<>2 then raise exception 'Origem ausente bloqueou registro';end if;
 deny:=false;
 begin
 perform public.mc_record_physical_occurrence(w,p,'PETG de origem incerta',101,'weighed',at_time,
  'Massa física observada em balança, aferição do operador.',lot,'pesagem manuscrita 2026-11-21',
  'Possível bobina informada, ainda sem comprovação','gap01-record-001');
 exception when others then deny:=true;end;
 if not deny then raise exception 'Chave idempotente aceitou payload divergente';end if;
 deny:=false;
 begin perform public.mc_record_physical_occurrence(w,p,'PETG',0,'weighed',at_time,
  'Massa física observada em balança.',lot,null,null,'gap01-zero-001');
 exception when others then deny:=true;end;
 if not deny then raise exception 'Quantidade zero passou';end if;
 deny:=false;
 begin perform public.mc_record_physical_occurrence(w,p,'PETG',1.1234,'weighed',at_time,
  'Massa física observada em balança.',lot,null,null,'gap01-decimals-001');
 exception when others then deny:=true;end;
 if not deny then raise exception 'Precisão acima de 3 casas passou';end if;
 deny:=false;
 begin perform public.mc_record_physical_occurrence(w,p,'PETG',1,'weighed',now()+interval '1 day',
  'Relato futuro inválido do operador.',lot,null,null,'gap01-future-001');
 exception when others then deny:=true;end;
 if not deny then raise exception 'Ocorrência futura passou';end if;
 deny:=false;
 begin perform public.mc_record_physical_occurrence(w,p,'PETG',1,'weighed',at_time,
  'Fonte informada pelo operador.',gen_random_uuid(),null,null,'gap01-foreign-lot-001');
 exception when others then deny:=true;end;
 if not deny then raise exception 'Lote não pertencente à oficina passou';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 if public.mc_list_physical_occurrences(w)<>'[]'::jsonb then
  raise exception 'Não membro leu ocorrências de oficina alheia';end if;
 deny:=false;
 begin perform public.mc_record_physical_occurrence(w,p,'PETG',1,'weighed',at_time,
  'Fonte informada pelo operador.',null,null,null,'gap01-unauthorized-001');
 exception when others then deny:=true;end;
 if not deny then raise exception 'Não membro gravou ocorrência';end if;
 if has_table_privilege('authenticated','public.mc_physical_consumption_occurrences','INSERT')
  or has_table_privilege('authenticated','public.mc_physical_consumption_occurrences','UPDATE')
  or has_table_privilege('authenticated','public.mc_physical_consumption_occurrences','DELETE')
  or has_table_privilege('anon','public.mc_physical_consumption_occurrences','SELECT')
  or has_function_privilege('anon','public.mc_record_physical_occurrence(uuid,uuid,text,numeric,text,timestamptz,text,uuid,text,text,text)','EXECUTE') then
  raise exception 'Grants da ocorrência GAP01 inseguros';end if;
 raise notice 'GAP01-A: saldo mantido, 100 g com 80 g registrados, origem opcional, autor, evidência, idempotência, isolamento e custo desconhecido: APROVADO';
end
$gap$;
rollback;
