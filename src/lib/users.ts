import { supabase, isSupabaseConfigured } from './supabase';

export const INITIAL_USERS = [
  { email: "student@agastya.edu", role: "student", fullName: "Demo Student", phone: "" },
];

const MEMORY_USERS: any[] = [];

export async function fetchProfiles() {
  if (!isSupabaseConfigured) {
    return [];
  }
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error("Error fetching profiles:", error.message);
    return [...MEMORY_USERS];
  }
  if (data) {
    const mapped = data.map((d) => ({
      email: d.email,
      fullName: d.full_name,
      role: d.role,
      id: d.id,
      phone: d.phone || "",
    }));
    MEMORY_USERS.splice(0, MEMORY_USERS.length, ...mapped);
    return [...MEMORY_USERS];
  }
  return [];
}

export function getValidUsers() {
  if (MEMORY_USERS.length > 0) return [...MEMORY_USERS];
  return INITIAL_USERS;
}

export async function registerUser(user: any) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase URL is not configured.");
  }
  const { error } = await supabase.from('profiles').upsert([
    {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role || 'new user',
      phone: user.phone || '',
    }
  ]);
  if (error) {
    throw new Error("Failed to register profile in Supabase: " + error.message);
  }
  await fetchProfiles();
}

export async function deleteUserRow(id: string, email: string) {
  if (!isSupabaseConfigured || !id) {
    throw new Error("Cannot delete user: missing user ID or Supabase configuration.");
  }
  const { error: rpcError } = await supabase.rpc('delete_user', { user_id: id });
  if (rpcError) {
    console.warn("delete_user RPC warning:", rpcError.message);
  }
  const { error: delError } = await supabase.from('profiles').delete().eq('id', id);
  if (delError) {
    throw new Error("Failed to delete user profile: " + delError.message);
  }
  const idx = MEMORY_USERS.findIndex((u) => u.id === id || u.email === email);
  if (idx !== -1) MEMORY_USERS.splice(idx, 1);
}

export async function deleteUser(email: string) {
  const user = MEMORY_USERS.find((u) => u.email === email);
  if (user?.id) {
    await deleteUserRow(user.id, email);
  } else {
    const { error } = await supabase.from('profiles').delete().eq('email', email);
    if (error) throw new Error("Failed to delete user by email: " + error.message);
  }
}

export async function updateUserRoleAsync(id: string, email: string, role: string) {
  if (!isSupabaseConfigured || !id) {
    throw new Error("Cannot update role: missing user ID or Supabase configuration.");
  }
  const { error } = await supabase.rpc('update_user_role', { target_user_id: id, new_role: role });
  if (error) {
    console.warn("Error updating user role (RPC):", error);
    const { error: fallbackError, data: updated } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select();
    if (fallbackError || !updated || updated.length === 0) {
      throw new Error(
        "Failed to update role. Ensure you have run the Master SQL Schema in Supabase SQL Editor. Error: " +
          (fallbackError?.message || error.message)
      );
    }
  }
  const idx = MEMORY_USERS.findIndex((u) => u.id === id || u.email === email);
  if (idx !== -1) {
    MEMORY_USERS[idx] = { ...MEMORY_USERS[idx], role };
  }
}

export async function updateUserRole(email: string, role: string) {
  const user = MEMORY_USERS.find((u) => u.email === email);
  if (user?.id) {
    await updateUserRoleAsync(user.id, email, role);
  }
}

export async function updateUser(email: string, updates: any) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase URL is not configured.");
  }
  const payload: any = {};
  if (updates.fullName !== undefined) payload.full_name = updates.fullName;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.role !== undefined) payload.role = updates.role;

  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase.from('profiles').update(payload).eq('email', email);
  if (error) {
    throw new Error("Failed to update user profile: " + error.message);
  }
  await fetchProfiles();
}

// Preload profiles cache
fetchProfiles().catch(() => {});
