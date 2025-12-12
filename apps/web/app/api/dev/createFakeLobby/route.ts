export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({ credential: applicationDefault() });
}
const db = getFirestore();

export async function POST() {
  const lobbyRef = db.collection("lobbies").doc();

  await lobbyRef.set({
    lobbyId: lobbyRef.id,
    players: ["test1", "test2"],
    mode: "SKATE",
    createdAt: Date.now(),
    state: "ready",
  });

  return NextResponse.json({ lobbyCreated: lobbyRef.id });
}
