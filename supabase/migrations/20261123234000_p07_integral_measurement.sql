-- P07: evidence-only integral measurement; no financial posting.
create table public.mc_p07_integral_measurements(
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null, production_id uuid not null,
 author_id uuid not null references auth.users(id),
 start_at timestamptz not null,end_at timestamptz not null,
 kwh numeric(30,18) not null,source_reference text not null,
 created_at timestamptz not null default now(),
 foreign key(production_id,workspace_id) references public.mc_productions(id,workspace_id),
 unique(production_id,workspace_id),
 check(isfinite(start_at) and isfinite(end_at) and end_at>start_at),
 check(kwh>=0 and kwh<1000000000000),
 check(length(btrim(source_reference))>0)
);
alter table public.mc_p07_integral_measurements enable row level security;
revoke all on public.mc_p07_integral_measurements from public,anon,authenticated;
create function public.mc_record_integral_energy(p_workspace_id uuid,p_production_id uuid,
 p_start timestamptz,p_end timestamptz,p_kwh numeric,p_reference text)
 returns uuid language plpgsql security definer set search_path='' as $$
 declare v_p public.mc_productions%rowtype;v_old public.mc_p07_integral_measurements%rowtype;v_id uuid;
 begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
 and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')) then raise exception 'Sem autorização';end if;
 select * into v_p from public.mc_productions p where p.workspace_id=p_workspace_id and p.id=p_production_id and p.kind='print';
 if not found then raise exception 'Impressão inexistente nesta oficina';end if;
 if p_start is null or p_end is null or not isfinite(p_start) or not isfinite(p_end) or p_end<=p_start
 or p_kwh is null or p_kwh<0 or p_kwh>=1000000000000 or p_kwh<>round(p_kwh,18)
 or p_reference is null or btrim(p_reference)='' then raise exception 'Medição integral inválida';end if;
 if (v_p.start_at is not null and p_start<>v_p.start_at) or (v_p.end_at is not null and p_end<>v_p.end_at)
 then raise exception 'Medição deve cobrir o período total da impressão';end if;
 perform pg_advisory_xact_lock(hashtextextended('p07-phase:'||p_production_id::text,0));
 if exists(select 1 from public.mc_p07_energy_intervals i where i.workspace_id=p_workspace_id and i.production_id=p_production_id
 and (i.start_at<p_start or i.end_at>p_end)) then raise exception 'Existem fases fora do período medido';end if;
 select * into v_old from public.mc_p07_integral_measurements where workspace_id=p_workspace_id and production_id=p_production_id;
 if found then
  if v_old.start_at=p_start and v_old.end_at=p_end and v_old.kwh=p_kwh and v_old.source_reference=btrim(p_reference)
  then return v_old.id;end if;
  raise exception 'Medição já registrada; correção auditável necessária';
 end if;
 insert into public.mc_p07_integral_measurements(workspace_id,production_id,author_id,start_at,end_at,kwh,source_reference)
 values(p_workspace_id,p_production_id,auth.uid(),p_start,p_end,p_kwh,btrim(p_reference)) returning id into v_id;
 return v_id;
 end $$;
revoke all on function public.mc_record_integral_energy(uuid,uuid,timestamptz,timestamptz,numeric,text) from public,anon;
grant execute on function public.mc_record_integral_energy(uuid,uuid,timestamptz,timestamptz,numeric,text) to authenticated;
create function public.mc_get_integral_energy(p_workspace_id uuid,p_production_id uuid)
 returns jsonb language plpgsql stable security definer set search_path='' as $$
 declare v_result jsonb;
 begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
 and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')) then raise exception 'Sem autorização';end if;
 if not exists(select 1 from public.mc_productions p where p.workspace_id=p_workspace_id and p.id=p_production_id and p.kind='print')
 then raise exception 'Impressão inexistente nesta oficina';end if;
 select jsonb_build_object('id',i.id,'start_at',i.start_at,'end_at',i.end_at,'kwh',i.kwh::text,
 'reference',i.source_reference,'author_id',i.author_id,'created_at',i.created_at)
 into v_result from public.mc_p07_integral_measurements i where i.workspace_id=p_workspace_id and i.production_id=p_production_id;
 return jsonb_build_object('workspace_id',p_workspace_id,'execution_id',p_production_id,'measurement',v_result,'posting_allowed',false);
 end $$;
revoke all on function public.mc_get_integral_energy(uuid,uuid) from public,anon;
grant execute on function public.mc_get_integral_energy(uuid,uuid) to authenticated;

