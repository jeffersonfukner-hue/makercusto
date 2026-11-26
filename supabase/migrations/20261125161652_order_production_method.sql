BEGIN;

ALTER TABLE public.mc_customer_orders
 ADD COLUMN production_method text NOT NULL DEFAULT 'direct'
 CHECK (production_method IN ('direct','assembly')),
 ADD CONSTRAINT mc_customer_orders_assembly_units
 CHECK (production_method <> 'assembly' OR (pieces_per_plate=1 AND partial_plate_cost=0));

GRANT INSERT (production_method) ON public.mc_customer_orders TO authenticated;

COMMIT;
