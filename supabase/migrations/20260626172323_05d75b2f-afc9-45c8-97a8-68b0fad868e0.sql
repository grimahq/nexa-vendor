REVOKE ALL ON public.stores FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.stores TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;

REVOKE ALL ON public.products FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

REVOKE ALL ON public.orders FROM PUBLIC, anon, authenticated;
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

REVOKE ALL ON public.payments FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

REVOKE ALL ON public.user_roles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

REVOKE ALL ON public.kyc_submissions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.kyc_submissions TO authenticated;
GRANT ALL ON public.kyc_submissions TO service_role;

REVOKE ALL ON public.order_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.order_events TO authenticated;
GRANT ALL ON public.order_events TO service_role;

REVOKE ALL ON public.likes FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.likes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.likes TO authenticated;
GRANT ALL ON public.likes TO service_role;

REVOKE ALL ON public.follows FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.follows TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;

REVOKE ALL ON public.comments FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;

REVOKE ALL ON public.subscription_plans FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;

REVOKE ALL ON public.subscriptions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

REVOKE ALL ON public.platform_revenue FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.platform_revenue TO authenticated;
GRANT ALL ON public.platform_revenue TO service_role;

REVOKE ALL ON public.coupons FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;

REVOKE ALL ON public.announcements FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;

REVOKE ALL ON public.admin_audit_log FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;