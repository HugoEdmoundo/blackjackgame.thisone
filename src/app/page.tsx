"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Key, ArrowRight, Sparkles, Shield } from "lucide-react"

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
        router.push(`/room/${data.room.id}?playerId=${data.playerId}`)
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
        router.push(`/room/${data.room.id}?playerId=${data.playerId}`)
      }
    } catch {
      setError("Gagal join room")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#101d35] to-[#162a4a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl" />

        {/* Floating card decorations */}
        <div className="absolute top-20 left-[10%] text-6xl opacity-[0.04] rotate-12 select-none">♠️</div>
        <div className="absolute bottom-20 right-[10%] text-6xl opacity-[0.04] -rotate-12 select-none">♥️</div>
        <div className="absolute top-1/3 right-[8%] text-4xl opacity-[0.03] rotate-45 select-none">♣️</div>
        <div className="absolute bottom-1/3 left-[8%] text-4xl opacity-[0.03] -rotate-45 select-none">♦️</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6 text-xs text-emerald-300/80">
            <Shield size={12} className="text-emerald-400" />
            Multiplayer Online
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-3 tracking-tight">
            Blackjack
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Main bareng temen-temen, buktikan siapa yang paling beruntung!
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Tab switcher */}
          <div className="flex mb-8 bg-white/5 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setTab("create")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                tab === "create"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Buat Room
            </button>
            <button
              onClick={() => setTab("join")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                tab === "join"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Join Room
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <Sparkles size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nama Kamu</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Masukkan nama..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                  maxLength={20}
                />
              </div>
            </div>

            {tab === "join" && (
              <div className="animate-slideInLeft" style={{ animationDuration: "0.25s" }}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Room Code</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: ABC123"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm uppercase tracking-widest font-mono"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            <button
              onClick={tab === "create" ? handleCreate : handleJoin}
              disabled={loading || !playerName.trim() || (tab === "join" && !roomCode.trim())}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98] disabled:shadow-none disabled:text-gray-400"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                <>
                  {tab === "create" ? "Buat Room" : "Join Room"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 flex items-center justify-center gap-4 text-xs text-gray-500/60">
          <span>Max 4 pemain per room</span>
          <span className="w-1 h-1 rounded-full bg-gray-600/40" />
          <span>v2.0</span>
        </div>
      </div>
    </div>
  )
}
