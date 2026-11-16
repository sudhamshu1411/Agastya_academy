import { createClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://khxuwnhykgxidtcxwntk.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_aiJK7ZMhQghSxNXUDfLC0w_T4iRkFfh';

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

const { url: safeUrl, isPlaceholder } = sanitizeSupabaseUrl(rawUrl);
const safeKey = rawKey.trim().replace(/^["']+|["']+$/g, '').trim() || 'placeholder';

export const SUPABASE_URL = safeUrl;
export const SUPABASE_ANON_KEY = safeKey;
export const isSupabaseConfigured = !isPlaceholder && safeKey !== 'placeholder';
export const _testUrl = safeUrl;

export const supabase = createClient(
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
