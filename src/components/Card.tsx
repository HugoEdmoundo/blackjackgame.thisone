import { Card as CardType } from "@/lib/types"

const suitColors: Record<string, string> = {
  "❤️": "text-red-500",
  "♦️": "text-red-500",
  "♣️": "text-gray-900",
  "♠️": "text-gray-900",
}

const suitNames: Record<string, string> = {
  "❤️": "Hearts",
  "♦️": "Diamonds",
  "♣️": "Clubs",
  "♠️": "Spades",
}

const suitSymbols: Record<string, string> = {
  "❤️": "♥",
  "♦️": "♦",
  "♣️": "♣",
  "♠️": "♠",
}

export default function Card({ card, hidden, index = 0, glow }: { card: CardType; hidden?: boolean; index?: number; glow?: "win" | "turn" | "bj" }) {
  const glowClass = glow === "win" ? "card-glow-win" : glow === "turn" ? "card-glow-turn" : glow === "bj" ? "card-glow-bj" : ""

  if (hidden) {
    return (
      <div
        aria-label="Kartu tertutup"
        role="img"
        className={`w-16 h-22 sm:w-20 sm:h-28 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 rounded-xl border-2 border-[#d4af37]/40 flex items-center justify-center shadow-xl ${glowClass}`}
        style={{
          animation: `cardDeal 0.35s ease-out ${index * 0.08}s both`,
        }}
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="grid grid-cols-3 gap-0.5 rotate-45 scale-75 sm:scale-100">
            <span className="text-[5px] sm:text-[7px] text-[#d4af37]/60">♠</span>
            <span className="text-[5px] sm:text-[7px] text-[#d4af37]/60">♥</span>
            <span className="text-[5px] sm:text-[7px] text-[#d4af37]/60">♦</span>
            <span className="text-[5px] sm:text-[7px] text-[#d4af37]/60">♣</span>
            <span className="text-[5px] sm:text-[7px] text-[#d4af37]/60">♠</span>
            <span className="text-[5px] sm:text-[7px] text-[#d4af37]/60">♥</span>
            <span className="text-[5px] sm:text-[7px] text-[#d4af37]/60">♦</span>
            <span className="text-[5px] sm:text-[7px] text-[#d4af37]/60">♣</span>
            <span className="text-[5px] sm:text-[7px] text-[#d4af37]/60">♠</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      aria-label={`${card.rank} ${suitNames[card.suit] || card.suit}`}
      role="img"
      className={`w-16 h-22 sm:w-20 sm:h-28 bg-white dark:bg-[#1a2a4a] rounded-xl border-2 border-[#d4af37]/60 dark:border-[#d4af37]/40 flex flex-col items-center justify-between py-1.5 sm:py-2 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 cursor-default ${glowClass}`}
      style={{
        animation: `cardDeal 0.35s ease-out ${index * 0.08}s both`,
      }}
    >
      <div className="flex flex-col items-center leading-none">
        <span className={`text-sm sm:text-lg font-bold font-mono ${suitColors[card.suit]}`}>{card.rank}</span>
        <span className={`text-xs sm:text-sm -mt-0.5 ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</span>
      </div>

      <span className={`text-lg sm:text-2xl ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</span>

      <div className="flex flex-col items-center leading-none rotate-180">
        <span className={`text-sm sm:text-lg font-bold font-mono ${suitColors[card.suit]}`}>{card.rank}</span>
        <span className={`text-xs sm:text-sm -mt-0.5 ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</span>
      </div>
    </div>
  )
}
