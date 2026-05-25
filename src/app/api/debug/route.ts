import { NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { DEFAULT_SETTINGS, STARTING_BALANCE } from "@/lib/types"

export async function GET() {
  const env = {
    KV_URL: process.env.KV_URL ? "SET (" + process.env.KV_URL.slice(0, 20) + "...)" : "NOT SET",
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "SET" : "NOT SET",
    REDIS_URL: process.env.REDIS_URL ? "SET" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  }

  let storeType = "unknown"
  let storeError: string | null = null
  let roomsCount = 0
  let rooms: any[] = []
  let testResult: any = {}

  try {
    const allRooms = await kv.getAll()
    rooms = allRooms.map((r) => ({
      id: r.id,
      code: r.code,
      players: r.game.players.length,
      status: r.game.status,
    }))
    roomsCount = rooms.length
    storeType = "Redis (Upstash)"
  } catch (e) {
    storeError = String(e)
    storeType = "InMemory (fallback)"
  }

  // Test: write a dummy room, read it back, delete it
  try {
    const testRoom = {
      id: "__test__",
      code: "TEST",
      game: {
        id: "__test__",
        code: "TEST",
        status: "waiting" as const,
        players: [],
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

    await kv.set("__test__", testRoom as any)
    testResult.setSuccess = true
  } catch (e) {
    testResult.setSuccess = false
    testResult.setError = String(e)
  }

  try {
    const read = await kv.get("__test__")
    testResult.getSuccess = !!read
    testResult.getData = read
      ? { id: read.id, code: read.code, status: read.game.status }
      : null
  } catch (e) {
    testResult.getSuccess = false
    testResult.getError = String(e)
  }

  try {
    await kv.delete("__test__")
    testResult.deleteSuccess = true
  } catch (e) {
    testResult.deleteSuccess = false
    testResult.deleteError = String(e)
  }

  // Check keys again after test
  let postTestCount = 0
  try {
    const allRooms2 = await kv.getAll()
    postTestCount = allRooms2.filter((r) => r.id !== "__test__").length
  } catch {}

  return NextResponse.json({
    env,
    storeType,
    storeError,
    roomsCount,
    rooms,
    testResult,
    postTestRoomsCount: postTestCount,
  })
}