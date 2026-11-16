import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeSupabaseUrl,
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_URL,
} from './supabase';

test('Supabase is configured with valid URL and anon key', () => {
  assert.equal(isSupabaseConfigured, true);
  assert.equal(SUPABASE_URL, DEFAULT_SUPABASE_URL);
  assert.ok(SUPABASE_ANON_KEY.length > 10);
});

test('sanitizeSupabaseUrl strips quotes, paths, and whitespace', () => {
  const res1 = sanitizeSupabaseUrl('  "https://khxuwnhykgxidtcxwntk.supabase.co/rest/v1/" ');
  assert.equal(res1.url, 'https://khxuwnhykgxidtcxwntk.supabase.co');
  assert.equal(res1.isPlaceholder, false);

  const res2 = sanitizeSupabaseUrl('khxuwnhykgxidtcxwntk.supabase.co');
  assert.equal(res2.url, 'https://khxuwnhykgxidtcxwntk.supabase.co');
  assert.equal(res2.isPlaceholder, false);

  const res3 = sanitizeSupabaseUrl('');
  assert.equal(res3.url, 'https://placeholder.supabase.co');
  assert.equal(res3.isPlaceholder, true);
});
