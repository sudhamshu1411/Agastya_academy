import {
  supabase,
  isSupabaseConfigured,
  fetchCloudPortalUsers,
  upsertCloudPortalUser,
  deleteCloudPortalUser,
  emailToDeterministicUuid,
} from './supabase';

export const INITIAL_USERS = [
  { email: "student@agastya.edu", role: "student", fullName: "Demo Student", phone: "" },
];

const MEMORY_USERS: any[] = [];

export async function fetchProfiles() {
  if (!isSupabaseConfigured) {
    return [];
  }

  const [{ data, error }, cloudPortalUsers] = await Promise.all([
    supabase.from('profiles').select('*'),
    fetchCloudPortalUsers(),
  ]);

  if (error) {
    console.warn("Warning fetching profiles:", error.message);
  }

  const mergedByEmail = new Map<string, any>();

  if (Array.isArray(data)) {
    for (const d of data) {
      const emailKey = (d.email || '').trim().toLowerCase();
      if (!emailKey) continue;
      mergedByEmail.set(emailKey, {
        email: d.email,
        fullName: d.full_name,
        role: d.role || 'new user',
        id: d.id,
        phone: d.phone || "",
      });
    }
  }

  for (const cu of cloudPortalUsers) {
    const emailKey = (cu.email || '').trim().toLowerCase();
    if (!emailKey) continue;
    const existing = mergedByEmail.get(emailKey);
    mergedByEmail.set(emailKey, {
      id: existing?.id || cu.id || emailToDeterministicUuid(emailKey),
      email: existing?.email || cu.email,
      fullName: cu.fullName || existing?.fullName || emailKey.split('@')[0],
      role: cu.role || existing?.role || 'new user',
      phone: cu.phone || existing?.phone || "",
    });
  }

  const mapped = Array.from(mergedByEmail.values());
  MEMORY_USERS.splice(0, MEMORY_USERS.length, ...mapped);
  return [...MEMORY_USERS];
}

export function getValidUsers() {
  if (MEMORY_USERS.length > 0) return [...MEMORY_USERS];
  return INITIAL_USERS;
}

export async function registerUser(user: any) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase URL is not configured.");
  }
  const email = (user.email || '').trim().toLowerCase();
  const id = user.id || emailToDeterministicUuid(email);
  await upsertCloudPortalUser({
    id,
    email,
    fullName: user.fullName || email.split('@')[0],
    role: user.role || 'new user',
    phone: user.phone || '',
    created_at: new Date().toISOString(),
  });
  await supabase.from('profiles').upsert([
    {
      id,
      email: user.email,
      full_name: user.fullName,
      role: user.role || 'new user',
      phone: user.phone || '',
    }
  ]);
  await fetchProfiles();
}

export async function deleteUserRow(id: string, email: string) {
  if (!isSupabaseConfigured || (!id && !email)) {
    throw new Error("Cannot delete user: missing user ID or Supabase configuration.");
  }
  if (email) {
    await deleteCloudPortalUser(email);
  }
  if (id) {
    await supabase.rpc('delete_user', { user_id: id }).then(() => {}, () => {});
    await supabase.from('profiles').delete().eq('id', id);
  }
  const idx = MEMORY_USERS.findIndex((u) => u.id === id || u.email === email);
  if (idx !== -1) MEMORY_USERS.splice(idx, 1);
}

export async function deleteUser(email: string) {
  const user = MEMORY_USERS.find((u) => u.email === email);
  await deleteCloudPortalUser(email);
  if (user?.id) {
    await deleteUserRow(user.id, email);
  } else {
    await supabase.from('profiles').delete().eq('email', email);
  }
}

export async function updateUserRoleAsync(id: string, email: string, role: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Cannot update role: missing Supabase configuration.");
  }
  const existing = MEMORY_USERS.find((u) => u.id === id || (u.email || '').toLowerCase() === (email || '').toLowerCase());
  const cleanEmail = (email || existing?.email || '').trim().toLowerCase();
  if (cleanEmail) {
    await upsertCloudPortalUser({
      id: id || existing?.id || emailToDeterministicUuid(cleanEmail),
      email: cleanEmail,
      fullName: existing?.fullName || cleanEmail.split('@')[0],
      phone: existing?.phone || '',
      role,
      created_at: new Date().toISOString(),
    });
  }
  if (id) {
    const { error } = await supabase.rpc('update_user_role', { target_user_id: id, new_role: role });
    if (error) {
      await supabase.from('profiles').update({ role }).eq('id', id);
    }
  }
  const idx = MEMORY_USERS.findIndex((u) => u.id === id || u.email === email);
  if (idx !== -1) {
    MEMORY_USERS[idx] = { ...MEMORY_USERS[idx], role };
  }
}

export async function updateUserRole(email: string, role: string) {
  const user = MEMORY_USERS.find((u) => u.email === email);
  await updateUserRoleAsync(user?.id || emailToDeterministicUuid(email), email, role);
}

export async function updateUser(email: string, updates: any) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase URL is not configured.");
  }
  const cleanEmail = (email || '').trim().toLowerCase();
  const existing = MEMORY_USERS.find((u) => (u.email || '').toLowerCase() === cleanEmail);
  if (cleanEmail) {
    await upsertCloudPortalUser({
      id: existing?.id || emailToDeterministicUuid(cleanEmail),
      email: cleanEmail,
      fullName: updates.fullName !== undefined ? updates.fullName : (existing?.fullName || cleanEmail.split('@')[0]),
      phone: updates.phone !== undefined ? updates.phone : (existing?.phone || ''),
      role: updates.role !== undefined ? updates.role : (existing?.role || 'new user'),
      created_at: new Date().toISOString(),
    });
  }

  const payload: any = {};
  if (updates.fullName !== undefined) payload.full_name = updates.fullName;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.role !== undefined) payload.role = updates.role;

  if (Object.keys(payload).length > 0) {
    await supabase.from('profiles').update(payload).eq('email', email);
  }
  await fetchProfiles();
}

// Preload profiles cache
fetchProfiles().catch(() => {});
