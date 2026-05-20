import { NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const room = await kv.get(id)

    if (!room) {
      return NextResponse.json({ success: false, error: "Room tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ success: true, game: room.game })
  } catch {
    return NextResponse.json({ success: false, error: "Gagal mengambil state" }, { status: 500 })
  }
}
