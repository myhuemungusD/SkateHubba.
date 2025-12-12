export const runtime = "edge";

import { kv } from "@vercel/kv";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) return new Response("Missing uid", { status: 400 });

    await kv.set(`presence:${uid}`, Date.now(), { ex: 30 });

    return new Response(JSON.stringify({ status: "ok", uid }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
    });
  }
}
