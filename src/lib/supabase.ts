import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl: string = metaEnv.VITE_SUPABASE_URL || 'https://kveppbflpyjlyochixjt.supabase.co';
const supabaseAnonKey: string = metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2ZXBwYmZscHlqbHlvY2hpeGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjIxMzQsImV4cCI6MjEwNDQzODEzNH0.MRYSGGsiKXmZW2KaO5PEmDxHM-iqQRoAesyrndaJzqg';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { error } = await supabase.from('public_tenant_info').select('id').limit(1);
    if (error) {
      console.warn('Supabase ping warning:', error.message);
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Supabase conectado com sucesso' };
  } catch (err: any) {
    console.error('Supabase connection error:', err);
    return { connected: false, message: err?.message || 'Falha na conexão' };
  }
}
