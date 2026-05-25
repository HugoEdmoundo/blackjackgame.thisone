import { Sun, Moon, CheckCircle, LogOut } from "lucide-react"
import type { GameState } from "@/lib/types"

export default function GameLayout({
  children,
  game,
  myPlayerId,
  darkMode,
  onToggleDark,
  onLeave,
  actionBar,
  timeLeft,
  isMyTurn,
  statusLabel,
}: {
  children: React.ReactNode
  game: GameState
  myPlayerId: string
  darkMode: boolean
  onToggleDark: () => void
  onLeave?: () => void
  actionBar?: React.ReactNode
  timeLeft: number | null
  isMyTurn: boolean
  statusLabel?: string
}) {
  const isFinished = game.status === "finished"

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#101d35] to-[#162a4a] flex flex-col">
      {/* === HEADER BAR === */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] bg-[#0a1628]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg sm:text-xl text-[#d4af37] tracking-wide">
            Blackjack
          </h1>
          {game.status !== "waiting" && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/30 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/50" />
              Round {game.round}
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              Kode: {game.code}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {timeLeft !== null && isMyTurn && timeLeft > 0 && (
            <div className="flex items-center gap-1.5">
              <div className={`text-sm font-mono font-bold ${timeLeft <= 5 ? "text-red-400" : "text-[#d4af37]"}`}>
                {timeLeft}s
              </div>
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    timeLeft <= 5 ? "bg-red-500" : "bg-[#d4af37]"
                  }`}
                  style={{ width: `${(timeLeft / (game.settings.turnTimeout || 30)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {statusLabel ? (
            <span className="hidden sm:inline text-xs text-white/50 font-medium">{statusLabel}</span>
          ) : isFinished ? (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle size={14} /> Selesai
            </span>
          ) : null}

          {onLeave && (
            <button
              onClick={onLeave}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors text-red-400 hover:text-red-300"
              title="Keluar Room"
            >
              <LogOut size={16} />
            </button>
          )}
          <button
            onClick={onToggleDark}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] transition-colors text-white/50 hover:text-white"
            title={darkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* === TABLE AREA === */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full felt-bg flex flex-col">
          {/* Content */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      {/* === ACTION BAR === */}
      {actionBar && (
        <div className="shrink-0 bg-[#0a1628]/90 backdrop-blur-xl border-t border-white/[0.06] px-4 sm:px-6 py-3 z-30">
          {actionBar}
        </div>
      )}
    </div>
  )
}
