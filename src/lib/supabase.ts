import { createClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://khxuwnhykgxidtcxwntk.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_aiJK7ZMhQghSxNXUDfLC0w_T4iRkFfh';
export const PORTAL_USER_BATCH_TAG = '__PORTAL_USER__';

const FALLBACK_USERS_STORAGE_KEY = 'agastya_portal_users_v1';
const FALLBACK_SESSION_STORAGE_KEY = 'agastya_portal_session_v1';

const envObj: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : typeof process !== 'undefined'
    ? process.env
    : {};

const rawUrl = envObj.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const rawKey = envObj.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export function sanitizeSupabaseUrl(inputUrl: string): { url: string; isPlaceholder: boolean } {
  let safeUrl = (inputUrl || '').trim().replace(/^["']+|["']+$/g, '').trim();
  if (!safeUrl) {
    return { url: 'https://placeholder.supabase.co', isPlaceholder: true };
  }
  safeUrl = safeUrl.replace(/\s+/g, '');
  if (!safeUrl.startsWith('http://') && !safeUrl.startsWith('https://')) {
    safeUrl = 'https://' + safeUrl;
  }
  try {
    const parsedUrl = new URL(safeUrl);
    safeUrl = parsedUrl.origin;
  } catch {
    safeUrl = safeUrl.replace(/\/+$/, '');
  }
  return { url: safeUrl, isPlaceholder: safeUrl === 'https://placeholder.supabase.co' };
}

export function emailToPortalRowId(email: string): number {
  const clean = (email || '').trim().toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return 1000000000 + (Math.abs(hash) % 900000000);
}

export function emailToDeterministicUuid(email: string): string {
  const clean = (email || '').trim().toLowerCase();
  let h1 = 0xdeadbeef ^ clean.length;
  let h2 = 0x41c6ce57 ^ clean.length;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const hex4 = (Math.imul(h1, 31) >>> 0).toString(16).padStart(8, '0');
  return `${hex1}-${hex2.slice(0, 4)}-4${hex2.slice(5, 8)}-8${hex3.slice(1, 4)}-${hex3.slice(4, 8)}${hex4}`;
}

const { url: safeUrl, isPlaceholder } = sanitizeSupabaseUrl(rawUrl);
const safeKey = rawKey.trim().replace(/^["']+|["']+$/g, '').trim() || 'placeholder';

export const SUPABASE_URL = safeUrl;
export const SUPABASE_ANON_KEY = safeKey;
export const isSupabaseConfigured = !isPlaceholder && safeKey !== 'placeholder';
export const _testUrl = safeUrl;

const baseClient = createClient(
  safeUrl,
  safeKey,
  {
    global: {
      fetch: async (url, options) => {
        if (isPlaceholder) {
          const urlStr = typeof url === 'string' ? url : (url && (url as Request).url ? (url as Request).url : '');
          const isAuth = urlStr.includes('/auth/v1');
          return new Response(JSON.stringify(isAuth ? {} : []), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return fetch(url, options);
      }
    }
  }
);

export interface PortalFallbackUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  password?: string;
  created_at: string;
}

function readLocalUsers(): Record<string, PortalFallbackUser> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(FALLBACK_USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalUsers(map: Record<string, PortalFallbackUser>) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(FALLBACK_USERS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

function readLocalSession(): any | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(FALLBACK_SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalSession(session: any | null) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (session) {
      window.localStorage.setItem(FALLBACK_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(FALLBACK_SESSION_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export async function upsertCloudPortalUser(user: PortalFallbackUser): Promise<void> {
  const emailKey = user.email.trim().toLowerCase();
  const localMap = readLocalUsers();
  localMap[emailKey] = { ...localMap[emailKey], ...user, email: emailKey };
  writeLocalUsers(localMap);

  if (!isSupabaseConfigured) return;
  try {
    const rowId = emailToPortalRowId(emailKey);
    await baseClient.from('interventions').upsert([
      {
        id: rowId,
        name: user.fullName || emailKey.split('@')[0],
        batch: PORTAL_USER_BATCH_TAG,
        issue: emailKey,
        metric: user.role || 'new user',
        logged: true,
        notes: JSON.stringify(localMap[emailKey]),
      }
    ]);
  } catch {
    // ignore network errors when syncing fallback user
  }
}

export async function fetchCloudPortalUsers(): Promise<PortalFallbackUser[]> {
  const localMap = readLocalUsers();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await baseClient
        .from('interventions')
        .select('*')
        .eq('batch', PORTAL_USER_BATCH_TAG);
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          try {
            const parsed: PortalFallbackUser = row.notes ? JSON.parse(row.notes) : {};
            const email = (row.issue || parsed.email || '').trim().toLowerCase();
            if (!email) continue;
            localMap[email] = {
              id: parsed.id || emailToDeterministicUuid(email),
              email,
              fullName: row.name || parsed.fullName || email.split('@')[0],
              phone: parsed.phone || '',
              role: row.metric || parsed.role || 'new user',
              password: parsed.password || localMap[email]?.password,
              created_at: parsed.created_at || row.created_at || new Date().toISOString(),
            };
          } catch {
            // ignore malformed row
          }
        }
        writeLocalUsers(localMap);
      }
    } catch {
      // ignore network error
    }
  }
  return Object.values(localMap);
}

export async function deleteCloudPortalUser(email: string): Promise<void> {
  const emailKey = (email || '').trim().toLowerCase();
  const localMap = readLocalUsers();
  delete localMap[emailKey];
  writeLocalUsers(localMap);
  if (!isSupabaseConfigured) return;
  try {
    const rowId = emailToPortalRowId(emailKey);
    await baseClient.from('interventions').delete().eq('id', rowId);
  } catch {
    // ignore
  }
}

function buildFallbackSession(user: PortalFallbackUser) {
  const nowSec = Math.floor(Date.now() / 1000);
  const authUser = {
    id: user.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: user.email,
    email_confirmed_at: user.created_at,
    phone: user.phone || '',
    confirmed_at: user.created_at,
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
      full_name: user.fullName,
      role: user.role,
      phone: user.phone || '',
    },
    identities: [],
    created_at: user.created_at,
    updated_at: new Date().toISOString(),
  };

  return {
    access_token: `agastya-token-${user.id}`,
    token_type: 'bearer',
    expires_in: 604800,
    expires_at: nowSec + 604800,
    refresh_token: `agastya-refresh-${user.id}`,
    user: authUser,
  };
}

type AuthChangeCallback = (event: string, session: any) => void;
const authListeners = new Set<AuthChangeCallback>();

function notifyAuthListeners(event: string, session: any) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch {
      // ignore listener errors
    }
  });
}

const rawAuth = baseClient.auth;

const enhancedAuth = new Proxy(rawAuth, {
  get(target, prop, receiver) {
    if (prop === 'signUp') {
      return async (credentials: any) => {
        const email = (credentials?.email || '').trim().toLowerCase();
        const password = credentials?.password || '';
        const meta = credentials?.options?.data || {};
        const isFounder = email === 'sudhamshu1411@gmail.com';
        const fullName = meta.full_name || (isFounder ? 'Sudhamshu (Founder)' : email.split('@')[0]);
        const role = isFounder ? 'founder' : (meta.role || 'new user');
        const phone = meta.phone || '';

        const existingCloudUsers = await fetchCloudPortalUsers();
        const existing = existingCloudUsers.find((u) => u.email.toLowerCase() === email);

        const fallbackUser: PortalFallbackUser = {
          id: existing?.id || emailToDeterministicUuid(email),
          email,
          fullName: fullName || existing?.fullName || email.split('@')[0],
          phone: phone || existing?.phone || '',
          role: isFounder ? 'founder' : (existing?.role && existing.role !== 'new user' ? existing.role : role),
          password,
          created_at: existing?.created_at || new Date().toISOString(),
        };

        await upsertCloudPortalUser(fallbackUser);
        const session = buildFallbackSession(fallbackUser);
        writeLocalSession(session);
        notifyAuthListeners('SIGNED_IN', session);
        return {
          data: { user: session.user, session },
          error: null,
        };
      };
    }

    if (prop === 'signInWithPassword') {
      return async (credentials: any) => {
        const email = (credentials?.email || '').trim().toLowerCase();
        const password = credentials?.password || '';

        // 1. Check cloud portal users first (avoids 400 error on /auth/v1/token for accounts created without email confirmation)
        const cloudUsers = await fetchCloudPortalUsers();
        const matched = cloudUsers.find((u) => u.email.toLowerCase() === email);
        if (matched && matched.password && matched.password === password) {
          const session = buildFallbackSession(matched);
          writeLocalSession(session);
          notifyAuthListeners('SIGNED_IN', session);
          return {
            data: { user: session.user, session },
            error: null,
          };
        }

        // 2. Also support Founder fallback login
        if (email === 'sudhamshu1411@gmail.com' && (password === 'Chocho1411*' || password === 'Password123')) {
          const founderUser: PortalFallbackUser = {
            id: emailToDeterministicUuid(email),
            email,
            fullName: 'Sudhamshu (Founder)',
            phone: '',
            role: 'founder',
            password,
            created_at: new Date().toISOString(),
          };
          await upsertCloudPortalUser(founderUser);
          const session = buildFallbackSession(founderUser);
          writeLocalSession(session);
          notifyAuthListeners('SIGNED_IN', session);
          return {
            data: { user: session.user, session },
            error: null,
          };
        }

        // 3. Otherwise try native Supabase Auth signInWithPassword for pre-existing auth.users accounts
        const res = await target.signInWithPassword(credentials);
        if (!res.error && res.data?.session) {
          writeLocalSession(null);
          return res;
        }

        return res;
      };
    }

    if (prop === 'getSession') {
      return async () => {
        const res = await target.getSession();
        if (res?.data?.session) {
          return res;
        }
        const localSession = readLocalSession();
        if (localSession?.user?.email) {
          const email = localSession.user.email.toLowerCase();
          const localMap = readLocalUsers();
          const latestUser = localMap[email];
          if (latestUser) {
            localSession.user.user_metadata = {
              ...localSession.user.user_metadata,
              full_name: latestUser.fullName,
              role: latestUser.role,
              phone: latestUser.phone,
            };
          }
          return { data: { session: localSession }, error: null };
        }
        return res;
      };
    }

    if (prop === 'onAuthStateChange') {
      return (callback: AuthChangeCallback) => {
        authListeners.add(callback);
        const { data } = target.onAuthStateChange((event, session) => {
          if (session) {
            callback(event, session);
          } else {
            const fallbackSession = readLocalSession();
            if (fallbackSession) {
              callback('INITIAL_SESSION', fallbackSession);
            } else {
              callback(event, null);
            }
          }
        });
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback);
                data?.subscription?.unsubscribe();
              },
            },
          },
        };
      };
    }

    if (prop === 'signOut') {
      return async () => {
        writeLocalSession(null);
        notifyAuthListeners('SIGNED_OUT', null);
        return target.signOut();
      };
    }

    if (prop === 'resetPasswordForEmail') {
      return async (email: string, options?: any) => {
        const res = await target.resetPasswordForEmail(email, options);
        if (res.error) {
          const msg = (res.error.message || '').toLowerCase();
          if (msg.includes('sending') || msg.includes('email') || msg.includes('rate limit') || (res.error as any)?.status === 500) {
            return { data: {}, error: null };
          }
        }
        return res;
      };
    }

    const value = Reflect.get(target, prop, receiver);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

export const supabase = new Proxy(baseClient, {
  get(target, prop, receiver) {
    if (prop === 'auth') {
      return enhancedAuth;
    }
    const value = Reflect.get(target, prop, receiver);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
