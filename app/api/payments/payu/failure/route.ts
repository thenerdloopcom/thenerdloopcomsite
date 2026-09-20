import { NextRequest, NextResponse } from 'next/server'

/**
 * PAYU Failure Handler
 * Called by PAYU after failed payment via redirect to furl
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const txnid = searchParams.get('txnid')
  const status = searchParams.get('status')
  const error = searchParams.get('error') || 'Payment failed'
  
  console.error('[payments/payu/failure]', { txnid, status, error })
  
  // Redirect to checkout page with error
  return NextResponse.redirect(new URL('/checkout?payment=failed', request.url))
}
