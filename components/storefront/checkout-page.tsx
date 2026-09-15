'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/data/catalog'
import { useCart } from './cart-provider'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
    }
  }
}

export function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { items, subtotal, clearCart } = useCart()

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shipping = subtotal >= 200000 ? 0 : 10000
  const total = subtotal + shipping

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
  })

  useEffect(() => {
    const loadSavedAddress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: address, error } = await supabase
        .from('addresses')
        .select(
          'full_name, phone, address_line_1, address_line_2, city, state, postal_code'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('[checkout] Failed to load saved address:', error)
        return
      }

      if (address) {
        setForm((current) => ({
          ...current,
          name: address.full_name,
          phone: address.phone ?? '',
          line1: address.address_line_1,
          line2: address.address_line_2 ?? '',
          city: address.city,
          state: address.state,
          postalCode: address.postal_code,
        }))
      }
    }

    loadSavedAddress()
  }, [supabase])

  const saveAddress = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const addressPayload = {
    user_id: user.id,
    full_name: form.name,
    phone: form.phone,
    address_line_1: form.line1,
    address_line_2: form.line2 || null,
    city: form.city,
    state: form.state,
    postal_code: form.postalCode,
    country: 'IN',
  }

  const { data: existingAddress, error: lookupError } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lookupError) throw lookupError

    if (existingAddress) {
      const { error } = await supabase
        .from('addresses')
        .update(addressPayload)
        .eq('id', existingAddress.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('addresses')
        .insert(addressPayload)

      if (error) throw error
    }
  }

  const canSubmit = useMemo(() => {
    return (
      items.length > 0 &&
      form.name &&
      form.email &&
      form.phone &&
      form.line1 &&
      form.city &&
      form.state &&
      form.postalCode
    )
  }, [items.length, form])

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!canSubmit || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await saveAddress()
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            customization_type: item.customization?.type ?? null,
            instructions: item.customization?.instructions ?? null,
            upload_id: item.customization?.imageStorageKey ?? null,
          })),
          shippingAddress: {
            full_name: form.name,
            phone: form.phone,
            address_line_1: form.line1,
            address_line_2: form.line2 || undefined,
            city: form.city,
            state: form.state,
            postal_code: form.postalCode,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Checkout failed')
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        order_id: data.razorpay.id,
        name: 'The Nerd Loop',
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          clearCart()
          setSubmitted(true)
          router.push(`/order-confirmation?order=${data.orderNumber}`)
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false)
          },
        },
      })

      razorpay.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="route-page">
        <section className="simple-route">
          <p className="eyebrow">CHECKOUT / EMPTY</p>
          <h1>YOUR BAG IS EMPTY.</h1>
          <a className="comic-button" href="/shop">
            SHOP THE LOOP
            <ArrowUpRight size={18} />
          </a>
        </section>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <section className="checkout-shell">
        <div>
          <p className="eyebrow">THE NERDLOOP / CHECKOUT</p>
          <h1>FINAL<br />PANEL.</h1>

          <form className="checkout-form" onSubmit={submit}>
            <section className="checkout-section">
              <h2>CONTACT</h2>

              <input
                required
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="FULL NAME"
              />

              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="EMAIL"
              />

              <input
                required
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="PHONE"
              />
            </section>

            <section className="checkout-section">
              <h2>SHIPPING ADDRESS</h2>

              <input
                required
                value={form.line1}
                onChange={(event) => updateField('line1', event.target.value)}
                placeholder="ADDRESS LINE 1"
              />

              <input
                value={form.line2}
                onChange={(event) => updateField('line2', event.target.value)}
                placeholder="ADDRESS LINE 2"
              />

              <div className="checkout-grid-2">
                <input
                  required
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="CITY"
                />

                <input
                  required
                  value={form.state}
                  onChange={(event) => updateField('state', event.target.value)}
                  placeholder="STATE"
                />
              </div>

              <input
                required
                value={form.postalCode}
                onChange={(event) => updateField('postalCode', event.target.value)}
                placeholder="PINCODE"
              />
            </section>

            <button
              className="checkout-button"
              type="submit"
              disabled={!canSubmit || submitting}
            >
              {submitting ? 'PROCESSING...' : 'CONTINUE TO PAYMENT'}
              <ArrowUpRight size={18} />
            </button>

            {error && (
              <div className="payment-placeholder">
                <ShieldCheck size={20} />
                <div>
                  <strong>CHECKOUT ERROR</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {submitted && (
              <div className="payment-placeholder">
                <ShieldCheck size={20} />
                <div>
                  <strong>PAYMENT SUCCESSFUL</strong>
                  <p>Redirecting to your order confirmation...</p>
                </div>
              </div>
            )}
          </form>
        </div>

        <aside className="checkout-summary">
          <p className="eyebrow">YOUR ORDER</p>

          {items.map(({ product, quantity }) => (
            <div key={product.id} className="checkout-line-item">
              <div>
                <strong>{product.name}</strong>
                <span>QTY {quantity}</span>
              </div>

              <span>{formatPrice(product.price * quantity)}</span>
            </div>
          ))}

          <div className="checkout-total-row">
            <span>SUBTOTAL</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="checkout-total-row">
            <span>SHIPPING</span>
            <strong>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</strong>
          </div>

          <div className="checkout-total-row grand-total">
            <span>TOTAL</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <p className="demo-note">PAYMENT PROVIDER: RAZORPAY</p>
        </aside>
      </section>
    </main>
  )
}