import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        gold: {
          50: "#fdf8e8",
          100: "#faefc5",
          200: "#f5de8e",
          300: "#f0cd5c",
          400: "#d4af37",
          500: "#b8962e",
          600: "#9a7d26",
          700: "#7d641e",
          800: "#5f4b16",
          900: "#423310",
        },
        felt: {
          DEFAULT: "#0d5c2e",
          light: "#1a7a3f",
          dark: "#083d1e",
        },
        table: {
          DEFAULT: "#0a1628",
          secondary: "#101d35",
          accent: "#162a4a",
        },
      },
      animation: {
        "slideInLeft": "slideInLeft 0.3s ease-out both",
        "slideInRight": "slideInRight 0.3s ease-out both",
        "flipIn": "flipIn 0.4s ease-out both",
        "chipDrop": "chipDrop 0.3s ease-out both",
        "glowPulse": "glowPulse 1.5s ease-in-out infinite",
        "toastIn": "toastIn 0.3s ease-out both",
        "toastOut": "toastOut 0.3s ease-in both",
        "confetti-fall": "confetti-fall 3s ease-in forwards",
        "overlayFadeIn": "overlayFadeIn 0.4s ease-out both",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "cardDeal": "cardDeal 0.35s ease-out both",
        "feltShimmer": "feltShimmer 4s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "bounceIn": "bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) both",
      },
      keyframes: {
        cardDeal: {
          "0%": { transform: "translateY(-120px) rotate(-10deg) scale(0.8)", opacity: "0" },
          "100%": { transform: "translateY(0) rotate(0deg) scale(1)", opacity: "1" },
        },
        feltShimmer: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}

export default config
