import { supabase } from './supabase';

export function getMaterials() {
  try {
    const data = localStorage.getItem('agastya_materials');
    if (data) return JSON.parse(data);
  } catch (e) {}
  const initial = [
    { id: 1, title: "Mechanics Final Notes.pdf", size: "2.4 MB", batch: "Alpha Batch", date: "Today" },
    { id: 2, title: "Thermodynamics Ref Sheet.pdf", size: "1.1 MB", batch: "Beta Batch", date: "Yesterday" },
    { id: 3, title: "Rotational Dynamics DPP-14.pdf", size: "450 KB", batch: "All Classes", date: "2 days ago" },
    { id: 4, title: "Waves and Sound Checklist.pdf", size: "800 KB", batch: "Alpha Batch", date: "3 days ago" },
    { id: 5, title: "Electrostatics Mind Map.jpg", size: "3.2 MB", batch: "All Classes", date: "1 week ago" },
    { id: 6, title: "Current Electricity Assignment.pdf", size: "1.5 MB", batch: "Beta Batch", date: "1 week ago" }
  ];
  return initial;
}

export async function saveMaterial(mat: any) {
  const materials = getMaterials();
  materials.push(mat);
  localStorage.setItem('agastya_materials', JSON.stringify(materials));
  window.dispatchEvent(new Event('storage'));
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('materials').insert([mat]);
     } catch (e) { console.warn("Supabase insert failed", e); }
  }
}

export async function revokeMaterial(id: number) {
  const materials = getMaterials();
  localStorage.setItem('agastya_materials', JSON.stringify(materials.filter((m:any) => m.id !== id)));
  window.dispatchEvent(new Event('storage'));
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('materials').delete().eq('id', id);
     } catch (e) { console.warn("Supabase delete failed", e); }
  }
}

export function getBatches() {
  try {
    const data = localStorage.getItem('agastya_batches');
    if (data) return JSON.parse(data);
  } catch (e) {}
  const initial = [
    { id: 1, name: "Alpha Batch (NEET RM)", size: 15, avgScore: 88, syllabus: "Mechanics, Rotational Dynamics" },
    { id: 2, name: "Beta Batch", size: 14, avgScore: 74, syllabus: "Thermodynamics" }
  ];
  return initial;
}

export async function saveBatch(batch: any) {
  const batches = getBatches();
  batches.push(batch);
  localStorage.setItem('agastya_batches', JSON.stringify(batches));
  window.dispatchEvent(new Event('storage'));
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('batches').insert([batch]);
     } catch (e) { console.warn("Supabase insert failed", e); }
  }
}

export function getAssessments() {
  try {
    const data = localStorage.getItem('agastya_assessments');
    if (data) return JSON.parse(data);
  } catch (e) {}
  const initial = [
    { id: 1, type: "Quiz", due: "2 Days", title: "Rotational Dynamics Quiz 4", batch: "Alpha Batch", color: "amber" },
    { id: 2, type: "DPP", due: "Tomorrow", title: "Mechanics DPP 08", batch: "All Classes", color: "blue" },
  ];
  return initial;
}

export async function saveAssessment(asm: any) {
  const assessments = getAssessments();
  assessments.push(asm);
  localStorage.setItem('agastya_assessments', JSON.stringify(assessments));
  window.dispatchEvent(new Event('storage'));
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('assessments').insert([asm]);
     } catch (e) { console.warn("Supabase insert failed", e); }
  }
}

export async function deleteAssessment(id: number) {
  const assessments = getAssessments();
  localStorage.setItem('agastya_assessments', JSON.stringify(assessments.filter((a:any) => a.id !== id)));
  window.dispatchEvent(new Event('storage'));
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('assessments').delete().eq('id', id);
     } catch (e) { console.warn("Supabase delete failed", e); }
  }
}

export function getNotices() {
  try {
    const data = localStorage.getItem('agastya_notices');
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
}

export async function saveNotice(msg: string) {
  const notices = getNotices();
  const notice = { id: Date.now(), msg, time: new Date().toLocaleTimeString() };
  notices.unshift(notice);
  localStorage.setItem('agastya_notices', JSON.stringify(notices));
  window.dispatchEvent(new Event('storage'));
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('notices').insert([notice]);
     } catch (e) { console.warn("Supabase insert failed", e); }
  }
}

