import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { generateRoomCode, generateId } from "@/lib/generateCode"
import { DEFAULT_SETTINGS, STARTING_BALANCE } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const { playerName } = await req.json()

    if (!playerName || typeof playerName !== "string" || playerName.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Nama pemain harus diisi" }, { status: 400 })
    }

    const roomId = generateId()
    const code = generateRoomCode()
    const playerId = generateId()

    const room = {
      id: roomId,
      code,
      game: {
        id: roomId,
        code,
        status: "waiting" as const,
        players: [
          {
            id: playerId,
            name: playerName.trim(),
            hands: [],
            isHost: true,
            balance: STARTING_BALANCE,
            totalBet: DEFAULT_SETTINGS.defaultBet,
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
          },
        ],
        dealerHand: [],
        dealerScore: 0,
        currentPlayerIndex: 0,
        currentHandIndex: 0,
        deck: [],
        createdAt: Date.now(),
        round: 0,
        settings: { ...DEFAULT_SETTINGS },
        turnStartedAt: 0,
        insuranceOffered: false,
        dealerBlackjack: false,
        settingsConfigured: false,
      },
    }

    await kv.set(roomId, room)

    return NextResponse.json({ success: true, room, playerId })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal membuat room" }, { status: 500 })
  }
}
