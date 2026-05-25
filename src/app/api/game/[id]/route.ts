import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("[game] GET game for:", id)

    const room = await kv.get(id)

    if (!room) {
      console.log("[game] Room NOT FOUND:", id)
      const all = await kv.getAll()
      console.log("[game] Total rooms in store:", all.length, all.map(r => ({ id: r.id, code: r.code })))
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    console.log("[game] Room FOUND:", id, room.code)
    return NextResponse.json({ success: true, game: room.game })
  } catch (err) {
    console.error("[game] Error fetching game:", err)
    return NextResponse.json({ success: false, error: "Gagal mengambil state" }, { status: 500 })
  }
}
