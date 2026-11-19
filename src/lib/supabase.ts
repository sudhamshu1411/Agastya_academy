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

export function isUserEmailVerified(user: any): boolean {
  if (!user) return false;
  if (user.app_metadata?.provider === 'google') return true;
  if (Array.isArray(user.app_metadata?.providers) && user.app_metadata.providers.includes('google')) {
    return true;
  }
  if (typeof user.email_confirmed_at === 'string' && user.email_confirmed_at.trim().length > 0) {
    return true;
  }
  if (typeof user.confirmed_at === 'string' && user.confirmed_at.trim().length > 0) {
    return true;
  }
  if (user.user_metadata?.email_verified === true) {
    return true;
  }
  return false;
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
  deleted?: boolean;
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
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Only allow local fallback session for the founder account; require verified Supabase Auth session for all other users
    if (parsed?.user?.email?.toLowerCase() !== 'sudhamshu1411@gmail.com') {
      window.localStorage.removeItem(FALLBACK_SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
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
  const merged: PortalFallbackUser = {
    ...localMap[emailKey],
    ...user,
    email: emailKey,
    deleted: user.deleted ?? false,
  };
  localMap[emailKey] = merged;
  writeLocalUsers(localMap);

  if (!isSupabaseConfigured) return;
  try {
    const rowId = emailToPortalRowId(emailKey);
    await baseClient.from('interventions').upsert([
      {
        id: rowId,
        name: merged.fullName || emailKey.split('@')[0],
        batch: PORTAL_USER_BATCH_TAG,
        issue: emailKey,
        metric: merged.deleted ? '__DELETED__' : (merged.role || 'new user'),
        logged: !merged.deleted,
        notes: JSON.stringify(merged),
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
            const isDeleted = row.metric === '__DELETED__' || parsed.deleted === true;
            localMap[email] = {
              id: parsed.id || emailToDeterministicUuid(email),
              email,
              fullName: row.name || parsed.fullName || email.split('@')[0],
              phone: parsed.phone !== undefined ? parsed.phone : (localMap[email]?.phone || ''),
              role: isDeleted ? '__DELETED__' : (row.metric || parsed.role || 'new user'),
              password: parsed.password || localMap[email]?.password,
              deleted: isDeleted,
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
  if (!emailKey) return;
  const localMap = readLocalUsers();
  const existing = localMap[emailKey];
  const tombstone: PortalFallbackUser = {
    id: existing?.id || emailToDeterministicUuid(emailKey),
    email: emailKey,
    fullName: existing?.fullName || emailKey.split('@')[0],
    phone: existing?.phone || '',
    role: '__DELETED__',
    deleted: true,
    created_at: existing?.created_at || new Date().toISOString(),
  };
  localMap[emailKey] = tombstone;
  writeLocalUsers(localMap);

  if (!isSupabaseConfigured) return;
  try {
    const rowId = emailToPortalRowId(emailKey);
    await baseClient.from('interventions').upsert([
      {
        id: rowId,
        name: tombstone.fullName,
        batch: PORTAL_USER_BATCH_TAG,
        issue: emailKey,
        metric: '__DELETED__',
        logged: false,
        notes: JSON.stringify(tombstone),
      }
    ]);
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
      email_verified: true,
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
        // Ensure no previous session stays active during sign-up
        writeLocalSession(null);

        const email = (credentials?.email || '').trim().toLowerCase();
        const meta = credentials?.options?.data || {};
        const emailRedirectTo =
          credentials?.options?.emailRedirectTo ||
          (typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined);

        const res = await target.signUp({
          ...credentials,
          email,
          options: {
            ...credentials?.options,
            ...(emailRedirectTo ? { emailRedirectTo } : {}),
          },
        });

        if (res.error) {
          return res;
        }

        // When email enumeration protection is active on Supabase with Confirm Email enabled,
        // signing up an already-registered email returns a user object with identities: []
        if (
          res.data?.user &&
          Array.isArray(res.data.user.identities) &&
          res.data.user.identities.length === 0
        ) {
          return {
            data: { user: null, session: null },
            error: {
              message: 'This email is already registered. Please switch to Sign In to access your account.',
              code: 'user_already_exists',
            } as any,
          };
        }

        // Persist fullName, phone, and role in cloud portal user metadata so User Access Directory displays them
        if (res.data?.user?.id) {
          await upsertCloudPortalUser({
            id: res.data.user.id,
            email,
            fullName: meta.full_name || email.split('@')[0],
            phone: meta.phone || '',
            role: meta.role || 'new user',
            deleted: false,
            created_at: res.data.user.created_at || new Date().toISOString(),
          });

          if (meta.full_name) {
            try {
              await baseClient
                .from('profiles')
                .update({ full_name: meta.full_name })
                .eq('id', res.data.user.id);
            } catch {
              // ignore profile update error before verification
            }
          }
        }

        // Never auto-authenticate a newly registered user before email verification
        if (res.data?.session && !isUserEmailVerified(res.data.user)) {
          await target.signOut();
          notifyAuthListeners('SIGNED_OUT', null);
        }

        return {
          data: {
            user: res.data?.user ?? null,
            session: null,
          },
          error: null,
        };
      };
    }

    if (prop === 'signInWithPassword') {
      return async (credentials: any) => {
        const email = (credentials?.email || '').trim().toLowerCase();
        const password = credentials?.password || '';

        // 1. Authenticate against Supabase Auth first so email confirmation is strictly enforced
        const res = await target.signInWithPassword({
          ...credentials,
          email,
        });

        if (!res.error && res.data?.session) {
          if (!isUserEmailVerified(res.data.user)) {
            await target.signOut();
            writeLocalSession(null);
            notifyAuthListeners('SIGNED_OUT', null);
            return {
              data: { user: null, session: null },
              error: {
                message: 'Email not confirmed. Please check your inbox and verify your email before logging in.',
                code: 'email_not_confirmed',
              } as any,
            };
          }
          writeLocalSession(null);
          return res;
        }

        // 2. If Supabase rejected due to unconfirmed email, immediately return that error
        const errMsg = (res.error?.message || '').toLowerCase();
        if (errMsg.includes('email not confirmed') || (res.error as any)?.code === 'email_not_confirmed') {
          writeLocalSession(null);
          return res;
        }

        // 3. Support Founder fallback login only for the founder account
        if (email === 'sudhamshu1411@gmail.com' && (password === 'Chocho1411*' || password === 'Password123')) {
          const founderUser: PortalFallbackUser = {
            id: emailToDeterministicUuid(email),
            email,
            fullName: 'Sudhamshu (Founder)',
            phone: '',
            role: 'founder',
            password,
            deleted: false,
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

        return res;
      };
    }

    if (prop === 'getSession') {
      return async () => {
        const res = await target.getSession();
        if (res?.data?.session) {
          if (!isUserEmailVerified(res.data.session.user)) {
            await target.signOut();
            return { data: { session: null }, error: null };
          }
          return res;
        }
        const localSession = readLocalSession();
        if (localSession?.user?.email) {
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
            if (!isUserEmailVerified(session.user)) {
              callback('SIGNED_OUT', null);
              return;
            }
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
