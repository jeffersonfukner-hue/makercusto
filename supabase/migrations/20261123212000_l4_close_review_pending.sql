-- L4-G01 — solicitação transacional de REVISÃO financeira, nunca fechamento.
-- Segurança: origem imutável, idempotência, lock, autorização por oficina,
-- checklist explícito. Não grava mc_cost_snapshots nem muda mc_productions.
create table public.mc_l4_close_reviews (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.mc_workspaces(id) on delete cascade,
 production_id uuid not null,
 idempotency_key text not null check(length(idempotency_key) between 10 and 100),
 request_payload jsonb not null,
 evidence_report jsonb not null,
 author_id uuid not null references auth.users(id),
 status text not null default 'pending' check(status='pending'),
 created_at timestamptz not null default transaction_timestamp(),
 foreign key(production_id,workspace_id) references public.mc_productions(id,workspace_id),
 unique(workspace_id,idempotency_key),unique(id,workspace_id)
);
create index mc_l4_reviews_execution on public.mc_l4_close_reviews(workspace_id,production_id,created_at desc);
alter table public.mc_l4_close_reviews enable row level security;
revoke all on public.mc_l4_close_reviews from public,anon,authenticated;

create function public.mc_l4_block_review_mutation()
returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Revisão L4 é histórica e imutável';end $$;
revoke all on function public.mc_l4_block_review_mutation() from public,anon,authenticated;
create trigger mc_l4_close_review_immutable
before update or delete on public.mc_l4_close_reviews
for each row execute function public.mc_l4_block_review_mutation();

create function public.mc_submit_l4_close_review(
 p_workspace_id uuid,p_production_id uuid,p_idempotency_key text,p_category_evidence jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_old public.mc_l4_close_reviews%rowtype;
 v_id uuid;v_payload jsonb;v_report jsonb;v_missing integer;
 v_unknown integer;v_estimated integer;v_consumptions integer;
 v_confirmed bigint;v_active_reservations integer;v_item jsonb;
 v_category text;v_status text;v_seen text[]:='{}';
 v_required text[]:=array['energy','machine','labor','accessory','tool','other'];
begin
 if auth.uid() is null or not exists(
  select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')
 ) then raise exception 'Sem autorização para revisar fechamento L4';end if;
 if p_idempotency_key is null or length(p_idempotency_key) not between 10 and 100
 then raise exception 'Chave idempotente inválida';end if;
 if p_category_evidence is null or jsonb_typeof(p_category_evidence)<>'array'
   or jsonb_array_length(p_category_evidence)<>array_length(v_required,1)
 then raise exception 'Checklist de categorias L4 incompleto';end if;
 for v_item in select value from jsonb_array_elements(p_category_evidence) loop
  if jsonb_typeof(v_item)<>'object' then raise exception 'Checklist de custo inválido';end if;
  v_category:=v_item->>'category';v_status:=v_item->>'status';
  if v_category is null or not(v_category=any(v_required)) or v_category=any(v_seen)
   or v_status not in ('supported','not_applicable','pending')
   or length(btrim(coalesce(v_item->>'reason',''))) not between 8 and 1000
  then raise exception 'Categoria ou justificativa de custo inválida';end if;
  -- A ausência de custo só pode ser DECLARADA, jamais inferida.
  if v_status='supported' and length(btrim(coalesce(v_item->>'source_reference','')))<8
  then raise exception 'Categoria declarada como suportada sem fonte verificável';end if;
  v_seen:=array_append(v_seen,v_category);
 end loop;
 if array_length(v_seen,1)<>array_length(v_required,1)
 then raise exception 'Checklist obrigatório incompleto';end if;
 v_payload:=jsonb_build_object('production_id',p_production_id,'categories',p_category_evidence);
 perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text||':'||p_production_id::text,0));
 select * into v_old from public.mc_l4_close_reviews
 where workspace_id=p_workspace_id and idempotency_key=p_idempotency_key;
 if found then
  if v_old.request_payload=v_payload then
   return jsonb_build_object('review_id',v_old.id,'status','pending',
    'report',v_old.evidence_report,'replayed',true);
  end if;
  raise exception 'Chave idempotente reutilizada com dados diferentes';
 end if;
 perform 1 from public.mc_productions p
 where p.id=p_production_id and p.workspace_id=p_workspace_id
 for update;
 if not found then raise exception 'Execução não pertence à oficina';end if;
 select count(*) into v_confirmed from public.mc_production_outputs o
 where o.workspace_id=p_workspace_id and o.production_id=p_production_id
  and o.confirmed_good+o.confirmed_failed>0;
 if v_confirmed=0 then raise exception 'Sem saídas confirmadas para revisão';end if;
 select count(*),count(*) filter(where orig.consumption_id is null),
   count(*) filter(where orig.source_cost_status='unknown'),
   count(*) filter(where orig.source_cost_status='estimated')
 into v_consumptions,v_missing,v_unknown,v_estimated
 from public.mc_production_consumption c
 join public.mc_production_confirmations pc
  on pc.id=c.confirmation_id and pc.workspace_id=c.workspace_id
 left join public.mc_l4_exact_consumption_origins orig
  on orig.consumption_id=c.id and orig.workspace_id=c.workspace_id
 where c.workspace_id=p_workspace_id and pc.production_id=p_production_id;
 select count(*) into v_active_reservations from public.mc_production_reservations r
 where r.workspace_id=p_workspace_id and r.production_id=p_production_id and r.status='active';
 v_report:=jsonb_build_object(
  'source_count',v_consumptions,'missing_exact_origins',v_missing,
  'unknown_cost_sources',v_unknown,'estimated_cost_sources',v_estimated,
  'active_reservations',v_active_reservations,
  'unreviewed_categories',(
    select count(*) from jsonb_array_elements(p_category_evidence) e
    where e->>'status'='pending'),
  'financially_final',false,
  'posting_allowed',false,
  'reason','É necessária conciliação financeira P05/P06 e aprovação de snapshots/estornos P09 antes de fechar'
 );
 insert into public.mc_l4_close_reviews(workspace_id,production_id,idempotency_key,
  request_payload,evidence_report,author_id)
 values(p_workspace_id,p_production_id,p_idempotency_key,v_payload,v_report,auth.uid())
 returning id into v_id;
 insert into public.mc_audit_events(workspace_id,entity,entity_id,action,actor_id,details)
 values(p_workspace_id,'l4_close_review',v_id,'submit_pending',auth.uid(),v_report);
 return jsonb_build_object('review_id',v_id,'status','pending',
  'report',v_report,'replayed',false);
end $$;
revoke all on function public.mc_submit_l4_close_review(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.mc_submit_l4_close_review(uuid,uuid,text,jsonb) to authenticated;
