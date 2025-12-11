"use client";

import Link from "next/link";
import { useState } from "react";

export default function DebugPage() {
  const [customGameId, setCustomGameId] = useState("test-game-123");

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-4xl font-bold text-[#39FF14] mb-8 border-b border-gray-800 pb-4">
        DEV / ADMIN HUB
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Navigation Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-orange-500 uppercase">Quick Navigation</h2>
          <div className="flex flex-col gap-2">
            <Link href="/" className="p-3 bg-gray-900 hover:bg-gray-800 rounded border border-gray-700 hover:border-[#39FF14] transition-colors">
              🏠 Landing Page
            </Link>
            <Link href="/skate/create" className="p-3 bg-gray-900 hover:bg-gray-800 rounded border border-gray-700 hover:border-[#39FF14] transition-colors">
              ➕ Create Game
            </Link>
            <Link href="/skate/join" className="p-3 bg-gray-900 hover:bg-gray-800 rounded border border-gray-700 hover:border-[#39FF14] transition-colors">
              🔍 Join Game List
            </Link>
          </div>
        </div>

        {/* Game Simulation Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-orange-500 uppercase">Game Simulation</h2>
          <div className="bg-gray-900 p-4 rounded border border-gray-700">
            <label className="block text-xs text-gray-400 mb-2">Target Game ID</label>
            <input 
              type="text" 
              value={customGameId}
              onChange={(e) => setCustomGameId(e.target.value)}
              className="w-full bg-black border border-gray-600 rounded p-2 mb-4 text-[#39FF14]"
            />
            <div className="grid grid-cols-2 gap-2">
              <Link 
                href={`/skate/${customGameId}`}
                className="p-2 bg-blue-900/50 text-blue-200 text-center rounded hover:bg-blue-800 transition-colors"
              >
                View Game
              </Link>
              <Link 
                href={`/skate/${customGameId}/submit`}
                className="p-2 bg-red-900/50 text-red-200 text-center rounded hover:bg-red-800 transition-colors"
              >
                Submit Turn
              </Link>
            </div>
          </div>
        </div>

        {/* Auth Debug */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-orange-500 uppercase">Auth Status</h2>
          <div className="p-4 bg-gray-900 rounded border border-gray-700 text-sm">
            <p className="mb-2">If you are stuck on &quot;Loading...&quot; or errors:</p>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>Check Vercel Environment Variables</li>
              <li>Ensure Firebase API Key is valid</li>
              <li>Check Console Logs (F12)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
