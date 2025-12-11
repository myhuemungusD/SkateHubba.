"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, collection, query, where, orderBy, updateDoc } from "firebase/firestore";
import { firestore } from "@utils/firebaseClient";
import { auth } from "@utils/auth";
import { onAuthStateChanged, User } from "firebase/auth";
import type { Game, Round } from "@skate-types/skate";
import AuthButton from "../../components/AuthButton";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Game Subscription
  useEffect(() => {
    if (!gameId) return;

    const gameRef = doc(firestore, "games", gameId);
    const unsubscribeGame = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        setGame(docSnap.data() as Game);
      } else {
        setGame(null);
      }
      setLoading(false);
    });

    return () => unsubscribeGame();
  }, [gameId]);

  // Rounds Subscription
  useEffect(() => {
    if (!gameId) return;

    const roundsRef = collection(firestore, "rounds");
    const q = query(roundsRef, where("gameId", "==", gameId), orderBy("index", "asc"));

    const unsubscribeRounds = onSnapshot(q, (querySnap) => {
      const roundsData: Round[] = [];
      querySnap.forEach((doc) => {
        roundsData.push(doc.data() as Round);
      });
      setRounds(roundsData);
    });

    return () => unsubscribeRounds();
  }, [gameId]);

  const handleAcceptGame = async () => {
    if (!game || !currentUser) return;
    setActionLoading(true);
    try {
      const gameRef = doc(firestore, "games", game.id);
      await updateDoc(gameRef, {
        status: "ACTIVE",
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("Error accepting game:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineGame = async () => {
    if (!game || !currentUser) return;
    if (!confirm("Are you sure you want to decline this game?")) return;
    
    setActionLoading(true);
    try {
      const gameRef = doc(firestore, "games", game.id);
      await updateDoc(gameRef, {
        status: "DECLINED",
        updatedAt: Date.now()
      });
      router.push("/");
    } catch (error) {
      console.error("Error declining game:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  if (!game) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Game not found</div>;

  // PENDING ACCEPT STATE
  if (game.status === "PENDING_ACCEPT") {
    const isDefender = currentUser?.uid === game.defenderId;
    const isChallenger = currentUser?.uid === game.challengerId;

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <AuthButton />
        </div>

        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-4xl font-bold text-[#39FF14] tracking-tighter">GAME INVITE</h1>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <p className="text-gray-400 mb-4">CHALLENGER</p>
            <div className="text-2xl font-bold mb-8">{game.challengerId === currentUser?.uid ? "You" : "Opponent"}</div>
            
            <div className="text-[#39FF14] text-xl font-bold mb-8">VS</div>
            
            <p className="text-gray-400 mb-4">DEFENDER</p>
            <div className="text-2xl font-bold">{game.defenderId === currentUser?.uid ? "You" : "Opponent"}</div>
          </div>

          {isDefender && (
            <div className="flex gap-4">
              <button
                onClick={handleDeclineGame}
                disabled={actionLoading}
                className="flex-1 py-4 rounded font-bold uppercase tracking-widest bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-900/40 transition-all"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptGame}
                disabled={actionLoading}
                className="flex-1 py-4 rounded font-bold uppercase tracking-widest bg-[#39FF14] text-black hover:bg-[#32cc12] transition-all"
              >
                {actionLoading ? "..." : "Accept"}
              </button>
            </div>
          )}

          {isChallenger && (
            <div className="text-gray-500 animate-pulse">
              Waiting for opponent to accept...
            </div>
          )}
          
          {!isDefender && !isChallenger && (
             <div className="text-gray-500">
              This game is pending acceptance.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ACTIVE GAME STATE
  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 relative">
      <div className="absolute top-4 right-4">
        <AuthButton />
      </div>

      <div className="mt-16 max-w-2xl mx-auto w-full">
        {/* Scoreboard */}
        <div className="flex justify-between items-end mb-8 bg-gray-900 p-6 rounded-lg border border-gray-800">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">CHALLENGER</p>
            <p className="font-bold text-lg mb-2">{game.challengerId === currentUser?.uid ? "YOU" : "OPP"}</p>
            <div className="text-3xl font-mono text-red-500 tracking-[0.5em]">
              {game.challengerLetters || "-"}
            </div>
          </div>
          
          <div className="text-center pb-2">
            <div className="text-4xl font-bold text-[#39FF14]">VS</div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">DEFENDER</p>
            <p className="font-bold text-lg mb-2">{game.defenderId === currentUser?.uid ? "YOU" : "OPP"}</p>
            <div className="text-3xl font-mono text-red-500 tracking-[0.5em]">
              {game.defenderLetters || "-"}
            </div>
          </div>
        </div>

        {/* Game Status / Action Area */}
        <div className="mb-8 text-center">
          {game.status === "COMPLETED" ? (
            <div className="bg-[#39FF14]/10 border border-[#39FF14] p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-[#39FF14] mb-2">GAME OVER</h2>
              <p className="text-white">Winner: {game.winnerId === currentUser?.uid ? "YOU" : "OPPONENT"}</p>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <p className="text-gray-400 mb-2">CURRENT TURN</p>
              <h2 className="text-2xl font-bold text-white mb-4">
                {game.currentTurn}
              </h2>
              
              {/* Logic for buttons will go here (Set Trick / View Attempt) */}
              <button 
                className="bg-gray-800 text-gray-500 px-6 py-3 rounded font-bold cursor-not-allowed"
                disabled
              >
                Waiting for turn...
              </button>
            </div>
          )}
        </div>

        {/* Rounds History */}
        <div className="space-y-4">
          <h3 className="text-gray-500 font-bold text-sm uppercase">Rounds</h3>
          {rounds.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No rounds yet. Game just started!</p>
          ) : (
            rounds.map((round) => (
              <div key={round.id} className="bg-gray-900 border border-gray-800 p-4 rounded flex justify-between items-center">
                <div>
                  <span className="text-[#39FF14] font-bold mr-4">R{round.index + 1}</span>
                  <span className="text-gray-400">{round.status}</span>
                </div>
                <div className="text-sm">
                  {round.attackerResult} vs {round.defenderResult}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
