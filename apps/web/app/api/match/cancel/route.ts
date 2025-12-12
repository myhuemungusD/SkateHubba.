import { kv } from "@vercel/kv";
import { asErrorMessage, parseMatchTicket } from "../_utils";

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
        const parsed = parseMatchTicket(t);
        if (parsed?.uid === uid) await kv.zrem("queue", t);
      }
    }

    await kv.del(`ticketFor:${uid}`);

    await kv.del(`presence:${uid}`);
    await kv.del(`lobbyFor:${uid}`);
    await kv.del(`inMatch:${uid}`);

    return Response.json({ status: "cancelled", uid });
  } catch (err: unknown) {
    return Response.json({ error: asErrorMessage(err) }, { status: 500 });
  }
}
