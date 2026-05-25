"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { GameState, GameSettings } from "@/lib/types"
import GameBoard from "@/components/GameBoard"
import RoomLobby from "@/components/RoomLobby"
import GameLayout from "@/components/GameLayout"
import ActionBar from "@/components/ActionBar"
import LoadingScreen from "@/components/LoadingScreen"
import ResultOverlay from "@/components/ResultOverlay"
import Confetti from "@/components/Confetti"
import { showToast } from "@/components/Toast"
import { canTakeInsurance, canSplit, canDoubleDown, canSurrender, getCurrentHand } from "@/lib/game"
import { dealCard, chipSound, winSound, loseSound, blackjackFanfare, buttonClick, insuranceSound } from "@/lib/sounds"
import { BarChart3, Play, Plus } from "lucide-react"

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
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const [betInput, setBetInput] = useState(10)
  const prevStatusRef = useRef<string | null>(null)
  const prevBalanceRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Init dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setDarkMode(isDark)
  }, [])

  function toggleDark() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle("dark", next)
    try { localStorage.setItem("bj-theme", next ? "dark" : "light") } catch {}
  }

  // Fetch game state
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/${roomId}`)
      const data = await res.json()
      if (data.success) {
        const prev = game
        setGame(data.game)

        if (prev && prev.status !== data.game.status) {
          if (data.game.status === "playing" && prev.status === "waiting") {
            dealCard()
            setTimeout(dealCard, 200)
          }
          if (data.game.status === "finished") {
            setTimeout(() => {
              const myP = data.game.players.find((p: any) => p.id === playerId)
              if (myP) {
                const net = myP.hands.reduce((s: number, h: any) => s + (h.result ? h.result.payout - h.bet : 0), 0)
                if (net > 0) {
                  const hasBJ = myP.hands.some((h: any) => h.result?.type === "blackjack_win")
                  if (hasBJ) blackjackFanfare()
                  else winSound()
                  setConfettiTrigger((t) => t + 1)
                } else if (net < 0) {
                  loseSound()
                }
              }
            }, 500)
          }
        }
      }
    } catch {
      // silent retry
    } finally {
      setLoading(false)
    }
  }, [roomId, playerId, game])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 2000)
    return () => clearInterval(interval)
  }, [fetchState])

  // Toast on balance change
  useEffect(() => {
    if (prevBalanceRef.current !== null && game) {
      const myP = game.players.find((p) => p.id === playerId)
      if (myP && myP.balance !== prevBalanceRef.current) {
        const diff = myP.balance - prevBalanceRef.current
        if (diff > 0) {
          showToast(`+${diff} chip!`, "success")
        } else if (diff < 0 && game.status === "playing") {
          chipSound()
        }
      }
    }
    if (game) {
      const myP = game.players.find((p) => p.id === playerId)
      if (myP) prevBalanceRef.current = myP.balance
    }
  }, [game, playerId])

  // Timer countdown
  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (game?.status === "playing" && game.settings.turnTimeout > 0) {
      const myP = game.players.find((p) => p.id === playerId)
      const isMyTurn = game.currentPlayerIndex < game.players.length &&
        game.players[game.currentPlayerIndex]?.id === playerId
      // Don't start timer if insurance is pending
      const canTakeInsuranceNow = myP ? canTakeInsurance(game) : false
      if (isMyTurn && myP && !canTakeInsuranceNow) {
        timerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - game.turnStartedAt) / 1000)
          const remaining = Math.max(0, game.settings.turnTimeout - elapsed)
          setTimeLeft(remaining)
          if (remaining <= 0) {
            doAction(`/api/game/${roomId}/stand`)
            setTimeLeft(null)
          }
        }, 1000)
      } else {
        setTimeLeft(null)
      }
    } else {
      setTimeLeft(null)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [game?.status, game?.turnStartedAt, game?.currentPlayerIndex, game?.currentHandIndex, game?.insuranceOffered, game?.dealerHand])

  // Sync bet input
  useEffect(() => {
    if (game) {
      const myP = game.players.find((p) => p.id === playerId)
      if (myP) setBetInput(myP.totalBet)
    }
  }, [game, playerId])

  // API helpers
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
        if (!url.includes("insurance")) buttonClick()
      } else {
        setError(data.error || "Gagal")
        showToast(data.error || "Gagal", "error")
      }
    } catch {
      setError("Gagal terhubung ke server")
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleStart() {
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/game/${roomId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      })
      const data = await res.json()
      if (data.success) setGame(data.game)
      else setError(data.error)
    } catch { setError("Gagal start game") }
    finally { setLoading(false) }
  }

  async function handleHit() { await doAction(`/api/game/${roomId}/hit`); dealCard() }
  async function handleStand() { await doAction(`/api/game/${roomId}/stand`) }
  async function handleDouble() { await doAction(`/api/game/${roomId}/double`); chipSound() }
  async function handleSplit() { await doAction(`/api/game/${roomId}/split`); chipSound() }
  async function handleSurrender() { await doAction(`/api/game/${roomId}/surrender`) }
  async function handleInsurance(take: boolean) {
    await doAction(`/api/game/${roomId}/insurance`, { takeInsurance: take })
    if (take) chipSound()
    else insuranceSound()
  }
  async function handleNextRound() {
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/game/${roomId}/next-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      })
      const data = await res.json()
      if (data.success) {
        setGame(data.game)
        showToast("Ronde baru dimulai!", "info")
        prevBalanceRef.current = null
      } else setError(data.error)
    } catch { setError("Gagal mulai ronde baru") }
    finally { setLoading(false) }
  }

  async function handleLeave() {
    if (!confirm("Yakin mau keluar room?")) return
    try {
      const res = await fetch(`/api/room/${roomId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      })
      const data = await res.json()
      if (data.success || data.deleted) {
        window.location.href = "/"
      } else {
        showToast(data.error || "Gagal keluar", "error")
      }
    } catch {
      showToast("Gagal keluar room", "error")
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
      if (data.success) setGame(data.game)
      else setError(data.error)
    } catch { setError("Gagal update settings") }
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
      if (data.success) setGame(data.game)
      else setError(data.error)
    } catch { setError("Gagal update bet") }
  }

  function handlePlayAgain() { window.location.href = "/" }

  // --- Derived state ---
  if (loading && !game) {
    return <LoadingScreen text="Memuat Game..." />
  }

  if (error && !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#101d35] to-[#162a4a] flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center max-w-sm">
          <p className="text-red-300 font-semibold mb-4" role="alert">{error}</p>
          <button onClick={() => window.location.href = "/"} className="bg-gold-500 text-black font-bold px-6 py-2 rounded-xl" aria-label="Kembali ke halaman utama">Kembali</button>
        </div>
      </div>
    )
  }

  if (!game) return null

  const myPlayer = game.players.find((p) => p.id === playerId)
  const isMyTurn = !!(game.currentPlayerIndex < game.players.length &&
    game.players[game.currentPlayerIndex]?.id === playerId)
  const currentHand = isMyTurn && myPlayer ? getCurrentHand(myPlayer, game.currentHandIndex) : null
  const canDoSplit = currentHand ? canSplit(currentHand) : false
  const canDoDouble = currentHand ? canDoubleDown(currentHand) : false
  const canDoSurrender = currentHand ? canSurrender(currentHand) : false
   const canDoInsurance = myPlayer ? canTakeInsurance(game) : false
   const needsInsuranceDecision = !!(canDoInsurance && myPlayer && !myPlayer.insuranceDecided)
   const isMyAction = !!(game.status === "playing" && isMyTurn && myPlayer && !currentHand?.isDone && !needsInsuranceDecision && !canDoInsurance)
  const isHost = myPlayer?.isHost ?? false
  const isFinished = game.status === "finished"

  // Status label for header
  let statusLabel = ""
  if (game.status === "playing" && isMyTurn && !needsInsuranceDecision) {
    statusLabel = "Giliranmu!"
  } else if (game.status === "playing" && isMyTurn && needsInsuranceDecision) {
    statusLabel = "Insurance?"
  } else if (game.status === "playing") {
    statusLabel = `Giliran: ${game.players[game.currentPlayerIndex]?.name}`
  }

  return (
    <>
      <Confetti trigger={confettiTrigger} />
      {isFinished && <ResultOverlay game={game} myPlayerId={playerId} onNextRound={handleNextRound} onNewRoom={handlePlayAgain} />}

      <GameLayout
        game={game}
        myPlayerId={playerId}
        darkMode={darkMode}
        onToggleDark={toggleDark}
        onLeave={handleLeave}
        timeLeft={timeLeft}
        isMyTurn={isMyTurn && !isFinished}
        statusLabel={statusLabel}
        actionBar={
          <ActionBar
            game={game}
            myPlayerId={playerId}
            actionLoading={actionLoading}
            needsInsuranceDecision={needsInsuranceDecision}
            canDoSplit={canDoSplit}
            canDoDouble={canDoDouble}
            canDoSurrender={canDoSurrender}
            isMyAction={isMyAction}
            isMyTurn={isMyTurn}
            canDoInsurance={canDoInsurance}
            onHit={handleHit}
            onStand={handleStand}
            onDouble={handleDouble}
            onSplit={handleSplit}
            onSurrender={handleSurrender}
            onInsurance={handleInsurance}
          />
        }
      >
        {/* Lobby */}
        {game.status === "waiting" && (
          <RoomLobby
            room={{ id: roomId, code: game.code, game }}
            playerId={playerId}
            onStart={handleStart}
            onUpdateSettings={handleUpdateSettings}
            onUpdateBet={handleUpdateBet}
          />
        )}

        {/* Game + Finished */}
        {game.status !== "waiting" && (
          <div className="space-y-4">
            <GameBoard game={game} myPlayerId={playerId} />

            {/* Finished: bet input + actions */}
            {isFinished && (
              <div className="space-y-3">
                {/* Bet input */}
                <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-xl p-4" role="region" aria-label="Atur taruhan">
                  <label htmlFor="next-round-bet" className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                    Taruhan untuk ronde berikutnya
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="next-round-bet"
                      type="number"
                      min={game.settings.minBet}
                      max={Math.min(game.settings.maxBet, myPlayer?.balance || 0)}
                      value={betInput}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || game.settings.minBet
                        setBetInput(val)
                        handleUpdateBet(val)
                      }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-gold-500/50"
                    />
                    <div className="flex gap-1" role="group" aria-label="Tambah taruhan cepat">
                      {[
                        { label: "+10", val: Math.min((betInput || 0) + 10, game.settings.maxBet, myPlayer?.balance || 99999) },
                        { label: "+25", val: Math.min((betInput || 0) + 25, game.settings.maxBet, myPlayer?.balance || 99999) },
                        { label: "Max", val: Math.min(game.settings.maxBet, myPlayer?.balance || 0) },
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          onClick={() => {
                            setBetInput(btn.val)
                            handleUpdateBet(btn.val)
                            buttonClick()
                          }}
                          disabled={btn.val < game.settings.minBet || btn.val > (myPlayer?.balance || 0)}
                          aria-label={`Tambah taruhan ${btn.label}`}
                          className="px-2.5 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition-colors disabled:opacity-30 border border-white/10"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Next round / New room */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleNextRound}
                    disabled={loading || !isHost}
                    aria-label="Mulai ronde selanjutnya"
                    className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:bg-white/10 disabled:cursor-not-allowed text-black disabled:text-white/30 font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-lg"
                  >
                    <Play size={18} />
                    Ronde Selanjutnya
                  </button>
                  <button
                    onClick={handlePlayAgain}
                    aria-label="Buat room baru"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 border border-white/10"
                  >
                    <Plus size={18} />
                    Room Baru
                  </button>
                </div>

                {/* Stats */}
                {myPlayer && (
                  <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-xl p-4" role="region" aria-label={`Statistik ${myPlayer.name}`}>
                    <h4 className="font-bold text-white/60 text-xs mb-2 flex items-center gap-1 uppercase tracking-wider">
                      <BarChart3 size={12} /> Statistik {myPlayer.name}
                    </h4>
                    <div className="grid grid-cols-4 gap-2 text-xs text-center">
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="font-bold text-white font-mono">{myPlayer.stats.totalGames}</div>
                        <div className="text-white/40 text-[10px] uppercase">Games</div>
                      </div>
                      <div className="bg-emerald-500/10 rounded-lg p-2">
                        <div className="font-bold text-emerald-400 font-mono">{myPlayer.stats.totalWins}</div>
                        <div className="text-emerald-400/60 text-[10px] uppercase">Win</div>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-2">
                        <div className="font-bold text-red-400 font-mono">{myPlayer.stats.totalLosses}</div>
                        <div className="text-red-400/60 text-[10px] uppercase">Lose</div>
                      </div>
                      <div className="bg-gold-500/10 rounded-lg p-2">
                        <div className="font-bold text-gold-400 font-mono">{myPlayer.stats.blackjackCount}</div>
                        <div className="text-gold-400/60 text-[10px] uppercase">BJ</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-center">
                      <div className="bg-white/5 rounded-lg p-2">
                        <div className="font-bold text-white font-mono">{myPlayer.stats.totalPushes}</div>
                        <div className="text-white/40 text-[10px] uppercase">Push</div>
                      </div>
                      <div className="bg-blue-500/10 rounded-lg p-2">
                        <div className={`font-bold font-mono ${myPlayer.stats.currentStreak >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {myPlayer.stats.currentStreak}
                        </div>
                        <div className="text-white/40 text-[10px] uppercase">Streak</div>
                      </div>
                    </div>
                    {myPlayer.stats.bestWinStreak > 0 && (
                      <div className="text-[10px] text-center text-white/30 mt-1">
                        Best Win Streak: {myPlayer.stats.bestWinStreak}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3" role="alert">
            {error}
          </div>
        )}
      </GameLayout>
    </>
  )
}
