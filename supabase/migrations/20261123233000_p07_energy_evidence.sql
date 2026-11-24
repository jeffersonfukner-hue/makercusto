-- P07: extend the existing tariff catalog, preserve evidence without posting.
alter table public.mc_energy_tariffs add column valid_until date,
 add column source_reference text;
alter table public.mc_energy_tariffs add constraint mc_tariff_period_check
 check(valid_until is null or valid_until>valid_from);
alter table public.mc_energy_tariffs add constraint mc_tariff_reference_check
 check(source_reference is null or length(btrim(source_reference))>0);
-- Existing rows lacking evidence remain legacy; do not invent a source.
revoke insert,update,delete on public.mc_energy_tariffs from authenticated,anon;
create function public.mc_register_energy_tariff(p_workspace_id uuid,p_name text,p_price numeric,
 p_from date,p_until date,p_reference text) returns uuid
 language plpgsql security definer set search_path='' as $$
 declare v_id uuid;
 begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
 and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')) then raise exception 'Sem autorização'; end if;
 if p_name is null or btrim(p_name)='' or p_reference is null or btrim(p_reference)=''
 or p_price is null or p_price<0 or p_price>99999999 or p_price<>round(p_price,6)
 or p_from is null or p_until is null or p_until<=p_from then raise exception 'Tarifa ou vigência inválida'; end if;
 perform pg_advisory_xact_lock(hashtextextended('p07-tariff:'||p_workspace_id::text,0));
 if exists(select 1 from public.mc_energy_tariffs t where t.workspace_id=p_workspace_id
 and t.source_reference is not null and daterange(t.valid_from,t.valid_until,'[)') && daterange(p_from,p_until,'[)'))
 then raise exception 'Vigência de tarifa sobreposta'; end if;
 insert into public.mc_energy_tariffs(workspace_id,name,price_kwh,valid_from,valid_until,source_reference)
 values(p_workspace_id,btrim(p_name),p_price,p_from,p_until,btrim(p_reference)) returning id into v_id;
 return v_id;
 end $$;
revoke all on function public.mc_register_energy_tariff(uuid,text,numeric,date,date,text) from public,anon;
grant execute on function public.mc_register_energy_tariff(uuid,text,numeric,date,date,text) to authenticated;

create table public.mc_p07_energy_intervals(
 id uuid primary key default gen_random_uuid(),workspace_id uuid not null,
 production_id uuid not null,author_id uuid not null references auth.users(id),
 start_at timestamptz not null,end_at timestamptz not null,
 phase text not null check(phase in ('heating','printing','pause','resume','unclassified')),
 pause_condition text check(pause_condition in ('heated','partially_heated','motors_on','standby','off','unknown')),
 source_kind text not null check(source_kind in ('measured','maker_estimate','manufacturer_estimate','unknown')),
 source_reference text, kwh numeric(30,18), watts numeric(30,18),
 created_at timestamptz not null default now(),
 foreign key(production_id,workspace_id) references public.mc_productions(id,workspace_id),
 check(end_at>start_at and isfinite(start_at) and isfinite(end_at)),
 check((phase='pause' and pause_condition is not null) or (phase<>'pause' and pause_condition is null)),
 check((source_kind='unknown' and kwh is null and watts is null) or
 (source_kind='measured' and kwh is not null and kwh>=0 and watts is null and length(btrim(coalesce(source_reference,'')))>0) or
 (source_kind in ('maker_estimate','manufacturer_estimate') and watts is not null and watts>=0 and kwh is null and length(btrim(coalesce(source_reference,'')))>0))
);
alter table public.mc_p07_energy_intervals enable row level security;
revoke all on public.mc_p07_energy_intervals from public,anon,authenticated;
create function public.mc_record_energy_interval(p_workspace_id uuid,p_production_id uuid,
 p_start timestamptz,p_end timestamptz,p_phase text,p_condition text,p_kind text,p_reference text,p_kwh numeric,p_watts numeric)
 returns uuid language plpgsql security definer set search_path='' as $$
 declare v_id uuid;
 begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
 and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')) then raise exception 'Sem autorização'; end if;
 if not exists(select 1 from public.mc_productions p where p.workspace_id=p_workspace_id and p.id=p_production_id and p.kind='print')
 then raise exception 'Impressão inexistente nesta oficina'; end if;
 if p_start is null or p_end is null or not isfinite(p_start) or not isfinite(p_end) or p_end<=p_start then raise exception 'Intervalo inválido'; end if;
 if (p_kwh is not null and (p_kwh<0 or p_kwh>=1000000000000 or p_kwh<>round(p_kwh,18))) or
 (p_watts is not null and (p_watts<0 or p_watts>=1000000000000 or p_watts<>round(p_watts,18))) then raise exception 'Valor de energia inválido';end if;
 perform pg_advisory_xact_lock(hashtextextended('p07-phase:'||p_production_id::text,0));
 if exists(select 1 from public.mc_p07_energy_intervals i where i.production_id=p_production_id and i.workspace_id=p_workspace_id
 and i.start_at<p_end and i.end_at>p_start) then raise exception 'Intervalo sobreposto'; end if;
 insert into public.mc_p07_energy_intervals(workspace_id,production_id,author_id,start_at,end_at,phase,pause_condition,source_kind,source_reference,kwh,watts)
 values(p_workspace_id,p_production_id,auth.uid(),p_start,p_end,p_phase,p_condition,p_kind,p_reference,p_kwh,p_watts) returning id into v_id;
 return v_id;
 end $$;
