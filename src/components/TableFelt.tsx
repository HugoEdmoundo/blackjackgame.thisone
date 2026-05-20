export default function TableFelt({ variant = "game" }: { variant?: "lobby" | "game" }) {
  if (variant === "lobby") {
    return (
      <div className="absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 50%, #0f7a42 0%, #09562d 50%, #04361c 100%)",
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "repeating-conic-gradient(rgba(0,0,0,0.04) 0% 25%, transparent 0% 50%)",
          backgroundSize: "3px 3px",
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }} />
      </div>
    )
  }

  return null
}
