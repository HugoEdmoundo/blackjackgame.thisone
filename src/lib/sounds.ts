let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function playTone(freq: number, duration: number, type: OscillatorType = "square", volume = 0.08) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.value = volume
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

export function dealCard() {
  playTone(800, 0.08, "square", 0.06)
  setTimeout(() => playTone(1000, 0.06, "square", 0.04), 40)
}

export function chipSound() {
  try {
    const ctx = getCtx()
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = 400 + i * 200
      gain.gain.value = 0.04
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.04)
      osc.stop(ctx.currentTime + i * 0.04 + 0.12)
    }
  } catch {}
}

export function winSound() {
  const notes = [523, 659, 784]
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, "sine", 0.1), i * 120)
  })
}

export function loseSound() {
  const notes = [784, 659, 523]
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.25, "sawtooth", 0.06), i * 150)
  })
}

export function blackjackFanfare() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.3, "sine", 0.12), i * 100)
  })
  setTimeout(() => playTone(1047, 0.5, "sine", 0.1), 400)
}

export function buttonClick() {
  playTone(600, 0.04, "square", 0.04)
}

export function insuranceSound() {
  playTone(440, 0.15, "triangle", 0.08)
  setTimeout(() => playTone(550, 0.15, "triangle", 0.06), 150)
}
