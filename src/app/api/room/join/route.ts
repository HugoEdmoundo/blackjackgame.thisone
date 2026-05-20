import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { calculateHand } from "@/lib/game"
import { generateId } from "@/lib/generateCode"

export async function POST(req: NextRequest) {
  try {
    const { roomCode, playerName } = await req.json()

    if (!roomCode || !playerName || playerName.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Room code dan nama harus diisi" }, { status: 400 })
    }

    const rooms = await kv.getAll()
    const room = rooms.find((r) => r.code === roomCode.toUpperCase())

    if (!room) {
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    if (room.game.status !== "waiting") {
      return NextResponse.json({ success: false, error: "Game sudah dimulai" }, { status: 400 })
    }

    if (room.game.players.length >= 4) {
      return NextResponse.json({ success: false, error: "Room sudah penuh (max 4 pemain)" }, { status: 400 })
    }

    if (!room.game.code) room.game.code = room.code

    const playerId = generateId()
    room.game.players.push({
      id: playerId,
      name: playerName.trim(),
      hand: [],
      score: 0,
      isDone: false,
      isHost: false,
    })

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, room, playerId })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal join room" }, { status: 500 })
  }
}
