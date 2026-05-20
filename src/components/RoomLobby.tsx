"use client"

import { Room } from "@/lib/types"

export default function RoomLobby({
  room,
  playerId,
  onStart,
}: {
  room: Room
  playerId: string
  onStart: () => void
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
          Pemain ({room.game.players.length}/4)
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
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    Host
                  </span>
                )}
              </div>
              {p.id === playerId && (
                <span className="text-xs text-blue-500">Kamu</span>
              )}
            </div>
          ))}
        </div>
      </div>

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
