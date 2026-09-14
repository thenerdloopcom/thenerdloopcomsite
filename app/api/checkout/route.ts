import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processCheckout } from '@/lib/api/checkout'

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
    const result = await processCheckout({ ...body, userId: user.id })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}