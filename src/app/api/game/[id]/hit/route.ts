import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { calculateHand, runDealerSequence } from "@/lib/game"

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
    }

    while (room.game.currentPlayerIndex < room.game.players.length && room.game.players[room.game.currentPlayerIndex].isDone) {
      room.game.currentPlayerIndex++
    }

    const allDone = room.game.players.every((p) => p.isDone)
    if (allDone) {
      const result = runDealerSequence(room.game.deck, room.game.players)
      room.game.dealerHand = result.dealerHand
      room.game.dealerScore = result.dealerScore
      room.game.players = result.players
      room.game.status = "finished"
    }

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal hit" }, { status: 500 })
  }
}
