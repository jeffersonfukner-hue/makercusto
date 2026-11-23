#!/usr/bin/env bash
# Isolamento de dados entre duas oficinas fictícias, PostgreSQL descartável do CI.
set -euo pipefail
ws_a='cccccccc-cccc-4ccc-8ccc-cccccccccccc'
user_a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
ws_b='99999999-9999-4999-8999-999999999999'
user_b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
printer_b='88888888-8888-4888-8888-888888888888'
product_b='77777777-7777-4777-8777-777777777777'
psql -X -v ON_ERROR_STOP=1 <<SQL
insert into public.mc_workspaces(id,owner_id,name) values ('$ws_b','$user_b','Oficina B isolada');
insert into public.mc_members(workspace_id,user_id,role,active,financial_access)
values ('$ws_b','$user_b','owner',true,true);
insert into public.mc_printers(id,workspace_id,name,active)
values ('$printer_b','$ws_b','Impressora B',true);
insert into public.mc_products(id,workspace_id,name,kind,active)
values ('$product_b','$ws_b','Peça B','component',true);
SQL
export PGOPTIONS="-c request.jwt.claim.sub=$user_b"
psql -X -v ON_ERROR_STOP=1 -Atc "select public.mc_create_print('$ws_b','$printer_b',jsonb_build_array(jsonb_build_object('product_id','$product_b','quantity',1)),null,'Oficina B','slicer')" >/dev/null
check_access() {
 local caller="$1" my_ws="$2" other_ws="$3"
 PGOPTIONS="-c request.jwt.claim.sub=$caller" psql -X -v ON_ERROR_STOP=1 -At <<SQL
begin transaction read only;
set local role authenticated;
do \$\$
declare
 own jsonb;
 foreign_data jsonb;
 own_rows integer;
 alien_rows integer;
begin
 own := public.mc_list_prints('$my_ws'::uuid);
 foreign_data := public.mc_list_prints('$other_ws'::uuid);
 select count(*) into own_rows from public.mc_productions where workspace_id='$my_ws';
 select count(*) into alien_rows from public.mc_productions where workspace_id='$other_ws';
 if jsonb_array_length(own)<1 or own_rows<1 then
   raise exception 'Oficina do próprio usuário não é visível';
 end if;
 if foreign_data <> '[]'::jsonb or alien_rows<>0 then
   raise exception 'VAZAMENTO: usuário de uma oficina viu produções da outra';
 end if;
end \$\$;
rollback;
SQL
}
check_access "$user_a" "$ws_a" "$ws_b"
check_access "$user_b" "$ws_b" "$ws_a"
echo "L2/L3: isolamento de duas oficinas e dois membros autenticados sintéticos, com dados efetivos: APROVADO"
