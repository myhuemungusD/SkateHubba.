import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) return Response.json({ error: "Missing uid" }, { status: 400 });

    // remove any ticket for this user
    const tickets = (await kv.zrange("queue", 0, -1)) as string[];
    for (const t of tickets) {
      const data = JSON.parse(t);
      if (data.uid === uid) {
        await kv.zrem("queue", t);
      }
    }

    await kv.del(`presence:${uid}`);
    await kv.del(`lobbyFor:${uid}`);
    await kv.del(`inMatch:${uid}`);

    return Response.json({ status: "cancelled", uid });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
