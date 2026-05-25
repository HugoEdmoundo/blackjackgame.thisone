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
      return NextResponse.json({ success: false, error: "Hanya host yang bisa memulai game" }, { status: 403 })
    }

    if (room.game.status !== "waiting") {
      return NextResponse.json({ success: false, error: "Game sudah dimulai" }, { status: 400 })
    }

    if (room.game.players.length < 2) {
      return NextResponse.json({ success: false, error: "Minimal 2 pemain" }, { status: 400 })
    }

    if (!room.game.settingsConfigured) {
      return NextResponse.json({ success: false, error: "Atur pengaturan room terlebih dahulu" }, { status: 400 })
    }

    const deck = createDeck()

    const dealerHand: import("@/lib/types").Card[] = []
    const d1 = deck.pop()
    const d2 = deck.pop()
    if (d1 && d2) dealerHand.push(d1, d2)

    const rawHands = dealInitialCards(deck, room.game.players.length)

    const updatedPlayers = room.game.players.map((p, i) => {
      const bet = Math.min(p.totalBet || room.game.settings.defaultBet, p.balance)
      p.balance -= bet
      return {
        ...p,
        hands: [createInitialHand(rawHands[i], bet)],
        insuranceDecided: false,
        insuranceBet: 0,
      }
    })

    room.game.deck = deck
    room.game.dealerHand = dealerHand
    room.game.dealerScore = 0
    room.game.currentPlayerIndex = 0
    room.game.currentHandIndex = 0
    room.game.players = updatedPlayers
    room.game.status = "playing"
    room.game.round = 1
    room.game.turnStartedAt = Date.now()
    room.game.insuranceOffered = false
    room.game.dealerBlackjack = false

    if (dealerHasBlackjack(dealerHand)) {
      room.game.dealerBlackjack = true
    }

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal start game" }, { status: 500 })
  }
}
