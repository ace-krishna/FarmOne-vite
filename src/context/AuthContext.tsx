import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthValue {
  session: Session | null;
  /** True until the saved session has been looked up, so we never flash the login screen at a signed-in user. */
  loading: boolean;
  name: string;
  email: string;
  /** Each returns an error message to show, or null on success. */
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Wrong email or password.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'This email is already registered. Try signing in.';
  if (m.includes('password') && m.includes('characters')) return 'Password must be at least 6 characters.';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a minute and try again.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'No connection. Check your internet and try again.';
  return message;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    // Supabase keeps the session in the browser/phone storage, so this restores a past login.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      // Offline copies of the animals and vaccinations belong to the last user, so drop them on sign-out
      if (!next) {
        localStorage.removeItem('farmone.animals.v1');
        localStorage.removeItem('farmone.vaccinations.v1');
      }
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!isSupabaseConfigured) return 'Supabase is not set up. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.';
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) return friendly(error.message);
      // With "Confirm email" on, Supabase creates the user but returns no session.
      if (!data.session) return 'Account created, but Supabase is asking for email confirmation. Turn off "Confirm email" in Authentication > Providers > Email.';
      return null;
    } catch (e) {
      return friendly(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return 'Supabase is not set up. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.';
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? friendly(error.message) : null;
    } catch (e) {
      return friendly(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthValue>(() => {
    const user = session?.user;
    const meta = user?.user_metadata as { full_name?: string } | undefined;
    return {
      session,
      loading,
      name: meta?.full_name ?? '',
      email: user?.email ?? '',
      signUp,
      signIn,
      signOut,
    };
  }, [session, loading, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
