import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processCheckout } from '@/lib/api/checkout'
import {
  generatePaymentHash,
  getPayUBaseUrl,
  getPayUMerchantKey,
} from '@/lib/providers/payu'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to check out.' },
        { status: 401 },
      )
    }

    const body = await request.json()

    const result = await processCheckout({
      ...body,
      userId: user.id,
    })

    // THESE ARE THE EXACT VALUES PAYU WILL RECEIVE
    const payuParams = {
      key: getPayUMerchantKey(),
      txnid: result.payu.merchantTransactionId,
      amount: result.payu.amount.toString(),
      productinfo: `Order ${result.orderNumber}`,
      firstname: body.shippingAddress.full_name,
      email: body.email,
    }

    const payuHash = generatePaymentHash({
      txnid: payuParams.txnid,
      amount: payuParams.amount,
      productinfo: payuParams.productinfo,
      firstname: payuParams.firstname,
      email: payuParams.email,
    })

    return NextResponse.json({
      ...result,

      payuUrl: getPayUBaseUrl(),

      payuParams: {
        ...payuParams,
        hash: payuHash,
      },
    })
  } catch (error) {
    console.error('[CHECKOUT ERROR]', error)

    const message =
      error instanceof Error ? error.message : 'Checkout failed'

    return NextResponse.json(
      { error: message },
      { status: 400 },
    )
  }
}