"use client"

import type { Room, GameSettings } from "@/lib/types"
import { Wallet, Crown, Copy, Check, User, Users, Play, CheckCircle, Settings } from "lucide-react"
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
  const [localSettings, setLocalSettings] = useState(room.game.settings)
  const needsSetup = isHost && !room.game.settingsConfigured

  function copyCode() {
    navigator.clipboard.writeText(room.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSaveSettings() {
    const s = {
      minBet: Math.max(1, localSettings.minBet),
      maxBet: Math.max(localSettings.minBet, localSettings.maxBet),
      maxPlayers: Math.min(6, Math.max(2, localSettings.maxPlayers)),
      turnTimeout: Math.min(60, Math.max(10, localSettings.turnTimeout)),
      defaultBet: Math.max(1, localSettings.defaultBet),
    }
    setLocalSettings(s)
    onUpdateSettings(s)
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
            aria-label="Salin kode room"
            title="Salin kode"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-white/40" />}
          </button>
        </div>
        <p className="text-xs text-white/30 mt-1 font-medium">
          Bagikan kode ini ke temen-temen kamu
        </p>
      </div>

      {/* Settings setup — first time host */}
      {needsSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Pengaturan room">
          <div className="bg-[#0d1b2a] border border-[#d4af37]/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <Settings size={32} className="mx-auto text-[#d4af37] mb-2" />
              <h3 className="text-lg font-bold text-white font-display">Pengaturan Room</h3>
              <p className="text-xs text-white/40 mt-1">Atur dulu sebelum temen-temen mulai main</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div>
                <label htmlFor="settings-min-bet" className="block text-white/50 mb-1 font-medium text-xs">Min Bet</label>
                <input
                  id="settings-min-bet"
                  type="number"
                  min={1}
                  value={localSettings.minBet}
                  onChange={(e) => setLocalSettings({ ...localSettings, minBet: parseInt(e.target.value) || 1 })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>
              <div>
                <label htmlFor="settings-max-bet" className="block text-white/50 mb-1 font-medium text-xs">Max Bet</label>
                <input
                  id="settings-max-bet"
                  type="number"
                  min={localSettings.minBet}
                  value={localSettings.maxBet}
                  onChange={(e) => setLocalSettings({ ...localSettings, maxBet: parseInt(e.target.value) || localSettings.minBet })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#d4af37]/50"
                />
              </div>
              <div>
                <label htmlFor="settings-max-players" className="block text-white/50 mb-1 font-medium text-xs">Max Pemain</label>
                <select
                  id="settings-max-players"
                  value={localSettings.maxPlayers}
                  onChange={(e) => setLocalSettings({ ...localSettings, maxPlayers: parseInt(e.target.value) })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]/50"
                >
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n} className="bg-[#0a1628]">{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="settings-timeout" className="block text-white/50 mb-1 font-medium text-xs">Timeout</label>
                <select
                  id="settings-timeout"
                  value={localSettings.turnTimeout}
                  onChange={(e) => setLocalSettings({ ...localSettings, turnTimeout: parseInt(e.target.value) })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]/50"
                >
                  {[15, 20, 30, 45, 60].map((n) => (
                    <option key={n} value={n} className="bg-[#0a1628]">{n} dtk</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              aria-label="Simpan pengaturan room"
              className="w-full bg-[#d4af37] hover:bg-[#e4bf47] text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <CheckCircle size={18} />
              Simpan Pengaturan
            </button>
          </div>
        </div>
      )}

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

                {isMe && room.game.settingsConfigured && (
                  <div className="mt-2 flex items-center gap-2">
                    <label htmlFor="bet-input-lobby" className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Bet:</label>
                    <input
                      id="bet-input-lobby"
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
        {room.game.settingsConfigured && isHost && (
          <button
            onClick={onStart}
            disabled={room.game.players.length < 2}
            aria-label={room.game.players.length < 2 ? `Tunggu pemain lain, saat ini ${room.game.players.length} dari 2 pemain` : "Mulai game"}
            className="w-full bg-[#d4af37] hover:bg-[#e4bf47] disabled:bg-white/10 disabled:cursor-not-allowed text-black disabled:text-white/30 font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/30 active:scale-[0.98]"
          >
            {room.game.players.length < 2 ? (
              <span className="text-sm">Tunggu pemain lain ({room.game.players.length}/2)</span>
            ) : (
              <><Play size={18} /><span>Mulai Game</span></>
            )}
          </button>
        )}

        {room.game.settingsConfigured && !isHost && (
          <div className="text-center py-3 bg-black/30 border border-white/[0.08] rounded-xl">
            <span className="text-sm text-[#d4af37]/50 font-display">Menunggu host memulai game...</span>
          </div>
        )}

        {!room.game.settingsConfigured && !isHost && (
          <div className="text-center py-3 bg-black/30 border border-white/[0.08] rounded-xl">
            <span className="text-sm text-[#d4af37]/50 font-display">Host sedang mengatur pengaturan...</span>
          </div>
        )}
      </div>
    </div>
  )
}
