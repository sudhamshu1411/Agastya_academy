import { supabase } from './supabase';

export const INITIAL_USERS = [
  { email: "student@agastya.edu", phone: "9000000001", password: "Password123!", role: "student", fullName: "Demo Student" },
  { email: "admin@agastya.edu", phone: "9000000002", password: "Password123!", role: "admin", fullName: "Demo Admin" },
  { email: "faculty@agastya.edu", phone: "9000000003", password: "Password123!", role: "faculty", fullName: "Demo Faculty" },
  { email: "founder@agastya.edu", phone: "9000000004", password: "Password123!", role: "founder", fullName: "Demo Founder" },
  { email: "priyanka@example.com", phone: "9876543210", password: "Password123!", role: "student", fullName: "Priyanka Desai" },
  { email: "avinash@example.com", phone: "9988776655", password: "Password123!", role: "new user", fullName: "Avinash Kumar" },
  { email: "sanya@example.com", phone: "9123456789", password: "Password123!", role: "new user", fullName: "Sanya Malik" },
  { email: "rohan@example.com", phone: "9456712389", password: "Password123!", role: "new user", fullName: "Rohan Gupta" },
  { email: "ananya@example.com", phone: "9777755555", password: "Password123!", role: "student", fullName: "Ananya Singh" },
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
  return getValidUsers();
}

export function getValidUsers() {
  try {
    const data = localStorage.getItem('agastya_users');
    if (data) {
      let users = JSON.parse(data);
      
      // Ensure all INITIAL_USERS are present (including our new ones)
      INITIAL_USERS.forEach(iu => {
        if (!users.find((u: any) => u.email === iu.email)) {
          users.push(iu);
        }
      });
      localStorage.setItem('agastya_users', JSON.stringify(users));

      return users;
    }
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem('agastya_users', JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
}

export async function registerUser(user: any) {
  const users = getValidUsers();
  const exists = users.find((u: any) => u.email === user.email);
  if (!exists) {
    users.push(user);
    localStorage.setItem('agastya_users', JSON.stringify(users));
  }
}

export async function deleteUserRow(id: string, email: string) {
  if (import.meta.env.VITE_SUPABASE_URL && id) {
     await supabase.rpc('delete_user', { user_id: id }); // Assumes a custom function for deletion if needed
     await supabase.from('profiles').delete().eq('id', id);
  }
  const users = getValidUsers();
  const updated = users.filter((u: any) => u.email !== email);
  localStorage.setItem('agastya_users', JSON.stringify(updated));
}

export function deleteUser(email: string) {
  const users = getValidUsers();
  const updated = users.filter((u: any) => u.email !== email);
  localStorage.setItem('agastya_users', JSON.stringify(updated));
}

export async function updateUserRoleAsync(id: string, email: string, role: string) {
  if (import.meta.env.VITE_SUPABASE_URL && id) {
    await supabase.from('profiles').update({ role }).eq('id', id);
  }
  updateUserRole(email, role);
}

export function updateUserRole(email: string, role: string) {
  const users = getValidUsers();
  const index = users.findIndex((u: any) => u.email === email);
  if (index !== -1) {
    users[index].role = role;
    localStorage.setItem('agastya_users', JSON.stringify(users));
  }
}

export function updateUser(email: string, updates: any) {
  const users = getValidUsers();
  const index = users.findIndex((u: any) => u.email === email);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('agastya_users', JSON.stringify(users));
  }
}
