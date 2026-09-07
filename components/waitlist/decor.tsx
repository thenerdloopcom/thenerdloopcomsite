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
    </div>
  )
}
