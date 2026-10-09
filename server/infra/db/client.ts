import pg from "pg";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";

let _db: any = null;
let _pgPool: pg.Pool | null = null;
let _dbChecked = false;
let _dbAvailable = false;

export async function getDb() {
  if (_dbChecked) {
    return _dbAvailable ? _db : null;
  }
  const url = process.env.DATABASE_URL;
  const isTemplate = !url || url.includes("[") || url.includes("]") || url.includes("<") || url.includes(">");
  if (!_db && url && !isTemplate) {
    try {
      if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
        _pgPool = new pg.Pool({
          connectionString: url,
          ssl: url.includes("supabase.com") ? { rejectUnauthorized: false } : undefined,
          connectionTimeoutMillis: 1500,
        });
        // Test connectivity once
        const client = await _pgPool.connect();
        client.release();
        _db = drizzlePg(_pgPool);
        _dbAvailable = true;
      } else if (url.startsWith("mysql://")) {
        _db = drizzleMysql(url);
        _dbAvailable = true;
      }
    } catch (error) {
      console.warn("[Database] Pooler unavailable, seamlessly using Supabase REST engine:", (error as any)?.message || error);
      _db = null;
      _dbAvailable = false;
    } finally {
      _dbChecked = true;
    }
  } else {
    _dbChecked = true;
  }
  return _dbAvailable ? _db : null;
}
