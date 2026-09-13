'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { formatPrice } from '@/data/catalog'
import { useCart } from './cart-provider'

export function CheckoutPage() {
  const { items, subtotal } = useCart()

  const [submitted, setSubmitted] = useState(false)

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

  const updateField = (
    key: keyof typeof form,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!canSubmit) return

    setSubmitted(true)

    // TODO:
    // 1. POST /api/checkout
    // 2. Create internal order
    // 3. Create Razorpay order
    // 4. Open Razorpay Checkout
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

          <form
            className="checkout-form"
            onSubmit={submit}
          >
            <section className="checkout-section">
              <h2>CONTACT</h2>

              <input
                required
                value={form.name}
                onChange={(event) =>
                  updateField('name', event.target.value)
                }
                placeholder="FULL NAME"
              />

              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField('email', event.target.value)
                }
                placeholder="EMAIL"
              />

              <input
                required
                value={form.phone}
                onChange={(event) =>
                  updateField('phone', event.target.value)
                }
                placeholder="PHONE"
              />
            </section>

            <section className="checkout-section">
              <h2>SHIPPING ADDRESS</h2>

              <input
                required
                value={form.line1}
                onChange={(event) =>
                  updateField('line1', event.target.value)
                }
                placeholder="ADDRESS LINE 1"
              />

              <input
                value={form.line2}
                onChange={(event) =>
                  updateField('line2', event.target.value)
                }
                placeholder="ADDRESS LINE 2"
              />

              <div className="checkout-grid-2">
                <input
                  required
                  value={form.city}
                  onChange={(event) =>
                    updateField('city', event.target.value)
                  }
                  placeholder="CITY"
                />

                <input
                  required
                  value={form.state}
                  onChange={(event) =>
                    updateField('state', event.target.value)
                  }
                  placeholder="STATE"
                />
              </div>

              <input
                required
                value={form.postalCode}
                onChange={(event) =>
                  updateField(
                    'postalCode',
                    event.target.value,
                  )
                }
                placeholder="PINCODE"
              />
            </section>

            <button
              className="checkout-button"
              type="submit"
              disabled={!canSubmit}
            >
              CONTINUE TO PAYMENT
              <ArrowUpRight size={18} />
            </button>

            {submitted && (
              <div className="payment-placeholder">
                <ShieldCheck size={20} />

                <div>
                  <strong>
                    RAZORPAY PLACEHOLDER
                  </strong>

                  <p>
                    Checkout details validated successfully.
                    Payment integration will be connected here.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        <aside className="checkout-summary">
          <p className="eyebrow">YOUR ORDER</p>

          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="checkout-line-item"
            >
              <div>
                <strong>{product.name}</strong>
                <span>QTY {quantity}</span>
              </div>

              <span>
                {formatPrice(
                  product.price * quantity,
                )}
              </span>
            </div>
          ))}

          <div className="checkout-total-row">
            <span>SUBTOTAL</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div className="checkout-total-row">
            <span>SHIPPING</span>
            <strong>
              {shipping === 0
                ? 'FREE'
                : formatPrice(shipping)}
            </strong>
          </div>

          <div className="checkout-total-row grand-total">
            <span>TOTAL</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <p className="demo-note">
            PAYMENT PROVIDER: RAZORPAY / DEMO MODE
          </p>
        </aside>
      </section>
    </main>
  )
}