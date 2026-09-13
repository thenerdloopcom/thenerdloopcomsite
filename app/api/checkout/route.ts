import { NextResponse } from 'next/server'
import { processCheckout } from '@/lib/api/checkout'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const result = await processCheckout(body)

    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Checkout failed'

    return NextResponse.json(
      { error: message },
      { status: 400 },
    )
  }
}