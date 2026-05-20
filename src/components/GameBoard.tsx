import type { GameState } from "@/lib/types"
import DealerArea from "./DealerArea"
import PlayerSpot from "./PlayerSpot"

export default function GameBoard({ game, myPlayerId }: { game: GameState; myPlayerId: string }) {
  if (!game) return null

  const isFinished = game.status === "finished"
  const currentPlayer = game.currentPlayerIndex < game.players.length
    ? game.players[game.currentPlayerIndex]
    : null
  const isMyTurn = currentPlayer?.id === myPlayerId && !isFinished

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Dealer area */}
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <DealerArea game={game} />
        </div>
      </div>

      {/* Divider with glow */}
      <div className="relative flex items-center justify-center">
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      </div>

      {/* Player spots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {game.players.map((player) => (
          <PlayerSpot
            key={player.id}
            player={player}
            isCurrentTurn={player.id === currentPlayer?.id && !isFinished}
            isFinished={isFinished}
            currentHandIndex={player.id === currentPlayer?.id ? game.currentHandIndex : 0}
            isMe={player.id === myPlayerId}
          />
        ))}
      </div>
    </div>
  )
}
