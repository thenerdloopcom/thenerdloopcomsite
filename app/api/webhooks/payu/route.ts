import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * PAYU Webhook Handler
 * 
 * Configure this URL in your PAYU dashboard for Server-to-Server notifications.
 * PAYU will POST payment status updates to this endpoint.
 * 
 * Expected fields in POST body:
 * - mihpayid: PAYU payment ID
 * - request_id: Request ID
 * - bank_ref_num: Bank reference number
 * - amt: Amount
 * - disc: Discount
 * - mode: Payment mode
 * - status: Success/Failure/Pending
 * - unmappedstatus: Unmapped status
 * - hash: Security hash
 * - txnid: Transaction ID
 * - key: Merchant key
 * - productinfo: Product info
 * - firstname: Customer name
 * - lastname: Customer last name
 * - address1: Address
 * - address2: Address line 2
 * - city: City
 * - state: State
 * - country: Country
 * - zipcode: Postal code
 * - email: Email
 * - phone: Phone
 * - udf1-udf5: User defined fields
 * - error: Error message (if any)
 * - error_Message: Error description
 * - net_amount_debit: Net amount debited
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const admin = createAdminClient()

    const getParam = (name: string) => formData.get(name)?.toString() || ''

    const mihpayid = getParam('mihpayid')
    const txnid = getParam('txnid')
    const status = getParam('status')
    const amount = getParam('amt')
    const productinfo = getParam('productinfo')
    const firstname = getParam('firstname')
    const email = getParam('email')
    const phone = getParam('phone')
    const udf1 = getParam('udf1')
    const udf2 = getParam('udf2')
    const udf3 = getParam('udf3')
    const udf4 = getParam('udf4')
    const udf5 = getParam('udf5')
    const hash = getParam('hash')
    const mode = getParam('mode')
    const bankRefNum = getParam('bank_ref_num')
    const errorMsg = getParam('error_Message')

    // Find the order by transaction ID
    const { data: order } = await admin
      .from('orders')
      .select('id')
      .eq('payu_transaction_id', txnid)
      .maybeSingle()

    if (!order) {
      console.warn('[webhooks/payu] No matching order for transaction:', txnid)
      return NextResponse.json({ result: 'error', message: 'Order not found' }, { status: 404 })
    }

    switch (status.toLowerCase()) {
      case 'success': {
        await admin
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            payu_payment_id: mihpayid,
          })
          .eq('id', order.id)

        await admin.from('payments').insert({
          order_id: order.id,
          provider: 'payu',
          provider_order_id: txnid,
          provider_payment_id: mihpayid,
          amount: Math.round(Number(amount) * 100), // Convert rupees to paise
          currency: 'INR',
          status: 'captured',
          method: mode,
          raw_data: {
            mihpayid,
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            phone,
            mode,
            bank_ref_num: bankRefNum,
            udf1,
            udf2,
            udf3,
            udf4,
            udf5,
          },
        })

        console.log('[webhooks/payu] Payment successful for order:', order.id, 'Payment ID:', mihpayid)
        break
      }

      case 'failure':
      case 'failed': {
        await admin
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('id', order.id)

        console.warn('[webhooks/payu] Payment failed for order:', order.id, 'Error:', errorMsg)
        break
      }

      case 'pending': {
        await admin
          .from('orders')
          .update({ payment_status: 'pending' })
          .eq('id', order.id)

        console.log('[webhooks/payu] Payment pending for order:', order.id)
        break
      }

      default:
        console.warn('[webhooks/payu] Unknown status:', status, 'for order:', order.id)
    }

    // Return success response that PAYU expects
    return NextResponse.json({ result: 'ok', message: 'Transaction updated successfully' })
  } catch (err) {
    console.error('[webhooks/payu]', err)
    // Return error but still acknowledge receipt to prevent retries on transient issues
    return NextResponse.json({ result: 'error', message: 'Webhook processing failed' }, { status: 500 })
  }
}