revoke all on function public.mc_record_energy_interval(uuid,uuid,timestamptz,timestamptz,text,text,text,text,numeric,numeric) from public,anon;
grant execute on function public.mc_record_energy_interval(uuid,uuid,timestamptz,timestamptz,text,text,text,text,numeric,numeric) to authenticated;
create function public.mc_get_energy_evidence(p_workspace_id uuid,p_production_id uuid)
 returns jsonb language plpgsql stable security definer set search_path='' as $$
 declare v_p public.mc_productions%rowtype;v_watts text;v_intervals jsonb;v_tariffs jsonb;
 begin
 if auth.uid() is null or not exists(select 1 from public.mc_members m where m.workspace_id=p_workspace_id
 and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')) then raise exception 'Sem autorização'; end if;
 select * into v_p from public.mc_productions p where p.workspace_id=p_workspace_id and p.id=p_production_id and p.kind='print';
 if not found then raise exception 'Impressão inexistente nesta oficina';end if;
 select average_watts::text into v_watts from public.mc_printers where id=v_p.printer_id and workspace_id=p_workspace_id;
 select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'start_at',i.start_at,'end_at',i.end_at,'phase',i.phase,
 'pause_condition',i.pause_condition,'source_kind',i.source_kind,'reference',i.source_reference,'kwh',i.kwh::text,'watts',i.watts::text)
 order by i.start_at),'[]'::jsonb) into v_intervals from public.mc_p07_energy_intervals i where i.workspace_id=p_workspace_id and i.production_id=p_production_id;
 select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'name',t.name,'price',t.price_kwh::text,'valid_from',t.valid_from,'valid_until',t.valid_until,'reference',t.source_reference)
 order by t.valid_from),'[]'::jsonb) into v_tariffs from public.mc_energy_tariffs t where t.workspace_id=p_workspace_id and t.source_reference is not null and t.valid_until is not null;
 return jsonb_build_object('workspace_id',p_workspace_id,'execution_id',p_production_id,'printer_id',v_p.printer_id,
 'current_average_watts',v_watts,'start_at',v_p.start_at,'end_at',v_p.end_at,'intervals',v_intervals,'tariffs',v_tariffs,'posting_allowed',false);
 end $$;
revoke all on function public.mc_get_energy_evidence(uuid,uuid) from public,anon;
grant execute on function public.mc_get_energy_evidence(uuid,uuid) to authenticated;
