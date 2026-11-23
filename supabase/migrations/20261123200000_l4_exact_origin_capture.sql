-- L4-P06: captura imutável da origem exata do lote ao confirmar consumo.
-- Somente novas confirmações posteriores a esta migração recebem a captura.
-- NÃO retropreencher automaticamente histórico com preço atual do lote.
create table public.mc_l4_exact_consumption_origins (
 consumption_id uuid primary key,
 workspace_id uuid not null references public.mc_workspaces(id) on delete cascade,
 confirmation_id uuid not null,
 lot_id uuid not null,
 source_cost_status text not null check(source_cost_status in ('known','estimated','unknown')),
 original_quantity_g numeric(18,4) not null check(original_quantity_g>0),
 original_total_cost_brl numeric(18,4) check(original_total_cost_brl>=0),
 purchase_line_id uuid,
 model_g numeric(18,4) not null check(model_g>=0),
 purge_g numeric(18,4) not null check(purge_g>=0),
 loss_g numeric(18,4) not null check(loss_g>=0),
 quantity_basis text not null check(quantity_basis in ('weighed','slicer','estimated')),
 captured_at timestamptz not null default transaction_timestamp(),
 source_version text not null default 'l4-exact-origin-v1',
 unique(consumption_id,workspace_id),
 foreign key(consumption_id) references public.mc_production_consumption(id),
 foreign key(confirmation_id,workspace_id) references public.mc_production_confirmations(id,workspace_id),
 foreign key(lot_id,workspace_id) references public.mc_stock_lots(id,workspace_id),
 check((source_cost_status='unknown' and original_total_cost_brl is null) or
       (source_cost_status<>'unknown' and original_total_cost_brl is not null))
);
create index mc_l4_exact_confirmation on public.mc_l4_exact_consumption_origins(workspace_id,confirmation_id);
alter table public.mc_l4_exact_consumption_origins enable row level security;
revoke all on public.mc_l4_exact_consumption_origins from public,anon,authenticated;

create function public.mc_l4_capture_exact_origin()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_lot public.mc_stock_lots%rowtype;
begin
 select * into v_lot from public.mc_stock_lots l
 where l.id=new.lot_id and l.workspace_id=new.workspace_id;
 if not found or v_lot.initial_quantity<=0 then
  raise exception 'Origem financeira do lote não identificada';
 end if;
 insert into public.mc_l4_exact_consumption_origins
 (consumption_id,workspace_id,confirmation_id,lot_id,source_cost_status,
 original_quantity_g,original_total_cost_brl,purchase_line_id,
 model_g,purge_g,loss_g,quantity_basis)
 values(new.id,new.workspace_id,new.confirmation_id,new.lot_id,v_lot.cost_status,
 v_lot.initial_quantity,v_lot.initial_cost_total,v_lot.purchase_line_id,
 new.model_quantity,new.purge_quantity,new.loss_quantity,new.quantity_basis);
 return new;
end $$;
revoke all on function public.mc_l4_capture_exact_origin() from public,anon,authenticated;
create trigger mc_l4_capture_origin_on_confirmation
after insert on public.mc_production_consumption
for each row execute function public.mc_l4_capture_exact_origin();

create function public.mc_l4_block_exact_origin_mutation()
returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Origem histórica L4 é imutável; use eventos compensatórios'; end $$;
revoke all on function public.mc_l4_block_exact_origin_mutation() from public,anon,authenticated;
create trigger mc_l4_exact_origin_immutable
before update or delete on public.mc_l4_exact_consumption_origins
for each row execute function public.mc_l4_block_exact_origin_mutation();

-- Sem ação financeira, sem alterar mc_confirm_print, sem encerramento de execução.
-- O preço por grama é representado como razão original_total_cost_brl/original_quantity_g.
-- Frações periódicas não são truncadas: origem retorna numerador e denominador.
create function public.mc_get_l4_exact_origins(p_workspace_id uuid,p_production_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_result jsonb;v_missing integer;
begin
 if auth.uid() is null or not exists(
  select 1 from public.mc_members m where m.workspace_id=p_workspace_id
  and m.user_id=auth.uid() and m.active and m.role in ('owner','manager')
 ) then raise exception 'Sem autorização para consultar origem exata L4';end if;
 if not exists(select 1 from public.mc_productions p
  where p.id=p_production_id and p.workspace_id=p_workspace_id) then
  raise exception 'Execução não pertence à oficina';end if;
 select count(*) into v_missing
 from public.mc_production_consumption c
 join public.mc_production_confirmations pc on pc.id=c.confirmation_id and pc.workspace_id=c.workspace_id
 left join public.mc_l4_exact_consumption_origins origin on origin.consumption_id=c.id and origin.workspace_id=c.workspace_id
 where c.workspace_id=p_workspace_id and pc.production_id=p_production_id and origin.consumption_id is null;
 select coalesce(jsonb_agg(jsonb_build_object(
  'consumption_id',o.consumption_id,'confirmation_id',o.confirmation_id,
  'lot_id',o.lot_id,'status',o.source_cost_status,
  'original_quantity_g',o.original_quantity_g::text,
  'original_total_cost_brl',o.original_total_cost_brl::text,
  'model_g',o.model_g::text,'purge_g',o.purge_g::text,'loss_g',o.loss_g::text,
  'quantity_basis',o.quantity_basis,'purchase_line_id',o.purchase_line_id,
  'source_version',o.source_version,'captured_at',o.captured_at
 ) order by pc.confirmed_at,o.consumption_id),'[]'::jsonb) into v_result
 from public.mc_l4_exact_consumption_origins o
 join public.mc_production_confirmations pc on pc.id=o.confirmation_id and pc.workspace_id=o.workspace_id
 where o.workspace_id=p_workspace_id and pc.production_id=p_production_id;
 return jsonb_build_object('execution_id',p_production_id,'read_only',true,
  'financially_final',false,'exact_source_version','l4-exact-origin-v1',
  'historical_rows_without_capture',v_missing,'origins',v_result);
end $$;
revoke all on function public.mc_get_l4_exact_origins(uuid,uuid) from public,anon;
grant execute on function public.mc_get_l4_exact_origins(uuid,uuid) to authenticated;
