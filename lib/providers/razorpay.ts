import 'server-only'
import Razorpay from 'razorpay'
import crypto from 'crypto'

/**
 * Real implementation, replaces the mocked lib/providers/razorpay.ts
 * placeholder already in the repo. Only import this from server code
 * (route handlers) — it uses the Razorpay key secret.
 */
function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
}

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

/**
 * amount must be in the smallest currency unit (paise for INR),
 * matching how `products.price` / `orders.total` are already stored.
 */
export async function createRazorpayOrder(amount: number, receipt: string): Promise<RazorpayOrder> {
  const client = getRazorpayClient()
  const order = await client.orders.create({
    amount,
    currency: 'INR',
    receipt,
  })

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    receipt: order.receipt ?? receipt,
    status: order.status,
  }
}

/**
 * Verifies the signature Razorpay Checkout returns to the browser after
 * a successful payment. Call this from your /api/payments/razorpay/verify
 * route BEFORE marking an order as paid — never trust the browser alone.
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpaySignature))
}

/**
 * Verifies the signature Razorpay sends on webhook requests
 * (X-Razorpay-Signature header) against the raw request body.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
