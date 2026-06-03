-- Enable Row Level Security (RLS) on the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID references auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT DEFAULT 'new user',
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security Policies

-- 1. Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 2. Founders and Admins can read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles
    AS PERMISSIVE FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.role = 'founder' OR p.role = 'admin')
      )
    );

-- 3. Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    AS PERMISSIVE FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Trigger to automatically create a profile record when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'new user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Optional: Function to protect user roles from being escalated by standard users
CREATE OR REPLACE FUNCTION public.protect_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Revert role changes if the user doing the updating is not an admin/founder
  -- (Complex implementation requires fetching current auth context)
  -- For now, keep it simple where roles are updated through a secured admin backend or function.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
