import { Player, Hand } from "@/lib/types"
import Card from "./Card"

export default function PlayerHand({
  player,
  isCurrentTurn,
  isFinished,
  currentHandIndex,
}: {
  player: Player
  isCurrentTurn: boolean
  isFinished: boolean
  currentHandIndex: number
}) {
  const bgColor = isCurrentTurn ? "bg-yellow-50 border-yellow-400" : "bg-white border-gray-200"

  return (
    <div className={`border-2 rounded-xl p-4 ${bgColor} transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base sm:text-lg">{player.name}</span>
          {player.isHost && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Host</span>}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
            💰 {player.balance}
          </span>
          {!isFinished && player.totalBet > 0 && (
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
              Bet: {player.totalBet}
            </span>
          )}
        </div>
      </div>

      {player.hands.length === 0 ? (
        <div className="flex gap-1.5">
          <span className="text-gray-400 italic text-sm">Menunggu kartu...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {player.hands.map((hand, hIdx) => (
            <div key={hIdx} className={hIdx > 0 ? "border-t border-gray-200 pt-3" : ""}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {player.hands.length > 1 && (
                    <span className="text-xs font-mono text-gray-500">Hand {hIdx + 1}:</span>
                  )}
                  {hand.isSplit && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Split</span>
                  )}
                  {hand.isDoubled && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Double</span>
                  )}
                  {hand.isSurrendered && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Surrender</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Bet: {hand.bet}</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                    Score: {hand.score || 0}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5">
                {hand.cards.map((card, i) => <Card key={i} card={card} />)}
              </div>

              {isFinished && hand.result && (
                <div className={`mt-1 text-sm font-semibold ${
                  hand.result.payout > 0
                    ? "text-green-600"
                    : hand.result.payout < 0
                    ? "text-red-600"
                    : "text-gray-600"
                }`}>
                  {hand.result.message}
                  <span className="ml-1">
                    ({hand.result.payout > 0 ? "+" : ""}{hand.result.payout})
                  </span>
                </div>
              )}

              {hand.isDone && !isFinished && !hand.isSurrendered && (
                <div className="mt-1 text-xs text-blue-500 font-medium">✓ Done</div>
              )}

              {isCurrentTurn && hIdx === currentHandIndex && !isFinished && !hand.isDone && (
                <div className="mt-1 text-xs text-yellow-600 font-medium animate-pulse">
                  ◀ Sedang main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
