-- Check and fix RLS policies for users table
-- Run this in Supabase SQL Editor

-- Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;

-- Create proper policies
-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Verify policies were created
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users';
