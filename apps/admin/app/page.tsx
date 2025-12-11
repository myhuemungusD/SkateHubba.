"use client";

import { useState } from "react";

export default function AdminHome() {
  const [gameId, setGameId] = useState("");
  const WEB_URL = "http://localhost:3000";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <header className="mb-10 border-b border-gray-800 pb-6">
        <h1 className="text-4xl font-bold text-[#39FF14]">SkateHubba Admin</h1>
        <p className="text-gray-400 mt-2">Control Center & Navigation Hub</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Navigation Card */}
        <div className="bg-black border border-gray-800 rounded-xl p-6 shadow-lg hover:border-[#39FF14] transition-colors">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🚀</span> App Navigation
          </h2>
          <div className="space-y-3">
            <a href={WEB_URL} target="_blank" className="block w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded text-center transition-colors">
              Open Landing Page
            </a>
            <a href={`${WEB_URL}/skate/create`} target="_blank" className="block w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded text-center transition-colors">
              Go to Create Game
            </a>
            <a href={`${WEB_URL}/skate/join`} target="_blank" className="block w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded text-center transition-colors">
              Go to Join List
            </a>
            <a href={`${WEB_URL}/debug`} target="_blank" className="block w-full py-3 px-4 bg-[#39FF14] text-black font-bold hover:bg-[#32cc12] rounded text-center transition-colors">
              Open Debug Hub (In-App)
            </a>
          </div>
        </div>

        {/* Game Jump Card */}
        <div className="bg-black border border-gray-800 rounded-xl p-6 shadow-lg hover:border-blue-500 transition-colors">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎮</span> Game Jump
          </h2>
          <p className="text-sm text-gray-400 mb-4">Enter a Game ID to open it directly.</p>
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="e.g. game-123-abc"
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white mb-4 focus:border-blue-500 outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <a 
              href={gameId ? `${WEB_URL}/skate/${gameId}` : "#"} 
              target="_blank"
              className={`py-2 px-4 rounded text-center font-bold transition-colors ${gameId ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
            >
              View Game
            </a>
            <a 
              href={gameId ? `${WEB_URL}/skate/${gameId}/submit` : "#"} 
              target="_blank"
              className={`py-2 px-4 rounded text-center font-bold transition-colors ${gameId ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
            >
              Submit Turn
            </a>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-black border border-gray-800 rounded-xl p-6 shadow-lg hover:border-purple-500 transition-colors">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> System Status
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400">Web App Port</span>
              <span className="text-[#39FF14] font-mono">3000</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400">Admin Port</span>
              <span className="text-purple-400 font-mono">3001</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400">Environment</span>
              <span className="text-blue-400">Development</span>
            </div>
            <div className="mt-4 p-3 bg-gray-900 rounded text-xs text-gray-500">
              Note: This admin portal controls the local development instance running on localhost:3000.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
