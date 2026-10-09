import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://pxrcaqmjmsvldhiyuacx.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log("Connecting to:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  const { data: users, error: uErr } = await supabase.from("users").select("id, openId, email, name, role").limit(10);
  console.log("Users query result:", { count: users?.length, error: uErr?.message, users });

  const { data: settings, error: sErr } = await supabase.from("settings").select("key").limit(10);
  console.log("Settings query result:", { count: settings?.length, error: sErr?.message, keys: settings?.map(s => s.key) });

  const { data: trades, error: tErr } = await supabase.from("traderTrades").select("id").limit(5);
  console.log("traderTrades table check:", { count: trades?.length, error: tErr?.message });

  const { data: journalEntries, error: jErr } = await supabase.from("journalEntries").select("id, title, userId").limit(5);
  console.log("journalEntries table check:", { count: journalEntries?.length, error: jErr?.message, sample: journalEntries });
}

inspect();
