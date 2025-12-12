import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST() {
  try {
    // Get two oldest players from sorted queue
    const players = (await kv.zrange("queue", 0, 1)) as string[];

    if (!players || players.length < 2) {
      return Response.json({ status: "waiting" });
    }

    const playerA = JSON.parse(players[0]);
    const playerB = JSON.parse(players[1]);

    const lobbyId = `${playerA.uid}-${playerB.uid}`;

    await kv.set(`lobby:${lobbyId}`, {
      id: lobbyId,
      players: [playerA.uid, playerB.uid],
      createdAt: Date.now(),
    });

    // Reverse pointers for fast lookup/cleanup
    await kv.set(`lobbyFor:${playerA.uid}`, lobbyId, { ex: 3600 });
    await kv.set(`lobbyFor:${playerB.uid}`, lobbyId, { ex: 3600 });
    await kv.set(`inMatch:${playerA.uid}`, true, { ex: 3600 });
    await kv.set(`inMatch:${playerB.uid}`, true, { ex: 3600 });
    await kv.del(`ticketFor:${playerA.uid}`);
    await kv.del(`ticketFor:${playerB.uid}`);

    await kv.zrem("queue", players[0]);
    await kv.zrem("queue", players[1]);

    return Response.json({
      status: "matched",
      lobbyId,
      players: [playerA, playerB],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
