-- 1. Fix function search paths
ALTER FUNCTION public.set_updated_at() SET search_path = public;

-- 2. Revoke EXECUTE on internal helper functions
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- has_role is used by RLS policies — keep it executable by authenticated only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

-- 3. Tighten storage listing for public buckets — drop the "any can SELECT bucket" policies and replace with stricter ones
DROP POLICY IF EXISTS "Public read store logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
-- Files are still fetchable via public URL since buckets are marked public; we just don't expose listing.
-- Allow authenticated users to view their own folder (for management)
CREATE POLICY "Owner lists own store-logos" ON storage.objects FOR SELECT
  USING (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner lists own product-images" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Tighten orders INSERT policy — require items array non-empty and total >= 0
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT
  WITH CHECK (
    jsonb_array_length(items) > 0
    AND total >= 0
    AND length(buyer_name) BETWEEN 1 AND 200
    AND length(buyer_phone) BETWEEN 1 AND 50
    AND EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id)
  );