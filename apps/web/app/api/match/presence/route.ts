export const runtime = "edge";

import { kv } from "@vercel/kv";

export async function POST(req: Request) {
  const { uid, mode, skill } = await req.json();

  if (!uid || !mode) {
    return new Response(JSON.stringify({ error: "missing fields" }), { status: 400 });
  }

  await kv.set(`presence:${uid}`, { uid, mode, skill }, { ex: 30 });

  return new Response("ok");
}
