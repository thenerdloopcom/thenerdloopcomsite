"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SlotCounter } from "./slot-counter"

type JoinStatus = "SUCCESS" | "DUPLICATE" | "FULL" | "INVALID"
type FormPhase = "idle" | "submitting" | "success" | "duplicate" | "full" | "error"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeResult(data: unknown): { status?: string; message?: string } {
  if (Array.isArray(data)) return (data[0] as Record<string, unknown>) ?? {}
  if (data && typeof data === "object") return data as Record<string, unknown>
  return {}
}

export function WaitlistExperience({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phase, setPhase] = useState<FormPhase>(initialCount >= 100 ? "full" : "idle")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const locked = phase === "success" || phase === "duplicate" || phase === "full"
  const submitting = phase === "submitting"

  async function refreshCount() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("get_waitlist_count")
      if (!error && typeof data === "number") setCount(data)
    } catch {
      // Non-critical: keep the last known count.
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || locked) return

    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!trimmedName) {
      setFieldError("Enter your name to enter the loop.")
      return
    }
    if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail)) {
      setFieldError("Enter a valid email address.")
      return
    }

    setFieldError(null)
    setStatusMessage(null)
    setPhase("submitting")

    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("join_waitlist", {
        p_name: trimmedName,
        p_email: normalizedEmail,
      })

      if (error) {
        setPhase("error")
        setStatusMessage("Something went wrong. Try again in a moment.")
        return
      }

      const result = normalizeResult(data)
      const status = (result.status as JoinStatus | undefined) ?? "INVALID"

      if (status === "SUCCESS") {
        setPhase("success")
        void refreshCount()
      } else if (status === "DUPLICATE") {
        setPhase("duplicate")
        void refreshCount()
      } else if (status === "FULL") {
        setPhase("full")
        void refreshCount()
      } else {
        // INVALID or anything unexpected.
        setPhase("idle")
        setFieldError(result.message ?? "That didn't work. Check your details and try again.")
      }
    } catch {
      setPhase("error")
      setStatusMessage("Something went wrong. Try again in a moment.")
    }
  }

  return (
    <div className="w-full">
      {phase === "success" || phase === "duplicate" ? (
        <ResolvedPanel variant={phase} />
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="border-4 border-tnl-black bg-tnl-black p-5 shadow-[8px_8px_0_0_var(--tnl-red)] sm:p-6"
        >
          <h2 className="font-display text-2xl uppercase leading-none tracking-wide text-tnl-yellow sm:text-3xl">
            {phase === "full" ? "The Loop Is Full" : "Join The Waitlist"}
          </h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-tnl-white/60">
            {phase === "full" ? "All 100 spots have been claimed." : "Name + email. Nothing else. No account."}
          </p>

          <fieldset disabled={submitting || phase === "full"} className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tnl-name" className="font-mono text-xs font-bold uppercase tracking-widest text-tnl-white">
                Your Name
              </label>
              <input
                id="tnl-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ALIAS / REAL NAME"
                className="border-4 border-tnl-white bg-tnl-white px-4 py-3 font-mono text-base font-medium text-tnl-black outline-none placeholder:text-tnl-black/40 focus-visible:border-tnl-blue focus-visible:ring-4 focus-visible:ring-tnl-blue/40 disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="tnl-email"
                className="font-mono text-xs font-bold uppercase tracking-widest text-tnl-white"
              >
                Your Email
              </label>
              <input
                id="tnl-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOU@DOMAIN.COM"
                aria-describedby={fieldError ? "tnl-form-error" : undefined}
                aria-invalid={fieldError ? true : undefined}
                className="border-4 border-tnl-white bg-tnl-white px-4 py-3 font-mono text-base font-medium text-tnl-black outline-none placeholder:text-tnl-black/40 focus-visible:border-tnl-blue focus-visible:ring-4 focus-visible:ring-tnl-blue/40 disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              className="group mt-1 flex items-center justify-center gap-3 border-4 border-tnl-yellow bg-tnl-yellow px-6 py-4 font-display text-xl uppercase tracking-wide text-tnl-black transition-all hover:bg-tnl-red hover:text-tnl-white hover:border-tnl-white active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 sm:text-2xl"
            >
              {submitting ? "Joining the loop..." : phase === "full" ? "Spots Claimed" : "Claim Your Spot"}
              {!submitting && phase !== "full" ? (
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  {"\u2192"}
                </span>
              ) : null}
            </button>
          </fieldset>

          <div aria-live="assertive" className="min-h-5">
            {fieldError ? (
              <p id="tnl-form-error" className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-tnl-red">
                {fieldError}
              </p>
            ) : null}
            {phase === "error" && statusMessage ? (
              <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-tnl-red">{statusMessage}</p>
            ) : null}
          </div>
        </form>
      )}

      <div className="mt-6">
        <SlotCounter count={count} />
      </div>
    </div>
  )
}

function ResolvedPanel({ variant }: { variant: "success" | "duplicate" }) {
  const success = variant === "success"
  return (
    <div className="tnl-slam border-4 border-tnl-black bg-tnl-black p-6 shadow-[8px_8px_0_0_var(--tnl-blue)] sm:p-8">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-tnl-yellow">
        {success ? "Access granted" : "Signal recognized"}
      </p>
      <h2 className="mt-2 font-display text-4xl uppercase leading-[0.9] text-tnl-white sm:text-5xl">
        {success ? (
          <>
            {"You're"} <span className="text-tnl-red">In</span> The Loop.
          </>
        ) : (
          <>
            {"You're"} <span className="text-tnl-blue">Already</span> In.
          </>
        )}
      </h2>
      <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-tnl-white/70">
        {success
          ? "Thread connected. Keep an eye on your inbox — the next signal comes from us."
          : "This email is already woven into the loop. Sit tight and watch your inbox."}
      </p>
    </div>
  )
}
