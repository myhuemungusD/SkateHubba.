import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) return Response.json({ error: "Missing uid" }, { status: 400 });

    // Fast path: remove the exact ticket string for this user
    const ticket = await kv.get(`ticketFor:${uid}`);
    if (typeof ticket === "string" && ticket.length > 0) {
      await kv.zrem("queue", ticket);
    } else {
      // Fallback (backward compat): scan the queue
      const tickets = (await kv.zrange("queue", 0, -1)) as string[];
      for (const t of tickets) {
        try {
          const data = JSON.parse(t);
          if (data?.uid === uid) {
            await kv.zrem("queue", t);
          }
        } catch {
          // ignore malformed ticket
        }
      }
    }

    await kv.del(`ticketFor:${uid}`);

    await kv.del(`presence:${uid}`);
    await kv.del(`lobbyFor:${uid}`);
    await kv.del(`inMatch:${uid}`);

    return Response.json({ status: "cancelled", uid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
