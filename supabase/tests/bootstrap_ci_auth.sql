-- Banco EFÊMERO de CI, criado do zero dentro do GitHub Actions.
-- Simula apenas as entidades mínimas do esquema auth que as migrações MakerCusto referenciam.
-- NÃO executar no Supabase real: auth.users e auth.uid() já existem nele.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;

-- Identidade estritamente sintética, usada exclusivamente pelo fixture do CI.
insert into auth.users(id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
