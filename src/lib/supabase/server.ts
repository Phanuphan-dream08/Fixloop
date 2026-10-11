import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseServerConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    (Boolean(supabaseServiceKey) || Boolean(supabaseAnonKey)) &&
    !supabaseUrl.includes('your-project') &&
    !supabaseServiceKey.includes('your-service-role-key')
  );
};

export const getSupabaseServer = () => {
  if (!isSupabaseServerConfigured()) return null;
  const key = supabaseServiceKey || supabaseAnonKey;
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
