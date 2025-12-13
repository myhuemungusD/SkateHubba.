import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const returnTo = url.searchParams.get("returnTo") || "/";

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const audience = process.env.AUTH0_AUDIENCE;

  if (!domain || !clientId || !audience) {
    return NextResponse.json(
      { error: "Missing Auth0 environment variables" },
      { status: 500 }
    );
  }

  const origin = url.origin;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${origin}/auth/callback`,
    scope: "openid profile email",
    audience,
    state: returnTo,
  });

  return NextResponse.redirect(`https://${domain}/authorize?${params.toString()}`);
}
