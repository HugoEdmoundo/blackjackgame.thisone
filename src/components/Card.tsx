import { Card as CardType } from "@/lib/types"

const suitColors: Record<string, string> = {
  "❤️": "text-red-500",
  "♦️": "text-red-500",
  "♣️": "text-gray-900",
  "♠️": "text-gray-900",
}

export default function Card({ card, hidden }: { card: CardType; hidden?: boolean }) {
  if (hidden) {
    return (
      <div className="w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 flex items-center justify-center shadow-md">
        <span className="text-2xl text-blue-300">?</span>
      </div>
    )
  }

  return (
    <div className="w-16 h-24 bg-white rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center shadow-md">
      <span className={`text-lg font-bold ${suitColors[card.suit]}`}>{card.rank}</span>
      <span className={`text-2xl ${suitColors[card.suit]}`}>{card.suit}</span>
    </div>
  )
}
