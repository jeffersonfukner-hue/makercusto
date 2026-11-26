BEGIN;

ALTER TABLE public.mc_customer_orders
 ADD CONSTRAINT mc_customer_orders_id_workspace_key UNIQUE (id,workspace_id);

CREATE TABLE public.mc_order_cancellations (
 order_id uuid NOT NULL,
 workspace_id uuid NOT NULL,
 reason text NOT NULL CHECK (length(btrim(reason)) BETWEEN 10 AND 1000),
 cancelled_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
 cancelled_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (order_id,workspace_id),
 FOREIGN KEY (order_id,workspace_id) REFERENCES public.mc_customer_orders(id,workspace_id)
);
CREATE INDEX mc_order_cancellations_workspace_idx ON public.mc_order_cancellations(workspace_id);

ALTER TABLE public.mc_order_cancellations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mc_order_cancellations FROM PUBLIC,anon,authenticated;
GRANT SELECT, INSERT (order_id,workspace_id,reason) ON public.mc_order_cancellations TO authenticated;
CREATE POLICY mc_order_cancellations_read ON public.mc_order_cancellations FOR SELECT TO authenticated
 USING (public.mc_finance(workspace_id));
CREATE POLICY mc_order_cancellations_insert ON public.mc_order_cancellations FOR INSERT TO authenticated
 WITH CHECK (cancelled_by=(SELECT auth.uid()) AND public.mc_finance(workspace_id)
  AND public.mc_role(workspace_id) IN ('owner','manager','operator'));

COMMIT;
