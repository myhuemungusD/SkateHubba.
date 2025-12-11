"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import type { Game } from "@skatehubba/types";
import { firestore } from "@utils/firebaseClient";
import { auth } from "@utils/auth";
import AuthButton from "./components/AuthButton";
import { createGame } from "./lib/gameService";

const SKATE_STEPS = ["-", "S", "SK", "SKA", "SKAT", "SKATE"];
const lettersFromCount = (count: number) => SKATE_STEPS[count] ?? "SKATE";

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [opponentUid, setOpponentUid] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setGames([]);
      return;
    }

    const gamesRef = collection(firestore, "games");
    const gamesQuery = query(
      gamesRef,
      where("players", "array-contains", currentUser.uid),
      orderBy("lastActionAt", "desc")
    );

    const unsubscribe = onSnapshot(gamesQuery, (snapshot) => {
      const data: Game[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as Game),
        id: (doc.data() as Game).id || doc.id,
      }));
      setGames(data);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const pending = useMemo(
    () => games.filter((g) => g.state.status === "PENDING_ACCEPT"),
    [games]
  );
  const active = useMemo(
    () => games.filter((g) => g.state.status === "ACTIVE"),
    [games]
  );
  const completed = useMemo(
    () => games.filter((g) => g.state.status === "COMPLETED"),
    [games]
  );
  const declined = useMemo(
    () => games.filter((g) => g.state.status === "DECLINED"),
    [games]
  );

  const handleCreateGame = async () => {
    if (!currentUser || !opponentUid.trim()) return;
    setCreating(true);
    try {
      const gameId = await createGame(currentUser.uid, opponentUid.trim());
      setShowDialog(false);
      setOpponentUid("");
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error("Error creating game", error);
      alert("Failed to create game. Check console for details.");
    } finally {
      setCreating(false);
    }
  };

  const renderGameRow = (game: Game) => {
    const opponentId = currentUser?.uid === game.players[0] ? game.players[1] : game.players[0];
    const lastActionDate =
      game.lastActionAt?.toDate?.() ??
      (typeof game.lastActionAt === "number"
        ? new Date(game.lastActionAt)
        : null);

    const statusLabel = (() => {
      switch (game.state.status) {
        case "ACTIVE":
          return { text: "Active", className: "text-[#39FF14]" };
        case "PENDING_ACCEPT":
          return { text: "Pending", className: "text-yellow-400" };
        case "COMPLETED":
          return { text: "Completed", className: "text-gray-400" };
        case "DECLINED":
          return { text: "Declined", className: "text-red-400" };
        default:
          return { text: game.state.status, className: "text-gray-400" };
      }
    })();

    return (
      <Link
        key={game.id}
        href={`/game/${game.id}`}
        className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-[#39FF14] rounded-lg px-4 py-3 transition-colors"
      >
        <div>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            Opponent
            <span className={`text-xs font-semibold ${statusLabel.className}`}>
              {statusLabel.text}
            </span>
          </p>
          <p className="font-semibold text-white">{opponentId}</p>
          <p className="text-xs text-gray-500 mt-1">Last action: {lastActionDate ? lastActionDate.toLocaleString() : "-"}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Letters</p>
          <p className="font-mono text-[#39FF14] text-lg">
            {lettersFromCount(game.state.p1Letters)} / {lettersFromCount(game.state.p2Letters)}
          </p>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#39FF14] tracking-tight">Your Games</h1>
          <p className="text-gray-500 text-sm">One place to see and start games.</p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <Link
              href="/skate/create"
              className="bg-[#39FF14] text-black font-bold px-4 py-2 rounded hover:bg-[#32cc12] transition-colors"
            >
              New Game
            </Link>
          )}
          <AuthButton />
        </div>
      </div>

      {!currentUser ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400 mb-2">Sign in to view and start games.</p>
          <p className="text-xs text-gray-600">Use the button in the top right to authenticate.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-300">Pending</span>
              <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded-full">{pending.length}</span>
            </div>
            {pending.length === 0 ? (
              <p className="text-gray-600 text-sm">No invites waiting.</p>
            ) : (
              <div className="space-y-3">{pending.map(renderGameRow)}</div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-300">Active</span>
              <span className="text-xs bg-green-900/30 text-[#39FF14] px-2 py-1 rounded-full">{active.length}</span>
            </div>
            {active.length === 0 ? (
              <p className="text-gray-600 text-sm">No active games right now.</p>
            ) : (
              <div className="space-y-3">{active.map(renderGameRow)}</div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-300">Completed</span>
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{completed.length}</span>
            </div>
            {completed.length === 0 ? (
              <p className="text-gray-600 text-sm">No completed games yet.</p>
            ) : (
              <div className="space-y-3">{completed.map(renderGameRow)}</div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-300">Declined</span>
              <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded-full">{declined.length}</span>
            </div>
            {declined.length === 0 ? (
              <p className="text-gray-600 text-sm">No declined games.</p>
            ) : (
              <div className="space-y-3">{declined.map(renderGameRow)}</div>
            )}
          </div>
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Start a New Game</h2>
            <label className="text-sm text-gray-400">Opponent UID</label>
            <input
              type="text"
              value={opponentUid}
              onChange={(e) => setOpponentUid(e.target.value)}
              placeholder="Enter UID"
              className="mt-2 w-full bg-black border border-gray-700 rounded px-3 py-2 text-white focus:border-[#39FF14] outline-none"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDialog(false);
                  setOpponentUid("");
                }}
                className="text-gray-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGame}
                disabled={creating || !opponentUid.trim()}
                className="bg-[#39FF14] text-black font-bold px-4 py-2 rounded hover:bg-[#32cc12] disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Game"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
