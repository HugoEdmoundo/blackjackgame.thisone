import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { calculateHand, getCurrentHand, canSplit, hasPlayerDoneAllHands } from "@/lib/game"
import { createInitialHand } from "@/lib/game"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { playerId } = await req.json()
    const room = await kv.get(id)

    if (!room) {
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    if (room.game.status !== "playing") {
      return NextResponse.json({ success: false, error: "Game tidak sedang berlangsung" }, { status: 400 })
    }

    const playerIdx = room.game.players.findIndex((p) => p.id === playerId)
    if (playerIdx === -1) {
      return NextResponse.json({ success: false, error: "Player tidak ditemukan" }, { status: 404 })
    }

    if (playerIdx !== room.game.currentPlayerIndex) {
      return NextResponse.json({ success: false, error: "Bukan giliranmu" }, { status: 400 })
    }

    const player = room.game.players[playerIdx]
    const hand = getCurrentHand(player, room.game.currentHandIndex)
    if (!hand || !canSplit(hand)) {
      return NextResponse.json({ success: false, error: "Tidak bisa split" }, { status: 400 })
    }

    if (player.hands.length >= 4) {
      return NextResponse.json({ success: false, error: "Max 4 split hands" }, { status: 400 })
    }

    if (player.balance < hand.bet) {
      return NextResponse.json({ success: false, error: "Saldo tidak cukup untuk split" }, { status: 400 })
    }

    player.balance -= hand.bet

    const card1 = hand.cards[0]
    const card2 = hand.cards[1]

    const deckCard1 = room.game.deck.pop()
    const deckCard2 = room.game.deck.pop()

    hand.cards = [card1]
    if (deckCard1) hand.cards.push(deckCard1)
    hand.score = calculateHand(hand.cards)
    hand.isSplit = true
    hand.isDone = false

    const newHand = createInitialHand([card2], hand.bet)
    if (deckCard2) newHand.cards.push(deckCard2)
    newHand.score = calculateHand(newHand.cards)
    newHand.isSplit = true

    player.hands.splice(room.game.currentHandIndex + 1, 0, newHand)

    if (hand.score === 21) {
      hand.isDone = true
    }

    room.game.turnStartedAt = Date.now()
    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal split" }, { status: 500 })
  }
}
