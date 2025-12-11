"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@utils/auth";
import { firestore, storage } from "@utils/firebaseClient";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { createRound } from "@skatehubba/skate-engine";
import { onAuthStateChanged, User } from "firebase/auth";
import { Game } from "@skatehubba/types";

export default function SubmitTurnPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [trickName, setTrickName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/"); // Redirect if not logged in
      } else {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !trickName) {
      setError("Please fill in all fields and select a video.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // 1. Upload Video
      const fileId = uuidv4();
      const storageRef = ref(storage, `skateTurns/${gameId}/${fileId}.mp4`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // 2. Fetch Game to get context
      const gameRef = doc(firestore, "games", gameId);
      const gameSnap = await getDoc(gameRef);
      if (!gameSnap.exists()) {
        throw new Error("Game not found");
      }
      const game = gameSnap.data() as Game;
      
      // Determine defender (the other player)
      const defenderId = game.challengerId === user.uid ? game.defenderId : game.challengerId;
      const roundIndex = (game.rounds?.length || 0) + 1;

      // 3. Create Round Object
      const roundId = uuidv4();
      const roundData = createRound(
        roundId,
        gameId,
        roundIndex,
        user.uid,
        defenderId,
        downloadUrl
      );

      // 4. Save to Firestore
      // Save round
      await setDoc(doc(firestore, "games", gameId, "rounds", roundId), roundData);
      
      // Update game with new round ID
      await updateDoc(gameRef, {
        rounds: arrayUnion(roundId),
        updatedAt: Date.now()
      });

      // 5. Redirect
      router.push(`/skate/${gameId}`);
    } catch (err) {
      console.error("Error submitting turn:", err);
      setError("Failed to submit turn. Please try again.");
      setUploading(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <div className="w-full max-w-md mt-10">
        <h1 className="text-3xl font-bold text-[#39FF14] mb-6 text-center">SUBMIT ATTEMPT</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg border border-gray-800">
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-400 mb-2 text-sm font-bold uppercase">Trick Name</label>
            <input
              type="text"
              value={trickName}
              onChange={(e) => setTrickName(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-[#39FF14] outline-none"
              placeholder="e.g. Kickflip"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-sm font-bold uppercase">Video Proof</label>
            <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-[#39FF14] transition-colors cursor-pointer">
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <p className="text-[#39FF14] font-bold truncate">{file.name}</p>
              ) : (
                <p className="text-gray-500 text-sm">Tap to upload video</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-4 rounded font-bold text-lg uppercase tracking-widest transition-all
              ${uploading 
                ? "bg-gray-700 text-gray-500 cursor-wait" 
                : "bg-[#FF4500] text-white hover:bg-[#ff571a] hover:shadow-[0_0_15px_#FF4500]"
              }`}
          >
            {uploading ? "Uploading..." : "Submit Trick"}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full py-2 text-gray-500 hover:text-white text-sm"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
