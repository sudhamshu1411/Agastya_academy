-- Run this script in your Supabase SQL Editor ONLY IF you have already signed up and need to force your role to 'founder'.
-- If you haven't signed up yet, simply use the "Sign Up" page with your email and password, and the system will automatically assign you as founder.

-- Update the profiles table
UPDATE public.profiles
SET role = 'founder'
WHERE email = 'sudhamshu1411@gmail.com';

-- Update the raw auth metadata (needed for RLS policies)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"founder"'
)
WHERE email = 'sudhamshu1411@gmail.com';
