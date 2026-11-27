-- MakerCusto: filamentos, produtos (com partes) e impressoras do usuário, na nuvem.
-- Mesmas regras de `calculos`: cada pessoa vê e altera só os próprios registros (RLS) e há limite por pessoa.

-- Limite por pessoa, por gatilho (contar dentro da política causaria recursão).
create function public.limite_por_usuario() returns trigger
language plpgsql set search_path = '' as $$
declare n integer;
begin
  execute format('select count(*) from %I.%I where user_id = $1', tg_table_schema, tg_table_name)
    into n using new.user_id;
  if n >= tg_argv[0]::integer then
    raise exception 'Limite de % registros por pessoa.', tg_argv[0] using errcode = 'check_violation';
  end if;
  return new;
end $$;

create table public.filamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 60),
  fornecedor text not null default '' check (char_length(fornecedor) <= 40),
  material text not null check (char_length(material) between 1 and 20),
  cor text not null default '' check (char_length(cor) <= 30),
  preco_centavos integer not null check (preco_centavos between 1 and 1000000),
  peso_g integer not null check (peso_g between 1 and 20000),
  comprado_em date not null,
  criado_em timestamptz not null default now()
);

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 60),
  entrada jsonb not null check (jsonb_typeof(entrada) = 'object' and pg_column_size(entrada) < 32768),
  criado_em timestamptz not null default now()
);

create table public.impressoras (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 60),
  dados jsonb not null check (jsonb_typeof(dados) = 'object' and pg_column_size(dados) < 2048),
  criado_em timestamptz not null default now()
);

create index filamentos_user_idx on public.filamentos (user_id, comprado_em desc);
create index produtos_user_idx on public.produtos (user_id, criado_em desc);
create index impressoras_user_idx on public.impressoras (user_id, criado_em desc);

create trigger filamentos_limite before insert on public.filamentos
  for each row execute function public.limite_por_usuario('100');
create trigger produtos_limite before insert on public.produtos
  for each row execute function public.limite_por_usuario('50');
create trigger impressoras_limite before insert on public.impressoras
  for each row execute function public.limite_por_usuario('20');

-- RLS: sem acesso para quem não está logado; cada pessoa só mexe no que é dela.
do $$
declare t text;
begin
  foreach t in array array['filamentos', 'produtos', 'impressoras'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy "ver os proprios" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format('create policy "criar os proprios" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t);
    execute format('create policy "alterar os proprios" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create policy "excluir os proprios" on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end $$;
