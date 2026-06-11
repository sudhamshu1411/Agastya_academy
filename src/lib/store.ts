import { supabase } from './supabase';

const MEMORY_MATERIALS: any[] = [];
const MEMORY_BATCHES: any[] = [];
const MEMORY_ASSESSMENTS: any[] = [];
const MEMORY_NOTICES: any[] = [];
const MEMORY_SUBMISSIONS: any[] = [];
const MEMORY_INTERVENTIONS: any[] = [];
const MEMORY_MEETINGS: any[] = [];
const MEMORY_ATTENDANCE: any[] = [];

export function getMaterials() {
  return MEMORY_MATERIALS;
}

export async function saveMaterial(mat: any) {
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('materials').insert([mat]);
     } catch (e) { console.warn("Supabase insert failed", e); }
  }
}

export async function revokeMaterial(id: number) {
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('materials').delete().eq('id', id);
     } catch (e) { console.warn("Supabase delete failed", e); }
  }
}

export function getBatches() {
  if (MEMORY_BATCHES.length > 0) return MEMORY_BATCHES;
  return [
    { id: 'b1', name: "Target NEET 2026 - Alpha" },
    { id: 'b2', name: "Target NEET 2026 - Beta" },
    { id: 'b3', name: "Target JEE 2026 - Alpha" },
    { id: 'b4', name: "Foundation 10th - Crash Course" }
  ];
}

export async function saveBatch(batch: any) {
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('batches').insert([batch]);
     } catch (e) { console.warn("Supabase insert failed", e); }
  }
}

export function getAssessments() {
  return MEMORY_ASSESSMENTS;
}

export async function saveAssessment(asm: any) {
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('assessments').insert([asm]);
     } catch (e) { console.warn("Supabase insert failed", e); }
  }
}

export async function deleteAssessment(id: number) {
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('assessments').delete().eq('id', id);
     } catch (e) { console.warn("Supabase delete failed", e); }
  }
}

export function getNotices() {
  return MEMORY_NOTICES;
}

export async function saveNotice(msg: string) {
  const notice = { id: Date.now(), msg, time: new Date().toLocaleTimeString() };
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('notices').insert([notice]);
     } catch (e) { console.warn("Supabase insert failed", e); }
  }
}

export function getSubmissions() {
  return MEMORY_SUBMISSIONS;
}

export async function gradeSubmission(id: number, score: number) {
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('submissions').update({ status: 'Graded', score }).eq('id', id);
     } catch (e) { console.warn("Supabase update failed", e); }
  }
}

export function getInterventions() {
  return MEMORY_INTERVENTIONS;
}

export async function logIntervention(id: number, notes: string) {
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('interventions').update({ logged: true, notes }).eq('id', id);
     } catch (e) { console.warn("Supabase update failed", e); }
  }
}

export function getMeetings() {
  return MEMORY_MEETINGS;
}

export async function saveMeeting(meeting: any) {
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('meetings').insert([meeting]);
     } catch (e) {
       console.warn("Supabase insert failed", e);
     }
  }
}

export async function updateMeeting(id: number | string, data: any) {
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('meetings').update(data).eq('id', id);
     } catch (e) {
       console.warn("Supabase update failed", e);
     }
  }
}

export async function deleteMeeting(id: number | string) {
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('meetings').delete().eq('id', id);
     } catch (e) {
       console.warn("Supabase delete failed", e);
     }
  }
}

// Background sync support
export async function syncAll() {
  if (!import.meta.env.VITE_SUPABASE_URL) return;
  try {
    const fetchTable = async (table: string, orderField: string = 'created_at', ascending: boolean = false) => {
      const { data, error } = await supabase.from(table).select('*').order(orderField, { ascending });
      if (!error && data && data.length > 0) {
        if (table === 'materials') MEMORY_MATERIALS.splice(0, MEMORY_MATERIALS.length, ...data);
        if (table === 'batches') MEMORY_BATCHES.splice(0, MEMORY_BATCHES.length, ...data);
        if (table === 'assessments') MEMORY_ASSESSMENTS.splice(0, MEMORY_ASSESSMENTS.length, ...data);
        if (table === 'notices') MEMORY_NOTICES.splice(0, MEMORY_NOTICES.length, ...data);
        if (table === 'submissions') MEMORY_SUBMISSIONS.splice(0, MEMORY_SUBMISSIONS.length, ...data);
        if (table === 'interventions') MEMORY_INTERVENTIONS.splice(0, MEMORY_INTERVENTIONS.length, ...data);
        if (table === 'meetings') MEMORY_MEETINGS.splice(0, MEMORY_MEETINGS.length, ...data);
        if (table === 'attendance') MEMORY_ATTENDANCE.splice(0, MEMORY_ATTENDANCE.length, ...data);
      }
    };
    
    await Promise.all([
      fetchTable('meetings'),
      fetchTable('materials', 'id', true),
      fetchTable('assessments', 'id', true),
      fetchTable('notices'),
      fetchTable('submissions', 'id', true),
      fetchTable('interventions', 'id', true),
      fetchTable('attendance')
    ]);
  } catch (e) {
    console.warn("Supabase fetch failed", e);
  }
}

// Kick off background sync at module load
syncAll();

export function getAttendanceLogs() {
  return MEMORY_ATTENDANCE;
}

export function saveAttendanceLogs(newRecords: any[]) {
}

export function getStudentAttendancePercentage(email: string): number {
  return 0;
}




