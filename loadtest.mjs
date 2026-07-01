// loadtest.mjs
// Run with: node loadtest.mjs

const BASE_URL = "https://student-superapp.vercel.app";
const COOKIE = "ext_name=ojplmecpdpgccookcobabopnaifgidhf; sb-dqnbdnwlfyfxdllhrzcp-auth-token=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0ltdHBaQ0k2SW1aMmIzaDBXbll5ZW14NU9VUlNkeThpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKb2RIUndjem92TDJSeGJtSmtibmRzWm5sbWVHUnNiR2h5ZW1Od0xuTjFjR0ZpWVhObExtTnZMMkYxZEdndmRqRWlMQ0p6ZFdJaU9pSTJNRGc0TWpVeFlpMWpZak01TFRRMk1HSXRPVFl5TVMwMFlqSTBNemt6TlRBME1EVWlMQ0poZFdRaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVpYaHdJam94TnpneU56ZzNNamd3TENKcFlYUWlPakUzT0RJM09ETTJPREFzSW1WdFlXbHNJam9pY25OaGVHVnVZVUIwWTJRdWFXVWlMQ0p3YUc5dVpTSTZJaUlzSW1Gd2NGOXRaWFJoWkdGMFlTSTZleUp3Y205MmFXUmxjaUk2SW1WdFlXbHNJaXdpY0hKdmRtbGtaWEp6SWpwYkltVnRZV2xzSWwxOUxDSjFjMlZ5WDIxbGRHRmtZWFJoSWpwN0ltVnRZV2xzSWpvaWNuTmhlR1Z1WVVCMFkyUXVhV1VpTENKbGJXRnBiRjkyWlhKcFptbGxaQ0k2ZEhKMVpTd2lablZzYkY5dVlXMWxJam9pVW1sMGFXc2dVMkY0Wlc1aElpd2ljR2h2Ym1WZmRtVnlhV1pwWldRaU9tWmhiSE5sTENKemRXSWlPaUkyTURnNE1qVXhZaTFqWWpNNUxUUTJNR0l0T1RZeU1TMDBZakkwTXprek5UQTBNRFVpZlN3aWNtOXNaU0k2SW1GMWRHaGxiblJwWTJGMFpXUWlMQ0poWVd3aU9pSmhZV3d4SWl3aVlXMXlJanBiZXlKdFpYUm9iMlFpT2lKd1lYTnpkMjl5WkNJc0luUnBiV1Z6ZEdGdGNDSTZNVGM0TWpjNE16WTRNSDFkTENKelpYTnphVzl1WDJsa0lqb2lNRFl5WVRaaVlXRXRaR0ptWVMwME9URmtMVGc1TkRVdE5tVmhaakJrTVdNM01tWXhJaXdpYVhOZllXNXZibmx0YjNWeklqcG1ZV3h6WlgwLkJYZmpaT1J5NDA5ck5TdXM5WmUxN3E4RkI4TFJJeWtQYldfejVnUk9RamciLCJ0b2tlbl90eXBlIjoiYmVhcmVyIiwiZXhwaXJlc19pbiI6MzYwMCwiZXhwaXJlc19hdCI6MTc4Mjc4NzI4MCwicmVmcmVzaF90b2tlbiI6InFrZmFlY3JwNWt1eSIsInVzZXIiOnsiaWQiOiI2MDg4MjUxYi1jYjM5LTQ2MGItOTYyMS00YjI0MzkzNTA0MDUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJlbWFpbCI6InJzYXhlbmFAdGNkLmllIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNS0xMi0xMlQwNDo1MDozNi4yNjY3NTRaIiwicGhvbmUiOiIiLCJjb25maXJtYXRpb25fc2VudF9hdCI6IjIwMjUtMTItMTJUMDQ6NTA6MjAuNzE0MTE1WiIsImNvbmZpcm1lZF9hdCI6IjIwMjUtMTItMTJUMDQ6NTA6MzYuMjY2NzU0WiIsImxhc3Rfc2lnbl9pbl9hdCI6IjIwMjYtMDYtMzBUMDE6NDE6MjAuMTUwMTIyMzMyWiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoicnNheGVuYUB0Y2QuaWUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiUml0aWsgU2F4ZW5hIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI2MDg4MjUxYi1jYjM5LTQ2MGItOTYyMS00YjI0MzkzNTA0MDUifSwiaWRlbnRpdGllcyI6W3siaWRlbnRpdHlfaWQiOiI2MzU1MzBhOS1lM2NlLTRjMWUtYjBlZi1iOTc4YjdlMWM0ODMiLCJpZCI6IjYwODgyNTFiLWNiMzktNDYwYi05NjIxLTRiMjQzOTM1MDQwNSIsInVzZXJfaWQiOiI2MDg4MjUxYi1jYjM5LTQ2MGItOTYyMS00YjI0MzkzNTA0MDUiLCJpZGVudGl0eV9kYXRhIjp7ImVtYWlsIjoicnNheGVuYUB0Y2QuaWUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiUml0aWsgU2F4ZW5hIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI2MDg4MjUxYi1jYjM5LTQ2MGItOTYyMS00YjI0MzkzNTA0MDUifSwicHJvdmlkZXIiOiJlbWFpbCIsImxhc3Rfc2lnbl9pbl9hdCI6IjIwMjUtMTItMTJUMDQ6NTA6MjAuNzA1NTg1WiIsImNyZWF0ZWRfYXQiOiIyMDI1LTEyLTEyVDA0OjUwOjIwLjcwNTY2WiIsInVwZGF0ZWRfYXQiOiIyMDI1LTEyLTEyVDA0OjUwOjIwLjcwNTY2WiIsImVtYWlsIjoicnNheGVuYUB0Y2QuaWUifV0sImNyZWF0ZWRfYXQiOiIyMDI1LTEyLTEyVDA0OjUwOjIwLjY5NTM3M1oiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wNi0zMFQwMTo0MToyMC4xODI1MTdaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0sIndlYWtfcGFzc3dvcmQiOm51bGx9";

