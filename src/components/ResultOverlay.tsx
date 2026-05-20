"use client"

import { useEffect, useState } from "react"
import { GameState } from "@/lib/types"
import { Trophy, CheckCircle, XCircle, Minus, Play, Plus } from "lucide-react"

export default function ResultOverlay({
  game,
  myPlayerId,
  onNextRound,
  onNewRoom,
}: {
  game: GameState
  myPlayerId: string
  onNextRound: () => void
  onNewRoom: () => void
}) {
  const [visible, setVisible] = useState(false)
  const myPlayer = game.players.find((p) => p.id === myPlayerId)
  const isHost = myPlayer?.isHost ?? false

  useEffect(() => {
    if (game.status === "finished") {
      setTimeout(() => setVisible(true), 600)
    } else {
      setVisible(false)
    }
  }, [game.status])

  if (!visible || game.status !== "finished") return null

  const hasBlackjack = game.players.some((p) =>
    p.hands.some((h) => h.result?.type === "blackjack_win")
  )

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-overlayFadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-4 flex justify-center">
          {hasBlackjack ? (
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
              <Trophy size={40} className="text-yellow-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-green-600" />
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Game Selesai!
        </h2>

        <div className="space-y-2 mb-6">
          {game.players.map((p) => {
            const net = p.hands.reduce((sum, h) => {
              if (!h.result) return sum
              const profit = h.result.payout - h.bet
              return sum + profit
            }, 0)
            const isMe = p.id === myPlayerId
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between px-4 py-2 rounded-xl ${
                  net > 0
                    ? "bg-green-50 dark:bg-green-900/30"
                    : net < 0
                    ? "bg-red-50 dark:bg-red-900/30"
                    : "bg-gray-50 dark:bg-gray-700/30"
                }`}
              >
                <span className={`font-medium flex items-center gap-2 ${isMe ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                  {isMe && <Play size={14} />}
                  {p.name}
                </span>
                <span className={`font-bold font-mono flex items-center gap-1 ${
                  net > 0 ? "text-green-600" : net < 0 ? "text-red-600" : "text-gray-500"
                }`}>
                  {net > 0 ? <Plus size={16} /> : net < 0 ? <XCircle size={16} /> : <Minus size={16} />}
                  {net > 0 ? "+" : ""}{net}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 justify-center">
          {isHost && (
            <button
              onClick={onNextRound}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-xl transition-all active:scale-95"
            >
              <Play size={18} />
              Ronde Selanjutnya
            </button>
          )}
          <button
            onClick={onNewRoom}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-xl transition-all active:scale-95"
          >
            <Plus size={18} />
            Room Baru
          </button>
        </div>
      </div>
    </div>
  )
}
