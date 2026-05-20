import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { calculateHand } from "@/lib/game"

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
    const card = room.game.deck.pop()
    if (card) {
      player.hand.push(card)
    }
    player.score = calculateHand(player.hand)

    if (player.score >= 21) {
      player.isDone = true
      room.game.currentPlayerIndex++
      if (room.game.currentPlayerIndex >= room.game.players.length) {
        room.game.currentPlayerIndex = room.game.players.length - 1
      }
    }

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal hit" }, { status: 500 })
  }
}
