import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature } from '@/lib/providers/razorpay'
import { markOrderPaid } from '@/lib/ecommerce/orders'

/**
 * Called from the client immediately after Razorpay Checkout.js's
 * `handler` callback fires with { razorpay_order_id, razorpay_payment_id,
 * razorpay_signature }. This is a synchronous convenience path for a
 * fast UI update — the webhook route below is the source of truth and
 * will also mark the order paid if this call is ever missed (e.g. user
 * closes the tab right after paying).
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json()

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing verification fields' }, { status: 400 })
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // The webhook (app/api/webhooks/razorpay) is the source of truth for
    // the `payments` row and its amount/status. This just gives the
    // browser a fast "you're done" response.
    await markOrderPaid({
      orderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[payments/razorpay/verify]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }
}