export function getSubmissions() {
  try {
    const data = localStorage.getItem('agastya_submissions');
    if (data) return JSON.parse(data);
  } catch (e) {}
  const initial = [
    { id: 1, student: "Vikram Desai", batch: "Beta Batch", title: "Mechanics DPP 07", date: "May 29, 2026", status: "Pending", score: null },
    { id: 2, student: "Rahul Sharma", batch: "Alpha Batch", title: "Rotational Dynamics Quiz", date: "May 28, 2026", status: "Graded", score: 85 },
    { id: 3, student: "Sneha Patel", batch: "Alpha Batch", title: "Rotational Dynamics Quiz", date: "May 28, 2026", status: "Pending", score: null },
  ];
  return initial;
}

export async function gradeSubmission(id: number, score: number) {
  const submissions = getSubmissions();
  const updated = submissions.map((s: any) => s.id === id ? { ...s, status: 'Graded', score } : s);
  localStorage.setItem('agastya_submissions', JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('submissions').update({ status: 'Graded', score }).eq('id', id);
     } catch (e) { console.warn("Supabase update failed", e); }
  }
}

export function getInterventions() {
  try {
    const data = localStorage.getItem('agastya_interventions');
    if (data) return JSON.parse(data);
  } catch (e) {}
  const initial = [
    { id: 1, name: "Vikram Desai", batch: "Beta Batch", issue: "Scored < 40% in last 3 Mechanics DPPs", metric: "38% Avg", logged: false, notes: null },
    { id: 2, name: "Rahul Sharma", batch: "Alpha Batch", issue: "Missed last 2 live lectures on Rotational Dynamics", metric: "Attendance", logged: false, notes: null }
  ];
  return initial;
}

export async function logIntervention(id: number, notes: string) {
  const interventions = getInterventions();
  const updated = interventions.map((s: any) => s.id === id ? { ...s, logged: true, notes } : s);
  localStorage.setItem('agastya_interventions', JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('interventions').update({ logged: true, notes }).eq('id', id);
     } catch (e) { console.warn("Supabase update failed", e); }
  }
}

export function getMeetings() {
  const todayDate = new Date().toISOString().split('T')[0];
  const initial = [
    { id: "1", title: "Live Class: Rotational Dynamics", type: "Live Class", time: "09:00 AM", date: todayDate, durationMinutes: 60, target: "Target NEET 2026 - Alpha", link: "https://meet.new", completed: false },
    { id: "2", title: "PTM - Rahul Sharma", type: "PTM", time: "05:00 PM", date: todayDate, durationMinutes: 30, target: "Rahul Sharma", link: "https://meet.new", completed: false }
  ];
  let meetings = initial;
  try {
    const data = localStorage.getItem('agastya_meetings');
    if (data) {
      meetings = JSON.parse(data);
    }
  } catch (e) {}

  return meetings.map((m: any) => ({
    ...m,
    link: m.link && m.link.includes('abc-defg-hij') ? 'https://meet.new' : 
          m.link && m.link.includes('xyz-uvwx-qrs') ? 'https://meet.new' : m.link
  }));
}

export async function saveMeeting(meeting: any) {
  const meetings = getMeetings();
  meetings.unshift(meeting);
  localStorage.setItem('agastya_meetings', JSON.stringify(meetings));
  window.dispatchEvent(new Event('storage'));
  
  if (import.meta.env.VITE_SUPABASE_URL) {
     try {
       await supabase.from('meetings').insert([meeting]);
     } catch (e) {
       console.warn("Supabase insert failed", e);
     }
  }
}

// Background sync support
export async function syncAll() {
  if (!import.meta.env.VITE_SUPABASE_URL) return;
  try {
    const fetchTable = async (table: string, key: string, orderField: string = 'created_at', ascending: boolean = false) => {
      const { data, error } = await supabase.from(table).select('*').order(orderField, { ascending });
      if (!error && data && data.length > 0) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    };
    
    await Promise.all([
      fetchTable('meetings', 'agastya_meetings'),
      fetchTable('materials', 'agastya_materials', 'id', true),
      fetchTable('assessments', 'agastya_assessments', 'id', true),
      fetchTable('notices', 'agastya_notices'),
      fetchTable('submissions', 'agastya_submissions', 'id', true),
      fetchTable('interventions', 'agastya_interventions', 'id', true)
    ]);
    
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn("Supabase fetch failed", e);
  }
}

