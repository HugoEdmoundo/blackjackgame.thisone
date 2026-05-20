"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { GameState, GameSettings } from "@/lib/types"
import GameBoard from "@/components/GameBoard"
import RoomLobby from "@/components/RoomLobby"
import { canTakeInsurance, canSplit, canDoubleDown, canSurrender, getCurrentHand } from "@/lib/game"

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = params.id as string
  const playerId = searchParams.get("playerId") ?? ""

  const [game, setGame] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (game?.status === "playing" && game.settings.turnTimeout > 0) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - game.turnStartedAt) / 1000)
        const remaining = Math.max(0, game.settings.turnTimeout - elapsed)
        setTimeLeft(remaining)
        if (remaining <= 0) {
          setTimeLeft(0)
        }
      }, 1000)
    } else {
      setTimeLeft(null)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [game?.status, game?.turnStartedAt, game?.currentPlayerIndex, game?.currentHandIndex])

  async function doAction(url: string, extraBody: Record<string, unknown> = {}) {
    setActionLoading(true)
    setError("")
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, ...extraBody }),
      })
      const data = await res.json()
      if (data.success) {
        setGame(data.game)
      } else {
        setError(data.error || "Gagal")
      }
    } catch {
      setError("Gagal terhubung ke server")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleStart() {
    setLoading(true)
    setError("")
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
    await doAction(`/api/game/${roomId}/hit`)
  }

  async function handleStand() {
    await doAction(`/api/game/${roomId}/stand`)
  }

  async function handleDouble() {
    await doAction(`/api/game/${roomId}/double`)
  }

  async function handleSplit() {
    await doAction(`/api/game/${roomId}/split`)
  }

  async function handleSurrender() {
    await doAction(`/api/game/${roomId}/surrender`)
  }

  async function handleInsurance(take: boolean) {
    await doAction(`/api/game/${roomId}/insurance`, { takeInsurance: take })
  }

  async function handleNextRound() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/game/${roomId}/next-round`, { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setGame(data.game)
      } else {
        setError(data.error)
      }
    } catch {
      setError("Gagal mulai ronde baru")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateSettings(settings: GameSettings) {
    setError("")
    try {
      const res = await fetch(`/api/room/${roomId}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, playerId }),
      })
      const data = await res.json()
      if (data.success) {
        setGame(data.game)
      } else {
        setError(data.error)
      }
    } catch {
      setError("Gagal update settings")
    }
  }

  async function handleUpdateBet(bet: number) {
    setError("")
    try {
      const res = await fetch(`/api/room/${roomId}/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, amount: bet }),
      })
      const data = await res.json()
      if (data.success) {
        setGame(data.game)
      } else {
        setError(data.error)
      }
    } catch {
      setError("Gagal update bet")
    }
  }

  function handlePlayAgain() {
    window.location.href = "/"
  }

  // ---- Derived state ----
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

  const currentHand = isMyTurn && myPlayer
    ? getCurrentHand(myPlayer, game.currentHandIndex)
    : null

  const canDoSplit = currentHand ? canSplit(currentHand) : false
  const canDoDouble = currentHand ? canDoubleDown(currentHand) : false
  const canDoSurrender = currentHand ? canSurrender(currentHand) : false
  const canDoInsurance = myPlayer ? canTakeInsurance(game) : false
  const needsInsuranceDecision = canDoInsurance && isMyTurn && myPlayer && !myPlayer.insuranceDecided

  const isMyAction =
    game.status === "playing" &&
    isMyTurn &&
    myPlayer &&
    !currentHand?.isDone &&
    !needsInsuranceDecision

  const isHost = myPlayer?.isHost ?? false
  const isFinished = game.status === "finished"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">♠️ Blackjack ♥️</h1>
            <div className="flex items-center gap-3">
              {timeLeft !== null && isMyTurn && timeLeft > 0 && (
                <div className="flex items-center gap-1">
                  <div className={`text-sm font-mono font-bold ${
                    timeLeft <= 5 ? "text-red-600" : "text-gray-600"
                  }`}>
                    {timeLeft}s
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        timeLeft <= 5 ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${(timeLeft / (game.settings.turnTimeout || 30)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="text-sm text-gray-500">
                {isFinished && (
                  <span className="text-green-600 font-medium">Game Selesai!</span>
                )}
                {game.status === "playing" && !isMyTurn && (
                  <span className="text-yellow-600 font-medium">
                    Giliran: {game.players[game.currentPlayerIndex]?.name}
                  </span>
                )}
                {game.status === "playing" && isMyTurn && (
                  <span className="text-green-600 font-medium">Giliranmu!</span>
                )}
              </div>
            </div>
          </div>

          {game.status === "waiting" && (
            <RoomLobby
              room={{ id: roomId, code: game.code, game }}
              playerId={playerId}
              onStart={handleStart}
              onUpdateSettings={handleUpdateSettings}
              onUpdateBet={handleUpdateBet}
            />
          )}

          {game.status !== "waiting" && (
            <>
              <GameBoard game={game} myPlayerId={playerId} />

              <div className="mt-6 space-y-3">
                {/* Insurance prompt */}
                {needsInsuranceDecision && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
                    <p className="text-yellow-800 font-bold mb-3">
                      🛡️ Dealer menunjukkan Ace! Ambil Insurance?
                    </p>
                    <p className="text-sm text-yellow-700 mb-3">
                      Biaya: {Math.floor((myPlayer?.totalBet || 0) / 2)} chip
                      {myPlayer && ` (Saldo: ${myPlayer.balance})`}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleInsurance(true)}
                        disabled={actionLoading}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Ya, Ambil Insurance
                      </button>
                      <button
                        onClick={() => handleInsurance(false)}
                        disabled={actionLoading}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                )}

                {/* Insurance waiting */}
                {canDoInsurance && !isMyTurn && !game.insuranceOffered && (
                  <div className="text-center text-yellow-600 text-sm font-medium">
                    Menunggu pemain lain memutuskan insurance...
                  </div>
                )}

                {/* Main action buttons */}
                {isMyAction && (
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={handleHit}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Hit
                    </button>
                    <button
                      onClick={handleStand}
                      disabled={actionLoading}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-8 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Stand
                    </button>
                    {canDoDouble && (
                      <button
                        onClick={handleDouble}
                        disabled={actionLoading}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Double
                      </button>
                    )}
                    {canDoSplit && (
                      <button
                        onClick={handleSplit}
                        disabled={actionLoading}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Split
                      </button>
                    )}
                    {canDoSurrender && (
                      <button
                        onClick={handleSurrender}
                        disabled={actionLoading}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Surrender
                      </button>
                    )}
                  </div>
                )}

                {game.status === "playing" && myPlayer && !isMyTurn && !needsInsuranceDecision && (
                  <div className="text-center text-gray-500 font-medium">
                    Tunggu giliranmu...
                  </div>
                )}

                {game.status === "playing" && isMyTurn && currentHand?.isDone && !needsInsuranceDecision && (
                  <div className="text-center text-blue-600 font-medium">
                    Kamu sudah done. Tunggu pemain lain...
                  </div>
                )}

                {isFinished && (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleNextRound}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Ronde Selanjutnya
                    </button>
                    <button
                      onClick={handlePlayAgain}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg transition-colors"
                    >
                      Main Lagi (Room Baru)
                    </button>
                  </div>
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

        {myPlayer && isFinished && (
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-4 mt-4">
            <h4 className="font-bold text-gray-700 mb-2 text-sm">📊 Statistik {myPlayer.name}</h4>
            <div className="grid grid-cols-4 gap-2 text-xs text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="font-bold text-gray-900">{myPlayer.stats.totalGames}</div>
                <div className="text-gray-500">Games</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="font-bold text-green-700">{myPlayer.stats.totalWins}</div>
                <div className="text-green-600">Win</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <div className="font-bold text-red-700">{myPlayer.stats.totalLosses}</div>
                <div className="text-red-600">Lose</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <div className="font-bold text-yellow-700">{myPlayer.stats.blackjackCount}</div>
                <div className="text-yellow-600">BJ</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="font-bold text-gray-900">{myPlayer.stats.totalPushes}</div>
                <div className="text-gray-500">Push</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className={`font-bold ${myPlayer.stats.currentStreak >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {myPlayer.stats.currentStreak}
                </div>
                <div className="text-gray-500">Streak</div>
              </div>
            </div>
            {myPlayer.stats.bestWinStreak > 0 && (
              <div className="text-xs text-center text-gray-400 mt-1">
                Best Win Streak: {myPlayer.stats.bestWinStreak}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
