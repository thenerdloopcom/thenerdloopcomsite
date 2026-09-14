import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/providers/razorpay'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Configure this URL in your Razorpay dashboard under
 * Settings → Webhooks, subscribed to at least:
 *   payment.captured, payment.failed, refund.processed
 *
 * Razorpay signs the raw request body with RAZORPAY_WEBHOOK_SECRET —
 * we must read the raw text (not parsed JSON) to verify it.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature')

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)
  const admin = createAdminClient()

  try {
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity
        const orderId = payment.notes?.order_id ?? null // set this note when creating the Razorpay order if you rely on it here
        const receipt = payment.notes?.receipt

        // Prefer looking the order up by the Razorpay order id we stored
        // when the order was created.
        const { data: order } = await admin
          .from('orders')
          .select('id')
          .eq('razorpay_order_id', payment.order_id)
          .maybeSingle()

        if (order) {
          await admin
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              razorpay_payment_id: payment.id,
            })
            .eq('id', order.id)

          await admin.from('payments').insert({
            order_id: order.id,
            provider: 'razorpay',
            provider_order_id: payment.order_id,
            provider_payment_id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'captured',
            method: payment.method,
            raw_data: payment,
          })
        } else {
          console.warn('[webhooks/razorpay] No matching order for', payment.order_id, orderId, receipt)
        }
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        await admin
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('razorpay_order_id', payment.order_id)
        break
      }

      case 'refund.processed': {
        const refund = event.payload.refund.entity
        await admin
          .from('orders')
          .update({ payment_status: 'refunded' })
          .eq('razorpay_payment_id', refund.payment_id)
        break
      }

      default:
        // Unhandled event types are fine to ignore.
        break
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhooks/razorpay]', err)
    // Return 200 anyway once you've logged it, or Razorpay will keep
    // retrying an event your own code is failing to process.
    return NextResponse.json({ ok: true })
  }
}
