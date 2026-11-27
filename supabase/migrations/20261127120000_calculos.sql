-- MakerCusto: cálculos salvos na nuvem. Rodar primeiro em um projeto de TESTE.
-- Cada pessoa vê e altera só os próprios cálculos (RLS). Máximo de 50 por pessoa, igual ao app.

create table public.calculos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 60),
  entrada jsonb not null check (jsonb_typeof(entrada) = 'object' and pg_column_size(entrada) < 4096),
  criado_em timestamptz not null default now()
);

create index calculos_user_criado_idx on public.calculos (user_id, criado_em desc);

alter table public.calculos enable row level security;

-- Sem acesso para quem não está logado.
revoke all on public.calculos from anon;
grant select, insert, update, delete on public.calculos to authenticated;

create policy "ver os proprios" on public.calculos
  for select to authenticated using (user_id = (select auth.uid()));

create policy "criar os proprios" on public.calculos
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Limite de 50 por pessoa. Feito por gatilho: contar dentro da própria política causaria recursão.
create function public.calculos_limite() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.calculos where user_id = new.user_id) >= 50 then
    raise exception 'Limite de 50 cálculos por pessoa.' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger calculos_limite before insert on public.calculos
  for each row execute function public.calculos_limite();

create policy "alterar os proprios" on public.calculos
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "excluir os proprios" on public.calculos
  for delete to authenticated using (user_id = (select auth.uid()));