// Kick off background sync at module load
syncAll();

export function getAttendanceLogs() {
  try {
    const data = localStorage.getItem('agastya_attendance');
    if (data) return JSON.parse(data);
  } catch (e) {}
  
  // Create beautiful, rich initial mock historical data so the logs look alive and functional
  const getPastDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };
  
  const initial = [
    { id: "att-1", email: "student@agastya.edu", studentName: "Rahul Sharma", batch: "Alpha RM", date: getPastDate(1), status: "Present", recordedBy: "Demo Faculty" },
    { id: "att-2", email: "student@agastya.edu", studentName: "Rahul Sharma", batch: "Alpha RM", date: getPastDate(2), status: "Present", recordedBy: "Demo Faculty" },
    { id: "att-3", email: "student@agastya.edu", studentName: "Rahul Sharma", batch: "Alpha RM", date: getPastDate(3), status: "Present", recordedBy: "Demo Faculty" },
    { id: "att-4", email: "student@agastya.edu", studentName: "Rahul Sharma", batch: "Alpha RM", date: getPastDate(4), status: "Absent", recordedBy: "Demo Faculty" },
    { id: "att-5", email: "student@agastya.edu", studentName: "Rahul Sharma", batch: "Alpha RM", date: getPastDate(5), status: "Present", recordedBy: "Demo Faculty" },
    { id: "att-6", email: "student@agastya.edu", studentName: "Rahul Sharma", batch: "Alpha RM", date: getPastDate(6), status: "Present", recordedBy: "Demo Faculty" },
    { id: "att-7", email: "student@agastya.edu", studentName: "Rahul Sharma", batch: "Alpha RM", date: getPastDate(7), status: "Present", recordedBy: "System (RFID)" },
    
    { id: "att-8", email: "priyanka@example.com", studentName: "Priyanka Desai", batch: "Alpha RM", date: getPastDate(1), status: "Present", recordedBy: "Demo Faculty" },
    { id: "att-9", email: "priyanka@example.com", studentName: "Priyanka Desai", batch: "Alpha RM", date: getPastDate(2), status: "Present", recordedBy: "Demo Faculty" },
    { id: "att-10", email: "priyanka@example.com", studentName: "Priyanka Desai", batch: "Alpha RM", date: getPastDate(3), status: "Absent", recordedBy: "Demo Faculty" },
    
    { id: "att-11", email: "sanya@example.com", studentName: "Sanya Malik", batch: "Alpha RM", date: getPastDate(1), status: "Present", recordedBy: "Demo Faculty" },
    { id: "att-12", email: "sanya@example.com", studentName: "Sanya Malik", batch: "Alpha RM", date: getPastDate(2), status: "Present", recordedBy: "Demo Faculty" },

    { id: "att-13", email: "ananya@example.com", studentName: "Ananya Singh", batch: "Gamma", date: getPastDate(1), status: "Present", recordedBy: "Demo Faculty" },
    { id: "att-14", email: "ananya@example.com", studentName: "Ananya Singh", batch: "Gamma", date: getPastDate(2), status: "Absent", recordedBy: "Demo Faculty" },
  ];
  
  localStorage.setItem('agastya_attendance', JSON.stringify(initial));
  return initial;
}

export function saveAttendanceLogs(newRecords: any[]) {
  const logs = getAttendanceLogs();
  
  // Avoid duplicating records for the exact same email + date combination
  const keys = new Set(newRecords.map(r => `${r.email}_${r.date}`));
  const filteredExisting = logs.filter((l: any) => !keys.has(`${l.email}_${l.date}`));
  const updated = [...newRecords, ...filteredExisting];
  
  localStorage.setItem('agastya_attendance', JSON.stringify(updated));
  window.dispatchEvent(new Event('storage'));
}

export function getStudentAttendancePercentage(email: string): number {
  const logs = getAttendanceLogs();
  const studentLogs = logs.filter((log: any) => log.email === email);
  if (studentLogs.length === 0) {
    if (email.includes("priyanka")) return 96.0;
    if (email.includes("ananya")) return 90.0;
    if (email.includes("student@agastya") || email.includes("student")) return 98.0;
    return 95.0;
  }
  const presentCount = studentLogs.filter((log: any) => log.status === 'Present').length;
  return parseFloat(((presentCount / studentLogs.length) * 100).toFixed(1));
}



