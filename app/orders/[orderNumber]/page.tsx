import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'

import { formatPrice } from '@/data/catalog'
import { createClient } from '@/lib/supabase/server'
import { getMyOrderByNumber } from '@/lib/ecommerce/orders'

const FULFILLMENT_STEPS = ['unfulfilled', 'processing', 'shipped', 'delivered'] as const

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/account?next=${encodeURIComponent(`/orders/${orderNumber}`)}`)
  }

  const order = await getMyOrderByNumber(orderNumber)
  if (!order) notFound()

  const address = order.order_addresses?.[0]
  const shipment = order.shipments?.[0]
  const currentStepIndex = order.fulfillment_status === 'cancelled'
    ? -1
    : FULFILLMENT_STEPS.indexOf(order.fulfillment_status as (typeof FULFILLMENT_STEPS)[number])

  return (
    <main className="checkout-page">
      <section className="checkout-shell">
        <div>
          <Link href="/orders" className="text-link">
            BACK TO ORDERS
          </Link>

          <p className="eyebrow">THE NERDLOOP / ORDER {order.order_number}</p>
          <h1>
            ORDER
            <br />
            STATUS.
          </h1>

          <section className="checkout-section">
            <h2>FULFILLMENT</h2>

            {order.status === 'cancelled' ? (
              <p>This order was cancelled.</p>
            ) : (
              <ol style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FULFILLMENT_STEPS.map((step, i) => (
                  <li
                    key={step}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      opacity: i <= currentStepIndex ? 1 : 0.4,
                    }}
                    className={i <= currentStepIndex ? 'status-blue' : undefined}
                  >
                    {i <= currentStepIndex ? <Check size={16} /> : <span style={{ width: 16 }} />}
                    {step.toUpperCase()}
                  </li>
                ))}
              </ol>
            )}

            {shipment?.tracking_number && (
              <p>
                Tracking: {shipment.tracking_number}
                {shipment.tracking_url && (
                  <>
                    {' — '}
                    <a href={shipment.tracking_url} target="_blank" rel="noreferrer">
                      Track shipment
                    </a>
                  </>
                )}
              </p>
            )}
          </section>

          {address && (
            <section className="checkout-section">
              <h2>SHIPPING TO</h2>
              <p>
                {address.full_name}
                <br />
                {address.address_line_1}
                {address.address_line_2 ? `, ${address.address_line_2}` : ''}
                <br />
                {address.city}, {address.state} {address.postal_code}
              </p>
            </section>
          )}
        </div>

        <aside className="checkout-summary">
          <p className="eyebrow">ORDER SUMMARY</p>

          {order.order_items.map((item) => (
            <div key={item.id} className="checkout-line-item">
              <div>
                <strong>{item.product_name}</strong>
                <span>QTY {item.quantity}</span>
              </div>
              <span>{formatPrice(item.line_total)}</span>
            </div>
          ))}

          <div className="checkout-total-row">
            <span>SUBTOTAL</span>
            <strong>{formatPrice(order.subtotal)}</strong>
          </div>

          <div className="checkout-total-row">
            <span>SHIPPING</span>
            <strong>{order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}</strong>
          </div>

          <div className="checkout-total-row grand-total">
            <span>TOTAL</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>

          <p className="demo-note"><span className="status-blue">PAYMENT STATUS: {order.payment_status.toUpperCase()}</span></p>

          <Link href="/shop" className="checkout-button">
            KEEP SHOPPING
            <ArrowUpRight size={18} />
          </Link>
        </aside>
      </section>
    </main>
  )
}