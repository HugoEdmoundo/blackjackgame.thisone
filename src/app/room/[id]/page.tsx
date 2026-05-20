"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { GameState } from "@/lib/types"
import GameBoard from "@/components/GameBoard"
import RoomLobby from "@/components/RoomLobby"

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.id as string
  const playerId = searchParams.get("playerId") ?? ""

  const [game, setGame] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/${roomId}`)
      const data = await res.json()
      if (data.success) {
        setGame(data.game)
      }
    } catch {
      // silent retry
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 2000)
    return () => clearInterval(interval)
  }, [fetchState])

  async function handleStart() {
    setLoading(true)
    try {
      const res = await fetch(`/api/game/${roomId}/start`, { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setGame(data.game)
      } else {
        setError(data.error)
      }
    } catch {
      setError("Gagal start game")
    } finally {
      setLoading(false)
    }
  }

  async function handleHit() {
    const res = await fetch(`/api/game/${roomId}/hit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    })
    const data = await res.json()
    if (data.success) setGame(data.game)
    else setError(data.error)
  }

  async function handleStand() {
    const res = await fetch(`/api/game/${roomId}/stand`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    })
    const data = await res.json()
    if (data.success) setGame(data.game)
    else setError(data.error)
  }

  async function handlePlayAgain() {
    window.location.href = "/"
  }

  if (loading && !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    )
  }

  if (error && !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button onClick={() => window.location.href = "/"} className="bg-green-600 text-white px-6 py-2 rounded-lg">
            Kembali
          </button>
        </div>
      </div>
    )
  }

  if (!game) return null

  const myPlayer = game.players.find((p) => p.id === playerId)
  const isMyTurn = game.currentPlayerIndex < game.players.length &&
    game.players[game.currentPlayerIndex]?.id === playerId

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">♠️ Blackjack ♥️</h1>
            <div className="text-sm text-gray-500">
              {game.status === "playing" && !isMyTurn && (
                <span className="text-yellow-600 font-medium">
                  Giliran: {game.players[game.currentPlayerIndex]?.name}
                </span>
              )}
              {game.status === "finished" && (
                <span className="text-green-600 font-medium">Game Selesai!</span>
              )}
            </div>
          </div>

          {game.status === "waiting" && (
            <RoomLobby
              room={{ id: roomId, code: game.code, game }}
              playerId={playerId}
              onStart={handleStart}
            />
          )}

          {game.status !== "waiting" && (
            <>
              <GameBoard game={game} myPlayerId={playerId} />

              <div className="mt-6 flex gap-3 justify-center">
                {game.status === "playing" && isMyTurn && !myPlayer?.isDone && (
                  <>
                    <button
                      onClick={handleHit}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-lg transition-colors"
                    >
                      Hit
                    </button>
                    <button
                      onClick={handleStand}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-8 rounded-lg transition-colors"
                    >
                      Stand
                    </button>
                  </>
                )}

                {game.status === "playing" && myPlayer?.isDone && (
                  <div className="text-blue-600 font-medium">
                    Kamu sudah done. Tunggu pemain lain...
                  </div>
                )}

                {game.status === "playing" && !isMyTurn && (
                  <div className="text-gray-500 font-medium">
                    Tunggu giliranmu...
                  </div>
                )}

                {game.status === "finished" && (
                  <button
                    onClick={handlePlayAgain}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-lg transition-colors"
                  >
                    Main Lagi
                  </button>
                )}
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
