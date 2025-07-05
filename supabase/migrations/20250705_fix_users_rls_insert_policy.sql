-- Add missing INSERT policy for users table
-- This allows users to create their own profile when auth.uid() matches their id

CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);