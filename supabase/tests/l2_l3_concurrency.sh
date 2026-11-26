#!/usr/bin/env bash
# MakerCusto: teste real de concorrência e isolamento em PostgreSQL efêmero.
# Nunca usar credenciais, identidade ou dados do Supabase operacional.
set -euo pipefail
ws='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
printer='dddddddd-dddd-4ddd-8ddd-dddddddddddd'
product='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
stranger='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
export PGOPTIONS="-c request.jwt.claim.sub=$owner"
lot="$(psql -X -At -v ON_ERROR_STOP=1 -c "select public.mc_register_existing_spool('$ws','ci-concurrency-spool-2026','PETG de teste','Concorrência CI',10.000,'measured',null,'somente ambiente efêmero')")"
test -n "$lot"
print1="$(psql -X -At -v ON_ERROR_STOP=1 -c "select public.mc_create_print('$ws','$printer',jsonb_build_array(jsonb_build_object('product_id','$product','quantity',1)),null,'Concorrência 1','slicer')")"
print2="$(psql -X -At -v ON_ERROR_STOP=1 -c "select public.mc_create_print('$ws','$printer',jsonb_build_array(jsonb_build_object('product_id','$product','quantity',1)),null,'Concorrência 2','slicer')")"
test -n "$print1" && test -n "$print2"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
psql -X -At -v ON_ERROR_STOP=1 -c "select public.mc_confirm_print('$ws','$print1','ci-concurrency-event-1','[]'::jsonb,jsonb_build_array(jsonb_build_object('lot_id','$lot','model_g',7,'purge_g',0,'loss_g',0,'basis','weighed')),null,false)" >"$tmp/first.log" 2>&1 &
pid1=$!
psql -X -At -v ON_ERROR_STOP=1 -c "select public.mc_confirm_print('$ws','$print2','ci-concurrency-event-2','[]'::jsonb,jsonb_build_array(jsonb_build_object('lot_id','$lot','model_g',7,'purge_g',0,'loss_g',0,'basis','weighed')),null,false)" >"$tmp/second.log" 2>&1 &
pid2=$!
pass1=0; pass2=0
wait "$pid1" && pass1=1 || true
wait "$pid2" && pass2=1 || true
if test "$((pass1+pass2))" -ne 1; then
  echo "Falha: duas confirmações concorrentes deveriam produzir somente um sucesso"
  cat "$tmp/first.log" "$tmp/second.log"
  exit 1
fi
balance="$(psql -X -At -v ON_ERROR_STOP=1 -c "select coalesce(sum(delta),0) from public.mc_stock_movements where workspace_id='$ws' and lot_id='$lot'")"
confirmations="$(psql -X -At -v ON_ERROR_STOP=1 -c "select count(*) from public.mc_production_confirmations where workspace_id='$ws' and idempotency_key in ('ci-concurrency-event-1','ci-concurrency-event-2')")"
test "$balance" = "3.0000" || { echo "Saldo incorreto após corrida: $balance"; exit 1; }
test "$confirmations" = "1" || { echo "Confirmações duplicadas: $confirmations"; exit 1; }
# Uma identidade diferente não pode listar a execução nem ler movimentos pelo RLS.
export PGOPTIONS="-c request.jwt.claim.sub=$stranger"
visible="$(psql -X -At -v ON_ERROR_STOP=1 -c "set role authenticated; select public.mc_list_prints('$ws')" | tail -n1)"
test "$visible" = "[]" || { echo "Outra identidade listou execuções indevidamente"; exit 1; }
moves="$(psql -X -At -v ON_ERROR_STOP=1 -c "set role authenticated; select count(*) from public.mc_stock_movements where workspace_id='$ws'" | tail -n1)"
test "$moves" = "0" || { echo "RLS permitiu leitura cruzada de movimentos"; exit 1; }
if psql -X -At -v ON_ERROR_STOP=1 -c "set role authenticated; select public.mc_confirm_print('$ws','$print1','ci-unauthorized-2026','[]'::jsonb,jsonb_build_array(jsonb_build_object('lot_id','$lot','model_g',1,'purge_g',0,'loss_g',0,'basis','weighed')),null,false)" >"$tmp/unauthorized.log" 2>&1; then
  echo "Identidade estranha confirmou produção"
  exit 1
fi
echo "L2/L3: concorrência real com duas sessões (1 sucesso/1 rejeição), saldo 3 g, RLS e autorização: APROVADOS"
