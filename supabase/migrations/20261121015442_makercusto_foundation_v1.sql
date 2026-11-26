-- MakerCusto · Fundacao de dados v1 · 21/11/2026
-- Executar apenas em projeto Supabase NOVO E VAZIO do MakerCusto.
-- Entidades sem dados reais. Sem cobranca/assinaturas efetivas.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Identidade, oficina e capacidades
CREATE TABLE public.mc_profiles (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.mc_workspaces (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES auth.users(id),
 name text NOT NULL CHECK(length(trim(name))>0),
 plan text NOT NULL DEFAULT 'free' CHECK(plan IN ('free','shared','full')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,owner_id)
);
CREATE TABLE public.mc_members (
 workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role text NOT NULL CHECK(role IN ('owner','manager','operator','auditor')),
 active boolean NOT NULL DEFAULT true, financial_access boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(workspace_id,user_id)
);
CREATE TABLE public.mc_preferences (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 workspace_id uuid REFERENCES public.mc_workspaces(id) ON DELETE SET NULL,
 last_printer_id uuid, options jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
-- O titular pode criar oficina pessoal, sem atribuir papel a outro usuario.
CREATE FUNCTION public.mc_create_workspace(p_name text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Login necessario'; END IF;
 IF nullif(trim(p_name),'') IS NULL THEN RAISE EXCEPTION 'Nome obrigatorio'; END IF;
 INSERT INTO public.mc_workspaces(owner_id,name) VALUES(auth.uid(),trim(p_name)) RETURNING id INTO v_id;
 INSERT INTO public.mc_members(workspace_id,user_id,role,financial_access) VALUES(v_id,auth.uid(),'owner',true);
 RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.mc_create_workspace(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mc_create_workspace(text) TO authenticated;

CREATE FUNCTION public.mc_member(p_ws uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM public.mc_members m WHERE m.workspace_id=p_ws AND m.user_id=auth.uid() AND m.active)
$$;
CREATE FUNCTION public.mc_role(p_ws uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT m.role FROM public.mc_members m WHERE m.workspace_id=p_ws AND m.user_id=auth.uid() AND m.active LIMIT 1
$$;
CREATE FUNCTION public.mc_finance(p_ws uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS(SELECT 1 FROM public.mc_members m WHERE m.workspace_id=p_ws AND m.user_id=auth.uid() AND m.active AND (m.role IN ('owner','manager') OR m.financial_access))
$$;
REVOKE ALL ON FUNCTION public.mc_member(uuid),public.mc_role(uuid),public.mc_finance(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mc_member(uuid),public.mc_role(uuid),public.mc_finance(uuid) TO authenticated;

-- Referencias descritivas; publicacao shared somente em copia separada.
CREATE TABLE public.mc_catalog (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL CHECK(kind IN ('printer_model','filament_type','filament_brand','color','supply_type','tool_type')),
 name text NOT NULL CHECK(length(trim(name))>0), manufacturer text,
 scope text NOT NULL DEFAULT 'private' CHECK(scope IN ('global','private','shared')),
 workspace_id uuid REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 author_id uuid REFERENCES auth.users(id), source_id uuid REFERENCES public.mc_catalog(id),
 version integer NOT NULL DEFAULT 1 CHECK(version>0), source_version integer,
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('draft','active','archived')),
 attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK((scope='global' AND workspace_id IS NULL AND author_id IS NULL) OR (scope<>'global' AND workspace_id IS NOT NULL AND author_id IS NOT NULL)),
 CHECK(source_id IS DISTINCT FROM id)
);
CREATE INDEX mc_catalog_find ON public.mc_catalog(kind,scope,name);
CREATE INDEX mc_catalog_ws ON public.mc_catalog(workspace_id,kind);

-- Equipamentos reais do maker: valores reais ficam aqui, nunca no catalogo publico.
CREATE TABLE public.mc_printers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 model_id uuid REFERENCES public.mc_catalog(id),name text NOT NULL CHECK(length(trim(name))>0),
 purchase_price numeric(16,4) CHECK(purchase_price>=0),average_watts numeric(12,3) CHECK(average_watts>=0),
 lifetime_hours numeric(14,3) CHECK(lifetime_hours>0),maintenance_per_hour numeric(14,4) NOT NULL DEFAULT 0 CHECK(maintenance_per_hour>=0),
 active boolean NOT NULL DEFAULT true,notes text,created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id,workspace_id)
);
ALTER TABLE public.mc_preferences ADD CONSTRAINT mc_pref_printer_fk FOREIGN KEY(last_printer_id) REFERENCES public.mc_printers(id) ON DELETE SET NULL;
CREATE TABLE public.mc_energy_tariffs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 name text NOT NULL DEFAULT 'Padrao',price_kwh numeric(14,6) NOT NULL CHECK(price_kwh>=0),valid_from date NOT NULL DEFAULT current_date,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,workspace_id)
);
CREATE TABLE public.mc_suppliers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 name text NOT NULL CHECK(length(trim(name))>0),contact jsonb NOT NULL DEFAULT '{}'::jsonb,
 active boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,workspace_id)
);
CREATE TABLE public.mc_filaments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 name text NOT NULL, type_id uuid REFERENCES public.mc_catalog(id),brand_id uuid REFERENCES public.mc_catalog(id),color_id uuid REFERENCES public.mc_catalog(id),
 diameter_mm numeric(8,3) NOT NULL DEFAULT 1.75 CHECK(diameter_mm>0),density_g_cm3 numeric(9,4) CHECK(density_g_cm3>0),
 notes text,active boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,workspace_id)
);
CREATE TABLE public.mc_tools (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 name text NOT NULL, purchase_cost numeric(16,4) CHECK(purchase_cost>=0), lifetime_uses numeric(14,2) CHECK(lifetime_uses>0),
 cost_per_use numeric(14,4) CHECK(cost_per_use>=0), active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(id,workspace_id)
);
CREATE TABLE public.mc_services (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 name text NOT NULL,unit text NOT NULL DEFAULT 'hour' CHECK(unit IN ('hour','minute','unit')),
 rate numeric(14,4) NOT NULL CHECK(rate>=0), created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(id,workspace_id)
);

