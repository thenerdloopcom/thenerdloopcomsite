'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

function AccountPageInner() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/account'

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  const signInWithGoogle = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) setError(error.message)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <main className="route-page">
        <section className="auth-page">
          <p>LOADING...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="route-page">
      <section className="auth-page">
        <div className="auth-copy">
          <p className="eyebrow">THE NERDLOOP / YOUR ACCOUNT</p>

          <h1>
            {user ? 'WELCOME BACK,' : 'JOIN THE'}
            <span> {user ? (user.user_metadata?.full_name ?? 'LOOPER') : 'LOOP.'}</span>
          </h1>

          <p>
            Save your details, track orders and keep your fandom collection
            in one place.
          </p>
        </div>

        <div className="auth-card">
          {user ? (
            <div className="auth-signed-in">
              <p>Signed in as {user.email}</p>

              <button type="button" className="checkout-button" onClick={signOut}>
                SIGN OUT
                <ArrowUpRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="checkout-button"
                onClick={signInWithGoogle}
              >
                CONTINUE WITH GOOGLE
                <ArrowUpRight size={18} />
              </button>

              {error && <p className="auth-placeholder">{error}</p>}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountPageInner />
    </Suspense>
  )
}