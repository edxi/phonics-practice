import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}

export type AuthMode = 'sign_in' | 'sign_up' | 'forgot_password';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean; // whether Supabase credentials are provided
}
