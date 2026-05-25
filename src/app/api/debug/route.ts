import { NextResponse } from "next/server"
import { kv } from "@/lib/kv"

export async function GET() {
  const env = {
    KV_URL: process.env.KV_URL ? "SET (" + process.env.KV_URL.slice(0, 20) + "...)" : "NOT SET",
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "SET" : "NOT SET",
    REDIS_URL: process.env.REDIS_URL ? "SET" : "NOT SET",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? "SET" : "NOT SET",
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? "SET" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  }

  let rooms: { id: string; code: string; players: number; status: string }[] = []
  let storeType = "unknown"
  let storeError: string | null = null

  try {
    const allRooms = await kv.getAll()
    rooms = allRooms.map((r) => ({
      id: r.id,
      code: r.code,
      players: r.game.players.length,
      status: r.game.status,
    }))
    storeType = "Redis (Upstash)"
  } catch (e) {
    storeError = String(e)
    storeType = "InMemory (fallback)"
  }

  return NextResponse.json({
    env,
    storeType,
    storeError,
    roomsCount: rooms.length,
    rooms,
  })
}