import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { createDeck, dealInitialCards, createInitialHand, dealerHasBlackjack } from "@/lib/game"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { playerId } = await req.json()
    const room = await kv.get(id)

    if (!room) {
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    const player = room.game.players.find((p) => p.id === playerId)
    if (!player?.isHost) {
      return NextResponse.json({ success: false, error: "Hanya host yang bisa mulai ronde baru" }, { status: 403 })
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
    const dealerHand: import("@/lib/types").Card[] = []
    const d1 = deck.pop()
    const d2 = deck.pop()
    if (d1 && d2) dealerHand.push(d1, d2)
    room.game.dealerHand = dealerHand
    room.game.dealerScore = 0
    room.game.currentPlayerIndex = 0
    room.game.currentHandIndex = 0
    room.game.round++
    room.game.insuranceOffered = false
    room.game.dealerBlackjack = false
    room.game.turnStartedAt = Date.now()

    if (dealerHasBlackjack(dealerHand)) {
      room.game.dealerBlackjack = true
    }

    const rawHands = dealInitialCards(deck, alivePlayers.length)
    const updatedPlayers = alivePlayers.map((p, i) => {
      const bet = Math.min(p.totalBet, p.balance)
      p.balance -= bet
      return {
        ...p,
        insuranceDecided: false,
        insuranceBet: 0,
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
