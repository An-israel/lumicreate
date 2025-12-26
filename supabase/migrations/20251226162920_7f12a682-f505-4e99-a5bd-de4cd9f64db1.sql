-- Drop existing SELECT policies on coin_wallets
DROP POLICY IF EXISTS "Users can view own wallet" ON public.coin_wallets;
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.coin_wallets;

-- Create a single, explicit SELECT policy
CREATE POLICY "Users can only view own wallet or admins view all"
ON public.coin_wallets
FOR SELECT
USING (
  auth.uid() = user_id 
  OR is_admin_or_staff(auth.uid())
);

-- Force RLS for table owner as well (extra security)
ALTER TABLE public.coin_wallets FORCE ROW LEVEL SECURITY;