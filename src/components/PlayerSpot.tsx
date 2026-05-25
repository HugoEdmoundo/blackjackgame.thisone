import { Player, Hand } from "@/lib/types"
import { Wallet, CheckCircle, ArrowRight, Crown, User } from "lucide-react"
import Card from "./Card"
import ChipStack from "./ChipStack"

function HandDisplay({
  hand,
  hIdx,
  totalHands,
  isActive,
  isFinished,
  isCurrentHand,
}: {
  hand: Hand
  hIdx: number
  totalHands: number
  isActive: boolean
  isFinished: boolean
  isCurrentHand: boolean
}) {
  const glow = hand.result
    ? hand.result.payout > hand.bet
      ? hand.result.type === "blackjack_win" ? "bj" as const : "win" as const
      : undefined
    : isCurrentHand && isActive
    ? "turn" as const
    : undefined

  return (
    <div className={hIdx > 0 ? "border-t border-white/[0.06] pt-2 mt-2" : ""}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {totalHands > 1 && (
            <span className="text-[10px] font-mono text-[#d4af37]/50 font-bold uppercase tracking-wider">
              Hand {hIdx + 1}
            </span>
          )}
          {hand.isSplit && (
            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Split
            </span>
          )}
          {hand.isDoubled && (
            <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Double
            </span>
          )}
          {hand.isSurrendered && (
            <span className="text-[10px] bg-gray-500/20 text-gray-300 border border-gray-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Surrender
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <ChipStack amount={hand.bet} size="xs" />
          <span className="text-xs font-mono font-bold bg-black/30 text-[#d4af37] px-2 py-0.5 rounded-md">
            {hand.score === 0 ? "..." : hand.score}
          </span>
        </div>
      </div>

      <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1">
        {hand.cards.map((card, i) => (
          <Card key={i} card={card} index={i} glow={glow} />
        ))}
      </div>

      {isFinished && hand.result && (
        <div className={`mt-1 text-xs font-bold font-mono tracking-tight ${
          hand.result.payout > hand.bet
            ? "text-emerald-400"
            : hand.result.payout === hand.bet
            ? "text-gray-400"
            : "text-red-400"
        }`}>
          {hand.result.message}
        </div>
      )}

      {hand.isDone && !isFinished && !hand.isSurrendered && (
        <div className="mt-1 text-[10px] text-blue-400 font-bold flex items-center gap-1 uppercase tracking-wider">
          <CheckCircle size={10} /> Done
        </div>
      )}

      {isActive && isCurrentHand && !isFinished && !hand.isDone && (
        <div className="mt-1 text-[10px] text-[#d4af37] font-bold animate-pulse flex items-center gap-1 uppercase tracking-wider">
          <ArrowRight size={10} /> Main
        </div>
      )}
    </div>
  )
}

export default function PlayerSpot({
  player,
  isCurrentTurn,
  isFinished,
  currentHandIndex,
  isMe,
}: {
  player: Player
  isCurrentTurn: boolean
  isFinished: boolean
  currentHandIndex: number
  isMe: boolean
}) {
  const isActive = isCurrentTurn && !isFinished
  const netResult = isFinished
    ? player.hands.reduce((sum, h) => {
        if (!h.result) return sum
        return sum + (h.result.payout - h.bet)
      }, 0)
    : 0

  let borderColor = "border-white/[0.08]"
  let bgColor = "bg-black/30"
  let bgGlow = ""
  if (isActive) {
    borderColor = "border-[#d4af37]/50"
    bgColor = "bg-black/40"
    bgGlow = "shadow-[0_0_30px_rgba(212,175,55,0.15)]"
  } else if (isFinished && netResult > 0) {
    borderColor = "border-emerald-500/30"
    bgColor = "bg-black/30"
  } else if (isFinished && netResult < 0) {
    borderColor = "border-red-500/30"
    bgColor = "bg-black/30"
  }

  return (
    <div
      className={`relative rounded-2xl border ${borderColor} ${bgColor} ${bgGlow} p-3 sm:p-4`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isMe && <User size={12} className="shrink-0 text-blue-400" />}
          <span className={`text-sm font-bold truncate ${
            isActive ? "text-[#d4af37]" : isMe ? "text-blue-300" : "text-white"
          }`}>
            {player.name}
          </span>
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse shrink-0" />
          )}
          {player.isHost && (
            <Crown size={12} className="shrink-0 text-[#d4af37]" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-black/40 border border-white/[0.06] rounded-md px-2 py-0.5">
            <Wallet size={10} className="text-[#d4af37]/50" />
            <span className="font-mono font-bold text-white">{player.balance}</span>
          </div>
        </div>
      </div>

      {player.hands.length === 0 ? (
        <div className="flex items-center justify-center h-16 sm:h-20">
          <span className="text-white/30 italic text-sm font-display">Menunggu kartu...</span>
        </div>
      ) : (
        <div className="space-y-1">
          {player.hands.map((hand, hIdx) => (
            <HandDisplay
              key={hIdx}
              hand={hand}
              hIdx={hIdx}
              totalHands={player.hands.length}
              isActive={isActive}
              isFinished={isFinished}
              isCurrentHand={hIdx === currentHandIndex}
            />
          ))}
        </div>
      )}

      {isFinished && netResult !== 0 && (
        <div className={`absolute -top-2 -right-2 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
          netResult > 0
            ? "bg-emerald-500 text-white"
            : "bg-red-500 text-white"
        }`}>
          {netResult > 0 ? "+" : ""}{netResult}
        </div>
      )}
    </div>
  )
}
