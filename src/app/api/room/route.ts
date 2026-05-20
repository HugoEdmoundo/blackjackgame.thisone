import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { createDeck, dealInitialCards, calculateHand } from "@/lib/game"
import { generateRoomCode, generateId } from "@/lib/generateCode"

export async function POST(req: NextRequest) {
  try {
    const { playerName } = await req.json()

    if (!playerName || typeof playerName !== "string" || playerName.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Nama pemain harus diisi" }, { status: 400 })
    }

    const roomId = generateId()
    const code = generateRoomCode()
    const playerId = generateId()
    const deck = createDeck()

    const playerHand: any[] = []
    dealInitialCards(deck, [playerHand])

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
            hand: playerHand,
            score: calculateHand(playerHand),
            isDone: false,
            isHost: true,
          },
        ],
        dealerHand: [],
        dealerScore: 0,
        currentPlayerIndex: 0,
        deck,
        result: null,
        createdAt: Date.now(),
      },
    }

    await kv.set(roomId, room)

    return NextResponse.json({ success: true, room, playerId })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal membuat room" }, { status: 500 })
  }
}
