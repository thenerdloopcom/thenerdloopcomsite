'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { formatPrice } from '@/data/catalog'
import type { OrderSummary } from '@/lib/ecommerce/orders'

const TABS = ['Current', 'Previous', 'Returns'] as const
type Tab = (typeof TABS)[number]

function matchesTab(order: OrderSummary, tab: Tab) {
  if (tab === 'Previous') return order.fulfillment_status === 'delivered'
  if (tab === 'Returns') return order.payment_status === 'refunded'
  // Current: everything still in flight
  return order.fulfillment_status !== 'delivered' && order.payment_status !== 'refunded'
}

export function OrdersList({ orders }: { orders: OrderSummary[] }) {
  const [tab, setTab] = useState<Tab>('Current')

  const filtered = useMemo(
    () => orders.filter((order) => matchesTab(order, tab)),
    [orders, tab],
  )

  return (
    <div>
      <div className="orders-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`orders-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>
          No {tab.toLowerCase()} orders.{' '}
          <Link href="/shop" className="text-link">
            SHOP THE LOOP
          </Link>
        </p>
      ) : (
        <div className="checkout-summary" style={{ width: '100%', maxWidth: 640 }}>
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.order_number}`}
              className="checkout-line-item"
              style={{ display: 'flex' }}
            >
              <div>
                <strong>{order.order_number}</strong>
                <span>{order.order_items.map((i) => i.product_name).join(', ')}</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span>{formatPrice(order.total)}</span>
                <br />
                <span className="status-blue">{order.fulfillment_status.toUpperCase()}</span>
              </div>

              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}