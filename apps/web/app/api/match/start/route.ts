import { kv } from "@vercel/kv";
import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const { uid } = await req.json();

  if (!uid) return new Response("Missing uid", { status: 400 });

  // Add user to queue
  await kv.zadd("queue", { score: Date.now(), member: uid });

  // Try find opponent
  const players = await kv.zrange<string>("queue", 0, 1);

  if (players.length < 2) {
    return Response.json({ status: "waiting" });
  }

  const [p1, p2] = players;

  // Remove them from queue
  await kv.zrem("queue", p1);
  await kv.zrem("queue", p2);

  const matchId = uuid();

  await kv.hmset(`match:${matchId}`, {
    players: JSON.stringify([p1, p2]),
    createdAt: Date.now(),
  });

  return Response.json({
    status: "matched",
    matchId,
    players: [p1, p2],
  });
}
