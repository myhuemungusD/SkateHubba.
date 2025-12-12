import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) return Response.json({ error: "Missing uid" }, { status: 400 });

    const ticket = JSON.stringify({ uid, ts: Date.now() });

    await kv.zadd("queue", {
      score: Date.now(),
      member: ticket,
    });

    return Response.json({ status: "queued", uid });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
