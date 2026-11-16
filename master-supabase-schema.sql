-- ============================================================================
-- AGASTYA ACADEMY ERP - MASTER SUPABASE SCHEMA & RLS SETUP
-- Run this entire script in your Supabase SQL Editor to provision all tables,
-- triggers, RPC functions, and Row-Level Security (RLS) policies.
-- ============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  phone text,
  role text DEFAULT 'new user'::text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users and admins can update profiles" ON public.profiles;
CREATE POLICY "Users and admins can update profiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    CASE
      WHEN lower(new.email) = 'sudhamshu1411@gmail.com' THEN 'founder'
      ELSE COALESCE(new.raw_user_meta_data->>'role', 'new user')
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role text)
RETURNS void AS $$
DECLARE
  calling_user_role text;
  calling_user_email text;
BEGIN
  SELECT email INTO calling_user_email FROM auth.users WHERE id = auth.uid();
  SELECT role INTO calling_user_role FROM public.profiles WHERE id = auth.uid();

  IF lower(calling_user_email) = 'sudhamshu1411@gmail.com' OR calling_user_role IN ('founder', 'admin') THEN
    UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
    UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', to_jsonb(new_role)) WHERE id = target_user_id;
  ELSE
    RAISE EXCEPTION 'Not authorized to update user roles';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_user(user_id uuid)
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ADMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.admissions (
  id text PRIMARY KEY,
  email text,
  "studentName" text,
  "previousSchool" text,
  cohort text,
  "parentContact" text,
  status text DEFAULT 'Pending Review',
  date text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all admissions access" ON public.admissions;
CREATE POLICY "Allow all admissions access" ON public.admissions FOR ALL USING (true) WITH CHECK (true);

-- 3. MEETINGS TABLE (Central Scheduler & Live Classes / PTMs / Interviews)
CREATE TABLE IF NOT EXISTS public.meetings (
  id text PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL,
  target text NOT NULL,
  subject text DEFAULT 'Physics',
  date text NOT NULL,
  time text NOT NULL,
  "durationMinutes" integer DEFAULT 30,
  link text,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS subject text DEFAULT 'Physics';
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all meetings access" ON public.meetings;
CREATE POLICY "Allow all meetings access" ON public.meetings FOR ALL USING (true) WITH CHECK (true);

-- 4. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id text PRIMARY KEY,
  email text NOT NULL,
  "studentName" text,
  batch text,
  date text NOT NULL,
  status text NOT NULL,
  "recordedBy" text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all attendance access" ON public.attendance;
CREATE POLICY "Allow all attendance access" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

-- 5. MATERIALS TABLE
CREATE TABLE IF NOT EXISTS public.materials (
  id bigint PRIMARY KEY,
  title text NOT NULL,
  size text,
  batch text,
  url text,
  "fileType" text,
  date text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all materials access" ON public.materials;
CREATE POLICY "Allow all materials access" ON public.materials FOR ALL USING (true) WITH CHECK (true);

-- 6. ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assessments (
  id bigint PRIMARY KEY,
  title text NOT NULL,
  type text,
  due text,
  batch text,
  color text,
  url text,
  "fileType" text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all assessments access" ON public.assessments;
CREATE POLICY "Allow all assessments access" ON public.assessments FOR ALL USING (true) WITH CHECK (true);

-- 7. BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.batches (
  id text PRIMARY KEY,
  name text NOT NULL,
  size integer DEFAULT 0,
  "avgScore" integer DEFAULT 0,
  syllabus text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all batches access" ON public.batches;
CREATE POLICY "Allow all batches access" ON public.batches FOR ALL USING (true) WITH CHECK (true);

-- 8. NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
  id bigint PRIMARY KEY,
  msg text NOT NULL,
  time text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all notices access" ON public.notices;
CREATE POLICY "Allow all notices access" ON public.notices FOR ALL USING (true) WITH CHECK (true);

-- 9. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id bigint PRIMARY KEY,
  student text,
  batch text,
  title text,
  date text,
  status text DEFAULT 'Pending',
  score integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all submissions access" ON public.submissions;
CREATE POLICY "Allow all submissions access" ON public.submissions FOR ALL USING (true) WITH CHECK (true);

-- 10. INTERVENTIONS TABLE
CREATE TABLE IF NOT EXISTS public.interventions (
  id bigint PRIMARY KEY,
  name text,
  batch text,
  issue text,
  metric text,
  logged boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all interventions access" ON public.interventions;
CREATE POLICY "Allow all interventions access" ON public.interventions FOR ALL USING (true) WITH CHECK (true);
