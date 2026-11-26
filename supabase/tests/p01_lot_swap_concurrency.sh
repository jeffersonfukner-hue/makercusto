#!/usr/bin/env bash
# P01-D/F — duas trocas simultâneas da mesma reserva de origem em DB descartável.
set -euo pipefail
ws='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
user='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
printer='dddddddd-dddd-4ddd-8ddd-dddddddddddd'
product='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
export PGOPTIONS="-c request.jwt.claim.sub=$user"
make_spool() {
 psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_register_existing_spool('$ws','p01-swap-race-$1','PETG QA $1','Bobina $1',100,'measured',null,'somente CI')"
}
a="$(make_spool origem)"
b="$(make_spool destino-b)"
c="$(make_spool destino-c)"
p="$(psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_create_print('$ws','$printer',jsonb_build_array(jsonb_build_object('product_id','$product','quantity',1)),null,'Troca concorrente','slicer')")"
old="$(psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_reserve_print_lot('$ws','$p','$a',60,'p01-swap-race-reservation')")"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_swap_print_reserved_lot('$ws','$p','$old','$b',60,40,'p01-swap-race-request-b','Troca concorrente para bobina B')" >"$tmp/b" 2>&1 &
pb=$!
psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_swap_print_reserved_lot('$ws','$p','$old','$c',60,40,'p01-swap-race-request-c','Troca concorrente para bobina C')" >"$tmp/c" 2>&1 &
pc=$!
ok_b=0;ok_c=0
wait "$pb" && ok_b=1 || true
wait "$pc" && ok_c=1 || true
if test "$((ok_b+ok_c))" -ne 1; then
 echo "P01-D/F: duas trocas deveriam resultar em um único sucesso"
 cat "$tmp/b" "$tmp/c"
 exit 1
fi
old_status="$(psql -X -v ON_ERROR_STOP=1 -Atc "select status from public.mc_production_reservations where id='$old'")"
old_remain="$(psql -X -v ON_ERROR_STOP=1 -Atc "select remaining from public.mc_production_reservations where id='$old'")"
held_b="$(psql -X -v ON_ERROR_STOP=1 -Atc "select coalesce(sum(remaining),0) from public.mc_production_reservations where workspace_id='$ws' and lot_id='$b' and status='active'")"
held_c="$(psql -X -v ON_ERROR_STOP=1 -Atc "select coalesce(sum(remaining),0) from public.mc_production_reservations where workspace_id='$ws' and lot_id='$c' and status='active'")"
swaps="$(psql -X -v ON_ERROR_STOP=1 -Atc "select count(*) from public.mc_audit_events where workspace_id='$ws' and entity_id='$p' and action='swap_reserved_lot'")"
phys="$(psql -X -v ON_ERROR_STOP=1 -Atc "select coalesce(sum(delta),0) from public.mc_stock_movements where workspace_id='$ws' and lot_id in ('$a','$b','$c')")"
test "$old_status" = "released" && test "$old_remain" = "0.0000" || { echo "Origem não liberada corretamente";exit 1; }
test "$swaps" = "1" || { echo "Auditoria de duas trocas concorrentes indevida: $swaps";exit 1; }
test "$phys" = "300.0000" || { echo "Trocas afetaram estoque físico: $phys";exit 1; }
if test "$ok_b" = "1"; then
 test "$held_b" = "40.0000" && test "$held_c" = "0" || { echo "Reservas conflitantes B/C";exit 1; }
else
 test "$held_c" = "40.0000" && test "$held_b" = "0" || { echo "Reservas conflitantes B/C";exit 1; }
fi
echo "P01-D/F: duas trocas simultâneas com mesma reserva — uma confirmada, outra negada, zero baixa: APROVADO"
