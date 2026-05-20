import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { calculateHand, playDealerTurn, determineWinner } from "@/lib/game"

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

    room.game.players[playerIdx].isDone = true
    room.game.currentPlayerIndex++

    const allDone = room.game.players.every((p) => p.isDone)

    if (allDone) {
      const dealerHand: any[] = []
      const card1 = room.game.deck.pop()
      const card2 = room.game.deck.pop()
      if (card1 && card2) {
        dealerHand.push(card1, card2)
      }
      playDealerTurn(room.game.deck, dealerHand)
      room.game.dealerHand = dealerHand
      room.game.dealerScore = calculateHand(dealerHand)

      const results = determineWinner(room.game.players, room.game.dealerScore)
      room.game.players = room.game.players.map((p, i) => ({
        ...p,
        result: results[i],
      }))
      room.game.status = "finished"
    }

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal stand" }, { status: 500 })
  }
}
