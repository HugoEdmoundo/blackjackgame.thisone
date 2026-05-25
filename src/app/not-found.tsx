"use client"

import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-table via-table-secondary to-table-accent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="absolute opacity-[0.04] select-none text-gold-400"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite ${i * 0.5}s`,
            }}
          >
            <Sparkles size={48} />
          </div>
        ))}
      </div>

      <div className="w-full max-w-md text-center relative z-10">
        {/* Animated 404 */}
        <div className="mb-8 relative">
          <h1 className="text-[8rem] sm:text-[10rem] font-black font-display leading-none">
            <span className="bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 bg-clip-text text-transparent"
              style={{ animation: "glowPulse 2s ease-in-out infinite" }}>
              404
            </span>
          </h1>
          {/* Decorative cards */}
          <div className="flex justify-center gap-2 mt-2">
            <div className="w-10 h-14 bg-white rounded-lg border-2 border-gold-400/60 flex items-center justify-center shadow-lg"
              style={{ animation: "float 2.5s ease-in-out infinite" }}>
              <span className="text-lg text-red-500">?</span>
            </div>
            <div className="w-10 h-14 bg-white rounded-lg border-2 border-gold-400/60 flex items-center justify-center shadow-lg"
              style={{ animation: "float 2.5s ease-in-out infinite 0.5s" }}>
              <span className="text-lg text-gray-900 dark:text-gray-300">?</span>
            </div>
            <div className="w-10 h-14 bg-white rounded-lg border-2 border-gold-400/60 flex items-center justify-center shadow-lg"
              style={{ animation: "float 2.5s ease-in-out infinite 1s" }}>
              <span className="text-lg text-red-500">?</span>
            </div>
          </div>
        </div>

        <p className="text-white/50 text-lg font-display mb-8">Halaman tidak ditemukan</p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg"
        >
          <ArrowLeft size={20} />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
