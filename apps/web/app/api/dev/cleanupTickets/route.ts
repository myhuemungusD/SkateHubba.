export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({ credential: applicationDefault() });
}
const db = getFirestore();

export async function POST() {
  const old = await db.collection("matchTickets").get();

  const batch = db.batch();
  old.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  return NextResponse.json({ cleared: old.size });
}
