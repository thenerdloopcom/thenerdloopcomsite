import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Call this right after the browser's direct PUT to the presigned R2
 * URL resolves with a 200. It just flips the row from 'pending' to
 * 'uploaded' so your admin view can distinguish "upload was requested"
 * from "file is actually sitting in R2".
 */
export async function POST(request: NextRequest) {
  try {
    const { uploadId } = await request.json()
    if (!uploadId) {
      return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('customer_uploads')
      .update({ status: 'uploaded' })
      .eq('id', uploadId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[uploads/confirm]', err)
    return NextResponse.json({ error: 'Failed to confirm upload' }, { status: 400 })
  }
}
