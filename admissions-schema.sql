-- Run this in the Supabase SQL Editor to properly initialize the admissions table and RLS policies

DROP TABLE IF EXISTS public.admissions CASCADE;

CREATE TABLE public.admissions (
  id text primary key,
  email text,
  "studentName" text,
  "previousSchool" text,
  cohort text,
  "parentContact" text,
  status text,
  date text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;

-- Allow public insertion (for applicants without an account)
CREATE POLICY "Allow public insert"
ON public.admissions
FOR INSERT
WITH CHECK (true);

-- Allow public viewing (to allow dashboards to see the logs easily)
CREATE POLICY "Allow public select"
ON public.admissions
FOR SELECT
USING (true);

-- Allow public update 
CREATE POLICY "Allow public update"
ON public.admissions
FOR UPDATE
USING (true);

-- Allow public delete
CREATE POLICY "Allow public delete"
ON public.admissions
FOR DELETE
USING (true);
