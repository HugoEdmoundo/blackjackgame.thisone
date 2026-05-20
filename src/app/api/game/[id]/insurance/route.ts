import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { canTakeInsurance, dealerHasBlackjack, runDealerSequence } from "@/lib/game"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { playerId, takeInsurance } = await req.json()
    const room = await kv.get(id)

    if (!room) {
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    if (room.game.status !== "playing") {
      return NextResponse.json({ success: false, error: "Game tidak sedang berlangsung" }, { status: 400 })
    }

    if (room.game.insuranceOffered) {
      return NextResponse.json({ success: false, error: "Insurance sudah diproses" }, { status: 400 })
    }

    if (!canTakeInsurance(room.game)) {
      return NextResponse.json({ success: false, error: "Insurance tidak tersedia" }, { status: 400 })
    }

    const player = room.game.players.find((p) => p.id === playerId)
    if (!player) {
      return NextResponse.json({ success: false, error: "Player tidak ditemukan" }, { status: 404 })
    }

    if (player.insuranceDecided) {
      return NextResponse.json({ success: false, error: "Sudah memutuskan insurance" }, { status: 400 })
    }

    if (takeInsurance) {
      const insuranceCost = Math.floor(player.totalBet / 2)
      if (player.balance < insuranceCost) {
        return NextResponse.json({ success: false, error: "Saldo tidak cukup" }, { status: 400 })
      }
      player.balance -= insuranceCost
      player.insuranceBet = insuranceCost
    }
    player.insuranceDecided = true

    const allDecided = room.game.players.every((p) => p.insuranceDecided)
    if (allDecided) {
      room.game.insuranceOffered = true

      const dHasBJ = dealerHasBlackjack(room.game.dealerHand)
      room.game.dealerBlackjack = dHasBJ

      if (dHasBJ) {
        const result = runDealerSequence(
          room.game.deck,
          room.game.players,
          room.game.dealerHand,
          true,
        )
        room.game.dealerHand = result.dealerHand
        room.game.dealerScore = result.dealerScore
        room.game.players = result.players
        room.game.status = "finished"
      }
    }

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal proses insurance" }, { status: 500 })
  }
}
