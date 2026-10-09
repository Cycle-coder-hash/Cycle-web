import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from("settings").select("key, value").like("key", "user_trades_%");
  console.log("Found user_trades settings entries:", data?.length);
  for (const row of data || []) {
    try {
      const parsed = JSON.parse(row.value);
      console.log(`Key: ${row.key} -> trades count: ${Array.isArray(parsed) ? parsed.length : 'not array'}`);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`Sample trade from ${row.key}:`, parsed[0].id, parsed[0].pair, parsed[0].date);
      }
    } catch (e) {
      console.log(`Key: ${row.key} -> parse error`);
    }
  }
}
check();
