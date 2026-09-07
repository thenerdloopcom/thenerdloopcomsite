import type { Metadata } from "next"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Decor } from "@/components/waitlist/decor"
import { WaitlistExperience } from "@/components/waitlist/waitlist-experience"

export const metadata: Metadata = {
  title: "TheNerdLoop — Join the Waitlist",
  description: "Be one of the first 100 people to enter TheNerdLoop.",
}

// The count is informational; join_waitlist() remains authoritative.
async function getInitialCount(): Promise<number> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc("get_waitlist_count")
    if (!error && typeof data === "number") return data
  } catch {
    // Fall through to a safe default; the client re-fetches after actions.
  }
  return 0
}

export default async function WaitlistPage() {
  const initialCount = await getInitialCount()

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-tnl-yellow px-5 py-12 text-tnl-black sm:px-8 sm:py-16">
      <Decor />

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center">
        {/* Brand logo — presented on its native black comic panel */}
        <div className="tnl-slam w-full max-w-md border-4 border-tnl-black bg-tnl-black shadow-[10px_10px_0_0_var(--tnl-black)]">
          <Image
            src="/tnl-logo.png"
            alt="TheNerdLoop"
            width={1536}
            height={768}
            priority
            className="h-auto w-full"
          />
        </div>

        {/* Cryptic teaser */}
        <div className="tnl-rise mt-10 flex flex-col items-center text-center" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-balance font-display text-4xl uppercase leading-[0.92] tracking-tight text-tnl-black sm:text-5xl">
            Something is being woven.
          </h1>
          <p className="mt-4 max-w-sm text-pretty font-mono text-sm font-medium uppercase leading-relaxed tracking-wider text-tnl-black/75 sm:text-base">
            The first thread has already been pulled.
          </p>

          <div className="mt-6 -rotate-1 bg-tnl-black px-5 py-2 shadow-[5px_5px_0_0_var(--tnl-blue)]">
            <span className="font-display text-2xl uppercase tracking-[0.2em] text-tnl-red sm:text-3xl">
              Enter the loop
            </span>
          </div>
        </div>

        {/* Waitlist feature */}
        <div className="tnl-rise mt-10 w-full" style={{ animationDelay: "0.2s" }}>
          <WaitlistExperience initialCount={initialCount} />
        </div>

        {/* Signal footer */}
        <p className="mt-10 font-mono text-xs font-bold uppercase tracking-[0.4em] text-tnl-black/60">
          TNL // Signal 001
        </p>
      </div>
    </main>
  )
}
