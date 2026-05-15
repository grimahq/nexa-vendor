ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'confirmed' BEFORE 'fulfilled';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'delivered' AFTER 'fulfilled';