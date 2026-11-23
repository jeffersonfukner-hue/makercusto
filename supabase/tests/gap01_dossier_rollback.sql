-- GAP01-D/E: dossiê READ ONLY, estado atual separado do consumo histórico.
begin;
do $case$
declare w uuid;u uuid;printer uuid;product uuid;lot uuid; p uuid;other_p uuid; occ uuid;
 dossier jsonb; before_mov bigint;after_mov bigint; before_audit bigint;after_audit bigint;
 before_res numeric;after_res numeric; denied boolean; no_lot uuid;
begin
 select m.workspace_id,m.user_id into w,u from public.mc_members m
 where m.active and m.role in ('owner','manager')
 and exists(select 1 from public.mc_printers where workspace_id=m.workspace_id and active)
 and exists(select 1 from public.mc_products where workspace_id=m.workspace_id and active and kind in ('product','component'))
 limit 1;
 if w is null then raise exception 'Fixture GAP01 D/E ausente';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select id into printer from public.mc_printers where workspace_id=w and active limit 1;
 select id into product from public.mc_products where workspace_id=w and active and kind in ('product','component') limit 1;
 lot:=public.mc_register_existing_spool(w,'gap01-dossier-'||gen_random_uuid()::text,
  'PETG QA','Bobina investigada',80,'measured',5.12,'Custo de teste conhecido');
 p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',2)),null,'GAP01 dossier','slicer');
 other_p:=public.mc_create_print(w,printer,jsonb_build_array(jsonb_build_object('product_id',product,'quantity',1)),null,'Reserva de outra ordem','slicer');
 perform public.mc_reserve_print_lot(w,p,lot,20,'gap01-dossier-res-own');
 perform public.mc_reserve_print_lot(w,other_p,lot,10,'gap01-dossier-res-other');
 perform public.mc_confirm_print(w,p,'gap01-dossier-confirm','[]'::jsonb,
 jsonb_build_array(jsonb_build_object('lot_id',lot,'model_g',15,'purge_g',0,
 'loss_g',0,'basis','weighed')),null,false);
 occ:=public.mc_record_physical_occurrence(w,p,'PETG observado',100,'weighed','2026-11-21T10:00:00Z',
  'Massa física observada, origem ainda em análise.',lot,'Caderno QA','Possível uso de bobina',
  'gap01-dossier-occ');
 perform public.mc_review_physical_occurrence(w,occ,'under_review','lot_change',
 'Possível troca de bobina precisa de verificação humana.',null,lot,'gap01-dossier-review');
 perform public.mc_propose_inventory_adjustment(w,occ,lot,20,'verified_count_error',
 'Possível erro histórico de inventário em análise',
 'Somente proposta sem aprovação ou movimentação',
 'Caderno de inventário QA','gap01-dossier-proposal');
 select count(*) into before_mov from public.mc_stock_movements where workspace_id=w;
 select count(*) into before_audit from public.mc_audit_events where workspace_id=w;
 select coalesce(sum(remaining),0) into before_res from public.mc_production_reservations where workspace_id=w;
 dossier:=public.mc_get_physical_occurrence_dossier(w,occ);
 if dossier->>'snapshot_type'<>'read_only_current_state'
 or dossier->>'approval'<>'not_available'
 or dossier->>'inventory_effect'<>'none'
 or dossier->>'possible_compensation_review'<>'manual_review_only'
 or dossier->'financial_adjustment'<>'null'::jsonb
 or dossier->'reversible_quantity_g'<>'null'::jsonb then
  raise exception 'Dossiê atribuiu aprovação, valor ou reversibilidade inexistentes';end if;
 if (dossier->>'physical_g')::numeric<>65
 or (dossier->>'reserved_g')::numeric<>15
 or (dossier->>'own_reserved_g')::numeric<>5
 or (dossier->>'other_reserved_g')::numeric<>10
 or (dossier->>'unreserved_g')::numeric<>50 then
  raise exception 'Saldo e reservas incorretos: %',dossier;end if;
 if jsonb_array_length(dossier->'confirmed_consumption_lines')<>1
 or (dossier->'confirmed_consumption_lines'->0->>'total_g')::numeric<>15
 or (dossier->'confirmed_consumption_lines'->0->>'unit_cost_snapshot')::numeric<>0.064
 or jsonb_array_length(dossier->'pending_adjustment_proposals')<>1
 or jsonb_array_length(dossier->'investigation_history')<>1
 or jsonb_array_length(dossier->'reservations')<>2 then
  raise exception 'Históricos ou propostas vinculados incorretamente';end if;
 if dossier->'confirmed_consumption_lines'->0->>'confirmation_id' is null
 or dossier->'confirmed_consumption_lines'->0->>'consumption_id' is null then
  raise exception 'Linhas de origem não referenciáveis';end if;
 select count(*) into after_mov from public.mc_stock_movements where workspace_id=w;
 select count(*) into after_audit from public.mc_audit_events where workspace_id=w;
 select coalesce(sum(remaining),0) into after_res from public.mc_production_reservations where workspace_id=w;
 if before_mov<>after_mov or before_audit<>after_audit or before_res<>after_res then
  raise exception 'Consulta alterou movimentos, reserva ou auditoria';end if;
 no_lot:=public.mc_record_physical_occurrence(w,p,'PETG desconhecido',7,'informed','2026-11-21T10:00:00Z',
  'Origem da amostra física ainda não identificada.',null,null,null,'gap01-dossier-no-lot');
 dossier:=public.mc_get_physical_occurrence_dossier(w,no_lot);
 if dossier->'physical_g'<>'null'::jsonb or dossier->'unreserved_g'<>'null'::jsonb
 or dossier->'reservations'<>'[]'::jsonb or dossier->>'lot_verification'<>'unverified' then
  raise exception 'Dossiê sem lote inventou saldo ou origem';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 denied:=false;
 begin perform public.mc_get_physical_occurrence_dossier(w,occ);
 exception when others then denied:=true;end;
 if not denied then raise exception 'Não membro consultou dossiê alheio';end if;
 if has_function_privilege('anon','public.mc_get_physical_occurrence_dossier(uuid,uuid)','EXECUTE') then
  raise exception 'Dossiê público indevido';end if;
 raise notice 'GAP01-D/E: dossiê somente leitura, lotes, reservas alheias e snapshots preservados, nenhuma aprovação/baixa: APROVADO';
end
$case$;
rollback;
