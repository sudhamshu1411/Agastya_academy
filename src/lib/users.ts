import { supabase } from './supabase';

export const INITIAL_USERS = [
  { email: "student@agastya.edu", role: "student", fullName: "Demo Student" },
];

export async function fetchProfiles() {
  if (import.meta.env.VITE_SUPABASE_URL) {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      return data.map(d => ({
        email: d.email,
        fullName: d.full_name,
        role: d.role,
        id: d.id,
      }));
    }
  }
  return [];
}

export function getValidUsers() {
  return [];
}

export async function registerUser(user: any) {
  // Not used in pure supabase setup; signup handles this via triggers or directly
}

export async function deleteUserRow(id: string, email: string) {
  if (import.meta.env.VITE_SUPABASE_URL && id) {
     await supabase.rpc('delete_user', { user_id: id }); 
     await supabase.from('profiles').delete().eq('id', id);
  }
}

export function deleteUser(email: string) {
}

export async function updateUserRoleAsync(id: string, email: string, role: string) {
  if (import.meta.env.VITE_SUPABASE_URL && id) {
    await supabase.from('profiles').update({ role }).eq('id', id);
  }
}

export function updateUserRole(email: string, role: string) {
}

export function updateUser(email: string, updates: any) {
}
