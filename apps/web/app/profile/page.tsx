"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@utils/auth";
import { onAuthStateChanged, User } from "firebase/auth";
import { createGame } from "./lib/gameService";

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [opponentUid, setOpponentUid] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Load current user EXACTLY how Profile page does it
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be signed in.");
      return;
    }

    if (!opponentUid.trim()) {
      setError("Enter your friend's UID.");
      return;
    }

    try {
      setCreating(true);
      const gameId = await createGame(user.uid, opponentUid.trim());
      router.push(`/game/${gameId}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to create game.");
    } finally {
      setCreating(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-gray-800 bg-gray-900/70 p-6 rounded-xl">
        <h1 className="text-3xl font-bold text-[#39FF14] text-center mb-8 tracking-tight">
          SkateHubba – Play S.K.A.T.E.
        </h1>

        {!user ? (
          <p className="text-center text-gray-400 text-sm">
            Sign in first to start a game.
          </p>
        ) : (
          <form onSubmit={handleCreateGame} className="space-y-6">
            <div>
              <label className="block text-gray-400 mb-2 text-sm uppercase tracking-wide font-semibold">
                Opponent UID
              </label>
              <input
                type="text"
                value={opponentUid}
                onChange={(e) => setOpponentUid(e.target.value)}
                placeholder="Paste your friend's UID"
                className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-[#39FF14] outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                MVP method: share UID manually from Firestore users collection.
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={creating}
              className={`w-full py-3 rounded font-bold uppercase tracking-wider transition-all ${
                creating
                  ? "bg-gray-700 text-gray-500 cursor-wait"
                  : "bg-[#39FF14] text-black hover:bg-[#32cc12]"
              }`}
            >
              {creating ? "Creating..." : "Start New Game"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
