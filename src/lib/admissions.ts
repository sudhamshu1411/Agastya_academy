import { supabase } from "../supabaseClient";

export async function getAdmissions() {
  const { data, error } = await supabase.from('admissions').select('*');
  if (error) {
    console.error("Error fetching admissions:", error);
    return [];
  }
  // Try to sort by date or created_at if possible in JS
  return (data || []).sort((a, b) => {
    const timeA = new Date(a.created_at || a.date || 0).getTime();
    const timeB = new Date(b.created_at || b.date || 0).getTime();
    return timeB - timeA;
  });
}

export async function saveAdmission(admission: any) {
  const { error } = await supabase.from('admissions').insert([admission]);
  if (error) {
    console.error("Error saving admission:", error);
    throw new Error(error.message);
  }
}

export async function updateAdmissionStatus(id: string, newStatus: string) {
  const { error } = await supabase.from('admissions').update({ status: newStatus }).eq('id', id);
  if (error) {
    console.error("Error updating admission status:", error);
  }
}

export async function deleteAdmissionByEmail(email: string) {
  const { error } = await supabase.from('admissions').delete().eq('email', email);
  if (error) {
    console.error("Error deleting admission:", error);
  }
}

export async function deleteAdmissionById(id: string) {
  const { error } = await supabase.from('admissions').delete().eq('id', id);
  if (error) {
    console.error("Error deleting admission:", error);
  }
}

export async function updateAdmissionByEmail(email: string, updates: any) {
  const { error } = await supabase.from('admissions').update(updates).eq('email', email);
  if (error) {
    console.error("Error updating admission by email:", error);
  }
}
