import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { createDeck, dealInitialCards, calculateHand } from "@/lib/game"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const room = await kv.get(id)

    if (!room) {
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    if (room.game.status !== "waiting") {
      return NextResponse.json({ success: false, error: "Game sudah dimulai" }, { status: 400 })
    }

    if (room.game.players.length < 2) {
      return NextResponse.json({ success: false, error: "Minimal 2 pemain" }, { status: 400 })
    }

    const deck = createDeck()
    const hands = room.game.players.map(() => [] as any[])
    dealInitialCards(deck, hands)

    room.game.players = room.game.players.map((p, i) => ({
      ...p,
      hand: hands[i],
      score: calculateHand(hands[i]),
      isDone: false,
    }))

    room.game.deck = deck
    room.game.dealerHand = []
    room.game.currentPlayerIndex = 0
    room.game.status = "playing"

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal start game" }, { status: 500 })
  }
}