const ENDPOINTS = [
  { path: "/marketplace", weight: 4 },
  { path: "/api/items", weight: 4 },
  { path: "/api/chats", weight: 2 },
  { path: "/api/favorites", weight: 1 },
];

const weighted = [];
for (const e of ENDPOINTS) {
  for (let i = 0; i < e.weight; i++) weighted.push(e.path);
}

async function hit(path) {
  const start = Date.now();
  try {
    const res = await fetch(BASE_URL + path, {
      headers: { cookie: COOKIE },
      signal: AbortSignal.timeout(15000),
    });
    return { path, status: res.status, ms: Date.now() - start, ok: true };
  } catch (err) {
    return { path, status: "ERR", ms: Date.now() - start, ok: false, err: String(err) };
  }
}

async function wave(concurrency) {
  const picks = Array.from({ length: concurrency }, (_, i) => weighted[i % weighted.length]);
  const results = await Promise.all(picks.map(hit));

  const statuses = {};
  let totalMs = 0;
  let maxMs = 0;
  let errors = 0;

  for (const r of results) {
    statuses[r.status] = (statuses[r.status] || 0) + 1;
    totalMs += r.ms;
    if (r.ms > maxMs) maxMs = r.ms;
    if (!r.ok || r.status >= 500) errors++;
  }

  const avg = Math.round(totalMs / results.length);
  const errPct = Math.round((errors / results.length) * 100);

  console.log(`\n-- ${concurrency} concurrent users --`);
  console.log(`  Avg response : ${avg}ms`);
  console.log(`  Slowest      : ${maxMs}ms`);
  console.log(`  Status codes : ${JSON.stringify(statuses)}`);
  console.log(`  Error rate   : ${errPct}%  (${errors}/${results.length} failed)`);

  if (errors > 0) {
    const sample = results.filter(r => !r.ok || r.status >= 500).slice(0, 3);
    sample.forEach(r => console.log(`    -> ${r.path} -> ${r.status} (${r.ms}ms) ${r.err || ""}`));
  }

  return { concurrency, avg, maxMs, errors, total: results.length };
}

async function main() {
  console.log(`Load test -> ${BASE_URL}`);
  console.log(`Endpoints  : ${[...new Set(weighted)].join(", ")}`);
  console.log(`Waves      : 10 -> 25 -> 50 -> 100 users\n`);

  const summary = [];

  for (const n of [10, 25, 50, 100]) {
    const result = await wave(n);
    summary.push(result);
    if (n < 100) await new Promise(r => setTimeout(r, 3000));
  }

  console.log("\n== SUMMARY ==================================");
  console.log("Users | Avg ms | Max ms | Errors");
  console.log("------+--------+--------+--------");
  for (const s of summary) {
    const errStr = s.errors > 0 ? `${s.errors} FAIL` : "0 OK";
    console.log(`  ${String(s.concurrency).padEnd(4)} | ${String(s.avg).padEnd(6)} | ${String(s.maxMs).padEnd(6)} | ${errStr}`);
  }

  console.log("\nDone. What to look for:");
  console.log("  - Avg under 1000ms at 100 users = healthy");
  console.log("  - Any 500 errors = something needs fixing");
  console.log("  - 429 errors = rate limiting is working correctly");
  console.log("  - Avg climbing sharply between 50->100 = DB connection pressure");
}

main().catch(console.error);