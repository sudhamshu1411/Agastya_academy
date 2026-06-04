-- Run this in the Supabase SQL Editor to allow founders/admins to update user roles

CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role text)
RETURNS void AS $$
DECLARE
  calling_user_role text;
  calling_user_email text;
BEGIN
  -- Get the email of the calling user
  SELECT email INTO calling_user_email FROM auth.users WHERE id = auth.uid();

  -- Get the role of the user calling this function from profiles
  SELECT role INTO calling_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- ALWAYS allow the hardcoded founder email to update roles, as a fallback / master control
  IF calling_user_email = 'sudhamshu1411@gmail.com' OR calling_user_role IN ('founder', 'admin') THEN
    UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
    -- Also update auth metadata so the JWT and user session reflects the new role instantly
    UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', to_jsonb(new_role)) WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Not authorized to update user roles';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-run this snippet so the RPC function is updated!
