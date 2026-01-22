-- Strengthen profiles table RLS by requiring authentication
-- Drop and recreate the SELECT policy to explicitly require authentication

DROP POLICY IF EXISTS "Users can only view own profile or admins view all" ON public.profiles;

-- Create a more explicit policy that requires authentication
CREATE POLICY "Authenticated users can view own profile or admins view all" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING ((auth.uid() = user_id) OR is_admin_or_staff(auth.uid()));

-- Also strengthen the INSERT policy to require authenticated role
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- And the UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);