-- Identidade de estoque por oficina. Um item pode ser filamento, insumo ou produto acabado.
CREATE TABLE public.mc_inventory_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('filament','supply','product','kit')),
 name text NOT NULL CHECK(length(trim(name))>0),sku text,base_unit text NOT NULL CHECK(base_unit IN ('g','unit','ml')),
 filament_id uuid, reordering_point numeric(18,4) CHECK(reordering_point>=0), active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,workspace_id),
 FOREIGN KEY(filament_id,workspace_id) REFERENCES public.mc_filaments(id,workspace_id),
 CHECK((kind='filament' AND filament_id IS NOT NULL AND base_unit='g') OR (kind<>'filament' AND filament_id IS NULL))
);
CREATE UNIQUE INDEX mc_items_sku ON public.mc_inventory_items(workspace_id,sku) WHERE sku IS NOT NULL;
CREATE TABLE public.mc_locations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 name text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(id,workspace_id)
);
CREATE TABLE public.mc_purchases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 supplier_id uuid, purchased_on date NOT NULL DEFAULT current_date,reference text,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','received','cancelled')),
 shipping_cost numeric(16,4) NOT NULL DEFAULT 0 CHECK(shipping_cost>=0),
 notes text,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(id,workspace_id),
 FOREIGN KEY(supplier_id,workspace_id) REFERENCES public.mc_suppliers(id,workspace_id)
);
CREATE TABLE public.mc_purchase_lines (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 purchase_id uuid NOT NULL,item_id uuid NOT NULL,
 purchased_quantity numeric(18,4) NOT NULL CHECK(purchased_quantity>0),purchased_unit text NOT NULL CHECK(purchased_unit IN ('g','kg','unit','ml','l')),
 base_quantity numeric(18,4) NOT NULL CHECK(base_quantity>0),total_price numeric(18,4) NOT NULL CHECK(total_price>=0),
 created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(id,workspace_id),
 FOREIGN KEY(purchase_id,workspace_id) REFERENCES public.mc_purchases(id,workspace_id),
 FOREIGN KEY(item_id,workspace_id) REFERENCES public.mc_inventory_items(id,workspace_id)
);
CREATE TABLE public.mc_stock_lots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 item_id uuid NOT NULL,purchase_line_id uuid,label text NOT NULL,
 origin text NOT NULL DEFAULT 'purchase' CHECK(origin IN ('purchase','initial_inventory','production','adjustment')),
 initial_quantity numeric(18,4) NOT NULL DEFAULT 0 CHECK(initial_quantity>=0),
 initial_cost_total numeric(18,4) CHECK(initial_cost_total>=0),
 cost_status text NOT NULL DEFAULT 'unknown' CHECK(cost_status IN ('known','estimated','unknown')),
 received_at timestamptz NOT NULL DEFAULT now(),notes text,
 UNIQUE(id,workspace_id), UNIQUE(id,item_id,workspace_id),
 FOREIGN KEY(item_id,workspace_id) REFERENCES public.mc_inventory_items(id,workspace_id),
 FOREIGN KEY(purchase_line_id,workspace_id) REFERENCES public.mc_purchase_lines(id,workspace_id),
 CHECK((cost_status='unknown' AND initial_cost_total IS NULL) OR (cost_status<>'unknown' AND initial_cost_total IS NOT NULL))
);
CREATE TABLE public.mc_stock_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 event_type text NOT NULL CHECK(event_type IN ('receipt','initial','production','transfer','sale','loss','adjustment','reversal','return')),
 idempotency_key text NOT NULL,reason text,created_by uuid REFERENCES auth.users(id),
 created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(id,workspace_id),UNIQUE(workspace_id,idempotency_key)
);
CREATE TABLE public.mc_stock_movements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 event_id uuid NOT NULL,item_id uuid NOT NULL,lot_id uuid,location_id uuid,
 delta numeric(18,4) NOT NULL CHECK(delta<>0),reversal_of uuid REFERENCES public.mc_stock_movements(id),
 unit_cost_snapshot numeric(18,6) CHECK(unit_cost_snapshot>=0),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(event_id,workspace_id) REFERENCES public.mc_stock_events(id,workspace_id),
 FOREIGN KEY(item_id,workspace_id) REFERENCES public.mc_inventory_items(id,workspace_id),
 FOREIGN KEY(lot_id,item_id,workspace_id) REFERENCES public.mc_stock_lots(id,item_id,workspace_id),
 FOREIGN KEY(location_id,workspace_id) REFERENCES public.mc_locations(id,workspace_id)
);
CREATE INDEX mc_stock_balance_lookup ON public.mc_stock_movements(workspace_id,item_id,lot_id,location_id);
CREATE VIEW public.mc_stock_balances WITH(security_invoker=true) AS
 SELECT workspace_id,item_id,lot_id,location_id,sum(delta)::numeric(18,4) AS quantity FROM public.mc_stock_movements GROUP BY 1,2,3,4;

