import { Briefcase } from "lucide-react"
import Card from "./Card"
import type { GameState } from "@/lib/types"

export default function DealerArea({ game }: { game: GameState }) {
  const isFinished = game.status === "finished"
  const isWaiting = game.status === "waiting"

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-[#d4af37]/5 rounded-[2rem] blur-2xl" />

      <div className="relative bg-gradient-to-b from-[#78350f]/40 via-[#713f12]/30 to-black/40 rounded-2xl border border-[#d4af37]/20 p-4 sm:p-5 shadow-[0_0_40px_rgba(212,175,55,0.08)]">
        <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">
              <Briefcase size={16} className="text-[#d4af37]" />
            </div>
            <h3 className="font-display text-lg text-[#d4af37] tracking-wide">Dealer</h3>
          </div>
          {isFinished && (
            <div className="bg-black/40 backdrop-blur border border-white/[0.08] text-white text-sm font-mono px-3 py-1 rounded-full">
              Score: {game.dealerScore}
            </div>
          )}
        </div>

        <div className="flex gap-2 sm:gap-3 justify-center min-h-[5.5rem] sm:min-h-[7rem] items-center">
          {isWaiting || game.dealerHand.length === 0 ? (
            <span className="text-[#d4af37]/30 italic text-sm font-display">Menunggu pemain...</span>
          ) : (
            game.dealerHand.map((card, i) => (
              <Card key={i} card={card} hidden={!isFinished && i === 0} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
