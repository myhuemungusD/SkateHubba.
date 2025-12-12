export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({ credential: applicationDefault() });
}
const db = getFirestore();

export async function POST() {
  const tickets = await db
    .collection("matchTickets")
    .orderBy("createdAt", "asc")
    .limit(2)
    .get();

  if (tickets.size < 2) {
    return NextResponse.json({ error: "Not enough tickets to match" });
  }

  const [a, b] = tickets.docs;

  const lobbyRef = db.collection("lobbies").doc();

  await lobbyRef.set({
    lobbyId: lobbyRef.id,
    players: [a.data().uid, b.data().uid],
    mode: a.data().mode,
    createdAt: Date.now(),
    state: "ready",
  });

  await a.ref.delete();
  await b.ref.delete();

  return NextResponse.json({ forcedLobby: lobbyRef.id });
}