-- Produtos, kits, composicao com versao imutavel quando publicada.
CREATE TABLE public.mc_products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 name text NOT NULL,sku text,kind text NOT NULL DEFAULT 'product' CHECK(kind IN ('product','component','kit')),
 description text,sale_price numeric(16,4) CHECK(sale_price>=0),active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(id,workspace_id)
);
CREATE TABLE public.mc_product_revisions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 product_id uuid NOT NULL,revision integer NOT NULL CHECK(revision>0),
 state text NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','published','archived')),
 notes text,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(id,workspace_id),UNIQUE(product_id,revision),
 FOREIGN KEY(product_id,workspace_id) REFERENCES public.mc_products(id,workspace_id)
);
CREATE TABLE public.mc_product_components (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 revision_id uuid NOT NULL,component_product_id uuid,inventory_item_id uuid,tool_id uuid,service_id uuid,
 quantity numeric(18,4) NOT NULL CHECK(quantity>0),unit text NOT NULL CHECK(unit IN ('g','unit','ml','hour','minute','use')),
 notes text,
 FOREIGN KEY(revision_id,workspace_id) REFERENCES public.mc_product_revisions(id,workspace_id),
 FOREIGN KEY(component_product_id,workspace_id) REFERENCES public.mc_products(id,workspace_id),
 FOREIGN KEY(inventory_item_id,workspace_id) REFERENCES public.mc_inventory_items(id,workspace_id),
 FOREIGN KEY(tool_id,workspace_id) REFERENCES public.mc_tools(id,workspace_id),
 FOREIGN KEY(service_id,workspace_id) REFERENCES public.mc_services(id,workspace_id),
 CHECK(num_nonnulls(component_product_id,inventory_item_id,tool_id,service_id)=1)
);
-- Ciclos de BOM e mutacao de revisoes publicadas serao prevenidos por operacoes transacionais da API futura.

