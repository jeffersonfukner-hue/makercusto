-- L4-G02: dossiê atual de prontidão, sempre bloqueado para contabilização.
-- Lê dados existentes + revisão histórica. NÃO executa fechamento nem grava dados.
-- Proteções: SECURITY DEFINER com search_path seguro, autorização de oficina,
-- nenhuma inferência de zero ou de categoria resolvida.
create function public.mc_get_l4_close_readiness(
 p_workspace_id uuid,p_production_id uuid,p_review_id uuid default null
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
 v_review public.mc_l4_close_reviews%rowtype;
 v_production public.mc_productions%rowtype;
 v_out integer;v_consumptions integer;v_missing integer;v_unknown integer;
 v_estimated integer;v_unverified integer;v_open integer;v_reversed integer;
 v_pending integer:=6;v_supported integer:=0;v_na integer:=0;v_pending_list jsonb:='[]'::jsonb;
 v_item jsonb;v_reasons jsonb:='[]'::jsonb;v_source_list jsonb;
begin
 if auth.uid() is null or not exists(
  select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')
 ) then raise exception 'Sem autorização para examinar custo L4';end if;
 select * into v_production from public.mc_productions p
 where p.workspace_id=p_workspace_id and p.id=p_production_id;
 if not found then raise exception 'Execução inexistente nesta oficina';end if;
 if p_review_id is null then
  select * into v_review from public.mc_l4_close_reviews r
  where r.workspace_id=p_workspace_id and r.production_id=p_production_id
  order by r.created_at desc,r.id desc limit 1;
 else
  select * into v_review from public.mc_l4_close_reviews r
  where r.workspace_id=p_workspace_id and r.production_id=p_production_id
   and r.id=p_review_id;
  if not found then raise exception 'Revisão não pertence à execução';end if;
 end if;
 select count(*) into v_out from public.mc_production_outputs o
 where o.workspace_id=p_workspace_id and o.production_id=p_production_id
 and o.confirmed_good+o.confirmed_failed>0;
 select count(*),
  count(*) filter(where exact.consumption_id is null),
  count(*) filter(where exact.source_cost_status='unknown'),
  count(*) filter(where exact.source_cost_status='estimated'),
  count(*) filter(where exact.source_cost_status='known'
   and exact.purchase_line_id is null)
 into v_consumptions,v_missing,v_unknown,v_estimated,v_unverified
 from public.mc_production_consumption c
 join public.mc_production_confirmations pc
 on pc.workspace_id=c.workspace_id and pc.id=c.confirmation_id
 left join public.mc_l4_exact_consumption_origins exact
 on exact.workspace_id=c.workspace_id and exact.consumption_id=c.id
 where c.workspace_id=p_workspace_id and pc.production_id=p_production_id;
 select count(*) into v_open from public.mc_production_reservations r
 where r.workspace_id=p_workspace_id and r.production_id=p_production_id and r.status='active';
 select count(*) into v_reversed from public.mc_production_confirmations pc
 where pc.workspace_id=p_workspace_id and pc.production_id=p_production_id and pc.status='reversed';
 if v_review.id is not null then
  v_pending:=0;v_supported:=0;v_na:=0;
  for v_item in select value from jsonb_array_elements(v_review.request_payload->'categories') loop
   case v_item->>'status'
    when 'pending' then
     v_pending:=v_pending+1;
     v_pending_list:=v_pending_list||jsonb_build_array(v_item->>'category');
    when 'supported' then v_supported:=v_supported+1;
    when 'not_applicable' then v_na:=v_na+1;
    else v_pending:=v_pending+1;
   end case;
  end loop;
 end if;
 if v_review.id is null then
  v_reasons:=v_reasons||jsonb_build_array('NO_REVIEW');
 end if;
 if v_out=0 then v_reasons:=v_reasons||jsonb_build_array('NO_CONFIRMED_OUTPUTS');end if;
 if v_consumptions=0 then v_reasons:=v_reasons||jsonb_build_array('NO_CONFIRMED_CONSUMPTION');end if;
 if v_missing>0 then v_reasons:=v_reasons||jsonb_build_array('MISSING_EXACT_ORIGINS');end if;
 if v_unknown>0 then v_reasons:=v_reasons||jsonb_build_array('UNKNOWN_SOURCE_COST');end if;
 if v_estimated>0 then v_reasons:=v_reasons||jsonb_build_array('ESTIMATED_SOURCE_COST');end if;
 if v_unverified>0 then v_reasons:=v_reasons||jsonb_build_array('SOURCE_WITHOUT_PURCHASE_REFERENCE');end if;
 if v_open>0 then v_reasons:=v_reasons||jsonb_build_array('ACTIVE_RESERVATIONS');end if;
 if v_reversed>0 then v_reasons:=v_reasons||jsonb_build_array('REVERSED_CONFIRMATIONS_NEED_RECONCILIATION');end if;
 if v_pending>0 then v_reasons:=v_reasons||jsonb_build_array('UNREVIEWED_COST_CATEGORIES');end if;
 -- Ainda não existe prova transacional de atribuição completa de todas as
 -- categorias P05/P06, P07 e compensações P09: bloqueio incondicional.
 v_reasons:=v_reasons||jsonb_build_array('FINAL_ALLOCATION_NOT_IMPLEMENTED','P09_REVERSAL_NOT_IMPLEMENTED');
 select coalesce(jsonb_agg(jsonb_build_object(
  'consumption_id',c.id,'confirmation_id',pc.id,'lot_id',c.lot_id,
  'origin_captured',exact.consumption_id is not null,
  'source_status',coalesce(exact.source_cost_status,'missing'),
  'purchase_reference',exact.purchase_line_id,
  'model_g',c.model_quantity::text,
  'purge_g',c.purge_quantity::text,
  'loss_g',c.loss_quantity::text
 ) order by pc.confirmed_at,c.id),'[]'::jsonb)
 into v_source_list
 from public.mc_production_consumption c
 join public.mc_production_confirmations pc on pc.workspace_id=c.workspace_id and pc.id=c.confirmation_id
 left join public.mc_l4_exact_consumption_origins exact
 on exact.workspace_id=c.workspace_id and exact.consumption_id=c.id
 where c.workspace_id=p_workspace_id and pc.production_id=p_production_id;
 return jsonb_build_object(
  'schema_version','l4-readiness-v1','workspace_id',p_workspace_id,
  'execution_id',p_production_id,'review_id',v_review.id,
  'production_status',v_production.status,
  'confirmed_output_groups',v_out,'consumption_rows',v_consumptions,
  'exact_origin_missing',v_missing,'cost_unknown',v_unknown,
  'cost_estimated',v_estimated,'cost_known_without_purchase_reference',v_unverified,
  'active_reservations',v_open,'reversed_confirmations',v_reversed,
  'categories_pending',v_pending,'categories_supported_claimed',v_supported,
  'categories_not_applicable_declared',v_na,'pending_categories',v_pending_list,
  'sources',v_source_list,'blockers',v_reasons,
  'status','pending','posting_allowed',false,'financially_final',false,
  'computed_live',true
 );
end $$;
revoke all on function public.mc_get_l4_close_readiness(uuid,uuid,uuid) from public,anon;
grant execute on function public.mc_get_l4_close_readiness(uuid,uuid,uuid) to authenticated;
