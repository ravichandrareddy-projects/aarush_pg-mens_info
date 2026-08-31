import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xwgdchtvodsfzblcagfy.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Z2RjaHR2b2RzZnpibGNhZ2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwODAwMzIsImV4cCI6MjEwMzY1NjAzMn0.sWLmTdEdFNaLWM7VUgfh1LOFd6GUqvqjfwHpNlU7s0E';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
