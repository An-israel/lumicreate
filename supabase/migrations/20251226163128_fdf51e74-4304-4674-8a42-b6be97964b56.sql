-- Drop the existing SELECT policy on profiles
DROP POLICY IF EXISTS "Users can only view own profile or admins view all" ON public.profiles;

-- Create a proper PERMISSIVE SELECT policy with strict access control
CREATE POLICY "Users can only view own profile or admins view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_admin_or_staff(auth.uid())
);

-- Force RLS for table owner as well (extra security)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;