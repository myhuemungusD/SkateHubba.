import { kv } from "@vercel/kv";
import { asErrorMessage, parseMatchTicket } from "../_utils";

export const runtime = "nodejs";

export async function POST() {
  try {
    // Get two oldest players from sorted queue
    const players = (await kv.zrange("queue", 0, 1)) as string[];

    if (!players || players.length < 2) {
      return Response.json({ status: "waiting" });
    }

    const playerA = parseMatchTicket(players[0]);
    const playerB = parseMatchTicket(players[1]);

    if (!playerA || !playerB) {
      return Response.json({ error: "Malformed queue tickets" }, { status: 500 });
    }

    const lobbyId = `${playerA.uid}-${playerB.uid}`;

    await kv.set(`lobby:${lobbyId}`, {
      id: lobbyId,
      players: [playerA.uid, playerB.uid],
      createdAt: Date.now(),
    });

    // Reverse pointers for fast lookup/cleanup
    await Promise.all([
      kv.set(`lobbyFor:${playerA.uid}`, lobbyId, { ex: 3600 }),
      kv.set(`lobbyFor:${playerB.uid}`, lobbyId, { ex: 3600 }),
      kv.set(`inMatch:${playerA.uid}`, true, { ex: 3600 }),
      kv.set(`inMatch:${playerB.uid}`, true, { ex: 3600 }),
      kv.del(`ticketFor:${playerA.uid}`),
      kv.del(`ticketFor:${playerB.uid}`),
    ]);

    await kv.zrem("queue", players[0]);
    await kv.zrem("queue", players[1]);

    return Response.json({
      status: "matched",
      lobbyId,
      players: [playerA, playerB],
    });
  } catch (err: unknown) {
    return Response.json({ error: asErrorMessage(err) }, { status: 500 });
  }
}
