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
        phone: d.phone || "",
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
    const { error } = await supabase.rpc('update_user_role', { target_user_id: id, new_role: role });
    if (error) {
       console.error("Error updating user role (RPC):", error);
       // Fallback for local / mock
       const { error: fallbackError, data: updated } = await supabase.from('profiles').update({ role }).eq('id', id).select();
       if (fallbackError || !updated || updated.length === 0) {
         throw new Error("Failed to update role. Ensure you've run the LATEST update-role-schema.sql in Supabase SQL editor. Error: " + (error.message));
       }
    }
  }
}

export function updateUserRole(email: string, role: string) {
}

export async function updateUser(email: string, updates: any) {
  if (import.meta.env.VITE_SUPABASE_URL) {
    const payload: any = {};
    if (updates.fullName) payload.full_name = updates.fullName;
    if (updates.phone) payload.phone = updates.phone;
    
    // Check if empty payload
    if (Object.keys(payload).length === 0) return;

    await supabase.from('profiles').update(payload).eq('email', email);
  }
}
