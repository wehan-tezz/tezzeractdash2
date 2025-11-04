-- Fix: Add missing INSERT policy for users table
-- This fixes the error: "new row violates row-level security policy for table 'users'"
-- Run this in your Supabase SQL Editor

-- Add INSERT policy for users table
-- Allows authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- Verify the policy was created
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
WHERE tablename = 'users'
ORDER BY policyname;

-- Expected policies after running this:
-- 1. "Users can insert their own profile" - FOR INSERT
-- 2. "Users can view their own profile" - FOR SELECT
-- 3. "Users can update their own profile" - FOR UPDATE

