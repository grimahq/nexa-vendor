CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

ALTER POLICY "Admins view audit log" ON public.admin_audit_log
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins write audit log" ON public.admin_audit_log
  WITH CHECK ((private.has_role(auth.uid(), 'admin'::public.app_role)) AND (actor_id = auth.uid()));

ALTER POLICY "Active announcements public" ON public.announcements
  USING ((is_active = true) OR private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage announcements" ON public.announcements
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage coupons" ON public.coupons
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins update KYC" ON public.kyc_submissions
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins view all KYC" ON public.kyc_submissions
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins view revenue" ON public.platform_revenue
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage stores" ON public.stores
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Active plans public" ON public.subscription_plans
  USING ((is_active = true) OR private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage plans" ON public.subscription_plans
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage subs" ON public.subscriptions
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins view all subs" ON public.subscriptions
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins manage roles" ON public.user_roles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

ALTER POLICY "Admins view all roles" ON public.user_roles
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));