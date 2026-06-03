import { createClient } from '@supabase/supabase-js';
import { getValidUsers, registerUser } from './users';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : ({
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => { throw new Error('OAuth is not supported in local demo mode.') },
        getSession: async () => ({ data: { session: null } }),
        signOut: async () => {
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userFullName');
          localStorage.removeItem('authToken');
          localStorage.removeItem('isSuperAdmin');
          return { error: null };
        },
        signInWithPassword: async ({ email, password }: any) => {
          const users = getValidUsers();
          const user = users.find((u: any) => u.email === email && u.password === password);
          if (user) {
            return {
              data: {
                user: { email: user.email, user_metadata: { role: user.role, full_name: user.fullName } }
              },
              error: null
            };
          }
          return { data: null, error: { message: "Invalid login credentials" } };
        },
        signUp: async ({ email, password, options }: any) => {
          const users = getValidUsers();
          if (users.find((u: any) => u.email === email)) {
            return { data: null, error: { message: "User already exists with this email." } };
          }
          const newUser = {
            email,
            password,
            fullName: options?.data?.full_name || "New User",
            role: options?.data?.role || "new user",
            phone: ""
          };
          registerUser(newUser);
          return {
            data: {
              user: { email: newUser.email, user_metadata: { role: newUser.role, full_name: newUser.fullName } }
            },
            error: null
          };
        },
      }
    } as any);


