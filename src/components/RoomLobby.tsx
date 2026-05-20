"use client"

import type { Room, GameSettings } from "@/lib/types"
import { Settings, Wallet, Crown, Copy, Check, User, Users, Play } from "lucide-react"
import ChipStack from "./ChipStack"
import { useState } from "react"

export default function RoomLobby({
  room,
  playerId,
  onStart,
  onUpdateSettings,
  onUpdateBet,
}: {
  room: Room
  playerId: string
  onStart: () => void
  onUpdateSettings: (settings: GameSettings) => void
  onUpdateBet: (bet: number) => void
}) {
  const myPlayer = room.game.players.find((p) => p.id === playerId)
  const isHost = myPlayer?.isHost ?? false
  const [copied, setCopied] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(room.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Room code header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur border border-[#d4af37]/20 rounded-full px-4 py-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-300/80 uppercase tracking-widest font-bold">
            {room.game.players.length}/{room.game.settings.maxPlayers} Pemain
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <h2 className="font-display text-2xl sm:text-3xl text-[#d4af37] tracking-wider">
            {room.code}
          </h2>
          <button
            onClick={copyCode}
            className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-white/[0.08] transition-colors"
            title="Salin kode"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-white/40" />}
          </button>
        </div>
        <p className="text-xs text-white/30 mt-1 font-medium">
          Bagikan kode ini ke temen-temen kamu
        </p>
      </div>

      {/* Player seats */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {room.game.players.map((p) => {
            const isMe = p.id === playerId
            return (
              <div
                key={p.id}
                className={`rounded-xl border px-4 py-3 ${
                  isMe
                    ? "bg-blue-500/15 border-blue-400/30"
                    : "bg-black/30 border-white/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {isMe && <User size={12} className="shrink-0 text-blue-400" />}
                    <span className={`text-sm font-bold truncate ${
                      isMe ? "text-blue-300" : "text-white"
                    }`}>
                      {p.name}
                    </span>
                    {p.isHost && <Crown size={12} className="shrink-0 text-[#d4af37]" />}
                    {isMe && <span className="text-[10px] text-blue-400/60 font-bold uppercase tracking-wider">Kamu</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-black/40 border border-white/[0.06] rounded-md px-2 py-0.5">
                      <Wallet size={10} className="text-[#d4af37]/50" />
                      <span className="text-xs font-mono font-bold text-white">{p.balance}</span>
                    </div>
                  </div>
                </div>

                {isMe && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Bet:</span>
                    <input
                      type="number"
                      min={room.game.settings.minBet}
                      max={Math.min(room.game.settings.maxBet, p.balance)}
                      value={p.totalBet}
                      onChange={(e) => onUpdateBet(parseInt(e.target.value) || room.game.settings.minBet)}
                      className="flex-1 bg-black/40 border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-[#d4af37]/50"
                    />
                  </div>
                )}

                {p.totalBet > 0 && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <ChipStack amount={p.totalBet} size="xs" showLabel />
                  </div>
                )}
              </div>
            )
          })}

          {Array.from({ length: room.game.settings.maxPlayers - room.game.players.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="rounded-xl border border-dashed border-white/[0.04] bg-black/10 px-4 py-3 flex items-center justify-center"
            >
              <div className="flex items-center gap-2 text-white/15">
                <Users size={14} />
                <span className="text-xs">Kursi kosong</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-2xl mx-auto space-y-3">
        {isHost && (
          <>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-black/30 hover:bg-black/50 border border-white/[0.08] transition-colors text-xs text-white/50 hover:text-white/80"
            >
              <Settings size={14} />
              {showSettings ? "Tutup Pengaturan" : "Pengaturan Room"}
            </button>

            {showSettings && (
              <div className="bg-black/30 backdrop-blur border border-white/[0.08] rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-white/50 mb-1 font-medium">Min Bet</label>
                    <input
                      type="number"
                      min={1}
                      value={room.game.settings.minBet}
                      onChange={(e) => onUpdateSettings({ ...room.game.settings, minBet: parseInt(e.target.value) || 1 })}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:border-[#d4af37]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1 font-medium">Max Bet</label>
                    <input
                      type="number"
                      min={room.game.settings.minBet}
                      value={room.game.settings.maxBet}
                      onChange={(e) => onUpdateSettings({ ...room.game.settings, maxBet: parseInt(e.target.value) || room.game.settings.minBet })}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:border-[#d4af37]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1 font-medium">Max Pemain</label>
                    <select
                      value={room.game.settings.maxPlayers}
                      onChange={(e) => onUpdateSettings({ ...room.game.settings, maxPlayers: parseInt(e.target.value) })}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-[#d4af37]/50"
                    >
                      {[2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n} className="bg-[#0a1628]">{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1 font-medium">Timeout</label>
                    <select
                      value={room.game.settings.turnTimeout}
                      onChange={(e) => onUpdateSettings({ ...room.game.settings, turnTimeout: parseInt(e.target.value) })}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-[#d4af37]/50"
                    >
                      {[15, 20, 30, 45, 60].map((n) => (
                        <option key={n} value={n} className="bg-[#0a1628]">{n} dtk</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {isHost ? (
          <button
            onClick={onStart}
            disabled={room.game.players.length < 2}
            className="w-full bg-[#d4af37] hover:bg-[#e4bf47] disabled:bg-white/10 disabled:cursor-not-allowed text-black disabled:text-white/30 font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/30 active:scale-[0.98]"
          >
            {room.game.players.length < 2 ? (
              <span className="text-sm">Tunggu pemain lain ({room.game.players.length}/2)</span>
            ) : (
              <><Play size={18} /><span>Mulai Game</span></>
            )}
          </button>
        ) : (
          <div className="text-center py-3 bg-black/30 border border-white/[0.08] rounded-xl">
            <span className="text-sm text-[#d4af37]/50 font-display">Menunggu host memulai game...</span>
          </div>
        )}
      </div>
    </div>
  )
}
