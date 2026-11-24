-- L4-G12C: append-only correction of labor quantities, rates and measurement basis.
-- Original activity and external reference remain immutable; no financial posting.
create table public.mc_l4_labor_revisions (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null,
 evidence_id uuid not null references public.mc_l4_labor_evidence(id),
 prior_id uuid not null,
 request_key uuid not null,
 minutes numeric(18,6) not null check(minutes>0 and minutes<=1000000),
 hourly_rate numeric(18,6) not null check(hourly_rate>0 and hourly_rate<=1000000),
 basis text not null check(basis in ('measured','estimated')),
 reason text not null check(length(btrim(reason)) between 3 and 1000),
 author_id uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 unique(evidence_id,prior_id),
 unique(workspace_id,request_key)
);
alter table public.mc_l4_labor_revisions enable row level security;
revoke all on public.mc_l4_labor_revisions from public,anon,authenticated;
create trigger mc_l4_labor_revision_immutable before update or delete on public.mc_l4_labor_revisions
 for each row execute function public.mc_block_labor_evidence_change();

create function public.mc_revise_l4_labor(
 p_workspace_id uuid,p_production_id uuid,p_evidence_id uuid,p_prior_id uuid,p_request_key uuid,
 p_minutes numeric,p_hourly_rate numeric,p_basis text,p_reason text
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_original public.mc_l4_labor_evidence%rowtype;
 v_existing public.mc_l4_labor_revisions%rowtype;v_current uuid;v_id uuid;
begin
 if auth.uid() is null or coalesce(public.mc_role(p_workspace_id),'') not in ('owner','manager')
 then raise exception 'Sem autorização';end if;
 if p_evidence_id is null or p_prior_id is null or p_request_key is null
 or p_minutes is null or p_minutes<=0 or p_minutes>1000000 or p_minutes<>round(p_minutes,6)
 or p_hourly_rate is null or p_hourly_rate<=0 or p_hourly_rate>1000000 or p_hourly_rate<>round(p_hourly_rate,6)
 or p_basis is null or p_basis not in ('measured','estimated')
 or p_reason is null or length(btrim(p_reason)) not between 3 and 1000
 then raise exception 'Revisão de mão de obra inválida';end if;
 perform pg_advisory_xact_lock(hashtextextended('l4-labor:'||p_workspace_id::text,0));
 select * into v_original from public.mc_l4_labor_evidence
 where id=p_evidence_id and workspace_id=p_workspace_id and production_id=p_production_id;
 if not found then raise exception 'Evidência não pertence à impressão e oficina';end if;
 select * into v_existing from public.mc_l4_labor_revisions
 where workspace_id=p_workspace_id and request_key=p_request_key;
 if found then
  if v_existing.evidence_id=p_evidence_id and v_existing.prior_id=p_prior_id
   and v_existing.minutes=p_minutes and v_existing.hourly_rate=p_hourly_rate
   and v_existing.basis=p_basis and v_existing.reason=btrim(p_reason)
   and v_existing.author_id=auth.uid() then return v_existing.id;end if;
  raise exception 'Chave de revisão reutilizada com conteúdo diferente';
 end if;
 select r.id into v_current from public.mc_l4_labor_revisions r
 where r.evidence_id=v_original.id
 and not exists(select 1 from public.mc_l4_labor_revisions newer
                where newer.evidence_id=r.evidence_id and newer.prior_id=r.id);
 if coalesce(v_current,v_original.id)<>p_prior_id
 then raise exception 'Evidência já revisada; consulte a última versão';end if;
 insert into public.mc_l4_labor_revisions(
 workspace_id,evidence_id,prior_id,request_key,minutes,hourly_rate,basis,reason,author_id)
 values(p_workspace_id,p_evidence_id,p_prior_id,p_request_key,p_minutes,p_hourly_rate,p_basis,btrim(p_reason),auth.uid())
 returning id into v_id;
 return v_id;
end $$;
revoke all on function public.mc_revise_l4_labor(uuid,uuid,uuid,uuid,uuid,numeric,numeric,text,text) from public,anon;
grant execute on function public.mc_revise_l4_labor(uuid,uuid,uuid,uuid,uuid,numeric,numeric,text,text) to authenticated;

create or replace function public.mc_get_l4_labor(p_workspace_id uuid,p_production_id uuid)
 returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_rows jsonb;
begin
 if not public.mc_finance(p_workspace_id) then raise exception 'Sem autorização financeira';end if;
 if not exists(select 1 from public.mc_productions
 where workspace_id=p_workspace_id and id=p_production_id and kind='print')
 then raise exception 'Impressão inexistente nesta oficina';end if;
 select coalesce(jsonb_agg(jsonb_build_object(
 'id',e.id,'activity',e.activity,
 'minutes',coalesce(latest.minutes,e.minutes)::text,
 'hourlyRate',coalesce(latest.hourly_rate,e.hourly_rate)::text,
 'basis',coalesce(latest.basis,e.basis),
 'reference',e.reference,'serviceId',e.service_id,'rateSource',e.rate_source,
 'authorId',coalesce(latest.author_id,e.author_id),
 'createdAt',coalesce(latest.created_at,e.created_at),
 'versionId',coalesce(latest.id,e.id),
 'original',jsonb_build_object('id',e.id,'minutes',e.minutes::text,'hourlyRate',e.hourly_rate::text,
 'basis',e.basis,'authorId',e.author_id,'createdAt',e.created_at),
 'revisions',coalesce(history.items,'[]'::jsonb)
 ) order by e.created_at,e.id),'[]'::jsonb) into v_rows
 from public.mc_l4_labor_evidence e
 left join lateral (
  select r.* from public.mc_l4_labor_revisions r where r.evidence_id=e.id
  and not exists(select 1 from public.mc_l4_labor_revisions newer
                 where newer.evidence_id=r.evidence_id and newer.prior_id=r.id)
 ) latest on true
 left join lateral (
  select jsonb_agg(jsonb_build_object(
   'id',r.id,'priorId',r.prior_id,'minutes',r.minutes::text,'hourlyRate',r.hourly_rate::text,
   'basis',r.basis,'reason',r.reason,'authorId',r.author_id,'createdAt',r.created_at
  ) order by r.created_at,r.id) as items
  from public.mc_l4_labor_revisions r where r.evidence_id=e.id
 ) history on true
 where e.workspace_id=p_workspace_id and e.production_id=p_production_id;
 return jsonb_build_object('workspace_id',p_workspace_id,'execution_id',p_production_id,
 'posting_allowed',false,'activities',v_rows);
end $$;
