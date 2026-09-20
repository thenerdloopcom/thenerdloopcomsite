import 'server-only'
import crypto from 'crypto'

/**
 * PAYU Integration - Server-side payment processing
 * Replace Razorpay with PAYU payment gateway
 */

export interface PayUOrder {
  merchantTransactionId: string
  amount: number
  currency: string
  status: string
  redirectUrl?: string
}

export interface PayUConfig {
  merchantKey: string
  merchantSalt: string
  environment: 'test' | 'prod'
}

function getPayUConfig(): PayUConfig {
  const merchantKey = process.env.PAYU_MERCHANT_KEY?.trim()
  const merchantSalt = process.env.PAYU_MERCHANT_SALT?.trim()

  if (!merchantKey) {
    throw new Error('PAYU_MERCHANT_KEY is missing')
  }

  if (!merchantSalt) {
    throw new Error('PAYU_MERCHANT_SALT is missing')
  }

  return {
    merchantKey,
    merchantSalt,
    environment: (process.env.PAYU_ENV as 'test' | 'prod') || 'test',
  }
}

export function getPayUMerchantKey(): string {
  const key = process.env.PAYU_MERCHANT_KEY

  if (!key) {
    throw new Error('PAYU_MERCHANT_KEY is missing')
  }

  return key
}

/**
 * Generates a hash for PAYU payment request
 * Format: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
 */
export function generatePaymentHash(params: {
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  email: string
  udf1?: string
  udf2?: string
  udf3?: string
  udf4?: string
  udf5?: string
}): string {
  const config = getPayUConfig()

  const hashString = [
    config.merchantKey,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 ?? '',
    params.udf2 ?? '',
    params.udf3 ?? '',
    params.udf4 ?? '',
    params.udf5 ?? '',
    '',
    '',
    '',
    '',
    '',
    '',
    config.merchantSalt,
  ].join('|')

  return crypto
    .createHash('sha512')
    .update(hashString, 'utf8')
    .digest('hex')
}

/**
 * Verifies the hash returned by PAYU in success/callback URL
 * Format: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPaymentHash(params: {
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  email: string
  status: string
  udf1?: string
  udf2?: string
  udf3?: string
  udf4?: string
  udf5?: string
  mihpayid: string
  hash: string
}): boolean {
  const config = getPayUConfig()
  
  const hashString = [
    config.merchantSalt,
    params.status,
    '', '', '', '', // unmapped fields
    params.udf5 || '',
    params.udf4 || '',
    params.udf3 || '',
    params.udf2 || '',
    params.udf1 || '',
    params.email,
    params.firstname,
    params.productinfo,
    params.amount,
    params.txnid,
    config.merchantKey
  ].join('|')
  
  const expectedHash = crypto.createHash('sha512').update(hashString).digest('hex')
  
  return crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(params.hash))
}

/**
 * Creates a PAYU order/payment request
 * Returns transaction details needed for redirect
 */
export async function createPayUOrder(amount: number, receipt: string): Promise<PayUOrder> {
  const config = getPayUConfig()
  
  // Amount should be in the smallest currency unit (paise for INR)
  // Convert to rupees for PAYU (PAYU expects amount in rupees)
  const amountInRupees = (amount / 100).toFixed(2)
  
  const merchantTransactionId = receipt
  
  return {
    merchantTransactionId,
    amount: Number(amountInRupees),
    currency: 'INR',
    status: 'pending',
  }
}

/**
 * Get the base URL for PAYU payment form
 */
export function getPayUBaseUrl(): string {
  const config = getPayUConfig()
  if (config.environment === 'prod') {
    return 'https://secure.payu.in/_payment'
  }
  return 'https://test.payu.in/_payment'
}

/**
 * Verify webhook signature from PAYU
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const config = getPayUConfig()
  const expected = crypto
    .createHmac('sha256', config.merchantSalt)
    .update(rawBody)
    .digest('hex')

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
