import { supabase, isSupabaseConfigured, PORTAL_USER_BATCH_TAG } from './supabase';

export function toSafeIntId(id?: number | string): number {
  const num = Number(id || Date.now());
  if (!Number.isFinite(num) || num <= 0) return Math.floor(Date.now() / 1000);
  if (num <= 2000000000) return Math.floor(num);
  return 100000000 + (Math.floor(num) % 1800000000);
}

const BATCHES_STORAGE_KEY = 'agastya_batches_v1';
const ATTENDANCE_STORAGE_KEY = 'agastya_attendance_v1';

function loadLocalList(key: string): any[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalList(key: string, list: any[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // ignore storage quota errors
  }
}

const MEMORY_MATERIALS: any[] = [];
const MEMORY_BATCHES: any[] = loadLocalList(BATCHES_STORAGE_KEY);
const MEMORY_ASSESSMENTS: any[] = [];
const MEMORY_NOTICES: any[] = [];
const MEMORY_SUBMISSIONS: any[] = [];
const MEMORY_INTERVENTIONS: any[] = [];
const MEMORY_MEETINGS: any[] = [];
const MEMORY_ATTENDANCE: any[] = loadLocalList(ATTENDANCE_STORAGE_KEY);

export const MASTER_SQL_SCHEMA_SNIPPET = `-- Run in Supabase SQL Editor to ensure all ERP tables exist:
CREATE TABLE IF NOT EXISTS public.meetings (
  id text PRIMARY KEY, title text NOT NULL, type text NOT NULL, target text NOT NULL,
  subject text DEFAULT 'Physics', date text NOT NULL, time text NOT NULL,
  "durationMinutes" integer DEFAULT 30, link text, completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance (
  id text PRIMARY KEY, email text NOT NULL, "studentName" text, batch text,
  date text NOT NULL, status text NOT NULL, "recordedBy" text, created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.materials (
  id bigint PRIMARY KEY, title text NOT NULL, size text, batch text,
  url text, "fileType" text, date text, created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.assessments (
  id bigint PRIMARY KEY, title text NOT NULL, type text, due text,
  batch text, color text, url text, "fileType" text, created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.batches (
  id text PRIMARY KEY, name text NOT NULL, size integer DEFAULT 0,
  "avgScore" integer DEFAULT 0, syllabus text, created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.notices (
  id bigint PRIMARY KEY, msg text NOT NULL, time text, created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.submissions (
  id bigint PRIMARY KEY, student text, batch text, title text,
  date text, status text DEFAULT 'Pending', score integer, created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.interventions (
  id bigint PRIMARY KEY, name text, batch text, issue text,
  metric text, logged boolean DEFAULT false, notes text, created_at timestamptz DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all meetings" ON public.meetings;
CREATE POLICY "Allow all meetings" ON public.meetings FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all attendance" ON public.attendance;
CREATE POLICY "Allow all attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all materials" ON public.materials;
CREATE POLICY "Allow all materials" ON public.materials FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all assessments" ON public.assessments;
CREATE POLICY "Allow all assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all batches" ON public.batches;
CREATE POLICY "Allow all batches" ON public.batches FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all notices" ON public.notices;
CREATE POLICY "Allow all notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all submissions" ON public.submissions;
CREATE POLICY "Allow all submissions" ON public.submissions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all interventions" ON public.interventions;
CREATE POLICY "Allow all interventions" ON public.interventions FOR ALL USING (true) WITH CHECK (true);`;

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase credentials (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are not configured.");
  }
}

function notifyStoreListeners() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('agastya-store-update'));
    window.dispatchEvent(new Event('storage'));
  }
}

export function subscribeToStore(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('agastya-store-update', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('agastya-store-update', callback);
    window.removeEventListener('storage', callback);
  };
}

export function getMaterials() {
  return [...MEMORY_MATERIALS];
}

