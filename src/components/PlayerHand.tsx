import { Player } from "@/lib/types"
import Card from "./Card"

export default function PlayerHand({ player, isCurrentTurn, showResult }: {
  player: Player
  isCurrentTurn: boolean
  showResult: boolean
}) {
  const bgColor = isCurrentTurn ? "bg-yellow-50 border-yellow-400" : "bg-gray-50 border-gray-200"
  const resultColor = player.result?.type.includes("win")
    ? "text-green-600"
    : player.result?.type.includes("bust")
    ? "text-red-600"
    : "text-gray-600"

  return (
    <div className={`border-2 rounded-xl p-4 ${bgColor} transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{player.name}</span>
          {player.isHost && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Host</span>}
        </div>
        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          Score: {player.score || 0}
        </span>
      </div>

      <div className="flex gap-1.5">
        {player.hand.length === 0 ? (
          <span className="text-gray-400 italic text-sm">Menunggu kartu...</span>
        ) : (
          player.hand.map((card, i) => <Card key={i} card={card} />)
        )}
      </div>

      {showResult && player.result && (
        <div className={`mt-2 text-sm font-semibold ${resultColor}`}>
          {player.result.message}
        </div>
      )}

      {player.isDone && !showResult && (
        <div className="mt-1 text-xs text-blue-500 font-medium">✓ Done</div>
      )}
    </div>
  )
}
