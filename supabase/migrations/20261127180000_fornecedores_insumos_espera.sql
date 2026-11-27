-- MakerCusto: fornecedores, estoque de insumos, marca/temperatura nos filamentos e lista de espera.
-- Mesmas regras das outras tabelas: cada pessoa só vê e altera o que é dela (RLS), com limite por pessoa.
-- Depende de 20261127150000 (função limite_por_usuario e tabela filamentos).

alter table public.filamentos add column marca text not null default '' check (char_length(marca) <= 30);
alter table public.filamentos add column temp_bico smallint check (temp_bico between 0 and 500);
alter table public.filamentos add column temp_mesa smallint check (temp_mesa between 0 and 200);

create table public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 60),
  contato text not null default '' check (char_length(contato) <= 80),
  site text not null default '' check (char_length(site) <= 120),
  obs text not null default '' check (char_length(obs) <= 200),
  criado_em timestamptz not null default now()
);

create table public.insumos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 60),
  categoria text not null default '' check (char_length(categoria) <= 30),
  fornecedor text not null default '' check (char_length(fornecedor) <= 60),
  qtd integer not null check (qtd between 0 and 1000000),
  minimo integer not null default 0 check (minimo between 0 and 1000000),
  custo_centavos integer not null check (custo_centavos between 0 and 10000000),
  criado_em timestamptz not null default now()
);

create index fornecedores_user_idx on public.fornecedores (user_id, nome);
create index insumos_user_idx on public.insumos (user_id, nome);

create trigger fornecedores_limite before insert on public.fornecedores
  for each row execute function public.limite_por_usuario('50');
create trigger insumos_limite before insert on public.insumos
  for each row execute function public.limite_por_usuario('200');

do $$
declare t text;
begin
  foreach t in array array['fornecedores', 'insumos'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy "ver os proprios" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format('create policy "criar os proprios" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t);
    execute format('create policy "alterar os proprios" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create policy "excluir os proprios" on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- Lista de espera da página inicial: qualquer visitante pode entrar com o e-mail, ninguém consegue ler a lista pelo app.
create table public.lista_espera (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 5 and 120 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  criado_em timestamptz not null default now()
);

-- security definer: quem se inscreve não tem permissão de leitura, mas o teto precisa contar as linhas.
create function public.lista_espera_teto() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.lista_espera) >= 20000 then
    raise exception 'Lista de espera cheia.' using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger lista_espera_teto before insert on public.lista_espera
  for each row execute function public.lista_espera_teto();

alter table public.lista_espera enable row level security;
revoke all on public.lista_espera from anon, authenticated;
grant insert on public.lista_espera to anon, authenticated;
create policy "entrar na lista" on public.lista_espera for insert to anon, authenticated with check (true);
