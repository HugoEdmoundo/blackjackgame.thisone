import { GameState, Player } from "@/lib/types"
import PlayerHand from "./PlayerHand"
import Card from "./Card"

export default function GameBoard({ game, myPlayerId }: { game: GameState; myPlayerId: string }) {
  if (!game) return null

  const isFinished = game.status === "finished"
  const currentPlayer = game.currentPlayerIndex < game.players.length
    ? game.players[game.currentPlayerIndex]
    : null
  const isMyTurn = currentPlayer?.id === myPlayerId && !isFinished

  return (
    <div className="space-y-6">
      <div className="bg-green-800 rounded-xl p-4 border-2 border-green-600">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold">Dealer</h3>
          {isFinished && (
            <span className="text-white/80 text-sm font-mono">
              Score: {game.dealerScore}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {game.dealerHand.length === 0 ? (
            <span className="text-green-300 italic text-sm">Menunggu...</span>
          ) : (
            game.dealerHand.map((card, i) => (
              <Card key={i} card={card} hidden={!isFinished && i === 0} />
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {game.players.map((player: Player) => (
          <PlayerHand
            key={player.id}
            player={player}
            isCurrentTurn={player.id === currentPlayer?.id && !isFinished}
            showResult={isFinished}
          />
        ))}
      </div>
    </div>
  )
}
