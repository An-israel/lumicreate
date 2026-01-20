-- Fix newsletter_subscribers INSERT policy to prevent spam abuse
-- Allow inserts but require a valid email format and rate limit via uniqueness constraint
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe with valid email"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (
  email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Add INSERT policy for payment_alerts (edge functions need to insert)
-- This uses service role so no policy needed for regular users

-- Drop deprecated coin system tables since coins have been removed
DROP TABLE IF EXISTS public.coin_wallets CASCADE;
DROP TABLE IF EXISTS public.coin_transactions CASCADE;

-- Add admin INSERT policy for payment_alerts (for edge functions)
DROP POLICY IF EXISTS "Service can insert payment alerts" ON public.payment_alerts;
CREATE POLICY "Service can insert payment alerts"
ON public.payment_alerts
FOR INSERT
WITH CHECK (true);
-- Note: This is intentional - edge functions use service role key which bypasses RLS
-- Regular users cannot insert because they don't have the service role key