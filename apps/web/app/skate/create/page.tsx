"use client";

import { useState, useEffect } from "react";
import { createGame } from "@skatehubba/skate-engine";
import { auth } from "@utils/auth";
import { doc, setDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { firestore } from "@utils/firebaseClient";
import { onAuthStateChanged, User } from "firebase/auth";
import AuthButton from "../../components/AuthButton";
import { GameVisibility } from "@skatehubba/types";

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  email?: string;
}

type Step = "TYPE" | "OPPONENT" | "RULES" | "CONFIRM";

export default function CreateGamePage() {
  const [step, setStep] = useState<Step>("TYPE");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Game State
  // const [gameType, setGameType] = useState("SKATE"); // Only one for now
  const [opponent, setOpponent] = useState<UserProfile | null>(null);
  const [visibility, setVisibility] = useState<GameVisibility>("PUBLIC");
  // const [spotId, setSpotId] = useState<string | null>(null);
  const spotId = null; // Hardcoded for now until spots are implemented
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);
    
    try {
      const usersRef = collection(firestore, "users");
      const q = query(
        usersRef, 
        where("displayName", ">=", searchQuery),
        where("displayName", "<=", searchQuery + '\uf8ff'),
        limit(5)
      );

      const snapshot = await getDocs(q);
      const results: UserProfile[] = [];
      snapshot.forEach((doc) => {
        if (currentUser && doc.id !== currentUser.uid) {
          results.push(doc.data() as UserProfile);
        }
      });
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateGame = async () => {
    if (!currentUser || !opponent) return;

    setCreating(true);

    try {
      const gameRef = doc(collection(firestore, "games"));
      const gameId = gameRef.id;

      const newGame = createGame(
        gameId, 
        currentUser.uid, 
        opponent.uid,
        visibility,
        spotId
      );

      await setDoc(gameRef, newGame);
      window.location.href = `/skate/${gameId}`;
    } catch (err) {
      console.error("Error creating game:", err);
      setCreating(false);
    }
  };

  // Render Steps
  const renderStep = () => {
    switch (step) {
      case "TYPE":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Select Game Type</h2>
            <div 
              onClick={() => setStep("OPPONENT")}
              className="bg-gray-900 border border-[#39FF14] p-6 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
            >
              <h3 className="text-xl font-bold text-[#39FF14] mb-2">1v1 S.K.A.T.E.</h3>
              <p className="text-gray-400 text-sm">Classic game. Set tricks, match them, or get a letter.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg opacity-50 cursor-not-allowed">
              <h3 className="text-xl font-bold text-gray-500 mb-2">Team Battle</h3>
              <p className="text-gray-600 text-sm">Coming soon...</p>
            </div>
          </div>
        );

      case "OPPONENT":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Choose Opponent</h2>
            
            {opponent ? (
              <div className="bg-black border border-[#39FF14] rounded p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {opponent.photoURL ? (
                    <img src={opponent.photoURL} alt={opponent.displayName} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">👤</div>
                  )}
                  <div>
                    <p className="font-bold text-[#39FF14]">{opponent.displayName}</p>
                    <p className="text-xs text-gray-500">UID: {opponent.uid.substring(0, 6)}...</p>
                  </div>
                </div>
                <button 
                  onClick={() => setOpponent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username..."
                    className="flex-1 bg-black border border-gray-700 rounded px-4 py-3 text-white focus:border-[#39FF14] outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={searching}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 rounded font-bold"
                  >
                    {searching ? "..." : "Search"}
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="bg-black border border-gray-800 rounded max-h-60 overflow-y-auto">
                    {searchResults.map(user => (
                      <div 
                        key={user.uid}
                        onClick={() => setOpponent(user)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-900 cursor-pointer border-b border-gray-900 last:border-0"
                      >
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs">👤</div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-sm">{user.displayName}</p>
                        </div>
                        <button className="text-xs bg-[#39FF14] text-black px-3 py-1 rounded font-bold">
                          SELECT
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep("TYPE")}
                className="text-gray-500 hover:text-white"
              >
                Back
              </button>
              <button 
                onClick={() => setStep("RULES")}
                disabled={!opponent}
                className={`px-8 py-3 rounded font-bold uppercase tracking-widest transition-all
                  ${!opponent 
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                    : "bg-[#39FF14] text-black hover:bg-[#32cc12]"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        );

      case "RULES":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Game Rules</h2>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Word</label>
                <div className="text-2xl font-bold text-[#39FF14] tracking-widest">S.K.A.T.E.</div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Time Limit</label>
                <div className="text-white">24 Hours per turn</div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Visibility</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setVisibility("PUBLIC")}
                    className={`flex-1 py-3 rounded border ${visibility === "PUBLIC" ? "border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]" : "border-gray-700 text-gray-500"}`}
                  >
                    Public
                  </button>
                  <button 
                    onClick={() => setVisibility("PRIVATE")}
                    className={`flex-1 py-3 rounded border ${visibility === "PRIVATE" ? "border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]" : "border-gray-700 text-gray-500"}`}
                  >
                    Private
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep("OPPONENT")}
                className="text-gray-500 hover:text-white"
              >
                Back
              </button>
              <button 
                onClick={handleCreateGame}
                disabled={creating}
                className={`px-8 py-3 rounded font-bold uppercase tracking-widest transition-all
                  ${creating 
                    ? "bg-gray-700 text-gray-500 cursor-wait" 
                    : "bg-[#39FF14] text-black hover:bg-[#32cc12]"
                  }`}
              >
                {creating ? "Creating..." : "Create Game"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <AuthButton />
      </div>

      <div className="w-full max-w-md">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1 flex-1 rounded ${step === "TYPE" || step === "OPPONENT" || step === "RULES" ? "bg-[#39FF14]" : "bg-gray-800"}`} />
          <div className={`h-1 flex-1 rounded ${step === "OPPONENT" || step === "RULES" ? "bg-[#39FF14]" : "bg-gray-800"}`} />
          <div className={`h-1 flex-1 rounded ${step === "RULES" ? "bg-[#39FF14]" : "bg-gray-800"}`} />
        </div>

        {renderStep()}
      </div>
    </div>
  );
}
