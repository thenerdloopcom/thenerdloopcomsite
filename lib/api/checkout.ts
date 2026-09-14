import 'server-only'
import {
  createOrder,
  attachRazorpayOrderId,
  type CheckoutItem,
  type ShippingAddressInput,
} from '@/lib/ecommerce/orders'
import { createRazorpayOrder } from '@/lib/providers/razorpay'

export interface CheckoutRequest {
  userId: string | null
  items: CheckoutItem[]
  shippingAddress: ShippingAddressInput
}

const FLAT_SHIPPING_FEE = 10000 // ₹100 in paise — replace with real rate logic later

/**
 * Real checkout flow, replacing the mocked version that lived here
 * before. create_order() re-derives the authoritative subtotal/total
 * from live product prices — nothing here is trusted for the final
 * amount, this function only decides the shipping fee input.
 *
 * NOTE: since the shipping fee currently has to be picked before the
 * real subtotal is known (create_order needs it as an input), this is
 * a flat fee for now. If you want true free-shipping-over-X, call
 * create_order with shippingFee 0 first isn't possible atomically —
 * simplest fix is to compute subtotal here yourself from a quick
 * `select price from products where id = any(...)` before calling
 * createOrder, then pass the right fee in. Left as a flat fee to keep
 * this file simple; ping me if you want that upgrade wired in.
 */
export const processCheckout = async (request: CheckoutRequest) => {
  if (!request.items.length) throw new Error('Cart is empty')

  const shippingFee = FLAT_SHIPPING_FEE

  const order = await createOrder({
    userId: request.userId,
    items: request.items,
    address: request.shippingAddress,
    shippingFee,
  })

  const razorpayOrder = await createRazorpayOrder(order.total, order.order_number)

  // Store the mapping immediately so the webhook (which only knows the
  // Razorpay order id) can find our order.
  await attachRazorpayOrderId(order.order_id, razorpayOrder.id)

  return {
    orderId: order.order_id,
    orderNumber: order.order_number,
    total: order.total,
    currency: 'INR',
    razorpay: razorpayOrder,
  }
}
