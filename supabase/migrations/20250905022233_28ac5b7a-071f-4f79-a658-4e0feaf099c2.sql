-- Remove the dangerous "System can manage subscriptions" policy that allows unrestricted access
DROP POLICY IF EXISTS "System can manage subscriptions" ON public.subscriptions;

-- The existing policies remain:
-- - "Users can view their own subscription" (SELECT for auth.uid() = user_id)
-- - "Admins can view all subscriptions" (SELECT for admins)
-- 
-- Edge functions will continue to work using the service role key which bypasses RLS policies
-- This ensures only authenticated service functions can manage subscriptions, not regular users