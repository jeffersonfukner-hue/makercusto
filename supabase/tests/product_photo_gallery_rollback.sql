-- Regressão para PostgreSQL de teste com Auth e Storage inicializados.
BEGIN;
INSERT INTO auth.users(id) VALUES
 ('a0800000-0000-4000-8000-000000000001'), ('a0800000-0000-4000-8000-000000000002');
INSERT INTO public.mc_workspaces(id, owner_id, name) VALUES
 ('a0800000-0000-4000-8000-000000000011','a0800000-0000-4000-8000-000000000001','Oficina teste A'),
 ('a0800000-0000-4000-8000-000000000012','a0800000-0000-4000-8000-000000000002','Oficina teste B');
INSERT INTO public.mc_members(workspace_id, user_id, role) VALUES
 ('a0800000-0000-4000-8000-000000000011','a0800000-0000-4000-8000-000000000001','owner'),
 ('a0800000-0000-4000-8000-000000000012','a0800000-0000-4000-8000-000000000002','owner');
INSERT INTO public.mc_products(id, workspace_id, name) VALUES
 ('a0800000-0000-4000-8000-000000000021','a0800000-0000-4000-8000-000000000011','Urso'),
 ('a0800000-0000-4000-8000-000000000022','a0800000-0000-4000-8000-000000000012','Urso');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','a0800000-0000-4000-8000-000000000001',true);
INSERT INTO storage.objects(bucket_id, name) VALUES
 ('mc-product-photos','a0800000-0000-4000-8000-000000000011/a0800000-0000-4000-8000-000000000021/a1.jpg'),
 ('mc-product-photos','a0800000-0000-4000-8000-000000000011/a0800000-0000-4000-8000-000000000021/a2.png');
INSERT INTO public.mc_product_photo_preferences(product_id, workspace_id, primary_path) VALUES
 ('a0800000-0000-4000-8000-000000000021','a0800000-0000-4000-8000-000000000011',
  'a0800000-0000-4000-8000-000000000011/a0800000-0000-4000-8000-000000000021/a1.jpg');
INSERT INTO public.mc_product_photo_preferences(product_id, workspace_id, primary_path) VALUES
 ('a0800000-0000-4000-8000-000000000021','a0800000-0000-4000-8000-000000000011',
  'a0800000-0000-4000-8000-000000000011/a0800000-0000-4000-8000-000000000021/a2.png')
 ON CONFLICT(product_id, workspace_id) DO UPDATE SET
  product_id=excluded.product_id, workspace_id=excluded.workspace_id, primary_path=excluded.primary_path;

DO $$
BEGIN
 IF (SELECT count(*) FROM storage.objects WHERE bucket_id='mc-product-photos' AND name LIKE 'a0800000-%')<>2 THEN
  RAISE EXCEPTION 'Fotos próprias indisponíveis';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.mc_product_photo_preferences WHERE product_id='a0800000-0000-4000-8000-000000000021' AND primary_path LIKE '%/a2.png') THEN
  RAISE EXCEPTION 'Upsert não mudou a foto principal';
 END IF;
 BEGIN
  INSERT INTO storage.objects(bucket_id,name) VALUES
   ('mc-product-photos','a0800000-0000-4000-8000-000000000011/a0800000-0000-4000-8000-000000000022/a1.jpg');
  RAISE EXCEPTION 'Gravação em produto de outra oficina aceita';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;

SELECT set_config('request.jwt.claim.sub','a0800000-0000-4000-8000-000000000002',true);
DO $$
BEGIN
 IF EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id='mc-product-photos' AND name LIKE 'a0800000-0000-4000-8000-000000000011/%')
 OR EXISTS (SELECT 1 FROM public.mc_product_photo_preferences WHERE workspace_id='a0800000-0000-4000-8000-000000000011') THEN
  RAISE EXCEPTION 'Fotos de outra oficina visíveis';
 END IF;
END $$;
ROLLBACK;
