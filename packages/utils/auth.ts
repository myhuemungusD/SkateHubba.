import { firebaseApp } from "./firebaseClient";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const auth = getAuth(firebaseApp);

export const listenToAuth = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const login = () => {
  if (typeof window === "undefined") return;

  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!domain || !clientId || !siteUrl || !audience) {
    console.error("Missing Auth0 environment variables");
    return;
  }

  const authorizeUrl = `https://${domain}/authorize?${new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${siteUrl}/auth/callback`,
    scope: "openid profile email",
    audience,
  }).toString()}`;

  window.location.href = authorizeUrl;
};

export const logout = () => {
  if (typeof window === "undefined") return;

  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!domain || !clientId || !siteUrl) {
    console.error("Missing Auth0 environment variables");
    return;
  }

  const logoutUrl = `https://${domain}/v2/logout?${new URLSearchParams({
    client_id: clientId,
    returnTo: siteUrl,
  }).toString()}`;

  window.location.href = logoutUrl;
};

export { auth };
