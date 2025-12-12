import { kv } from "@vercel/kv";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) return new Response("Missing uid", { status: 400 });

    await kv.set(`presence:${uid}`, Date.now(), { ex: 30 });

    return new Response(JSON.stringify({ status: "ok", uid }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
