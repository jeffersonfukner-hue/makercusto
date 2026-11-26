-- MakerCusto — PREFLIGHT L2/L3: somente leitura. Falha fechada se a implantação não for segura.
-- Usar antes de qualquer autorização/aplicação da migração no Supabase MakerCusto.
begin transaction read only;
do $preflight$
declare
 v_prints integer; v_confs integer;
begin
 if current_setting('server_version_num')::integer<170000 then
  raise exception 'PostgreSQL inesperado: exigir versão 17+ validada em CI';
 end if;
 if to_regclass('public.mc_production_output_events') is not null
    or to_regprocedure('public.mc_create_print(uuid,uuid,jsonb,numeric,text,text)') is not null
    or to_regprocedure('public.mc_confirm_print(uuid,uuid,text,jsonb,jsonb,numeric,boolean)') is not null
    or to_regprocedure('public.mc_list_prints(uuid)') is not null then
  raise exception 'L2/L3 já apresenta objetos; não reaplicar sem reconciliar o estado existente';
 end if;
 if to_regclass('public.mc_productions') is null
    or to_regclass('public.mc_production_outputs') is null
    or to_regclass('public.mc_stock_lots') is null
    or to_regclass('public.mc_stock_movements') is null
    or to_regclass('public.mc_production_confirmations') is null
    or to_regprocedure('public.mc_register_existing_spool(uuid,text,text,text,numeric,text,numeric,text)') is null then
  raise exception 'Pré-requisitos L1 e fundação ausentes';
 end if;
 select count(*) into v_prints from public.mc_productions;
 select count(*) into v_confs from public.mc_production_confirmations;
 if v_prints>0 or v_confs>0 then
  raise exception 'Já há registros operacionais de produção/confirmacão; exigir plano de migração de dados (%/%).',v_prints,v_confs;
 end if;
 if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname in ('mc_productions','mc_production_outputs',
   'mc_stock_lots','mc_stock_movements','mc_production_confirmations') and not c.relrowsecurity) then
  raise exception 'RLS desabilitado em uma das tabelas críticas';
 end if;
 raise notice 'PREFLIGHT L2/L3 APROVADO: PostgreSQL %, tabelas L1 presentes, produções %, confirmações %, RLS ativo',
 current_setting('server_version'),v_prints,v_confs;
end
$preflight$;
rollback;
