import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  }
  return initializeApp({ credential: applicationDefault() });
}

const db = getFirestore(getAdminApp());

export async function POST(req: Request) {
  try {
    const { uid, ticketId } = await req.json();

    if (!uid || !ticketId) {
      return NextResponse.json({ error: "Missing uid or ticketId." }, { status: 400 });
    }

    await kv.del(`presence:${uid}`);
    await db.collection("matchTickets").doc(ticketId).delete().catch(() => {});

    return NextResponse.json({ status: "cancelled" });
  } catch (error) {
    console.error("match/cancel failed", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
