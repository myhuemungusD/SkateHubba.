import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) return Response.json({ error: "Missing uid" }, { status: 400 });

    const ticket = JSON.stringify({ uid, ts: Date.now() });

    // Save a direct pointer so /api/match/cancel can remove in O(1)
    await kv.set(`ticketFor:${uid}`, ticket, { ex: 120 });

    await kv.zadd("queue", {
      score: Date.now(),
      member: ticket,
    });

    return Response.json({ status: "queued", uid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
