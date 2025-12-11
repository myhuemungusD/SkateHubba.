import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Use Node runtime because firebase-admin is not edge-friendly
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
    const { uid, mode, skill } = await req.json();

    if (!uid || !mode) {
      return NextResponse.json({ error: "Missing uid or mode." }, { status: 400 });
    }

    // Presence (auto expires in 30s)
    await kv.set(`presence:${uid}`, { uid, mode, skill }, { ex: 30 });

    // Create match ticket
    const ticketRef = db.collection("matchTickets").doc();
    await ticketRef.set({
      uid,
      mode,
      skill: skill || 100,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      ticketId: ticketRef.id,
      status: "searching",
    });
  } catch (error) {
    console.error("match/start failed", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
