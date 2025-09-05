-- Fix security vulnerability: Add user_id columns and proper RLS policies
-- for personal data access while maintaining admin oversight

-- 1. Add user_id column to contact_submissions (optional for guest submissions)
ALTER TABLE public.contact_submissions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add user_id column to registrations  
ALTER TABLE public.registrations 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Update RLS policies for contact_submissions
-- Allow users to view their own submissions
CREATE POLICY "Users can view their own contact submissions" ON public.contact_submissions
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL AND is_admin());

-- 4. Update RLS policies for registrations
-- Allow users to view their own registrations
CREATE POLICY "Users can view their own registrations" ON public.registrations
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own registrations  
CREATE POLICY "Users can create their own registrations" ON public.registrations
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 5. Update RLS policies for receipts
-- Allow users to view receipts for their own registrations
CREATE POLICY "Users can view their own receipts" ON public.receipts
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.registrations r 
      WHERE r.id = receipts.registration_id 
      AND r.user_id = auth.uid()
    )
  );

-- 6. Create indexes for better performance on new user_id columns
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON public.contact_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations(user_id);