-- Producoes, reservas, confirmacoes parciais e rastreabilidade de falhas/retrabalho.
CREATE TABLE public.mc_productions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 printer_id uuid, parent_production_id uuid,
 kind text NOT NULL DEFAULT 'print' CHECK(kind IN ('print','rework','assembly')),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','reserved','running','partial','completed','failed','cancelled')),
 planned_hours numeric(14,4) CHECK(planned_hours>=0),actual_hours numeric(14,4) CHECK(actual_hours>=0),
 start_at timestamptz,end_at timestamptz,notes text,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(id,workspace_id),
 FOREIGN KEY(printer_id,workspace_id) REFERENCES public.mc_printers(id,workspace_id),
 FOREIGN KEY(parent_production_id,workspace_id) REFERENCES public.mc_productions(id,workspace_id)
);
CREATE TABLE public.mc_production_outputs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 production_id uuid NOT NULL,product_id uuid NOT NULL,revision_id uuid,
 planned_quantity numeric(18,4) NOT NULL DEFAULT 0 CHECK(planned_quantity>=0),
 confirmed_good numeric(18,4) NOT NULL DEFAULT 0 CHECK(confirmed_good>=0),
 confirmed_failed numeric(18,4) NOT NULL DEFAULT 0 CHECK(confirmed_failed>=0),
 FOREIGN KEY(production_id,workspace_id) REFERENCES public.mc_productions(id,workspace_id),
 FOREIGN KEY(product_id,workspace_id) REFERENCES public.mc_products(id,workspace_id),
 FOREIGN KEY(revision_id,workspace_id) REFERENCES public.mc_product_revisions(id,workspace_id),
 UNIQUE(id,workspace_id)
);
CREATE TABLE public.mc_production_reservations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 production_id uuid NOT NULL,item_id uuid NOT NULL,lot_id uuid,
 quantity numeric(18,4) NOT NULL CHECK(quantity>0),remaining numeric(18,4) NOT NULL CHECK(remaining>=0 AND remaining<=quantity),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','released','fulfilled')),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(production_id,workspace_id) REFERENCES public.mc_productions(id,workspace_id),
 FOREIGN KEY(item_id,workspace_id) REFERENCES public.mc_inventory_items(id,workspace_id),
 FOREIGN KEY(lot_id,item_id,workspace_id) REFERENCES public.mc_stock_lots(id,item_id,workspace_id)
);
CREATE TABLE public.mc_production_confirmations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 production_id uuid NOT NULL,idempotency_key text NOT NULL,
 confirmed_at timestamptz NOT NULL DEFAULT now(),author_id uuid REFERENCES auth.users(id),
 status text NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','reversed')),
 FOREIGN KEY(production_id,workspace_id) REFERENCES public.mc_productions(id,workspace_id),
 UNIQUE(workspace_id,idempotency_key),UNIQUE(id,workspace_id)
);
CREATE TABLE public.mc_production_consumption (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 confirmation_id uuid NOT NULL,item_id uuid NOT NULL,lot_id uuid,
 model_quantity numeric(18,4) NOT NULL DEFAULT 0 CHECK(model_quantity>=0),purge_quantity numeric(18,4) NOT NULL DEFAULT 0 CHECK(purge_quantity>=0),
 loss_quantity numeric(18,4) NOT NULL DEFAULT 0 CHECK(loss_quantity>=0),
 quantity_basis text NOT NULL CHECK(quantity_basis IN ('weighed','slicer','estimated')),
 unit_cost_snapshot numeric(18,6) CHECK(unit_cost_snapshot>=0),notes text,
 FOREIGN KEY(confirmation_id,workspace_id) REFERENCES public.mc_production_confirmations(id,workspace_id),
 FOREIGN KEY(item_id,workspace_id) REFERENCES public.mc_inventory_items(id,workspace_id),
 FOREIGN KEY(lot_id,item_id,workspace_id) REFERENCES public.mc_stock_lots(id,item_id,workspace_id)
);
CREATE TABLE public.mc_production_failures (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 production_id uuid NOT NULL,confirmation_id uuid,reason text NOT NULL DEFAULT 'unknown',
 wasted_quantity numeric(18,4) NOT NULL DEFAULT 0 CHECK(wasted_quantity>=0),
 recovered_quantity numeric(18,4) NOT NULL DEFAULT 0 CHECK(recovered_quantity>=0),notes text,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(production_id,workspace_id) REFERENCES public.mc_productions(id,workspace_id),
 FOREIGN KEY(confirmation_id,workspace_id) REFERENCES public.mc_production_confirmations(id,workspace_id)
);
CREATE TABLE public.mc_cost_snapshots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 production_id uuid,product_id uuid,revision_id uuid,
 formula_version text NOT NULL DEFAULT 'v1',currency text NOT NULL DEFAULT 'BRL' CHECK(currency='BRL'),
 quantity numeric(18,4) NOT NULL CHECK(quantity>0),total_cost numeric(18,4) CHECK(total_cost>=0),
 cost_status text NOT NULL DEFAULT 'estimated' CHECK(cost_status IN ('known','estimated','unknown')),
 parameters jsonb NOT NULL DEFAULT '{}'::jsonb,confirmed_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(production_id,workspace_id) REFERENCES public.mc_productions(id,workspace_id),
 FOREIGN KEY(product_id,workspace_id) REFERENCES public.mc_products(id,workspace_id),
 FOREIGN KEY(revision_id,workspace_id) REFERENCES public.mc_product_revisions(id,workspace_id),UNIQUE(id,workspace_id)
);
CREATE TABLE public.mc_cost_lines (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 snapshot_id uuid NOT NULL,category text NOT NULL CHECK(category IN ('material','energy','machine','labor','accessory','tool','other','failure','rework')),
 basis text,quantity numeric(18,4) NOT NULL DEFAULT 1 CHECK(quantity>=0),unit_cost numeric(18,6),
 amount numeric(18,4) NOT NULL CHECK(amount>=0),source_lot_id uuid,source text,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 FOREIGN KEY(snapshot_id,workspace_id) REFERENCES public.mc_cost_snapshots(id,workspace_id),
 FOREIGN KEY(source_lot_id,workspace_id) REFERENCES public.mc_stock_lots(id,workspace_id)
);
CREATE TABLE public.mc_cost_pools (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 production_id uuid NOT NULL,category text NOT NULL CHECK(category IN ('energy','machine','shared_labor','purge','other')),
 amount numeric(18,4) NOT NULL CHECK(amount>=0),allocation_basis text NOT NULL CHECK(allocation_basis IN ('mass','time','direct','manual')),
 FOREIGN KEY(production_id,workspace_id) REFERENCES public.mc_productions(id,workspace_id),UNIQUE(id,workspace_id)
);
CREATE TABLE public.mc_cost_allocations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 pool_id uuid NOT NULL,output_id uuid,loss_reason text,
 amount numeric(18,4) NOT NULL CHECK(amount>=0),basis_quantity numeric(18,4) CHECK(basis_quantity>=0),
 FOREIGN KEY(pool_id,workspace_id) REFERENCES public.mc_cost_pools(id,workspace_id),
 FOREIGN KEY(output_id,workspace_id) REFERENCES public.mc_production_outputs(id,workspace_id),
 CHECK((output_id IS NOT NULL) <> (loss_reason IS NOT NULL))
);
CREATE TABLE public.mc_inventory_issues (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 production_id uuid,item_id uuid,reported_qty numeric(18,4) CHECK(reported_qty>=0),recorded_qty numeric(18,4) CHECK(recorded_qty>=0),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','investigating','resolved','dismissed')),
 reason text,evidence jsonb NOT NULL DEFAULT '{}'::jsonb,requested_by uuid REFERENCES auth.users(id),
 decided_by uuid REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(production_id,workspace_id) REFERENCES public.mc_productions(id,workspace_id),
 FOREIGN KEY(item_id,workspace_id) REFERENCES public.mc_inventory_items(id,workspace_id)
);
CREATE TABLE public.mc_audit_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workspace_id uuid REFERENCES public.mc_workspaces(id) ON DELETE CASCADE,
 entity text NOT NULL,entity_id uuid,action text NOT NULL,actor_id uuid REFERENCES auth.users(id),
 approver_id uuid REFERENCES auth.users(id),reason text,details jsonb NOT NULL DEFAULT '{}'::jsonb,
 occurred_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: todos os dados de oficina isolados, mesmo sem aplicativo autenticado.
