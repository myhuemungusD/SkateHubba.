import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

    await kv.zrem("queue", players[0]);
    await kv.zrem("queue", players[1]);

    return Response.json({
      status: "matched",
      lobbyId,
      players: [playerA, playerB],
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
