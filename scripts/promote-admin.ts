/**
 * One-time bootstrap helper: promote a user to ADMIN.
 *
 * Usage:
 *   npm run promote-admin -- you@example.com
 *
 * Calls the Supabase REST API directly (PostgREST) to avoid the
 * @supabase/supabase-js → Realtime → `ws` dependency on Node < 22.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnv() {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]!]) {
        process.env[m[1]!] = m[2]!.replace(/^"|"$/g, "").trim();
      }
    }
  } catch {
    /* optional */
  }
}

async function main() {
  loadEnv();

  const email = process.argv[2] ?? process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!email) {
    console.error("Usage: npm run promote-admin -- you@example.com");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const endpoint = `${url}/rest/v1/profiles?email=eq.${encodeURIComponent(email.toLowerCase())}`;

  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ role: "ADMIN" }),
  });

  if (!res.ok) {
    console.error(`Update failed (HTTP ${res.status}):`, await res.text());
    process.exit(1);
  }

  const rows = (await res.json()) as Array<{ id: string; email: string; role: string }>;
  if (!rows.length) {
    console.error(`No profile with email "${email}". Make sure you've registered first, then re-run.`);
    process.exit(1);
  }

  for (const row of rows) {
    console.log(`Promoted ${row.email} (${row.id}) to ${row.role}.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
