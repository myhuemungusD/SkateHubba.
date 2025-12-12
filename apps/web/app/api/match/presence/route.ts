import { kv } from "@vercel/kv";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();

  if (!uid) {
    return new Response("Missing uid", { status: 400 });
  }

  // Mark player as present (TTL 15 seconds)
  await kv.set(`presence:${uid}`, Date.now(), { ex: 15 });

  return Response.json({ ok: true });
}
