#!/usr/bin/env bash
# CI descartável P01-A/F: confirmação concorrendo com cancelamento de ordem.
# Resultados válidos: confirmação anterior ao cancelamento OU rejeição da confirmação.
set -euo pipefail
ws='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
user='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
printer='dddddddd-dddd-4ddd-8ddd-dddddddddddd'
product='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
export PGOPTIONS="-c request.jwt.claim.sub=$user"
lot="$(psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_register_existing_spool('$ws','p01-cancel-race-lot','PETG P01-A','Bobina corrida',100,'measured',null,'somente CI')")"
p="$(psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_create_print('$ws','$printer',jsonb_build_array(jsonb_build_object('product_id','$product','quantity',1)),null,'Corrida cancelamento','slicer')")"
o="$(psql -X -v ON_ERROR_STOP=1 -Atc "select id from public.mc_production_outputs where workspace_id='$ws' and production_id='$p'")"
r="$(psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_reserve_print_lot('$ws','$p','$lot',40,'p01-cancel-race-reserve')")"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_confirm_print('$ws','$p','p01-cancel-race-confirm',
 jsonb_build_array(jsonb_build_object('output_id','$o','good',1,'failed',0)),
 jsonb_build_array(jsonb_build_object('lot_id','$lot','model_g',25,'purge_g',0,'loss_g',0,'basis','weighed')),null,false)" >"$tmp/confirm" 2>&1 &
pid_confirm=$!
psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_cancel_print('$ws','$p','p01-cancel-race-key','Interromper execução em teste de concorrência')" >"$tmp/cancel" 2>&1 &
pid_cancel=$!
confirmed=0; cancelled=0
wait "$pid_confirm" && confirmed=1 || true
wait "$pid_cancel" && cancelled=1 || true
if test "$cancelled" != "1"; then echo "Falha: cancelamento não concluído"; cat "$tmp/cancel"; exit 1; fi
state="$(psql -X -At -v ON_ERROR_STOP=1 -c "select status from public.mc_productions where id='$p'")"
balance="$(psql -X -At -v ON_ERROR_STOP=1 -c "select coalesce(sum(delta),0) from public.mc_stock_movements where workspace_id='$ws' and lot_id='$lot'")"
held="$(psql -X -At -v ON_ERROR_STOP=1 -c "select remaining from public.mc_production_reservations where id='$r'")"
reservation_state="$(psql -X -At -v ON_ERROR_STOP=1 -c "select status from public.mc_production_reservations where id='$r'")"
nconfirm="$(psql -X -At -v ON_ERROR_STOP=1 -c "select count(*) from public.mc_production_confirmations where workspace_id='$ws' and production_id='$p'")"
goods="$(psql -X -At -v ON_ERROR_STOP=1 -c "select confirmed_good from public.mc_production_outputs where id='$o'")"
release="$(psql -X -At -v ON_ERROR_STOP=1 -c "select (details->>'released_g')::numeric from public.mc_audit_events where workspace_id='$ws' and entity_id='$r' and action='release_on_cancel'")"
expected_balance=100;expected_release=40
if test "$confirmed" = "1"; then expected_balance=75;expected_release=15;fi
test "$state" = "cancelled" || { echo "Status inválido: $state"; exit 1; }
test "$balance" = "$expected_balance.0000" || { echo "Saldo inválido: $balance"; exit 1; }
test "$held" = "0.0000" || { echo "Sobra não liberada: $held"; exit 1; }
test "$reservation_state" = "released" || { echo "Reserva não liberada: $reservation_state"; exit 1; }
test "$nconfirm" = "$confirmed" || { echo "Confirmações incorretas: $nconfirm"; exit 1; }
test "$goods" = "$confirmed.0000" || { echo "Saída alterada indevidamente: $goods"; exit 1; }
test "$(psql -X -At -v ON_ERROR_STOP=1 -c "select ($release)::numeric = ($expected_release)::numeric")" = "t" || { echo "Auditoria não corresponde à sobra: $release"; exit 1; }
echo "P01-A/F: cancelamento versus confirmação concorrente: ordem cancelada, consumo preservado quando confirmado, sobra auditada: APROVADO"
