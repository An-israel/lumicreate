-- Add explicit INSERT policy - only admins/staff can create transactions
CREATE POLICY "Only admins can insert transactions"
ON public.coin_transactions
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_staff(auth.uid()));

-- Add explicit UPDATE policy - only admins/staff can update transactions
CREATE POLICY "Only admins can update transactions"
ON public.coin_transactions
FOR UPDATE
TO authenticated
USING (is_admin_or_staff(auth.uid()));

-- Add explicit DELETE policy - only admins/staff can delete transactions
CREATE POLICY "Only admins can delete transactions"
ON public.coin_transactions
FOR DELETE
TO authenticated
USING (is_admin_or_staff(auth.uid()));

-- Force RLS for table owner as well (extra security)
ALTER TABLE public.coin_transactions FORCE ROW LEVEL SECURITY;