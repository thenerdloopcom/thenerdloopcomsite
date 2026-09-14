import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyOrders } from '@/lib/ecommerce/orders'
import { OrdersList } from '@/components/storefront/orders-list'

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/account?next=/orders')
  }

  const orders = await getMyOrders()

  return (
    <main className="route-page">
      <section className="auth-page">
        <div className="auth-copy">
          <p className="eyebrow">THE NERDLOOP / ORDERS</p>
          <h1>
            YOUR
            <span> ORDERS.</span>
          </h1>
        </div>

        <OrdersList orders={orders} />
      </section>
    </main>
  )
}