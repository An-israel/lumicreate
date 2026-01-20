-- Drop the overly permissive INSERT policy on payment_alerts
-- Edge functions use the service role key which bypasses RLS, so no INSERT policy is needed
DROP POLICY IF EXISTS "Service can insert payment alerts" ON public.payment_alerts;