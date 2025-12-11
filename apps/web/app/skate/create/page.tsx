"use client";

import { useState, useEffect } from "react";
import { createGame } from "@skatehubba/skate-engine";
import { auth } from "@utils/auth";
import { doc, setDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { firestore } from "@utils/firebaseClient";
import { onAuthStateChanged, User } from "firebase/auth";
import AuthButton from "../../components/AuthButton";

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  email?: string;
}

export default function CreateGamePage() {
  const [opponentId, setOpponentId] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const copyToClipboard = () => {
    if (currentUser) {
      navigator.clipboard.writeText(currentUser.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);
    
    try {
      const usersRef = collection(firestore, "users");
      // Search by displayName (case-sensitive prefix match is standard Firestore behavior)
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

  const selectOpponent = (user: UserProfile) => {
    setSelectedOpponent(user);
    setOpponentId(user.uid);
    setSearchResults([]);
    setSearchQuery("");
  };

  const clearSelection = () => {
    setSelectedOpponent(null);
    setOpponentId("");
  };

  const handleCreateGame = async () => {
    if (!currentUser || !opponentId) return;

    setLoading(true);
    setError("");

    try {
      // Generate a new ID for the game
      const gameRef = doc(collection(firestore, "games"));
      const gameId = gameRef.id;

      // Create the game object using the engine
      const newGame = createGame(gameId, currentUser.uid, opponentId);

      // Write to Firestore
      await setDoc(gameRef, newGame);

      // Redirect to the game page
      window.location.href = `/skate/${gameId}`;
    } catch (err) {
      console.error("Error creating game:", err);
      setError("Failed to create game. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <AuthButton />
      </div>

      <h1 className="text-4xl font-bold text-[#39FF14] mb-8 tracking-tighter">
        NEW SKATE GAME
      </h1>

      <div className="w-full max-w-md space-y-6">
        {currentUser && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">Your Player ID (Share this with friends)</p>
            <div className="flex items-center gap-2">
              <code className="bg-black px-2 py-1 rounded text-[#39FF14] flex-1 overflow-hidden text-ellipsis">
                {currentUser.uid}
              </code>
              <button 
                onClick={copyToClipboard}
                className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-white transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Opponent Selection Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Find Opponent</h2>
          
          {selectedOpponent ? (
            <div className="flex items-center justify-between bg-black border border-[#39FF14] rounded p-3 mb-4">
              <div className="flex items-center gap-3">
                {selectedOpponent.photoURL ? (
                  <img src={selectedOpponent.photoURL} alt={selectedOpponent.displayName} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">👤</div>
                )}
                <div>
                  <p className="font-bold text-[#39FF14]">{selectedOpponent.displayName}</p>
                  <p className="text-xs text-gray-500">{selectedOpponent.uid.substring(0, 8)}...</p>
                </div>
              </div>
              <button onClick={clearSelection} className="text-gray-400 hover:text-white">✕</button>
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username..."
                  className="flex-1 bg-black border border-gray-700 rounded px-4 py-2 text-white focus:border-[#39FF14] outline-none"
                />
                <button 
                  type="submit"
                  disabled={searching}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded font-bold transition-colors"
                >
                  {searching ? "..." : "Search"}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="bg-black border border-gray-800 rounded max-h-40 overflow-y-auto">
                  {searchResults.map(user => (
                    <div 
                      key={user.uid}
                      onClick={() => selectOpponent(user)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-900 cursor-pointer border-b border-gray-900 last:border-0"
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs">👤</div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-sm">{user.displayName}</p>
                      </div>
                      <button className="text-xs bg-[#39FF14] text-black px-2 py-1 rounded font-bold">
                        SELECT
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-800"></div>
                <span className="flex-shrink-0 mx-4 text-gray-600 text-xs">OR ENTER ID</span>
                <div className="flex-grow border-t border-gray-800"></div>
              </div>

              <input
                type="text"
                value={opponentId}
                onChange={(e) => {
                  setOpponentId(e.target.value);
                  setSelectedOpponent(null);
                }}
                placeholder="Paste Opponent UID directly"
                className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white focus:border-[#39FF14] outline-none text-sm"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-center text-sm bg-red-900/20 p-2 rounded border border-red-900">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateGame}
          disabled={loading || !opponentId || !currentUser}
          className={`w-full py-4 rounded font-bold text-lg uppercase tracking-widest transition-all
            ${loading || !opponentId || !currentUser
              ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
              : "bg-[#39FF14] text-black hover:bg-[#32cc12] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]"
            }`}
        >
          {loading ? "Creating Game..." : "Start Game"}
        </button>

        {currentUser && (
          <button
            onClick={() => setOpponentId("PRACTICE-BOT")}
            className="w-full text-xs text-gray-500 hover:text-[#39FF14] mt-2 underline"
          >
            Play Practice Mode (vs Bot)
          </button>
        )}

        {!currentUser && (
          <p className="text-center text-gray-500 text-sm">
            You must be logged in to start a game.
          </p>
        )}
      </div>
    </div>
  );
}
