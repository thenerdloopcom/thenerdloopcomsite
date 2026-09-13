'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

export default function AccountPage() {
  const [mode, setMode] = useState<'login' | 'signup'>(
    'login',
  )

  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="route-page">
      <section className="auth-page">
        <div className="auth-copy">
          <p className="eyebrow">
            THE NERDLOOP / YOUR ACCOUNT
          </p>

          <h1>
            JOIN THE
            <span> LOOP.</span>
          </h1>

          <p>
            Save your details, track orders and keep your
            fandom collection in one place.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              LOGIN
            </button>

            <button
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => setMode('signup')}
            >
              SIGN UP
            </button>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)

              // TODO: Supabase Auth integration.
            }}
          >
            {mode === 'signup' && (
              <input
                required
                placeholder="NAME"
              />
            )}

            <input
              required
              type="email"
              placeholder="EMAIL"
            />

            <input
              required
              type="password"
              placeholder="PASSWORD"
            />

            <button
              type="submit"
              className="checkout-button"
            >
              {mode === 'login'
                ? 'LOGIN'
                : 'CREATE ACCOUNT'}
              <ArrowUpRight size={18} />
            </button>
          </form>

          {submitted && (
            <p className="auth-placeholder">
              SUPABASE AUTH PLACEHOLDER — AUTHENTICATION
              NOT CONNECTED YET.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}