-- Fix infinite recursion in profiles RLS policies
-- The "Admins can view all profiles" policy is causing infinite recursion 
-- because it references the profiles table within the profiles table policy

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a new admin policy using the existing is_admin() function which uses user_roles table
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (is_admin());

-- Also check if there might be an issue with the handle_new_user trigger
-- Let's make sure the role values match exactly what the check constraint expects