import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { createDeck, dealInitialCards, createInitialHand } from "@/lib/game"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const room = await kv.get(id)

    if (!room) {
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    if (room.game.status !== "finished") {
      return NextResponse.json({ success: false, error: "Game belum selesai" }, { status: 400 })
    }

    const alivePlayers = room.game.players.filter((p) => p.balance >= room.game.settings.minBet)
    if (alivePlayers.length < 2) {
      return NextResponse.json({
        success: false,
        error: "Tidak cukup pemain dengan saldo cukup",
      }, { status: 400 })
    }

    const deck = createDeck()
    room.game.deck = deck
    room.game.dealerHand = []
    room.game.dealerScore = 0
    room.game.currentPlayerIndex = 0
    room.game.currentHandIndex = 0
    room.game.round++
    room.game.insuranceOffered = false
    room.game.dealerBlackjack = false
    room.game.turnStartedAt = Date.now()

    const rawHands = dealInitialCards(deck, alivePlayers.length)
    const updatedPlayers = alivePlayers.map((p, i) => {
      const bet = Math.min(p.totalBet, p.balance)
      p.balance -= bet
      return {
        ...p,
        hands: [createInitialHand(rawHands[i], bet)],
      }
    })

    room.game.players = updatedPlayers
    room.game.status = "playing"

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal mulai ronde baru" }, { status: 500 })
  }
}
