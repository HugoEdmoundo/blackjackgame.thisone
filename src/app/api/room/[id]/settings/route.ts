import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { GameSettings, DEFAULT_SETTINGS } from "@/lib/types"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { settings, playerId } = await req.json()
    const room = await kv.get(id)

    if (!room) {
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    if (room.game.status !== "waiting") {
      return NextResponse.json({ success: false, error: "Tidak bisa ubah settings saat game berjalan" }, { status: 400 })
    }

    if (room.game.settingsConfigured) {
      return NextResponse.json({ success: false, error: "Settings sudah dikunci" }, { status: 400 })
    }

    const player = room.game.players.find((p) => p.id === playerId)
    if (!player?.isHost) {
      return NextResponse.json({ success: false, error: "Hanya host yang bisa ubah settings" }, { status: 403 })
    }

    const newSettings: GameSettings = {
      minBet: Math.max(1, settings.minBet || DEFAULT_SETTINGS.minBet),
      maxBet: Math.max(settings.minBet || 1, settings.maxBet || DEFAULT_SETTINGS.maxBet),
      maxPlayers: Math.min(6, Math.max(2, settings.maxPlayers || DEFAULT_SETTINGS.maxPlayers)),
      turnTimeout: Math.min(60, Math.max(10, settings.turnTimeout || DEFAULT_SETTINGS.turnTimeout)),
      defaultBet: Math.max(1, settings.defaultBet || DEFAULT_SETTINGS.defaultBet),
    }

    room.game.settings = newSettings
    room.game.settingsConfigured = true

    await kv.set(room.id, room)

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal update settings" }, { status: 500 })
  }
}