ALTER TABLE public.mc_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY mc_profiles_own ON public.mc_profiles FOR ALL TO authenticated USING(user_id=(SELECT auth.uid())) WITH CHECK(user_id=(SELECT auth.uid()));
ALTER TABLE public.mc_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY mc_workspaces_read ON public.mc_workspaces FOR SELECT TO authenticated USING(public.mc_member(id));
-- Alteracao de plano/titularidade somente por operacao administrativa futura, nunca pelo navegador.
ALTER TABLE public.mc_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY mc_members_read ON public.mc_members FOR SELECT TO authenticated USING(public.mc_member(workspace_id));
-- Membros/planos alterados apenas por operacoes administrativas futuras; nunca UPDATE direto no cliente.
ALTER TABLE public.mc_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY mc_prefs_own ON public.mc_preferences FOR ALL TO authenticated USING(user_id=(SELECT auth.uid())) WITH CHECK(user_id=(SELECT auth.uid()));
ALTER TABLE public.mc_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY mc_catalog_read ON public.mc_catalog FOR SELECT TO authenticated USING(
 scope='global' OR (scope='private' AND public.mc_member(workspace_id)) OR
 (scope='shared' AND status='active' AND EXISTS(SELECT 1 FROM public.mc_workspaces w JOIN public.mc_members m ON m.workspace_id=w.id WHERE m.user_id=(SELECT auth.uid()) AND m.active AND w.plan IN ('shared','full'))));
