import React, { useEffect, useState } from 'react';
import type { User, Session, Provider } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { UserProfile } from '../types/auth';
import { AuthContext } from './authContextDef';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    // 1. Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch((err) => {
      console.error('Error fetching Supabase session:', err);
      setIsLoading(false);
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Compute a simplified UserProfile
  const profile: UserProfile | null = user
    ? {
        id: user.id,
        email: user.email,
        displayName:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          '拼读学员',
        avatarUrl:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          undefined,
      }
    : null;

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase 尚未配置，请在后台添加配置环境变量。') };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase 尚未配置，请在后台添加配置环境变量。') };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase 尚未配置，请在后台添加配置环境变量。'), user: null };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      return { error, user: data.user };
    } catch (e: any) {
      return { error: e, user: null };
    }
  };

  const sendMagicLink = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase 尚未配置，请在后台添加配置环境变量。') };
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signInWithOAuth,
        signInWithEmail,
        signUpWithEmail,
        sendMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
