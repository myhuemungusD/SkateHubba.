export const runtime = "edge";

import { kv } from "@vercel/kv";

export async function POST() {
  const keys = await kv.keys("presence:*");
  const result: Record<string, unknown> = {};

  for (const key of keys) {
    result[key] = await kv.get(key);
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { "content-type": "application/json" },
  });
}
