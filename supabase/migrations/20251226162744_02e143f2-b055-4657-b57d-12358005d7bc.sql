-- Drop existing SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a single, explicit SELECT policy that combines both conditions
-- Users can only see their own profile OR admins/staff can see all profiles
CREATE POLICY "Users can only view own profile or admins view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR is_admin_or_staff(auth.uid())
);

-- Ensure the table has RLS enabled (should already be enabled but just to be safe)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner as well (extra security)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;