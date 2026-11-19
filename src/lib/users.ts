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

  const deletedEmails = new Set<string>();
  for (const cu of cloudPortalUsers) {
    const emailKey = (cu.email || '').trim().toLowerCase();
    if (!emailKey) continue;
    if (cu.deleted || cu.role === '__DELETED__') {
      deletedEmails.add(emailKey);
    }
  }

  const mergedByEmail = new Map<string, any>();

  if (Array.isArray(data)) {
    for (const d of data) {
      const emailKey = (d.email || '').trim().toLowerCase();
      if (!emailKey || deletedEmails.has(emailKey)) continue;
      mergedByEmail.set(emailKey, {
        email: d.email,
        fullName: d.full_name || '',
        role: d.role || 'new user',
        id: d.id,
        phone: d.phone || "",
      });
    }
  }

  for (const cu of cloudPortalUsers) {
    const emailKey = (cu.email || '').trim().toLowerCase();
    if (!emailKey || deletedEmails.has(emailKey)) continue;
    const existing = mergedByEmail.get(emailKey);
    mergedByEmail.set(emailKey, {
      id: existing?.id || cu.id || emailToDeterministicUuid(emailKey),
      email: existing?.email || cu.email,
      fullName: cu.fullName !== undefined && cu.fullName !== '' ? cu.fullName : (existing?.fullName || emailKey.split('@')[0]),
      role: cu.role && cu.role !== '__DELETED__' ? cu.role : (existing?.role || 'new user'),
      phone: cu.phone !== undefined ? cu.phone : (existing?.phone || ""),
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
    deleted: false,
    created_at: new Date().toISOString(),
  });
  await supabase.from('profiles').upsert([
    {
      id,
      email: user.email,
      full_name: user.fullName,
      role: user.role || 'new user',
    }
  ]);
  await fetchProfiles();
}

export async function deleteUserRow(id: string, email: string) {
  if (!isSupabaseConfigured || (!id && !email)) {
    throw new Error("Cannot delete user: missing user ID or Supabase configuration.");
  }
  const cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail) {
    await deleteCloudPortalUser(cleanEmail);
  }
  if (id) {
    await supabase.rpc('delete_user', { user_id: id }).then(() => {}, () => {});
    await supabase.from('profiles').delete().eq('id', id);
  }
  if (cleanEmail) {
    await supabase.from('profiles').delete().eq('email', email);
  }
  const idx = MEMORY_USERS.findIndex(
    (u) => u.id === id || (u.email || '').toLowerCase() === cleanEmail
  );
  if (idx !== -1) MEMORY_USERS.splice(idx, 1);
}

export async function deleteUser(email: string) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const user = MEMORY_USERS.find((u) => (u.email || '').toLowerCase() === cleanEmail);
  await deleteUserRow(user?.id || emailToDeterministicUuid(cleanEmail), email);
}

export async function updateUserRoleAsync(id: string, email: string, role: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Cannot update role: missing Supabase configuration.");
  }
  const cleanEmail = (email || '').trim().toLowerCase();
  const existing = MEMORY_USERS.find(
    (u) => u.id === id || (u.email || '').toLowerCase() === cleanEmail
  );
  const resolvedEmail = cleanEmail || (existing?.email || '').trim().toLowerCase();
  if (resolvedEmail) {
    await upsertCloudPortalUser({
      id: id || existing?.id || emailToDeterministicUuid(resolvedEmail),
      email: resolvedEmail,
      fullName: existing?.fullName || resolvedEmail.split('@')[0],
      phone: existing?.phone || '',
      role,
      deleted: false,
      created_at: new Date().toISOString(),
    });
  }
  if (id) {
    const { error } = await supabase.rpc('update_user_role', { target_user_id: id, new_role: role });
    if (error) {
      await supabase.from('profiles').update({ role }).eq('id', id);
    }
  }
  const idx = MEMORY_USERS.findIndex(
    (u) => u.id === id || (u.email || '').toLowerCase() === resolvedEmail
  );
  if (idx !== -1) {
    MEMORY_USERS[idx] = { ...MEMORY_USERS[idx], role };
  }
}

export async function updateUserRole(email: string, role: string) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const user = MEMORY_USERS.find((u) => (u.email || '').toLowerCase() === cleanEmail);
  await updateUserRoleAsync(user?.id || emailToDeterministicUuid(cleanEmail), email, role);
}

export async function updateUser(email: string, updates: any) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase URL is not configured.");
  }
  const cleanEmail = (email || '').trim().toLowerCase();
  const existing = MEMORY_USERS.find((u) => (u.email || '').toLowerCase() === cleanEmail);
  const nextFullName =
    updates.fullName !== undefined ? updates.fullName : (existing?.fullName || cleanEmail.split('@')[0]);
  const nextPhone =
    updates.phone !== undefined ? updates.phone : (existing?.phone || '');
  const nextRole =
    updates.role !== undefined ? updates.role : (existing?.role || 'new user');

  if (cleanEmail) {
    await upsertCloudPortalUser({
      id: existing?.id || emailToDeterministicUuid(cleanEmail),
      email: cleanEmail,
      fullName: nextFullName,
      phone: nextPhone,
      role: nextRole,
      deleted: false,
      created_at: new Date().toISOString(),
    });
  }

  // Note: public.profiles only has id, full_name, role, email, created_at (no phone column)
  const profilePayload: any = {};
  if (updates.fullName !== undefined) profilePayload.full_name = updates.fullName;
  if (updates.role !== undefined) profilePayload.role = updates.role;

  if (Object.keys(profilePayload).length > 0) {
    await supabase.from('profiles').update(profilePayload).eq('email', email);
  }
  await fetchProfiles();
}

// Preload profiles cache
fetchProfiles().catch(() => {});
