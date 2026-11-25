BEGIN;

CREATE TABLE public.mc_customer_orders (
 id uuid PRIMARY KEY,
 workspace_id uuid NOT NULL REFERENCES public.mc_workspaces(id),
 author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
 snapshot_id uuid,
 product_name text NOT NULL CHECK (length(btrim(product_name)) BETWEEN 2 AND 150),
 status text NOT NULL CHECK (status IN ('planned', 'sold')),
 quantity integer NOT NULL CHECK (quantity > 0),
 pieces_per_plate integer NOT NULL CHECK (pieces_per_plate > 0),
 plate_cost numeric(18,4) NOT NULL CHECK (plate_cost >= 0 AND plate_cost <> 'NaN'::numeric),
 partial_plate_cost numeric(18,4) NOT NULL CHECK (
  partial_plate_cost >= 0 AND partial_plate_cost <> 'NaN'::numeric
  AND (quantity % pieces_per_plate <> 0 OR partial_plate_cost = 0)
 ),
 sale_price numeric(18,4) NOT NULL CHECK (sale_price >= 0 AND sale_price <> 'NaN'::numeric),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (snapshot_id, workspace_id) REFERENCES public.mc_cost_snapshots(id, workspace_id)
);
CREATE INDEX mc_customer_orders_workspace_date_idx ON public.mc_customer_orders(workspace_id, created_at DESC, id DESC);
CREATE INDEX mc_customer_orders_snapshot_idx ON public.mc_customer_orders(snapshot_id, workspace_id) WHERE snapshot_id IS NOT NULL;

ALTER TABLE public.mc_customer_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mc_customer_orders FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.mc_customer_orders TO authenticated;
GRANT INSERT (id, workspace_id, snapshot_id, product_name, status, quantity, pieces_per_plate, plate_cost, partial_plate_cost, sale_price)
 ON public.mc_customer_orders TO authenticated;
CREATE POLICY mc_customer_orders_read ON public.mc_customer_orders
 FOR SELECT TO authenticated USING (public.mc_finance(workspace_id));
CREATE POLICY mc_customer_orders_insert ON public.mc_customer_orders
 FOR INSERT TO authenticated WITH CHECK (
  author_id = (SELECT auth.uid()) AND public.mc_finance(workspace_id)
  AND public.mc_role(workspace_id) IN ('owner','manager','operator')
 );

COMMIT;
