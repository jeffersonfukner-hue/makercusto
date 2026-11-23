-- Fixture exclusiva para PostgreSQL efêmero no CI. Dados fictícios.
insert into public.mc_workspaces(id,owner_id,name) values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Oficina de testes L2/L3');
insert into public.mc_members(workspace_id,user_id,role,active,financial_access) values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','owner',true,true);
insert into public.mc_printers(id,workspace_id,name,active) values
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','cccccccc-cccc-4ccc-8ccc-cccccccccccc','Impressora simulada',true);
insert into public.mc_products(id,workspace_id,name,kind,active) values
 ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','cccccccc-cccc-4ccc-8ccc-cccccccccccc','Hélice simulada','component',true);
