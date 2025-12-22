-- =================================================================
-- AUTH USER TRIGGER (Applied manually via Supabase Dashboard)
-- =================================================================
-- 
-- This trigger automatically creates a user in public.users
-- when a new user is created in auth.users (Supabase Auth)
--
-- IMPORTANT: This migration file is for documentation only.
-- The actual trigger must be created manually in Supabase Dashboard
-- because Prisma's shadow database doesn't have access to auth schema.
--
-- To apply: Copy the SQL below and run it in Supabase SQL Editor
-- =================================================================

/*

-- Create function to handle new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    supabase_auth_id,
    role,
    invite_status,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    NEW.email,
    NEW.id,
    'STARTUP',
    'ACCEPTED',
    true,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;

*/

-- Placeholder: Actual trigger applied manually
SELECT 1;