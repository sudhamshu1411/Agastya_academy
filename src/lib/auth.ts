import { supabase } from './supabase';

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      if (session.provider_token) {
        cachedAccessToken = session.provider_token;
      }
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(session.user, cachedAccessToken);
      } else if (!isSigningIn) {
        // We might be logged in but without a provider token
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  }).data.subscription.unsubscribe;
};

export const googleSignIn = async (): Promise<{ user: any; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar.events',
        redirectTo: window.location.origin + '/login',
      }
    });
    
    if (error) {
      throw error;
    }
    
    return null; // Will redirect in actual browser environment for OAuth
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.provider_token) {
    cachedAccessToken = session.provider_token;
  }
  return cachedAccessToken;
};

export const logout = async () => {
  await supabase.auth.signOut();
  cachedAccessToken = null;
};
