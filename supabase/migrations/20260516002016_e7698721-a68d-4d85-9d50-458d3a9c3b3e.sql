
CREATE OR REPLACE FUNCTION public.sync_store_kyc_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.reviewed_at := now();
    UPDATE public.stores
      SET kyc_status = NEW.status,
          verified = (NEW.status = 'approved'),
          updated_at = now()
      WHERE id = NEW.store_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_store_kyc ON public.kyc_submissions;
CREATE TRIGGER trg_sync_store_kyc
BEFORE UPDATE ON public.kyc_submissions
FOR EACH ROW EXECUTE FUNCTION public.sync_store_kyc_status();

CREATE OR REPLACE FUNCTION public.sync_store_kyc_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stores SET kyc_status = 'pending', updated_at = now()
    WHERE id = NEW.store_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_store_kyc_insert ON public.kyc_submissions;
CREATE TRIGGER trg_sync_store_kyc_insert
AFTER INSERT ON public.kyc_submissions
FOR EACH ROW EXECUTE FUNCTION public.sync_store_kyc_on_insert();
