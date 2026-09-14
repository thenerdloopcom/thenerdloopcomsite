import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processCheckout, type CheckoutRequest } from '@/lib/api/checkout'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const checkoutRequest: CheckoutRequest = {
      userId: user?.id ?? null,
      items: body.items,
      shippingAddress: body.shippingAddress,
    }

    const result = await processCheckout(checkoutRequest)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[api/orders]', err)
    const message = err instanceof Error ? err.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
