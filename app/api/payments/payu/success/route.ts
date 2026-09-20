import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentHash } from '@/lib/providers/payu'
import { markOrderPaid } from '@/lib/ecommerce/orders'
import { createClient } from '@/lib/supabase/server'

/**
 * PAYU Success Handler
 * Called by PAYU after successful payment via redirect to surl
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const txnid = searchParams.get('txnid')
    const amount = searchParams.get('amount')
    const productinfo = searchParams.get('productinfo')
    const firstname = searchParams.get('firstname')
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const mihpayid = searchParams.get('mihpayid')
    const hash = searchParams.get('hash')
    const udf1 = searchParams.get('udf1') || ''
    const udf2 = searchParams.get('udf2') || ''
    const udf3 = searchParams.get('udf3') || ''
    const udf4 = searchParams.get('udf4') || ''
    const udf5 = searchParams.get('udf5') || ''

    if (!txnid || !amount || !productinfo || !firstname || !email || !status || !mihpayid || !hash) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 })
    }

    // Verify the hash returned by PAYU
    const isValid = verifyPaymentHash({
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      mihpayid,
      hash,
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment hash' }, { status: 400 })
    }

    if (status !== 'success') {
      return NextResponse.json({ error: 'Payment failed' }, { status: 400 })
    }

    // Find the order by transaction ID (stored in orders table)
    const supabase = await createClient()
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('payu_transaction_id', txnid)
      .maybeSingle()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Mark order as paid
    await markOrderPaid({
      orderId: order.id,
      payuTransactionId: txnid,
      payuPaymentId: mihpayid,
    })

    // Get order number for redirect
    const { data: fullOrder } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', order.id)
      .single()

    // Redirect to order confirmation page
    return NextResponse.redirect(new URL(`/order-confirmation?order=${fullOrder.order_number}`, request.url))
  } catch (err) {
    console.error('[payments/payu/success]', err)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }
}