CREATE POLICY mc_catalog_guest ON public.mc_catalog FOR SELECT TO anon USING(scope='global' AND status='active');
CREATE POLICY mc_catalog_insert ON public.mc_catalog FOR INSERT TO authenticated WITH CHECK(scope='private' AND author_id=(SELECT auth.uid()) AND public.mc_role(workspace_id) IN ('owner','manager','operator'));
CREATE POLICY mc_catalog_update ON public.mc_catalog FOR UPDATE TO authenticated USING(scope='private' AND author_id=(SELECT auth.uid()) AND public.mc_member(workspace_id)) WITH CHECK(scope='private' AND author_id=(SELECT auth.uid()) AND public.mc_member(workspace_id));
-- Publicar compartilhamento exige fluxo de copia separada, liberado na API futura.

-- Geracao de politicas para cada tabela operacional. Acesso financeiro restrito a owner/manager.
DO $$ DECLARE t text; money_tables text[]:=ARRAY['mc_purchases','mc_purchase_lines','mc_stock_lots','mc_cost_snapshots','mc_cost_lines','mc_cost_pools','mc_cost_allocations','mc_energy_tariffs','mc_suppliers']; BEGIN
 FOREACH t IN ARRAY ARRAY[
 'mc_printers','mc_energy_tariffs','mc_suppliers','mc_filaments','mc_tools','mc_services','mc_inventory_items','mc_locations',
 'mc_purchases','mc_purchase_lines','mc_stock_lots','mc_stock_events','mc_stock_movements',
 'mc_products','mc_product_revisions','mc_product_components','mc_productions','mc_production_outputs',
 'mc_production_reservations','mc_production_confirmations','mc_production_consumption','mc_production_failures',
 'mc_cost_snapshots','mc_cost_lines','mc_cost_pools','mc_cost_allocations','mc_inventory_issues','mc_audit_events'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.mc_%s(workspace_id))',t||'_read',t,CASE WHEN t=ANY(money_tables) THEN 'finance' ELSE 'member' END);
  IF t <> ALL(ARRAY['mc_stock_events','mc_stock_movements','mc_production_confirmations','mc_production_consumption','mc_production_failures','mc_cost_snapshots','mc_cost_lines','mc_cost_pools','mc_cost_allocations','mc_audit_events','mc_inventory_issues','mc_production_reservations']) THEN
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.mc_role(workspace_id) IN (''owner'',''manager'',''operator''))',t||'_insert',t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.mc_role(workspace_id) IN (''owner'',''manager'')) WITH CHECK (public.mc_role(workspace_id) IN (''owner'',''manager''))',t||'_update',t);
  END IF;
 END LOOP;
