import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Blackjack Multiplayer",
  description: "Main Blackjack bareng temen-temen!",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  )
}
