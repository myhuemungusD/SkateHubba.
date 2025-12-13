import { NextResponse } from "next/server";
import * as jose from "jose";
import { getFirebaseAdmin } from "../../../../lib/firebase/admin";

export const runtime = "nodejs";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const JWKS = jose.createRemoteJWKSet(
  new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)
);

export async function POST(req: Request) {
  try {
    const { auth0Token } = await req.json();
    if (!auth0Token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const { payload } = await jose.jwtVerify(auth0Token, JWKS, {
      issuer: `https://${AUTH0_DOMAIN}/`,
      audience: process.env.AUTH0_AUDIENCE!,
    });

    const roles = (payload["https://skatehubba.com/roles"] as string[]) || [];
    const orgId = (payload["https://skatehubba.com/org_id"] as string) || "org_main";
    const userId = (payload["https://skatehubba.com/user_id"] as string) || payload.sub;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid Auth0 token (missing user_id)" },
        { status: 400 }
      );
    }

    const admin = getFirebaseAdmin();
    const customToken = await admin.auth().createCustomToken(userId, {
      roles,
      orgId,
    });

    return NextResponse.json({ firebaseToken: customToken });
  } catch (err) {
    console.error("Auth Bridge Error:", err);
    return NextResponse.json({ error: "Token verification failed" }, { status: 401 });
  }
}
