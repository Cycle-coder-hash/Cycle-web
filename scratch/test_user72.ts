import "dotenv/config";
import { supabaseServer } from "../server/supabase";
import { getUserById, resolveUserCanonicalAndDerived, getDb } from "../server/db";

async function test() {
  console.log("Checking DB connection...");
  const db = await getDb();
  console.log("getDb():", db ? "connected" : "null/fallback");

  console.log("Fetching user 72 via supabaseServer direct query:");
  const { data: supaUser, error: supaErr } = await supabaseServer
    .from("users")
    .select("*")
    .eq("id", 72);
  console.log("Supabase direct query:", supaUser, supaErr);

  console.log("Fetching user 72 via getUserById:");
  const user = await getUserById(72);
  console.log("getUserById(72):", user);

  console.log("Testing resolveUserCanonicalAndDerived(72):");
  const resolved = await resolveUserCanonicalAndDerived(72);
  console.log("resolveUserCanonicalAndDerived(72):", resolved);
}

test().catch(console.error);
