import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project')
);

if (!isSupabaseConfigured) {
  console.info(
    '[Supabase] 未检测到有效的 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY。应用将运行在本地 LocalStorage 模式下。配置 Supabase 环境变量后即可开启云端同步与多端登录。'
  );
}

// Create the real client if configured, otherwise create a placeholder client that won't throw on init
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
