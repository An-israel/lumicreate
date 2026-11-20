-- Explicit shop category for products (falls back to keyword matching when null)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;

-- Supplier details and landed cost are kept out of the publicly readable
-- products table so customers can't see sourcing or margins.
CREATE TABLE IF NOT EXISTS public.product_sourcing (
  product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_name text,
  supplier_url text,
  -- Supplier's own product/variant IDs, for automated re-ordering later
  supplier_product_id text,
  supplier_sku_id text,
  cost_price_naira integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_sourcing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and staff can view product sourcing"
ON public.product_sourcing FOR SELECT
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can insert product sourcing"
ON public.product_sourcing FOR INSERT
WITH CHECK (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can update product sourcing"
ON public.product_sourcing FOR UPDATE
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can delete product sourcing"
ON public.product_sourcing FOR DELETE
USING (public.is_admin_or_staff(auth.uid()));

CREATE TRIGGER update_product_sourcing_updated_at
BEFORE UPDATE ON public.product_sourcing
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
