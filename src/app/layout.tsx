import type { Metadata } from "next"
import ToastContainer from "@/components/Toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "Blackjack Multiplayer",
  description: "Main Blackjack bareng temen-temen!",
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap" />
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem("bj-theme") || "dark"
                if (theme === "dark") document.documentElement.classList.add("dark")
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full font-sans bg-table text-white">
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
