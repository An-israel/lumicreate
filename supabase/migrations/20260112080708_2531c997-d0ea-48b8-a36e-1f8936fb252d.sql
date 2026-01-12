-- Allow users to insert order items for their own orders
CREATE POLICY "Users can insert own order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Fix the overly permissive RLS policies on blog_likes and payment_alerts
-- Update blog_likes INSERT policy to be more restrictive
DROP POLICY IF EXISTS "Anyone can like posts" ON public.blog_likes;
CREATE POLICY "Anyone can like posts with session" 
ON public.blog_likes 
FOR INSERT 
WITH CHECK (
  session_id IS NOT NULL OR auth.uid() = user_id
);

-- Update payment_alerts INSERT to only allow service role (via edge functions)
-- The current policy allows anyone to insert which is a security issue
DROP POLICY IF EXISTS "Service role can insert alerts" ON public.payment_alerts;
-- Service role bypasses RLS, so we don't need an INSERT policy for regular users