import { HandMetal, Hand as HandIcon, RefreshCw, Scissors, Flag, CheckCircle, Minus, Shield } from "lucide-react"
import type { GameState } from "@/lib/types"
import { getCurrentHand } from "@/lib/game"

export default function ActionBar({
  game,
  myPlayerId,
  actionLoading,
  needsInsuranceDecision,
  canDoSplit,
  canDoDouble,
  canDoSurrender,
  isMyAction,
  isMyTurn,
  canDoInsurance,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onSurrender,
  onInsurance,
}: {
  game: GameState
  myPlayerId: string
  actionLoading: boolean
  needsInsuranceDecision: boolean
  canDoSplit: boolean
  canDoDouble: boolean
  canDoSurrender: boolean
  isMyAction: boolean
  isMyTurn: boolean
  canDoInsurance: boolean
  onHit: () => void
  onStand: () => void
  onDouble: () => void
  onSplit: () => void
  onSurrender: () => void
  onInsurance: (take: boolean) => void
}) {
  const myPlayer = game.players.find((p) => p.id === myPlayerId)
  const isFinished = game.status === "finished"
  const isWaiting = game.status === "waiting"
  const currentPlayer = game.currentPlayerIndex < game.players.length
    ? game.players[game.currentPlayerIndex]
    : null
  const currentHand = isMyTurn && myPlayer ? getCurrentHand(myPlayer, game.currentHandIndex) : null
  const insuranceBet = Math.floor((myPlayer?.totalBet || 0) / 2)

  if (isWaiting || isFinished) return null

  if (needsInsuranceDecision) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-[#d4af37] font-bold text-sm">
          <Shield size={16} /> Dealer menunjukkan Ace!
        </div>
        <p className="text-xs text-white/50">
          Biaya insurance: {insuranceBet} chip
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onInsurance(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#e4bf47] text-black font-bold py-2 px-5 rounded-xl transition-all disabled:opacity-50 active:scale-95 text-sm"
          >
            <CheckCircle size={16} /> Ambil ({insuranceBet})
          </button>
          <button
            onClick={() => onInsurance(false)}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold py-2 px-5 rounded-xl transition-all disabled:opacity-50 active:scale-95 text-sm border border-white/[0.08]"
          >
            <Minus size={16} /> Skip
          </button>
        </div>
      </div>
    )
  }

  if (canDoInsurance && !isMyTurn && !game.insuranceOffered) {
    return (
      <div className="text-center text-[#d4af37]/50 text-sm font-medium">
        Menunggu pemain lain memutuskan insurance...
      </div>
    )
  }

  if (isMyAction) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          <button
            onClick={onHit}
            disabled={actionLoading}
            className="flex items-center gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 sm:px-6 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg text-sm"
          >
            <HandMetal size={18} /> Hit
          </button>
          <button
            onClick={onStand}
            disabled={actionLoading}
            className="flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-5 sm:px-6 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg text-sm"
          >
            <HandIcon size={18} /> Stand
          </button>
          {canDoDouble && (
            <button
              onClick={onDouble}
              disabled={actionLoading}
              className="flex items-center gap-1.5 sm:gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-4 sm:px-5 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg text-sm"
            >
              <RefreshCw size={16} /> Double
            </button>
          )}
          {canDoSplit && (
            <button
              onClick={onSplit}
              disabled={actionLoading}
              className="flex items-center gap-1.5 sm:gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 sm:px-5 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg text-sm"
            >
              <Scissors size={16} /> Split
            </button>
          )}
          {canDoSurrender && (
            <button
              onClick={onSurrender}
              disabled={actionLoading}
              className="flex items-center gap-1.5 sm:gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2.5 px-4 sm:px-5 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg text-sm"
            >
              <Flag size={16} /> Surrender
            </button>
          )}
        </div>
      </div>
    )
  }

  if (game.status === "playing" && myPlayer && !isMyTurn && !needsInsuranceDecision) {
    return (
      <div className="text-center text-sm">
        <span className="text-white/40">Giliran: </span>
        <span className="text-[#d4af37] font-bold">{currentPlayer?.name}</span>
      </div>
    )
  }

  if (game.status === "playing" && isMyTurn && currentHand?.isDone && !needsInsuranceDecision) {
    return (
      <div className="text-center text-sm text-blue-400 font-medium">
        Kamu sudah done. Tunggu pemain lain...
      </div>
    )
  }

  return null
}
