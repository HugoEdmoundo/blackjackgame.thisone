import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { generateId } from "@/lib/generateCode"
import { DEFAULT_SETTINGS, STARTING_BALANCE } from "@/lib/types"

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

    if (room.game.players.length >= room.game.settings.maxPlayers) {
      return NextResponse.json({
        success: false,
        error: `Room sudah penuh (max ${room.game.settings.maxPlayers} pemain)`,
      }, { status: 400 })
    }

    const playerId = generateId()
    room.game.players.push({
      id: playerId,
      name: playerName.trim(),
      hands: [],
      isHost: false,
            balance: STARTING_BALANCE,
            totalBet: room.game.settings.defaultBet,
            insuranceBet: 0,
            insuranceDecided: false,
      stats: {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalPushes: 0,
        blackjackCount: 0,
        currentStreak: 0,
        bestWinStreak: 0,
      },
    })

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, room, playerId })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal join room" }, { status: 500 })
  }
}
