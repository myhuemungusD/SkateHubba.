import { kv } from "@vercel/kv";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();

  if (!uid) return new Response("Missing uid", { status: 400 });

  await kv.zrem("queue", uid);

  return Response.json({ ok: true });
}
