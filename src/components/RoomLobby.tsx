"use client"

import { Room, GameSettings, DEFAULT_SETTINGS } from "@/lib/types"

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

  return (
    <div className="text-center space-y-6">
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-2">Room Code</h2>
        <div className="text-4xl font-mono font-bold tracking-[0.3em] text-gray-900 bg-white border-2 border-gray-200 rounded-lg py-3 px-6 inline-block">
          {room.code}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Share kode ini ke temen-temen kamu biar mereka bisa join!
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">
          Pemain ({room.game.players.length}/{room.game.settings.maxPlayers})
        </h3>
        <div className="space-y-2">
          {room.game.players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-white border rounded-lg px-4 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.name}</span>
                {p.isHost && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Host</span>
                )}
                {p.id === playerId && (
                  <span className="text-xs text-blue-500">Kamu</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  💰 {p.balance}
                </span>
                {p.id === playerId && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Bet:</span>
                    <input
                      type="number"
                      min={room.game.settings.minBet}
                      max={Math.min(room.game.settings.maxBet, p.balance)}
                      value={p.totalBet}
                      onChange={(e) => onUpdateBet(parseInt(e.target.value) || room.game.settings.minBet)}
                      className="w-20 text-center text-sm border border-gray-300 rounded px-1 py-0.5"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
          <h4 className="font-semibold text-gray-700 mb-3 text-center">⚙️ Pengaturan Room</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-gray-600 mb-1">Min Bet</label>
              <input
                type="number"
                min={1}
                value={room.game.settings.minBet}
                onChange={(e) => onUpdateSettings({
                  ...room.game.settings,
                  minBet: parseInt(e.target.value) || 1,
                })}
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Max Bet</label>
              <input
                type="number"
                min={room.game.settings.minBet}
                value={room.game.settings.maxBet}
                onChange={(e) => onUpdateSettings({
                  ...room.game.settings,
                  maxBet: parseInt(e.target.value) || room.game.settings.minBet,
                })}
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Max Pemain</label>
              <select
                value={room.game.settings.maxPlayers}
                onChange={(e) => onUpdateSettings({
                  ...room.game.settings,
                  maxPlayers: parseInt(e.target.value),
                })}
                className="w-full border border-gray-300 rounded px-2 py-1"
              >
                {[2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Timeout (detik)</label>
              <select
                value={room.game.settings.turnTimeout}
                onChange={(e) => onUpdateSettings({
                  ...room.game.settings,
                  turnTimeout: parseInt(e.target.value),
                })}
                className="w-full border border-gray-300 rounded px-2 py-1"
              >
                {[15, 20, 30, 45, 60].map((n) => (
                  <option key={n} value={n}>{n} detik</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {isHost && (
        <button
          onClick={onStart}
          disabled={room.game.players.length < 2}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          {room.game.players.length < 2
            ? `Tunggu pemain lain (${room.game.players.length}/2)`
            : "Mulai Game"}
        </button>
      )}

      {!isHost && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 text-sm">
          Menunggu host memulai game...
        </div>
      )}
    </div>
  )
}
