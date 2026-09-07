// Comic / street-art background texture: halftone dot field + a few
// diagonal "speed line" slashes. Purely decorative, hidden from AT.
export function Decor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Halftone dot field */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(var(--tnl-black) 1.4px, transparent 1.6px)",
          backgroundSize: "14px 14px",
          maskImage: "radial-gradient(120% 90% at 50% 0%, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 50% 0%, black 30%, transparent 78%)",
        }}
      />

      {/* Speed-line slashes */}
      <div className="absolute -left-10 top-16 h-2 w-72 -rotate-[24deg] bg-tnl-black/80" />
      <div className="absolute -left-6 top-24 h-1 w-40 -rotate-[24deg] bg-tnl-red/80" />
      <div className="absolute right-[-40px] top-10 h-2 w-80 rotate-[18deg] bg-tnl-black/80" />
      <div className="absolute right-4 top-20 h-1 w-44 rotate-[18deg] bg-tnl-blue/80" />
      <div className="absolute bottom-24 left-[-30px] h-1.5 w-56 rotate-[12deg] bg-tnl-black/70" />
      <div className="absolute bottom-16 right-[-30px] h-1.5 w-60 -rotate-[14deg] bg-tnl-black/70" />
    </div>
  )
}