-- Revisions append evidence, never update the original measurement.
create table public.mc_p07_integral_revisions(
 id uuid primary key default gen_random_uuid(),
 measurement_id uuid not null references public.mc_p07_integral_measurements(id),
 prior_id uuid not null,request_key uuid not null,
 author_id uuid not null references auth.users(id),
 kwh numeric(30,18) not null check(kwh>=0 and kwh<1000000000000),
 source_reference text not null check(length(btrim(source_reference))>0),
 reason text not null check(length(btrim(reason))>0),
 created_at timestamptz not null default now(),
 unique(measurement_id,prior_id),unique(measurement_id,request_key)
);
alter table public.mc_p07_integral_revisions enable row level security;
revoke all on public.mc_p07_integral_revisions from public,anon,authenticated;
create function public.mc_revise_integral_energy(p_workspace_id uuid,p_production_id uuid,p_prior_id uuid,
 p_request_key uuid,p_kwh numeric,p_reference text,p_reason text)
 returns uuid language plpgsql security definer set search_path='' as $$
 declare v_original public.mc_p07_integral_measurements%rowtype;
 v_replay public.mc_p07_integral_revisions%rowtype;v_current uuid;v_id uuid;
 begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
 and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')) then raise exception 'Sem autorização';end if;
 if p_prior_id is null or p_request_key is null or p_kwh is null or p_kwh<0 or p_kwh>=1000000000000
 or p_kwh<>round(p_kwh,18) or coalesce(btrim(p_reference),'')='' or coalesce(btrim(p_reason),'')=''
 then raise exception 'Revisão inválida';end if;
 perform pg_advisory_xact_lock(hashtextextended('p07-phase:'||p_production_id::text,0));
 select * into v_original from public.mc_p07_integral_measurements
 where workspace_id=p_workspace_id and production_id=p_production_id;
 if not found then raise exception 'Medição original inexistente';end if;
 select * into v_replay from public.mc_p07_integral_revisions where measurement_id=v_original.id and request_key=p_request_key;
 if found then
  if v_replay.prior_id=p_prior_id and v_replay.kwh=p_kwh and v_replay.source_reference=btrim(p_reference)
  and v_replay.reason=btrim(p_reason) and v_replay.author_id=auth.uid() then return v_replay.id;end if;
  raise exception 'Chave de revisão reutilizada com dados diferentes';
 end if;
 select r.id into v_current from public.mc_p07_integral_revisions r
 where r.measurement_id=v_original.id and not exists(select 1 from public.mc_p07_integral_revisions n
 where n.measurement_id=r.measurement_id and n.prior_id=r.id);
 if coalesce(v_current,v_original.id)<>p_prior_id then raise exception 'Medição revisada por outro operador; consulte novamente';end if;
 insert into public.mc_p07_integral_revisions(measurement_id,prior_id,request_key,author_id,kwh,source_reference,reason)
 values(v_original.id,p_prior_id,p_request_key,auth.uid(),p_kwh,btrim(p_reference),btrim(p_reason)) returning id into v_id;
 return v_id;
 end $$;
revoke all on function public.mc_revise_integral_energy(uuid,uuid,uuid,uuid,numeric,text,text) from public,anon;
grant execute on function public.mc_revise_integral_energy(uuid,uuid,uuid,uuid,numeric,text,text) to authenticated;
create or replace function public.mc_get_integral_energy(p_workspace_id uuid,p_production_id uuid)
 returns jsonb language plpgsql stable security definer set search_path='' as $$
 declare v_original public.mc_p07_integral_measurements%rowtype;v_result jsonb;v_history jsonb;v_latest jsonb;
 begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
 and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')) then raise exception 'Sem autorização';end if;
 if not exists(select 1 from public.mc_productions p where p.workspace_id=p_workspace_id and p.id=p_production_id and p.kind='print')
 then raise exception 'Impressão inexistente nesta oficina';end if;
 select * into v_original from public.mc_p07_integral_measurements where workspace_id=p_workspace_id and production_id=p_production_id;
 if found then
 v_result:=jsonb_build_object('id',v_original.id,'start_at',v_original.start_at,'end_at',v_original.end_at,'kwh',v_original.kwh::text,
 'reference',v_original.source_reference,'author_id',v_original.author_id,'created_at',v_original.created_at);
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'prior_id',r.prior_id,'kwh',r.kwh::text,
 'reference',r.source_reference,'reason',r.reason,'author_id',r.author_id,'created_at',r.created_at) order by r.created_at,r.id),'[]'::jsonb)
 into v_history from public.mc_p07_integral_revisions r where r.measurement_id=v_original.id;
 select jsonb_build_object('id',r.id,'kwh',r.kwh::text,'reference',r.source_reference,'author_id',r.author_id,'created_at',r.created_at)
 into v_latest from public.mc_p07_integral_revisions r where r.measurement_id=v_original.id
 and not exists(select 1 from public.mc_p07_integral_revisions n where n.measurement_id=r.measurement_id and n.prior_id=r.id);
 end if;
 return jsonb_build_object('workspace_id',p_workspace_id,'execution_id',p_production_id,
 'measurement',case when v_latest is null then v_result else v_result||v_latest end,
 'original',v_result,'revisions',coalesce(v_history,'[]'::jsonb),'posting_allowed',false);
 end $$;
