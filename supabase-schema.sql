-- agastya_meetings table schema for Supabase

CREATE TABLE public.meetings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    time TEXT NOT NULL,
    date TEXT NOT NULL,
    durationMinutes INTEGER NOT NULL,
    target TEXT NOT NULL,
    link TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Basic row level security (RLS) policies
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.meetings AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all users" ON public.meetings AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.meetings AS PERMISSIVE FOR UPDATE TO public USING (true);
CREATE POLICY "Enable delete for all users" ON public.meetings AS PERMISSIVE FOR DELETE TO public USING (true);

CREATE TABLE public.materials (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    size TEXT NOT NULL,
    batch TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.materials AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all users" ON public.materials AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.materials AS PERMISSIVE FOR DELETE TO public USING (true);

CREATE TABLE public.assessments (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    due TEXT NOT NULL,
    title TEXT NOT NULL,
    batch TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.assessments AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all users" ON public.assessments AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.assessments AS PERMISSIVE FOR DELETE TO public USING (true);

CREATE TABLE public.notices (
    id BIGINT PRIMARY KEY,
    msg TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.notices AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all users" ON public.notices AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);

CREATE TABLE public.submissions (
    id SERIAL PRIMARY KEY,
    student TEXT NOT NULL,
    batch TEXT NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.submissions AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all users" ON public.submissions AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.submissions AS PERMISSIVE FOR UPDATE TO public USING (true);

CREATE TABLE public.interventions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    batch TEXT NOT NULL,
    issue TEXT NOT NULL,
    metric TEXT NOT NULL,
    logged BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.interventions AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert for all users" ON public.interventions AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.interventions AS PERMISSIVE FOR UPDATE TO public USING (true);
