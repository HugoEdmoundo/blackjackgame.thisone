"use client"

import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-table via-table-secondary to-table-accent flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Animated icon */}
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center"
          style={{ animation: "bounceIn 0.6s ease-out" }}>
          <AlertTriangle size={36} className="text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 font-display">Oops!</h1>
        <p className="text-white/50 mb-2">Terjadi kesalahan</p>
        <p className="text-sm text-white/30 mb-6 line-clamp-2">{error.message}</p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-6 rounded-xl transition-all active:scale-95 border border-white/10"
          >
            <Home size={16} />
            Beranda
          </a>
        </div>
      </div>
    </div>
  )
}
