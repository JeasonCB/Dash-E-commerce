import { createClient } from '@supabase/supabase-js';
import { keyManager } from '../security/key-manager.js';

let adminClient = null;

export function getAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = keyManager.getKey('SUPABASE_SERVICE');

  adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
