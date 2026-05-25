import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { playerId } = await req.json()
    const room = await kv.get(id)

    if (!room) {
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    if (room.game.status === "playing") {
      return NextResponse.json({ success: false, error: "Tidak bisa keluar saat game berjalan" }, { status: 400 })
    }

    const playerIdx = room.game.players.findIndex((p) => p.id === playerId)
    if (playerIdx === -1) {
      return NextResponse.json({ success: false, error: "Player tidak ditemukan" }, { status: 404 })
    }

    const wasHost = room.game.players[playerIdx].isHost
    room.game.players.splice(playerIdx, 1)

    if (room.game.players.length === 0) {
      await kv.delete(room.id)
      return NextResponse.json({ success: true, deleted: true })
    }

    if (wasHost) {
      room.game.players[0].isHost = true
    }

    await kv.set(room.id, room)
    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal keluar room" }, { status: 500 })
  }
}
