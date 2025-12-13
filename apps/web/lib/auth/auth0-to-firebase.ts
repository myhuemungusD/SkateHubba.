import { signInWithCustomToken } from "firebase/auth";
import { auth as firebaseAuth } from "../firebase/client";

export async function auth0ToFirebase(auth0Token: string) {
  const res = await fetch("/api/auth/auth0-to-firebase", {
    method: "POST",
    body: JSON.stringify({ auth0Token }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!data.firebaseToken) {
    throw new Error("Failed to get Firebase token");
  }

  await signInWithCustomToken(firebaseAuth, data.firebaseToken);
}
