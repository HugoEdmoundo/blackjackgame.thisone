"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [tab, setTab] = useState<"create" | "join">("create")
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleCreate() {
    if (!playerName.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: playerName.trim() }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error)
      } else {
        const playerId = data.playerId
        const roomId = data.room.id
        router.push(`/room/${roomId}?playerId=${playerId}`)
      }
    } catch {
      setError("Gagal membuat room")
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!playerName.trim() || !roomCode.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: playerName.trim(), roomCode: roomCode.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error)
      } else {
        const playerId = data.playerId
        const roomId = data.room.id
        router.push(`/room/${roomId}?playerId=${playerId}`)
      }
    } catch {
      setError("Gagal join room")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">♠️ Blackjack ♥️</h1>
          <p className="text-green-200">Main bareng temen-temen!</p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTab("create")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === "create" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Buat Room
            </button>
            <button
              onClick={() => setTab("join")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === "join" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Join Room
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kamu</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Masukkan nama..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                maxLength={20}
              />
            </div>

            {tab === "join" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: ABC123"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none uppercase tracking-widest font-mono transition-colors"
                  maxLength={6}
                />
              </div>
            )}

            <button
              onClick={tab === "create" ? handleCreate : handleJoin}
              disabled={loading || !playerName.trim() || (tab === "join" && !roomCode.trim())}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? "Loading..." : tab === "create" ? "Buat Room" : "Join Room"}
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-green-300/60 text-xs">
          Max 4 pemain per room
        </div>
      </div>
    </div>
  )
}
