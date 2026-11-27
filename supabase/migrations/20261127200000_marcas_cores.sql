-- MakerCusto: marcas e cores cadastradas pela própria pessoa (além das listas de sugestão do app).
-- Mesmas regras das outras tabelas: cada pessoa só vê e altera o que é dela (RLS), com limite por pessoa.
-- Depende de 20261127150000 (função limite_por_usuario).

create table public.marcas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 30),
  site text not null default '' check (char_length(site) <= 120),
  temp_bico smallint check (temp_bico between 0 and 500),
  temp_mesa smallint check (temp_mesa between 0 and 200),
  criado_em timestamptz not null default now()
);

create table public.cores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 30),
  criado_em timestamptz not null default now()
);

-- Mesmo nome (sem diferença de maiúscula) não repete para a mesma pessoa.
create unique index marcas_nome_uni on public.marcas (user_id, lower(nome));
create unique index cores_nome_uni on public.cores (user_id, lower(nome));

create trigger marcas_limite before insert on public.marcas
  for each row execute function public.limite_por_usuario('100');
create trigger cores_limite before insert on public.cores
  for each row execute function public.limite_por_usuario('100');

do $$
declare t text;
begin
  foreach t in array array['marcas', 'cores'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy "ver os proprios" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format('create policy "criar os proprios" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t);
    execute format('create policy "alterar os proprios" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create policy "excluir os proprios" on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end $$;
