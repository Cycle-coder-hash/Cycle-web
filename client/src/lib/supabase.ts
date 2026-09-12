import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://pxrcaqmjmsvldhiyuacx.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cmNhcW1qbXN2bGRoaXl1YWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjQ3MTUsImV4cCI6MjEwMzYwMDcxNX0.T9_0iHg5a-vHh2tpTrVUVlvIsp5G6UB1n_i_kHN9OoM";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: "cycle_supabase_session",
    detectSessionInUrl: true,
  },
});
