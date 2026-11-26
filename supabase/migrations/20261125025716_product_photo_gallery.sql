BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mc-product-photos', 'mc-product-photos', false, 6291456, ARRAY['image/jpeg','image/png','image/webp']);

-- A pasta identifica o produto pela dupla oficina/produto.
CREATE POLICY mc_product_photos_read ON storage.objects
 FOR SELECT TO authenticated
 USING (
  bucket_id = 'mc-product-photos' AND EXISTS (
   SELECT 1 FROM public.mc_products p
   WHERE p.id::text = split_part(objects.name, '/', 2)
     AND p.workspace_id::text = split_part(objects.name, '/', 1)
     AND public.mc_member(p.workspace_id)
  )
 );

CREATE POLICY mc_product_photos_upload ON storage.objects
 FOR INSERT TO authenticated
 WITH CHECK (
  bucket_id = 'mc-product-photos'
  AND name ~ '^[0-9a-f-]+/[0-9a-f-]+/[0-9a-f-]+\.(jpg|png|webp)$'
  AND EXISTS (
   SELECT 1 FROM public.mc_products p
   WHERE p.id::text = split_part(objects.name, '/', 2)
     AND p.workspace_id::text = split_part(objects.name, '/', 1)
     AND p.active
     AND public.mc_role(p.workspace_id) IN ('owner','manager','operator')
  )
 );

CREATE TABLE public.mc_product_photo_preferences (
 product_id uuid NOT NULL,
 workspace_id uuid NOT NULL,
 primary_path text NOT NULL,
 PRIMARY KEY (product_id, workspace_id),
 FOREIGN KEY (product_id, workspace_id) REFERENCES public.mc_products(id, workspace_id) ON DELETE CASCADE,
 CHECK (primary_path LIKE workspace_id::text || '/' || product_id::text || '/%')
);

ALTER TABLE public.mc_product_photo_preferences ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mc_product_photo_preferences FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.mc_product_photo_preferences TO authenticated;
-- PostgREST upsert escreve as colunas enviadas, inclusive as chaves.
GRANT UPDATE (primary_path, product_id, workspace_id) ON public.mc_product_photo_preferences TO authenticated;

CREATE POLICY mc_product_photo_preferences_read ON public.mc_product_photo_preferences
 FOR SELECT TO authenticated USING (public.mc_member(workspace_id));

CREATE POLICY mc_product_photo_preferences_insert ON public.mc_product_photo_preferences
 FOR INSERT TO authenticated WITH CHECK (
  public.mc_role(workspace_id) IN ('owner','manager','operator')
  AND EXISTS (
   SELECT 1 FROM storage.objects obj WHERE obj.bucket_id = 'mc-product-photos' AND obj.name = primary_path
  )
 );

CREATE POLICY mc_product_photo_preferences_update ON public.mc_product_photo_preferences
 FOR UPDATE TO authenticated
 USING (public.mc_role(workspace_id) IN ('owner','manager','operator'))
 WITH CHECK (
  public.mc_role(workspace_id) IN ('owner','manager','operator')
  AND EXISTS (
   SELECT 1 FROM storage.objects obj WHERE obj.bucket_id = 'mc-product-photos' AND obj.name = primary_path
  )
 );

COMMIT;