export async function saveMaterial(mat: any) {
  ensureSupabaseConfigured();
  const payload = {
    ...mat,
    date: mat.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
  const { error } = await supabase.from('materials').insert([payload]);
  if (error) {
    throw new Error(`Supabase materials insert failed: ${error.message}. Please run the Master SQL Schema in Supabase SQL Editor.`);
  }
  MEMORY_MATERIALS.unshift(payload);
  notifyStoreListeners();
}

export async function revokeMaterial(id: number | string) {
  ensureSupabaseConfigured();
  const { error } = await supabase.from('materials').delete().eq('id', id);
  if (error) {
    throw new Error(`Supabase materials delete failed: ${error.message}`);
  }
  const idx = MEMORY_MATERIALS.findIndex((m) => String(m.id) === String(id));
  if (idx !== -1) MEMORY_MATERIALS.splice(idx, 1);
  notifyStoreListeners();
}

export function getBatches() {
  if (MEMORY_BATCHES.length > 0) return [...MEMORY_BATCHES];
  return [
    { id: 'b1', name: "Target NEET 2026 - Alpha", size: 15, avgScore: 88, syllabus: "Rotational Dynamics & Electrostatics" },
    { id: 'b2', name: "Target NEET 2026 - Beta", size: 14, avgScore: 79, syllabus: "Thermodynamics & Kinematics" },
    { id: 'b3', name: "Target JEE 2026 - Alpha", size: 15, avgScore: 84, syllabus: "Electrodynamics & Calculus" },
    { id: 'b4', name: "Foundation 10th - Crash Course", size: 12, avgScore: 76, syllabus: "Mechanics & Optics Foundation" }
  ];
}

export async function saveBatch(batch: any) {
  ensureSupabaseConfigured();
  const payload = {
    ...batch,
    id: String(batch.id || Date.now())
  };
  MEMORY_BATCHES.push(payload);
  saveLocalList(BATCHES_STORAGE_KEY, MEMORY_BATCHES);
  notifyStoreListeners();
}

export function getAssessments() {
  return [...MEMORY_ASSESSMENTS];
}

export async function saveAssessment(asm: any) {
  ensureSupabaseConfigured();
  const { error } = await supabase.from('assessments').insert([asm]);
  if (error) {
    throw new Error(`Supabase assessments insert failed: ${error.message}. Please run the Master SQL Schema in Supabase SQL Editor.`);
  }
  MEMORY_ASSESSMENTS.unshift(asm);
  notifyStoreListeners();
}

export async function updateAssessment(id: number | string, updates: any) {
  ensureSupabaseConfigured();
  const { error } = await supabase.from('assessments').update(updates).eq('id', id);
  if (error) {
    throw new Error(`Supabase assessments update failed: ${error.message}`);
  }
  const idx = MEMORY_ASSESSMENTS.findIndex((a) => String(a.id) === String(id));
  if (idx !== -1) {
    MEMORY_ASSESSMENTS[idx] = { ...MEMORY_ASSESSMENTS[idx], ...updates };
  }
  notifyStoreListeners();
}

export async function deleteAssessment(id: number | string) {
  ensureSupabaseConfigured();
  const { error } = await supabase.from('assessments').delete().eq('id', id);
  if (error) {
    throw new Error(`Supabase assessments delete failed: ${error.message}`);
  }
  const idx = MEMORY_ASSESSMENTS.findIndex((a) => String(a.id) === String(id));
  if (idx !== -1) MEMORY_ASSESSMENTS.splice(idx, 1);
  notifyStoreListeners();
}

export function getNotices() {
  return [...MEMORY_NOTICES];
}

export async function saveNotice(msg: string) {
  ensureSupabaseConfigured();
  const notice = { id: Date.now(), msg, time: new Date().toLocaleTimeString() };
  const { error } = await supabase.from('notices').insert([notice]);
  if (error) {
    throw new Error(`Supabase notices insert failed: ${error.message}. Please run the Master SQL Schema in Supabase SQL Editor.`);
  }
  MEMORY_NOTICES.unshift(notice);
  notifyStoreListeners();
}

export function getSubmissions() {
  return [...MEMORY_SUBMISSIONS];
}

export async function gradeSubmission(id: number | string, score: number) {
  ensureSupabaseConfigured();
  const { error } = await supabase.from('submissions').update({ status: 'Graded', score }).eq('id', id);
  if (error) {
    throw new Error(`Supabase submissions update failed: ${error.message}`);
  }
  const idx = MEMORY_SUBMISSIONS.findIndex((s) => String(s.id) === String(id));
  if (idx !== -1) {
    MEMORY_SUBMISSIONS[idx] = { ...MEMORY_SUBMISSIONS[idx], status: 'Graded', score };
  }
  notifyStoreListeners();
}

export function getInterventions() {
  return [...MEMORY_INTERVENTIONS];
}

export async function logIntervention(id: number | string, notes: string) {
  ensureSupabaseConfigured();
  const { error } = await supabase.from('interventions').update({ logged: true, notes }).eq('id', id);
  if (error) {
    throw new Error(`Supabase interventions update failed: ${error.message}`);
  }
  const idx = MEMORY_INTERVENTIONS.findIndex((i) => String(i.id) === String(id));
  if (idx !== -1) {
    MEMORY_INTERVENTIONS[idx] = { ...MEMORY_INTERVENTIONS[idx], logged: true, notes };
  }
  notifyStoreListeners();
}

export function getMeetings() {
  return [...MEMORY_MEETINGS];
}

export async function saveMeeting(meeting: any) {
  ensureSupabaseConfigured();
  const { error } = await supabase.from('meetings').insert([meeting]);
  if (error) {
    throw new Error(`Supabase meetings insert failed: ${error.message}. Ensure the 'meetings' table has been created in Supabase.`);
  }
  MEMORY_MEETINGS.unshift(meeting);
  notifyStoreListeners();
}

export async function updateMeeting(id: number | string, data: any) {
  ensureSupabaseConfigured();
  const { error } = await supabase.from('meetings').update(data).eq('id', id);
  if (error) {
    throw new Error(`Supabase meetings update failed: ${error.message}`);
  }
  const idx = MEMORY_MEETINGS.findIndex((m) => String(m.id) === String(id));
  if (idx !== -1) {
    MEMORY_MEETINGS[idx] = { ...MEMORY_MEETINGS[idx], ...data };
  }
  notifyStoreListeners();
}

export async function deleteMeeting(id: number | string) {
  ensureSupabaseConfigured();
  const { error } = await supabase.from('meetings').delete().eq('id', id);
  if (error) {
    throw new Error(`Supabase meetings delete failed: ${error.message}`);
  }
  const idx = MEMORY_MEETINGS.findIndex((m) => String(m.id) === String(id));
  if (idx !== -1) {
    MEMORY_MEETINGS.splice(idx, 1);
  }
  notifyStoreListeners();
}

export function getAttendanceLogs() {
  return [...MEMORY_ATTENDANCE];
}

export async function saveAttendanceLogs(newRecords: any[]) {
  ensureSupabaseConfigured();
  MEMORY_ATTENDANCE.unshift(...newRecords);
  saveLocalList(ATTENDANCE_STORAGE_KEY, MEMORY_ATTENDANCE);
  notifyStoreListeners();
}

export function getStudentAttendancePercentage(email: string): number {
  if (!email) return 0;
  const normalized = email.trim().toLowerCase();
  const logs = MEMORY_ATTENDANCE.filter((log) => (log.email || '').trim().toLowerCase() === normalized);
  if (logs.length === 0) return 0;
  const presentCount = logs.filter((log) => log.status === 'Present').length;
  return Math.round((presentCount / logs.length) * 100);
}

// Background sync support
export async function syncAll() {
  if (!isSupabaseConfigured) return;
  try {
    const fetchTable = async (table: string, orderField: string = 'created_at', ascending: boolean = false) => {
      const { data, error } = await supabase.from(table).select('*').order(orderField, { ascending });
      if (!error && Array.isArray(data)) {
        if (table === 'materials') MEMORY_MATERIALS.splice(0, MEMORY_MATERIALS.length, ...data);
        if (table === 'assessments') MEMORY_ASSESSMENTS.splice(0, MEMORY_ASSESSMENTS.length, ...data);
        if (table === 'notices') MEMORY_NOTICES.splice(0, MEMORY_NOTICES.length, ...data);
        if (table === 'submissions') MEMORY_SUBMISSIONS.splice(0, MEMORY_SUBMISSIONS.length, ...data);
        if (table === 'interventions') {
          const cleanInterventions = data.filter((row: any) => row.batch !== PORTAL_USER_BATCH_TAG);
          MEMORY_INTERVENTIONS.splice(0, MEMORY_INTERVENTIONS.length, ...cleanInterventions);
        }
        if (table === 'meetings') MEMORY_MEETINGS.splice(0, MEMORY_MEETINGS.length, ...data);
      }
    };

    await Promise.allSettled([
      fetchTable('meetings'),
      fetchTable('materials', 'id', false),
      fetchTable('assessments', 'id', false),
      fetchTable('notices'),
      fetchTable('submissions', 'id', false),
      fetchTable('interventions', 'id', false),
    ]);
    notifyStoreListeners();
  } catch (e) {
    console.warn("Supabase sync warning:", e);
  }
}

// Kick off background sync at module load
syncAll();
