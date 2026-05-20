type ChipValue = 100 | 50 | 25 | 10 | 5 | 1

const chipStyles: Record<ChipValue, { bg: string; border: string; label: string }> = {
  100: { bg: "bg-red-600", border: "border-red-800", label: "$100" },
  50: { bg: "bg-blue-600", border: "border-blue-800", label: "$50" },
  25: { bg: "bg-emerald-600", border: "border-emerald-800", label: "$25" },
  10: { bg: "bg-yellow-500", border: "border-yellow-700", label: "$10" },
  5: { bg: "bg-purple-600", border: "border-purple-800", label: "$5" },
  1: { bg: "bg-gray-300", border: "border-gray-400", label: "$1" },
}

function breakdown(amount: number): ChipValue[] {
  const result: ChipValue[] = []
  let remaining = amount
  const denoms: ChipValue[] = [100, 50, 25, 10, 5, 1]
  for (const d of denoms) {
    while (remaining >= d && result.length < 6) {
      result.push(d)
      remaining -= d
    }
    if (result.length >= 6) break
  }
  return result
}

export default function ChipStack({ amount, size = "sm", showLabel = true }: { amount: number; size?: "sm" | "xs"; showLabel?: boolean }) {
  if (amount <= 0) return null

  const chips = breakdown(amount)
  const chipSize = size === "xs" ? "w-4 h-4" : "w-5 h-5"
  const textSize = size === "xs" ? "text-[6px]" : "text-[7px]"

  return (
    <div className="flex items-center">
      <div className="flex items-center relative" style={{ paddingRight: `${(chips.length - 1) * 6}px` }}>
        {chips.map((val, i) => {
          const style = chipStyles[val]
          return (
            <div
              key={i}
              className={`absolute ${chipSize} rounded-full border ${style.bg} ${style.border} flex items-center justify-center`}
              style={{
                left: `${i * 6}px`,
                zIndex: chips.length - i,
                animation: `chipDrop 0.3s ease-out ${i * 0.05}s both`,
              }}
            >
              <span className={`${textSize} font-bold text-white leading-none`}>{val}</span>
            </div>
          )
        })}
      </div>
      {showLabel && chips.length > 0 && (
        <span className="ml-1 text-xs font-mono font-bold text-gold-300">{amount}</span>
      )}
    </div>
  )
}
