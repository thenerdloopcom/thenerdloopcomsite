import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2 } from 'lucide-react'

import { formatPrice } from '@/data/catalog'
import { createClient } from '@/lib/supabase/server'
import { getMyOrderByNumber } from '@/lib/ecommerce/orders'

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order: orderNumber } = await searchParams

  if (!orderNumber) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(
      `/account?next=${encodeURIComponent(`/order-confirmation?order=${orderNumber}`)}`,
    )
  }

  const order = await getMyOrderByNumber(orderNumber)

  if (!order) {
    notFound()
  }

  const address = order.order_addresses?.[0]
  const isPaid = order.payment_status === 'paid'

  return (
    <main className="checkout-page">
      <section className="checkout-shell">
        <div>
          <p className="eyebrow">THE NERDLOOP / ORDER CONFIRMED</p>
          <h1>
            THANKS,
            <br />
            LOOPER.
          </h1>

          <p className="checkout-order-status">
            <CheckCircle2 size={18} />
            Order <strong>{order.order_number}</strong> is{' '}
            {isPaid ? 'paid and confirmed' : 'being processed'}.
          </p>

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

          <Link href="/shop" className="checkout-button">
            KEEP SHOPPING
            <ArrowUpRight size={18} />
          </Link>
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
            <strong>
              {order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}
            </strong>
          </div>

          <div className="checkout-total-row grand-total">
            <span>TOTAL</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>

          <p className="demo-note">
            PAYMENT STATUS: {order.payment_status.toUpperCase()}
          </p>
        </aside>
      </section>
    </main>
  )
}