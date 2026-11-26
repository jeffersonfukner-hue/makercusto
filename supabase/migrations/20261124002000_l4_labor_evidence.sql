-- G12B: append-only evidence of human work; no financial posting.
create table public.mc_l4_labor_evidence(
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null,production_id uuid not null,
 request_key uuid not null,service_id uuid,
 activity text not null,minutes numeric(18,6) not null,hourly_rate numeric(18,6) not null,
 basis text not null,reference text not null,rate_source text not null,
 author_id uuid not null references auth.users(id),created_at timestamptz not null default now(),
 foreign key(production_id,workspace_id) references public.mc_productions(id,workspace_id),
 foreign key(service_id,workspace_id) references public.mc_services(id,workspace_id),
 unique(workspace_id,request_key),
 check(minutes>0 and minutes<=1000000 and hourly_rate>0 and hourly_rate<=1000000),
 check(basis in ('measured','estimated')),
 check(rate_source in ('manual','catalog_at_registration')),
 check(length(btrim(activity)) between 1 and 200 and length(btrim(reference)) between 1 and 500)
);
create unique index mc_l4_labor_reference_unique on public.mc_l4_labor_evidence(workspace_id,production_id,lower(btrim(reference)));
alter table public.mc_l4_labor_evidence enable row level security;
revoke all on public.mc_l4_labor_evidence from public,anon,authenticated;
create function public.mc_record_l4_labor(p_workspace_id uuid,p_production_id uuid,p_request_key uuid,
 p_activity text,p_minutes numeric,p_hourly_rate numeric,p_basis text,p_reference text,p_service_id uuid)
 returns uuid language plpgsql security definer set search_path='' as $$
 declare v_old public.mc_l4_labor_evidence%rowtype;v_service public.mc_services%rowtype;v_id uuid;
 begin
 if auth.uid() is null or coalesce(public.mc_role(p_workspace_id),'') not in ('owner','manager') then raise exception 'Sem autorização';end if;
 if p_request_key is null or p_activity is null or length(btrim(p_activity)) not between 1 and 200
 or p_reference is null or length(btrim(p_reference)) not between 1 and 500
 or p_minutes is null or p_minutes<=0 or p_minutes>1000000 or p_minutes<>round(p_minutes,6)
 or p_hourly_rate is null or p_hourly_rate<=0 or p_hourly_rate>1000000 or p_hourly_rate<>round(p_hourly_rate,6)
 or p_basis is null or p_basis not in ('measured','estimated') then raise exception 'Evidência de mão de obra inválida';end if;
 if not exists(select 1 from public.mc_productions where workspace_id=p_workspace_id and id=p_production_id and kind='print') then raise exception 'Impressão inexistente nesta oficina';end if;
 perform pg_advisory_xact_lock(hashtextextended('l4-labor:'||p_workspace_id::text,0));
 select * into v_old from public.mc_l4_labor_evidence where workspace_id=p_workspace_id and request_key=p_request_key;
 if found then
  if v_old.production_id=p_production_id and v_old.activity=btrim(p_activity) and v_old.minutes=p_minutes
  and v_old.hourly_rate=p_hourly_rate and v_old.basis=p_basis and v_old.reference=btrim(p_reference)
  and v_old.service_id is not distinct from p_service_id then return v_old.id;end if;
  raise exception 'Chave reutilizada com conteúdo diferente';
 end if;
 if p_service_id is not null then
  select * into v_service from public.mc_services where workspace_id=p_workspace_id and id=p_service_id and unit='hour';
  if not found or v_service.rate<>p_hourly_rate then raise exception 'Tarifa de catálogo alterada ou incompatível; consulte novamente ou declare manualmente';end if;
 end if;
 insert into public.mc_l4_labor_evidence(workspace_id,production_id,request_key,service_id,activity,minutes,hourly_rate,basis,reference,rate_source,author_id)
 values(p_workspace_id,p_production_id,p_request_key,p_service_id,btrim(p_activity),p_minutes,p_hourly_rate,p_basis,btrim(p_reference),
 case when p_service_id is null then 'manual' else 'catalog_at_registration' end,auth.uid()) returning id into v_id;
 return v_id;
 end $$;
revoke all on function public.mc_record_l4_labor(uuid,uuid,uuid,text,numeric,numeric,text,text,uuid) from public,anon;
grant execute on function public.mc_record_l4_labor(uuid,uuid,uuid,text,numeric,numeric,text,text,uuid) to authenticated;
create function public.mc_block_labor_evidence_change() returns trigger language plpgsql set search_path='' as $$
 begin raise exception 'Evidência histórica imutável; revisão auditável necessária';end $$;
revoke all on function public.mc_block_labor_evidence_change() from public,anon,authenticated;
create trigger mc_l4_labor_immutable before update or delete on public.mc_l4_labor_evidence
 for each row execute function public.mc_block_labor_evidence_change();
create function public.mc_get_l4_labor(p_workspace_id uuid,p_production_id uuid)
 returns jsonb language plpgsql stable security definer set search_path='' as $$
 declare v_rows jsonb;
 begin
 if not public.mc_finance(p_workspace_id) then raise exception 'Sem autorização financeira';end if;
 if not exists(select 1 from public.mc_productions where workspace_id=p_workspace_id and id=p_production_id and kind='print') then raise exception 'Impressão inexistente nesta oficina';end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'activity',activity,'minutes',minutes::text,'hourlyRate',hourly_rate::text,
 'basis',basis,'reference',reference,'serviceId',service_id,'rateSource',rate_source,'authorId',author_id,'createdAt',created_at) order by created_at,id),'[]'::jsonb)
 into v_rows from public.mc_l4_labor_evidence where workspace_id=p_workspace_id and production_id=p_production_id;
 return jsonb_build_object('workspace_id',p_workspace_id,'execution_id',p_production_id,'posting_allowed',false,'activities',v_rows);
 end $$;
revoke all on function public.mc_get_l4_labor(uuid,uuid) from public,anon;
grant execute on function public.mc_get_l4_labor(uuid,uuid) to authenticated;
