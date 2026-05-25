"use client"

export default function LoadingScreen({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-table via-table-secondary to-table-accent flex items-center justify-center" role="status" aria-label="Memuat">
      <div className="flex flex-col items-center gap-8">
        {/* Animated cards */}
        <div className="flex gap-4 items-center">
          <div className="w-14 h-20 bg-gradient-to-br from-blue-700 to-blue-600 rounded-xl border-2 border-gold-400/30 flex items-center justify-center shadow-xl"
            style={{ animation: "loadingCardFlip 1.2s ease-in-out infinite" }}>
            <span className="text-2xl text-gold-300 font-bold">?</span>
          </div>
          <div className="w-14 h-20 bg-white rounded-xl border-2 border-gold-400/60 flex items-center justify-center shadow-xl"
            style={{ animation: "loadingCardFlip 1.2s ease-in-out infinite 0.4s" }}>
            <span className="text-2xl text-red-500">?</span>
          </div>
          <div className="w-14 h-20 bg-gradient-to-br from-blue-700 to-blue-600 rounded-xl border-2 border-gold-400/30 flex items-center justify-center shadow-xl"
            style={{ animation: "loadingCardFlip 1.2s ease-in-out infinite 0.8s" }}>
            <span className="text-2xl text-gold-300 font-bold">?</span>
          </div>
        </div>

        {/* Text */}
        <p className="text-white/40 text-sm font-medium tracking-[0.3em] uppercase animate-pulse">
          {text}
        </p>
      </div>
    </div>
  )
}
