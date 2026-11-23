-- Regressão de conjuntos com peças cadastradas — PostgreSQL CI efêmero, ROLLBACK.
begin;
do $test$
declare w uuid;u uuid;guirlanda uuid;estrela_g uuid;estrela_p uuid;kit uuid;kit2 uuid;
 rev_id uuid;rev2 uuid;pieces_before int;pieces_after int;d jsonb;lib jsonb;
 cost_initial numeric;deny boolean;
begin
 select workspace_id,user_id into w,u from public.mc_members
 where active and role in ('owner','manager') limit 1;
 if w is null then raise exception 'Membro QA ausente';end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 guirlanda:=public.mc_save_calculated_product(w,'Guirlanda','component','GRD-01',
 'Guirlanda decorativa',32,1,7.40,
 '{"origin":"calculator","saved_input":{"grams":74},"calculated_result":{"modelGrams":74}}'::jsonb);
 estrela_g:=public.mc_save_calculated_product(w,'Estrela grande','component','EST-G',
 'Estrela impressa',15,1,2.50,
 '{"origin":"calculator","saved_input":{"grams":25},"calculated_result":{"modelGrams":25}}'::jsonb);
 estrela_p:=public.mc_save_calculated_product(w,'Estrela pequena','component','EST-P',
 'Estrela impressa',9,1,1.10,
 '{"origin":"calculator","saved_input":{"grams":11},"calculated_result":{"modelGrams":11}}'::jsonb);
 lib:=public.mc_list_component_library(w);
 if not exists(select 1 from jsonb_array_elements(lib) x
 where x->>'id'=estrela_g::text and (x->>'unit_cost')::numeric=2.50 and (x->>'grams')::numeric=25)
 then raise exception 'Biblioteca não oferece estrela já cadastrada com custo por unidade';end if;
 select count(*) into pieces_before from public.mc_products where workspace_id=w and kind='component';
 kit:=public.mc_save_assembly_linked(w,null,'Guirlanda natalina',null,null,59,
 jsonb_build_array(
 jsonb_build_object('product_id',guirlanda,'name','nome alterado não autorizado','quantity',1,'notes',''),
 jsonb_build_object('product_id',estrela_g,'name','estrela duplicada?','quantity',1,'notes',''),
 jsonb_build_object('product_id',estrela_p,'name','estrela pequena','quantity',1,'notes','')
 ));
 select count(*) into pieces_after from public.mc_products where workspace_id=w and kind='component';
 if pieces_after<>pieces_before then raise exception 'Conjunto duplicou peças: % -> %',pieces_before,pieces_after;end if;
 if (select name from public.mc_products where id=guirlanda)<>'Guirlanda'
 then raise exception 'Cadastro original foi sobrescrito ao vincular';end if;
 select id into rev_id from public.mc_product_revisions where product_id=kit and revision=1;
 if (select count(*) from public.mc_product_components where revision_id=rev_id)<>3
 then raise exception 'Conjunto não guardou as três peças distintas';end if;
 d:=public.mc_list_assemblies(w);
 select (x->>'total_cost')::numeric into cost_initial
 from jsonb_array_elements(d) x where x->>'id'=kit::text;
 if cost_initial<>11.00 then raise exception 'Custo inicial esperado 11,00 mas recebeu %',cost_initial;end if;
 if not exists(select 1 from jsonb_array_elements(d) k,jsonb_array_elements(k->'parts') x
 where k->>'id'=kit::text and x->>'product_id'=estrela_g::text
 and x->>'name'='Estrela grande' and (x->>'unit_cost')::numeric=2.50)
 then raise exception 'Peça vinculada não foi exibida com nome/custo corretos';end if;
 -- Revisar conjunto não altera peça nem snapshot da revisão anterior.
 kit2:=public.mc_save_assembly_linked(w,kit,'Guirlanda natalina final',null,null,59,
 jsonb_build_array(
 jsonb_build_object('product_id',guirlanda,'quantity',1,'notes','mantém'),
 jsonb_build_object('product_id',estrela_g,'quantity',2,'notes','duas estrelas grandes'),
 jsonb_build_object('product_id',estrela_p,'quantity',1,'notes','mantém')));
 if kit2<>kit then raise exception 'Revisão mudou a identidade do conjunto';end if;
 select id into rev2 from public.mc_product_revisions where product_id=kit and revision=2;
 if rev2 is null or (select count(*) from public.mc_product_components where revision_id=rev2)<>3
 then raise exception 'Nova revisão incorreta';end if;
 if (select total_cost from public.mc_cost_snapshots where revision_id=rev_id)<>11.00
 or (select total_cost from public.mc_cost_snapshots where revision_id=rev2)<>13.50
 then raise exception 'Revisão sobrescreveu custo histórico ou total novo errado';end if;
 if (select name from public.mc_products where id=estrela_g)<>'Estrela grande'
 then raise exception 'Edição do conjunto alterou peça original';end if;
 -- Atualização posterior do custo da peça não altera o retrato da revisão do kit.
 insert into public.mc_cost_snapshots(workspace_id,product_id,formula_version,
 quantity,total_cost,cost_status,parameters) values
 (w,estrela_g,'qa-new-price',1,15,'estimated','{"origin":"calculator"}'::jsonb);
 if (select cost_per_unit from public.mc_assembly_part_snapshots
  where component_row_id=(select id from public.mc_product_components
   where revision_id=rev_id and component_product_id=estrela_g))<>2.50
 then raise exception 'Snapshot antigo foi reprecificado';end if;
 denied:=false;
 begin perform public.mc_save_assembly_linked(w,null,'Conjunto adversarial',null,null,null,
 jsonb_build_array(
 jsonb_build_object('product_id',gen_random_uuid(),'quantity',1),
 jsonb_build_object('product_id',guirlanda,'quantity',1)));
 exception when others then denied:=true;end;
 if not denied then raise exception 'Vínculo inexistente aceito';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 if public.mc_list_component_library(w)<>'[]'::jsonb then
 raise exception 'Não membro leu biblioteca da oficina';end if;
 denied:=false;
 begin perform public.mc_save_assembly_linked(w,null,'Sem acesso',null,null,null,
 jsonb_build_array(jsonb_build_object('product_id',guirlanda,'quantity',1),
 jsonb_build_object('product_id',estrela_g,'quantity',1)));
 exception when others then denied:=true;end;
 if not denied then raise exception 'Não membro criou conjunto';end if;
 if has_function_privilege('anon','public.mc_save_assembly_linked(uuid,uuid,text,text,text,numeric,jsonb)','EXECUTE')
 or has_function_privilege('anon','public.mc_list_component_library(uuid)','EXECUTE')
 then raise exception 'RPCs acessíveis sem autenticação';end if;
 raise notice 'CONJUNTOS-01: guirlanda + estrelas grandes/pequenas, 3 IDs originais, custos e revisões congelados, sem duplicação: APROVADO';
end
$test$;
rollback;