END $$;
-- Nao conceder CRUD direto em eventos contabilizados / snapshots imutaveis.
-- O fluxo transacional de confirmacao, reserva, estorno e inventario sera liberado por RPCs testadas.
-- Materiais e produtos/cadastros ja suportam operacoes simples.

-- Catalogo minimo util: dados descritivos, NENHUMA potencia/preco real presumido.
INSERT INTO public.mc_catalog(kind,name,manufacturer,scope,status) VALUES
 ('printer_model','Kobra X','Anycubic','global','active'),
 ('printer_model','Impressora personalizada','Outro','global','active'),
 ('filament_type','PLA',NULL,'global','active'),
 ('filament_type','PLA+',NULL,'global','active'),
 ('filament_type','PETG',NULL,'global','active'),
 ('filament_type','ABS',NULL,'global','active'),
 ('filament_type','ASA',NULL,'global','active'),
 ('filament_type','TPU',NULL,'global','active'),
 ('filament_brand','Masterprint',NULL,'global','active'),
 ('filament_brand','Anycubic',NULL,'global','active'),
 ('filament_brand','Bambu Lab',NULL,'global','active'),
 ('filament_brand','eSUN',NULL,'global','active'),
 ('filament_brand','Creality',NULL,'global','active'),
 ('color','Branco',NULL,'global','active'),
 ('color','Preto',NULL,'global','active'),
 ('color','Cinza',NULL,'global','active'),
 ('color','Azul',NULL,'global','active'),
 ('color','Vermelho',NULL,'global','active'),
 ('color','Verde',NULL,'global','active');
-- Auditar snapshot: nenhuma alteracao/destruicao permitida por cliente.
CREATE INDEX mc_product_ws ON public.mc_products(workspace_id,name);
CREATE INDEX mc_production_ws ON public.mc_productions(workspace_id,created_at DESC);
CREATE INDEX mc_events_ws ON public.mc_stock_events(workspace_id,created_at DESC);
CREATE INDEX mc_audit_ws ON public.mc_audit_events(workspace_id,occurred_at DESC);

-- Usuario logado cria perfil sem privilegios extra.
CREATE FUNCTION public.mc_self_profile() RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$
 INSERT INTO public.mc_profiles(user_id) VALUES(auth.uid()) ON CONFLICT(user_id) DO NOTHING
$$;
REVOKE ALL ON FUNCTION public.mc_self_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mc_self_profile() TO authenticated;

-- Manter CRUD sob politicas; tabelas de eventos nao devem ser acessiveis a visitantes.
GRANT SELECT ON public.mc_catalog TO anon;
DO $$ DECLARE t record; BEGIN
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'mc\_%' ESCAPE '\' LOOP
  EXECUTE format('GRANT SELECT, INSERT, UPDATE ON public.%I TO authenticated', t.tablename);
 END LOOP;
END $$;
-- DELETE nao e concedido: preservar historico e usar inativacao.
