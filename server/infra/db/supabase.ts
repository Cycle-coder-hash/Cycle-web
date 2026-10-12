import { createClient } from "@supabase/supabase-js";
import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
  const existingServers = dns.getServers();
  const publicDns = ["1.1.1.1", "8.8.8.8", "8.8.4.4"];
  const merged = Array.from(new Set([...publicDns, ...existingServers]));
  dns.setServers(merged);

  if (!(dns as any).__cycleIpv4LookupPatched) {
    (dns as any).__cycleIpv4LookupPatched = true;
    const origLookup = dns.lookup.bind(dns);
    (dns as any).lookup = (hostname: string, options: any, cb?: any) => {
      const callback = typeof options === "function" ? options : cb;
      const opts =
        typeof options === "number"
          ? { family: options }
          : typeof options === "object" && options !== null
          ? options
          : {};
      if (
        !hostname ||
        hostname === "localhost" ||
        hostname.startsWith("127.") ||
        hostname === "::1" ||
        /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
      ) {
        return origLookup(hostname, options, cb);
      }
      if (opts.family === 6) {
        const err: any = new Error(`queryAaaa ENOTFOUND ${hostname}`);
        err.code = "ENOTFOUND";
        return process.nextTick(() => (opts.all ? callback(err, []) : callback(err)));
      }
      dns.resolve4(hostname, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
          const notFound: any = new Error(`queryA ENOTFOUND ${hostname}`);
          notFound.code = "ENOTFOUND";
          return opts.all ? callback(notFound, []) : callback(notFound);
        }
        if (opts.all) {
          return callback(
            null,
            addresses.map((address) => ({ address, family: 4 }))
          );
        }
        return callback(null, addresses[0], 4);
      });
    };
  }
} catch {}


const DEFAULT_SUPABASE_URL = "https://pxrcaqmjmsvldhiyuacx.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cmNhcW1qbXN2bGRoaXl1YWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjQ3MTUsImV4cCI6MjEwMzYwMDcxNX0.T9_0iHg5a-vHh2tpTrVUVlvIsp5G6UB1n_i_kHN9OoM";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

let supabaseOfflineUntil = 0;

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: async (url, options = {}) => {
      if (process.env.NODE_ENV === "test" && !process.env.TEST_LIVE_DB) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      const offlineResponse = () =>
        new Response(
          JSON.stringify({
            message: "Supabase temporarily unreachable (using memory fallback)",
            code: "SUPABASE_OFFLINE",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );

      if (Date.now() < supabaseOfflineUntil && !process.env.TEST_LIVE_DB) {
        return offlineResponse();
      }
      const timeoutMs = process.env.TEST_LIVE_DB ? 8000 : 1200;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const signal = options.signal
        ? (AbortSignal as any).any
          ? (AbortSignal as any).any([options.signal, controller.signal])
          : controller.signal
        : controller.signal;
      try {
        const response = await fetch(url, { ...options, signal });
        if (response.status >= 500) {
          if (!process.env.TEST_LIVE_DB) {
            supabaseOfflineUntil = Date.now() + 60_000;
          }
          return offlineResponse();
        }
        return response;
      } catch {
        if (!process.env.TEST_LIVE_DB) {
          supabaseOfflineUntil = Date.now() + 60_000;
        }
        return offlineResponse();
      } finally {
        clearTimeout(id);
      }
    },
  },
});

