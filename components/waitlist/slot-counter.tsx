const TOTAL_SLOTS = 100

export function SlotCounter({ count }: { count: number }) {
  const safe = Math.max(0, Math.min(TOTAL_SLOTS, count))
  const pct = (safe / TOTAL_SLOTS) * 100
  const full = safe >= TOTAL_SLOTS

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between font-mono text-sm font-bold uppercase tracking-widest text-tnl-black">
        <span aria-live="polite">
          <span className={full ? "text-tnl-red" : "text-tnl-blue"}>{safe}</span>
          {" / "}
          {TOTAL_SLOTS} slots claimed
        </span>
        <span className="text-tnl-black/60">{full ? "closed" : "open"}</span>
      </div>

      <div
        className="mt-2 h-5 w-full border-4 border-tnl-black bg-tnl-white"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL_SLOTS}
        aria-valuenow={safe}
        aria-label={`${safe} of ${TOTAL_SLOTS} waitlist slots claimed`}
      >
        <div
          className={`tnl-bar-fill h-full ${full ? "bg-tnl-red" : "bg-tnl-blue"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
