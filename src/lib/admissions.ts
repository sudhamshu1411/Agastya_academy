export const INITIAL_ADMISSIONS = [
  { id: "APP-2026-001", email: "priyanka@example.com", studentName: "Priyanka Desai", previousSchool: "DPS", cohort: "Alpha RM", parentContact: "+91 98765 43210", status: "Admitted", date: "May 29, 2026" },
  { id: "APP-2026-002", email: "avinash@example.com", studentName: "Avinash Kumar", previousSchool: "Kavya School", cohort: "Beta", parentContact: "+91 99887 76655", status: "Pending Review", date: "May 28, 2026" },
  { id: "APP-2026-003", email: "sanya@example.com", studentName: "Sanya Malik", previousSchool: "Modern School", cohort: "Alpha RM", parentContact: "+91 91234 56789", status: "Interview Scheduled", date: "May 28, 2026" },
  { id: "APP-2026-004", email: "rohan@example.com", studentName: "Rohan Gupta", previousSchool: "DPS", cohort: "Crash '25", parentContact: "+91 94567 12389", status: "Rejected", date: "May 25, 2026" },
  { id: "APP-2026-005", email: "ananya@example.com", studentName: "Ananya Singh", previousSchool: "St. Xavier's", cohort: "Gamma", parentContact: "+91 97777 55555", status: "Admitted", date: "May 24, 2026" },
];

export function getAdmissions() {
  try {
    const data = localStorage.getItem('admissions_logs');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem('admissions_logs', JSON.stringify(INITIAL_ADMISSIONS));
  return INITIAL_ADMISSIONS;
}

export function saveAdmission(admission: any) {
  const data = getAdmissions();
  data.unshift(admission);
  localStorage.setItem('admissions_logs', JSON.stringify(data));
}

export function updateAdmissionStatus(id: string, newStatus: string) {
  const data = getAdmissions();
  const index = data.findIndex((log: any) => log.id === id);
  if (index !== -1) {
    data[index].status = newStatus;
    localStorage.setItem('admissions_logs', JSON.stringify(data));
  }
}

export function deleteAdmissionByEmail(email: string) {
  const data = getAdmissions();
  const updated = data.filter((log: any) => log.email !== email);
  localStorage.setItem('admissions_logs', JSON.stringify(updated));
}

export function deleteAdmissionById(id: string) {
  const data = getAdmissions();
  const updated = data.filter((log: any) => log.id !== id);
  localStorage.setItem('admissions_logs', JSON.stringify(updated));
}

export function updateAdmissionByEmail(email: string, updates: any) {
  const data = getAdmissions();
  const index = data.findIndex((log: any) => log.email === email);
  if (index !== -1) {
    data[index] = { ...data[index], ...updates };
    localStorage.setItem('admissions_logs', JSON.stringify(data));
  }
}
