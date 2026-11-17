import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeSupabaseUrl,
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_URL,
  emailToPortalRowId,
  emailToDeterministicUuid,
  isUserEmailVerified,
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

test('emailToPortalRowId generates deterministic 32-bit positive integers', () => {
  const id1 = emailToPortalRowId('sudhamsh141130@gmail.com');
  const id2 = emailToPortalRowId('SUDHAMSH141130@gmail.com ');
  assert.equal(id1, id2);
  assert.ok(id1 >= 1000000000 && id1 <= 2147483647);
});

test('emailToDeterministicUuid generates valid deterministic UUID v4 format', () => {
  const u1 = emailToDeterministicUuid('sudhamsh141130@gmail.com');
  const u2 = emailToDeterministicUuid('SUDHAMSH141130@GMAIL.COM');
  assert.equal(u1, u2);
  assert.match(u1, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('isUserEmailVerified rejects unverified signups and accepts confirmed users', () => {
  assert.equal(isUserEmailVerified(null), false);
  assert.equal(
    isUserEmailVerified({
      id: '123',
      email: 'unverified@example.com',
      email_confirmed_at: null,
      user_metadata: { email_verified: false },
    }),
    false
  );
  assert.equal(
    isUserEmailVerified({
      id: '123',
      email: 'verified@example.com',
      email_confirmed_at: '2026-11-17T10:00:00Z',
    }),
    true
  );
  assert.equal(
    isUserEmailVerified({
      id: '123',
      email: 'oauth@example.com',
      app_metadata: { provider: 'google' },
    }),
    true
  );
});
