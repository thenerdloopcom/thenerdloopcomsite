'use client'

import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
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

export function ProfilePage({
  email,
  fullName,
  phone,
  address,
}: {
  email: string
  fullName: string
  phone: string
  address: Address | null
}) {
  const supabase = createClient()
  const router = useRouter()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <main className="route-page">
      <section className="auth-page">
        <div className="auth-copy">
          <p className="eyebrow">THE NERDLOOP / YOUR ACCOUNT</p>

          <h1>
            WELCOME BACK,
            <span> {fullName}</span>
          </h1>

          <p>
            Save your details, track orders and keep your fandom collection
            in one place.
          </p>

          {phone && <p>Phone: {phone}</p>}
        </div>

        <div className="auth-card">
          <div className="auth-signed-in">
            <p>Signed in as {email}</p>

            <button type="button" className="checkout-button" onClick={signOut}>
              SIGN OUT
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="simple-route" style={{ paddingTop: 0 }}>
        <p className="eyebrow">SAVED ADDRESS</p>

        {address ? (
          <p>
            {address.full_name}
            {address.phone ? ` — ${address.phone}` : ''}
            <br />
            {address.address_line_1}
            {address.address_line_2 ? `, ${address.address_line_2}` : ''}
            <br />
            {address.city}, {address.state} {address.postal_code}
          </p>
        ) : (
          <p>No saved address yet — one is saved automatically the first time you check out.</p>
        )}
      </section>
    </main>
  )
}