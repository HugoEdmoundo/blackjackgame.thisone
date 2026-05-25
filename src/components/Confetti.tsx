"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  opacity: number
}

const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6", "#a855f7", "#f97316", "#ffffff"]

export default function Confetti({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!trigger) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const count = 80
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4 + 2,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      })
    }

    let frame = 0
    function animate() {
      frame++
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      particlesRef.current = particlesRef.current.filter((p) => p.opacity > 0 && p.y < canvas!.height + 20)

      for (const p of particlesRef.current) {
        p.x += p.vx
        p.vy += 0.1
        p.y += p.vy
        p.rotation += p.rotationSpeed
        if (frame > 60) p.opacity -= 0.008

        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate((p.rotation * Math.PI) / 180)
        ctx!.globalAlpha = Math.max(0, p.opacity)
        ctx!.fillStyle = p.color
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx!.restore()
      }

      if (particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(animate)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    setTimeout(() => cancelAnimationFrame(animRef.current), 5000)

    return () => cancelAnimationFrame(animRef.current)
  }, [trigger])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  )
}
