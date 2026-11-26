#!/usr/bin/env bash
# L4-G01: idempotência real sob duas sessões concorrentes. Exclusivamente CI efêmero.
set -euo pipefail
ws='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
user='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
printer='dddddddd-dddd-4ddd-8ddd-dddddddddddd'
product='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
export PGOPTIONS="-c request.jwt.claim.sub=$user"
print_id="$(psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_create_print('$ws','$printer',jsonb_build_array(jsonb_build_object('product_id','$product','quantity',1)),1,'Revisão concorrente L4','slicer')")"
output_id="$(psql -X -v ON_ERROR_STOP=1 -Atc "select id from public.mc_production_outputs where workspace_id='$ws' and production_id='$print_id' limit 1")"
psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_confirm_print('$ws','$print_id','l4-parallel-confirmation-01',jsonb_build_array(jsonb_build_object('output_id','$output_id','good',1,'failed',0)),'[]'::jsonb,null,false)" >/dev/null
evidence='[{"category":"energy","status":"pending","reason":"Energia pendente de medição"},{"category":"machine","status":"pending","reason":"Desgaste ainda sem cálculo"},{"category":"labor","status":"not_applicable","reason":"Sem serviço de montagem"},{"category":"accessory","status":"not_applicable","reason":"Sem acessórios nesta mesa"},{"category":"tool","status":"not_applicable","reason":"Sem ferramentas extras"},{"category":"other","status":"not_applicable","reason":"Sem custos adicionais"}]'
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
sql="select public.mc_submit_l4_close_review('$ws','$print_id','l4-parallel-review-same-01','$evidence'::jsonb);"
psql -X -v ON_ERROR_STOP=1 -Atc "$sql" >"$tmp/a" 2>&1 &
pid_a=$!
psql -X -v ON_ERROR_STOP=1 -Atc "$sql" >"$tmp/b" 2>&1 &
pid_b=$!
wait "$pid_a" || { cat "$tmp/a"; exit 1; }
wait "$pid_b" || { cat "$tmp/b"; exit 1; }
one="$(psql -X -v ON_ERROR_STOP=1 -Atc "select count(*) from public.mc_l4_close_reviews where workspace_id='$ws' and production_id='$print_id' and idempotency_key='l4-parallel-review-same-01'")"
audit="$(psql -X -v ON_ERROR_STOP=1 -Atc "select count(*) from public.mc_audit_events a join public.mc_l4_close_reviews r on a.entity_id=r.id where a.workspace_id='$ws' and r.production_id='$print_id' and a.action='submit_pending'")"
if test "$one" != "1" || test "$audit" != "1"; then
 echo "L4 concorrência duplicou revisão/auditoria: reviews=$one audits=$audit"
 cat "$tmp/a" "$tmp/b";exit 1
fi
if ! grep -q '"replayed": true' "$tmp/a" "$tmp/b"; then
 echo "L4 concorrência não identificou replay";cat "$tmp/a" "$tmp/b";exit 1
fi
if ! grep -q '"replayed": false' "$tmp/a" "$tmp/b"; then
 echo "L4 concorrência não identificou operação inicial";cat "$tmp/a" "$tmp/b";exit 1
fi
# Mesma chave com dados diferentes: primeira vence, segunda é rejeitada.
other='[{"category":"energy","status":"pending","reason":"Energia pendente de nova medição"},{"category":"machine","status":"pending","reason":"Desgaste ainda sem cálculo"},{"category":"labor","status":"not_applicable","reason":"Sem serviço de montagem"},{"category":"accessory","status":"not_applicable","reason":"Sem acessórios nesta mesa"},{"category":"tool","status":"not_applicable","reason":"Sem ferramentas extras"},{"category":"other","status":"not_applicable","reason":"Sem custos adicionais"}]'
psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_submit_l4_close_review('$ws','$print_id','l4-parallel-review-different-01','$evidence'::jsonb)" >"$tmp/c" 2>&1 &
pid_c=$!
psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_submit_l4_close_review('$ws','$print_id','l4-parallel-review-different-01','$other'::jsonb)" >"$tmp/d" 2>&1 &
pid_d=$!
ok_c=0;ok_d=0
wait "$pid_c" && ok_c=1 || true
wait "$pid_d" && ok_d=1 || true
test "$((ok_c+ok_d))" = "1" || { echo "L4 concorrência de payload divergente não rejeitou exatamente um";cat "$tmp/c" "$tmp/d";exit 1; }
two="$(psql -X -v ON_ERROR_STOP=1 -Atc "select count(*) from public.mc_l4_close_reviews where workspace_id='$ws' and production_id='$print_id' and idempotency_key='l4-parallel-review-different-01'")"
test "$two" = "1" || { echo "L4 concorrência criou $two revisões para mesma chave";exit 1; }
echo "L4-G01: concorrência de revisão, replay e payload divergente sem duplicar auditoria: APROVADO"
