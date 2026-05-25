"use client"

import { useEffect, useState, useCallback } from "react"

export type ToastType = "success" | "error" | "info"

export type ToastData = {
  id: number
  message: string
  type: ToastType
  leaving?: boolean
}

let toastId = 0
let addToastFn: ((msg: string, type: ToastType) => void) | null = null

export function showToast(message: string, type: ToastType = "info") {
  addToastFn?.(message, type)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, leaving: true } : t))
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, 3000)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => { addToastFn = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm" role="alert" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-xl shadow-2xl text-white font-medium text-sm backdrop-blur-sm ${
            toast.type === "success"
              ? "bg-green-600/90"
              : toast.type === "error"
              ? "bg-red-600/90"
              : "bg-blue-600/90"
          } ${toast.leaving ? "animate-toastOut" : "animate-toastIn"}`}
          style={{ animationDuration: "300ms" }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
