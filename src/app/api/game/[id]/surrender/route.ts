import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { canSurrender, getCurrentHand, hasPlayerDoneAllHands } from "@/lib/game"

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
    if (!hand || !canSurrender(hand)) {
      return NextResponse.json({ success: false, error: "Tidak bisa surrender" }, { status: 400 })
    }

    hand.isSurrendered = true
    hand.isDone = true

    const refund = Math.floor(hand.bet / 2)
    player.balance += refund

    room.game.currentHandIndex++
    while (
      room.game.currentHandIndex < player.hands.length &&
      player.hands[room.game.currentHandIndex].isDone
    ) {
      room.game.currentHandIndex++
    }

    if (hasPlayerDoneAllHands(player)) {
      room.game.currentPlayerIndex++
      room.game.currentHandIndex = 0

      while (
        room.game.currentPlayerIndex < room.game.players.length &&
        hasPlayerDoneAllHands(room.game.players[room.game.currentPlayerIndex])
      ) {
        room.game.currentPlayerIndex++
        room.game.currentHandIndex = 0
      }

      if (room.game.currentPlayerIndex >= room.game.players.length) {
        const { runDealerSequence } = await import("@/lib/game")
        const result = runDealerSequence(room.game.deck, room.game.players, room.game.dealerHand, room.game.dealerBlackjack)
        room.game.dealerHand = result.dealerHand
        room.game.dealerScore = result.dealerScore
        room.game.players = result.players
        room.game.status = "finished"
      }
    } else {
      room.game.turnStartedAt = Date.now()
    }

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal surrender" }, { status: 500 })
  }
}
