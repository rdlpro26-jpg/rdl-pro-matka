import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: { 'x-application-name': 'rdl-pro-matka' },
  },
  db: { schema: 'public' },
});

export interface RdlResult {
  id: string;
  draw_date: string;
  slot_12pm: string | null;
  slot_2pm: string | null;
  slot_4pm: string | null;
  slot_6pm: string | null;
  slot_8pm: string | null;
  slot_10pm: string | null;
  created_at: string;
  updated_at: string;
}

export interface RdlCurrentResult {
  id: string;
  slot_name: string;
  result_value: string;
  previous_value: string | null;
  updated_at: string;
}

export const TIME_SLOTS = [
  { key: 'slot_12pm', label: 'RDL PRO 12 PM', short: '12PM' },
  { key: 'slot_2pm', label: 'RDL PRO 02 PM', short: '02PM' },
  { key: 'slot_4pm', label: 'RDL PRO 04 PM', short: '04PM' },
  { key: 'slot_6pm', label: 'RDL PRO 06 PM', short: '06PM' },
  { key: 'slot_8pm', label: 'RDL PRO 08 PM', short: '08PM' },
  { key: 'slot_10pm', label: 'RDL PRO 10 PM', short: '10PM' },
] as const;
