import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  assertUploadIsAllowed,
  buildObjectKey,
  createPresignedUploadUrl,
} from '@/lib/r2/client'

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType, size } = await request.json()

    if (!contentType || typeof size !== 'number') {
      return NextResponse.json({ error: 'Missing filename, contentType or size' }, { status: 400 })
    }

    assertUploadIsAllowed(contentType, size)

    // Optional: identify the user if signed in, so the upload can be
    // scoped to them immediately. Anonymous checkout is still fine —
    // customer_uploads.user_id is nullable.
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const admin = createAdminClient()

    // Create the DB row first so we have a stable uploadId to key the
    // R2 object name off of.
    const { data: uploadRow, error: insertError } = await admin
      .from('customer_uploads')
      .insert({
        user_id: user?.id ?? null,
        storage_provider: 'cloudflare-r2',
        bucket: process.env.R2_BUCKET_NAME!,
        object_key: 'pending', // patched below
        original_filename: filename ?? null,
        content_type: contentType,
        file_size: size,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError || !uploadRow) {
      throw insertError ?? new Error('Failed to create upload record')
    }

    const extension = EXTENSION_BY_TYPE[contentType] ?? 'bin'
    const objectKey = buildObjectKey(extension, uploadRow.id)

    const { error: updateError } = await admin
      .from('customer_uploads')
      .update({ object_key: objectKey })
      .eq('id', uploadRow.id)

    if (updateError) throw updateError

    const uploadUrl = await createPresignedUploadUrl(objectKey, contentType)

    return NextResponse.json({
      uploadId: uploadRow.id,
      uploadUrl,
      objectKey,
    })
  } catch (err) {
    console.error('[uploads/presign]', err)
    const message = err instanceof Error ? err.message : 'Failed to create upload URL'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
