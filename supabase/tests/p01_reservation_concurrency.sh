#!/usr/bin/env bash
# P01-F — duas reservas de ordens distintas disputam o mesmo saldo, PostgreSQL descartável CI.
set -euo pipefail
ws='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
user='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
printer='dddddddd-dddd-4ddd-8ddd-dddddddddddd'
product='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
export PGOPTIONS="-c request.jwt.claim.sub=$user"
lot="$(psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_register_existing_spool('$ws','p01-concurrency-lot','PETG P01','Bobina paralela',100,'measured',null,'teste descartável')")"
a="$(psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_create_print('$ws','$printer',jsonb_build_array(jsonb_build_object('product_id','$product','quantity',1)),null,'Reserva paralela A','slicer')")"
b="$(psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_create_print('$ws','$printer',jsonb_build_array(jsonb_build_object('product_id','$product','quantity',1)),null,'Reserva paralela B','slicer')")"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_reserve_print_lot('$ws','$a','$lot',60,'p01-parallel-request-a')" >"$tmp/a" 2>&1 &
pid_a=$!
psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_reserve_print_lot('$ws','$b','$lot',60,'p01-parallel-request-b')" >"$tmp/b" 2>&1 &
pid_b=$!
ok_a=0;ok_b=0
wait "$pid_a" && ok_a=1 || true
wait "$pid_b" && ok_b=1 || true
if test "$((ok_a+ok_b))" -ne 1; then
 echo "P01-F: falhou critério de 1 sucesso e 1 recusa de reserva concorrente"
 cat "$tmp/a" "$tmp/b"
 exit 1
fi
held="$(psql -X -v ON_ERROR_STOP=1 -Atc "select coalesce(sum(remaining),0) from public.mc_production_reservations where workspace_id='$ws' and lot_id='$lot' and status='active'")"
balance="$(psql -X -v ON_ERROR_STOP=1 -Atc "select coalesce(sum(delta),0) from public.mc_stock_movements where workspace_id='$ws' and lot_id='$lot'")"
events="$(psql -X -v ON_ERROR_STOP=1 -Atc "select count(*) from public.mc_audit_events where workspace_id='$ws' and entity='production_reservation' and action='reserve'")"
test "$held" = "60.0000" || { echo "P01-F: reservas comprometidas inesperadas: $held"; exit 1; }
test "$balance" = "100.0000" || { echo "P01-F: reserva movimentou estoque físico: $balance"; exit 1; }
test "$events" = "1" || { echo "P01-F: auditoria não corresponde ao registro de reserva: $events"; exit 1; }
echo "P01-F: duas reservas concorrentes, 1 aprovada, 1 negada, 60 g reservados e 100 g físicos: APROVADO"
