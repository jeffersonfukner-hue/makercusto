-- G11B: freeze printer parameters at registration, never backfill older prints.
create table public.mc_l4_machine_origins(
 production_id uuid primary key,workspace_id uuid not null,printer_id uuid not null,
 printer_name text not null,purchase_price numeric(16,4),lifetime_hours numeric(14,3),
 maintenance_per_hour numeric(14,4) not null,
 captured_at timestamptz not null default now(),author_id uuid references auth.users(id),
 foreign key(production_id,workspace_id) references public.mc_productions(id,workspace_id),
 foreign key(printer_id,workspace_id) references public.mc_printers(id,workspace_id),
 check(purchase_price>=0),check(lifetime_hours>0),check(maintenance_per_hour>=0)
);
alter table public.mc_l4_machine_origins enable row level security;
revoke all on public.mc_l4_machine_origins from public,anon,authenticated;
create function public.mc_capture_machine_origin() returns trigger
 language plpgsql security definer set search_path='' as $$
 begin
 if new.kind='print' and new.printer_id is not null then
  insert into public.mc_l4_machine_origins(production_id,workspace_id,printer_id,printer_name,
   purchase_price,lifetime_hours,maintenance_per_hour,author_id)
  select new.id,new.workspace_id,p.id,p.name,p.purchase_price,p.lifetime_hours,p.maintenance_per_hour,auth.uid()
  from public.mc_printers p where p.workspace_id=new.workspace_id and p.id=new.printer_id;
 end if;
 return new;
 end $$;
revoke all on function public.mc_capture_machine_origin() from public,anon,authenticated;
create trigger mc_l4_capture_machine after insert on public.mc_productions
 for each row execute function public.mc_capture_machine_origin();
create function public.mc_block_machine_origin_change() returns trigger
 language plpgsql set search_path='' as $$
 begin raise exception 'Origem histórica da máquina é imutável';end $$;
revoke all on function public.mc_block_machine_origin_change() from public,anon,authenticated;
create trigger mc_l4_machine_immutable before update or delete on public.mc_l4_machine_origins
 for each row execute function public.mc_block_machine_origin_change();
create function public.mc_get_l4_machine_origin(p_workspace_id uuid,p_production_id uuid)
 returns jsonb language plpgsql stable security definer set search_path='' as $$
 declare v_data jsonb;v_p public.mc_productions%rowtype;
 begin
 if not public.mc_finance(p_workspace_id) then raise exception 'Sem autorização financeira';end if;
 select * into v_p from public.mc_productions where workspace_id=p_workspace_id and id=p_production_id and kind='print';
 if not found then raise exception 'Impressão inexistente nesta oficina';end if;
 select jsonb_build_object('printer_id',o.printer_id,'printer_name',o.printer_name,
  'purchase_price',o.purchase_price::text,'lifetime_hours',o.lifetime_hours::text,
  'maintenance_per_hour',o.maintenance_per_hour::text,'captured_at',o.captured_at,'author_id',o.author_id)
 into v_data from public.mc_l4_machine_origins o where o.workspace_id=p_workspace_id and o.production_id=p_production_id;
 return jsonb_build_object('workspace_id',p_workspace_id,'execution_id',p_production_id,
  'origin',v_data,'actual_hours',v_p.actual_hours::text,'posting_allowed',false,
  'schema_version','l4-machine-origin-v1','printer_matches',coalesce((v_data->>'printer_id')::uuid=v_p.printer_id,false));
 end $$;
revoke all on function public.mc_get_l4_machine_origin(uuid,uuid) from public,anon;
grant execute on function public.mc_get_l4_machine_origin(uuid,uuid) to authenticated;
