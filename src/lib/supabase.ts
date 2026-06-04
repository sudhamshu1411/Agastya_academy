import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!rawUrl || !rawKey) {
  console.error("⚠️ SUPABASE CREDENTIALS MISSING: Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment configuration.");
}

// Clean and validate URL
let safeUrl = rawUrl.replace(/^["']|["']$/g, '').trim();
if (safeUrl) {
  // If user pasted url with extra spaces or newlines inside, clean it up
  safeUrl = safeUrl.replace(/\s+/g, '');
  if (!safeUrl.startsWith('http://') && !safeUrl.startsWith('https://')) {
    safeUrl = 'https://' + safeUrl;
  }
  
  try {
    const parsedUrl = new URL(safeUrl);
    // Force only the origin (e.g. https://xxx.supabase.co)
    // This removes any accidental /rest/v1 or /auth/v1 from the base URL!
    safeUrl = parsedUrl.origin;
  } catch (err) {
    // Fallback if URL parsing fails
    safeUrl = safeUrl.replace(/\/+$/, '');
  }
} else {
  safeUrl = 'https://placeholder.supabase.co';
}

export const _testUrl = safeUrl;
export const supabase = createClient(
  safeUrl,
  rawKey.replace(/^["']|["']$/g, '').trim() || 'placeholder'
);




