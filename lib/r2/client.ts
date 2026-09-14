import 'server-only'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * Cloudflare R2 is S3-compatible — same SDK, different endpoint.
 * This client (and the R2 secret it uses) must never be imported by
 * client components; it only ever runs inside app/api/** route
 * handlers.
 */
export function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

const PRESIGN_UPLOAD_EXPIRY_SECONDS = 5 * 60 // 5 minutes to complete the PUT
const PRESIGN_DOWNLOAD_EXPIRY_SECONDS = 60 * 10 // 10 minutes for admin viewing

const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024 // 15 MB

export function assertUploadIsAllowed(contentType: string, size: number) {
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new Error(`Unsupported file type: ${contentType}`)
  }
  if (size > MAX_UPLOAD_BYTES) {
    throw new Error('File is too large (max 15MB)')
  }
}

export function buildObjectKey(extension: string, uploadId: string) {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `customer-uploads/${year}/${month}/${uploadId}.${extension}`
}

/** Presigned PUT URL — the browser uploads the file directly to R2. */
export async function createPresignedUploadUrl(objectKey: string, contentType: string) {
  const client = getR2Client()
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: objectKey,
    ContentType: contentType,
  })
  return getSignedUrl(client, command, { expiresIn: PRESIGN_UPLOAD_EXPIRY_SECONDS })
}

/** Presigned GET URL — used by the admin view to briefly view a customer photo. */
export async function createPresignedDownloadUrl(objectKey: string) {
  const client = getR2Client()
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: objectKey,
  })
  return getSignedUrl(client, command, { expiresIn: PRESIGN_DOWNLOAD_EXPIRY_SECONDS })
}

export async function deleteObject(objectKey: string) {
  const client = getR2Client()
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: objectKey,
    }),
  )
}
