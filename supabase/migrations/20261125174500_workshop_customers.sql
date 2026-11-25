BEGIN;

CREATE TABLE public.mc_customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id),
 name text NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 150),
 whatsapp text CHECK (length(whatsapp) BETWEEN 1 AND 40),
 email text CHECK (length(email) BETWEEN 1 AND 254),
 UNIQUE (workspace_id,id)
);
CREATE INDEX mc_customers_workspace_name_idx ON public.mc_customers(workspace_id,name,id);
ALTER TABLE public.mc_customers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mc_customers FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT (id,workspace_id,name,whatsapp,email), UPDATE (name,whatsapp,email)
 ON public.mc_customers TO authenticated;

CREATE POLICY mc_customers_read ON public.mc_customers FOR SELECT TO authenticated
 USING (public.mc_finance(workspace_id));
CREATE POLICY mc_customers_create ON public.mc_customers FOR INSERT TO authenticated
 WITH CHECK (public.mc_finance(workspace_id) AND public.mc_role(workspace_id) IN ('owner','manager','operator'));
CREATE POLICY mc_customers_edit ON public.mc_customers FOR UPDATE TO authenticated
 USING (public.mc_finance(workspace_id) AND public.mc_role(workspace_id) IN ('owner','manager','operator'))
 WITH CHECK (public.mc_finance(workspace_id) AND public.mc_role(workspace_id) IN ('owner','manager','operator'));

ALTER TABLE public.mc_customer_orders ADD COLUMN customer_id uuid,
 ADD CONSTRAINT mc_orders_customer_workspace_fk FOREIGN KEY (workspace_id,customer_id)
 REFERENCES public.mc_customers(workspace_id,id);
CREATE INDEX mc_orders_customer_history_idx
 ON public.mc_customer_orders(workspace_id,customer_id,created_at DESC,id DESC)
 WHERE customer_id IS NOT NULL;
GRANT INSERT (customer_id) ON public.mc_customer_orders TO authenticated;
COMMIT;
