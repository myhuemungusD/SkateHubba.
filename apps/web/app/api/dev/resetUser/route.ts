export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({ credential: applicationDefault() });
}
const db = getFirestore();

export async function POST(req: Request) {
  const { uid } = await req.json();

  await db.collection("users").doc(uid).update({
    lobbyId: null,
    inMatch: false,
  });

  return NextResponse.json({ reset: uid });
}
