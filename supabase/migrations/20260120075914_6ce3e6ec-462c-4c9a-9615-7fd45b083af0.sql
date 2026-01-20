-- Add explicit admin SELECT policy for delivery_addresses
-- Admins need to view customer addresses for order fulfillment
CREATE POLICY "Admins can view all addresses" 
ON public.delivery_addresses 
FOR SELECT 
USING (is_admin_or_staff(auth.uid()));