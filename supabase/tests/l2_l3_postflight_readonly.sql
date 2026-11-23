-- MakerCusto — POSTFLIGHT L2/L3: somente leitura, sem dados de teste na base operacional.
-- Exigir resultado aprovado depois da migração autorizada.
begin transaction read only;
do $postflight$
declare v record;
begin
 if to_regclass('public.mc_production_output_events') is null
    or to_regprocedure('public.mc_create_print(uuid,uuid,jsonb,numeric,text,text)') is null
    or to_regprocedure('public.mc_confirm_print(uuid,uuid,text,jsonb,jsonb,numeric,boolean)') is null
    or to_regprocedure('public.mc_list_prints(uuid)') is null then
  raise exception 'L2/L3 incompleto: faltam tabela ou RPCs';
 end if;
 if not (select relrowsecurity from pg_class where oid='public.mc_production_output_events'::regclass) then
  raise exception 'Tabela nova com RLS desabilitado';
 end if;
 for v in select 'public.mc_create_print(uuid,uuid,jsonb,numeric,text,text)' as fn union all
           select 'public.mc_confirm_print(uuid,uuid,text,jsonb,jsonb,numeric,boolean)' union all
           select 'public.mc_list_prints(uuid)'
 loop
  if has_function_privilege('anon',v.fn,'EXECUTE')
    or not has_function_privilege('authenticated',v.fn,'EXECUTE') then
   raise exception 'Permissão de função insegura: %',v.fn;
  end if;
 end loop;
 if not has_table_privilege('authenticated','public.mc_production_output_events','SELECT')
   or has_table_privilege('authenticated','public.mc_production_output_events','INSERT')
   or has_table_privilege('anon','public.mc_production_output_events','SELECT') then
  raise exception 'Permissão indevida na tabela de deltas';
 end if;
 for v in select unnest(array['mc_productions','mc_production_outputs','mc_production_confirmations',
   'mc_production_consumption','mc_production_reservations','mc_audit_events']) as tbl loop
  if has_table_privilege('authenticated',format('public.%I',v.tbl),'INSERT')
     or has_table_privilege('authenticated',format('public.%I',v.tbl),'UPDATE')
     or has_table_privilege('authenticated',format('public.%I',v.tbl),'DELETE') then
   raise exception 'Escrita direta ainda aberta na tabela %',v.tbl;
  end if;
 end loop;
 raise notice 'POSTFLIGHT L2/L3 APROVADO: RPCs, grants, proibição de escrita direta e RLS conferidos';
end
$postflight$;
rollback;
