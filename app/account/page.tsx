'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

type Address = {
  full_name: string
  phone: string | null
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  postal_code: string
}

function AccountPageInner() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/account'

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ fullName: '', phone: '' })
  const [address, setAddress] = useState<Address | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loadProfile = async (currentUser: User) => {
    const [{ data: profile }, { data: addr }] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', currentUser.id)
        .maybeSingle(),
      supabase
        .from('addresses')
        .select('full_name, phone, address_line_1, address_line_2, city, state, postal_code')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    setForm({ fullName: profile?.full_name ?? '', phone: profile?.phone ?? '' })
    setAddress(addr ?? null)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
      if (data.user) loadProfile(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user)
    })

    return () => listener.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    setSaved(false)
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.fullName, phone: form.phone })
      .eq('id', user.id)

    setSaving(false)
    if (error) setError(error.message)
    else setSaved(true)
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
            <span> {user ? (form.fullName || 'LOOPER') : 'LOOP.'}</span>
          </h1>

          <p>
            Save your details, track orders and keep your fandom collection
            in one place.
          </p>
        </div>

        <div className="auth-card">
          {user ? (
            <>
              <form onSubmit={saveProfile} style={{ display: 'grid', gap: 12 }}>
                <input value={user.email ?? ''} disabled placeholder="EMAIL" />

                <input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="FULL NAME"
                />

                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="PHONE"
                />

                <button type="submit" className="checkout-button" disabled={saving}>
                  {saving ? 'SAVING...' : 'SAVE CHANGES'}
                  <ArrowUpRight size={18} />
                </button>

                {saved && <p className="demo-note">Profile updated.</p>}
              </form>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #aaa' }}>
                <p className="eyebrow">SAVED ADDRESS</p>
                {address ? (
                  <p style={{ fontSize: 11, fontFamily: 'monospace', lineHeight: 1.6 }}>
                    {address.full_name}
                    {address.phone ? ` — ${address.phone}` : ''}
                    <br />
                    {address.address_line_1}
                    {address.address_line_2 ? `, ${address.address_line_2}` : ''}
                    <br />
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                ) : (
                  <p className="demo-note" style={{ justifyContent: 'flex-start' }}>
                    No saved address yet.
                  </p>
                )}
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #aaa' }}>
                <button type="button" className="checkout-button" onClick={signOut}>
                  SIGN OUT
                  <ArrowUpRight size={18} />
                </button>
              </div>

              {error && <p className="auth-placeholder">{error}</p>}
            </>
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