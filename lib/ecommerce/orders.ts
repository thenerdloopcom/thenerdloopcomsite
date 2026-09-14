import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

export type CheckoutItem = {
  product_id: string
  quantity: number
  customization_type?: 'photo-personalized' | 'fully-custom' | null
  instructions?: string | null
  upload_id?: string | null
}

export type ShippingAddressInput = {
  full_name: string
  phone?: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country?: string
}

/**
 * Server-only. Calls the create_order() Postgres function, which
 * re-validates every price against the live products table and writes
 * orders + order_items + order_addresses (+ attaches uploads)
 * atomically. This is the ONLY supported way to create an order —
 * never insert into `orders` directly from application code.
 */
export async function createOrder({
  userId,
  items,
  address,
  shippingFee = 0,
  currency = 'INR',
}: {
  userId: string | null
  items: CheckoutItem[]
  address: ShippingAddressInput
  shippingFee?: number
  currency?: string
}) {
  if (!userId) {
    throw new Error('A signed-in user is required to place an order.')
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('create_order', {
    p_user_id: userId,
    p_items: items,
    p_address: address,
    p_currency: currency,
    p_shipping_fee: shippingFee,
  })

  if (error) throw error

  // Postgres functions declared `returns table(...)` come back as an array.
  const result = Array.isArray(data) ? data[0] : data
  return result as { order_id: string; order_number: string; total: number }
}

export async function attachRazorpayOrderId(orderId: string, razorpayOrderId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({ razorpay_order_id: razorpayOrderId })
    .eq('id', orderId)

  if (error) throw error
}

export async function getOrderById(orderId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), order_addresses(*), payments(*), shipments(*)')
    .eq('id', orderId)
    .single()

  if (error) throw error
  return data
}

export async function markOrderPaid({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
}: {
  orderId: string
  razorpayOrderId: string
  razorpayPaymentId: string
}) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
    })
    .eq('id', orderId)

  if (error) throw error
}

export type OrderWithRelations = Database['public']['Tables']['orders']['Row'] & {
  order_items: Database['public']['Tables']['order_items']['Row'][]
  order_addresses: Database['public']['Tables']['order_addresses']['Row'][]
  payments: Database['public']['Tables']['payments']['Row'][]
  shipments: Database['public']['Tables']['shipments']['Row'][]
}

/**
 * Customer-facing lookup — uses the cookie-aware SESSION client, not
 * the admin client, so it naturally respects the orders_select_own RLS
 * policy. A user can only ever fetch their own order this way; there
 * is no need to manually filter by user_id here, Postgres does it.
 */
export async function getMyOrderByNumber(orderNumber: string): Promise<OrderWithRelations | null> {
  const supabase = await createSessionClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), order_addresses(*), payments(*), shipments(*)')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (error) throw error
  return data as unknown as OrderWithRelations | null
}