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
