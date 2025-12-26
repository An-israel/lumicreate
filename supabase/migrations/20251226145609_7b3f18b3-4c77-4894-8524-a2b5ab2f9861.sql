-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix search_path for generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_order_number TEXT;
  year_suffix TEXT;
  sequence_num INTEGER;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 10) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.orders
  WHERE order_number LIKE 'LUM-' || year_suffix || '-%';
  
  new_order_number := 'LUM-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  RETURN new_order_number;
END;
$$;