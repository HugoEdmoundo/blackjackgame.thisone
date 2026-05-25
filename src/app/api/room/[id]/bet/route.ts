import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { playerId, amount } = await req.json()
    const room = await kv.get(id)

    if (!room) {
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    if (room.game.status === "playing") {
      return NextResponse.json({ success: false, error: "Tidak bisa ubah bet saat game berjalan" }, { status: 400 })
    }

    const player = room.game.players.find((p) => p.id === playerId)
    if (!player) {
      return NextResponse.json({ success: false, error: "Player tidak ditemukan" }, { status: 404 })
    }

    const bet = Math.max(room.game.settings.minBet, Math.min(room.game.settings.maxBet, amount, player.balance))
    player.totalBet = bet

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal update bet" }, { status: 500 })
  }
}
