/**
 * Checkout API Logic Placeholder
 * Implements the server workflow described in Section 19 of the Backend Spec.
 */

import { createRazorpayOrder } from '../providers/razorpay';
import { products, type Product } from '@/data/catalog';

export interface CheckoutRequest {
  items: { variant_id: string; quantity: number }[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export const processCheckout = async (request: CheckoutRequest) => {
  console.log('[Checkout] Starting checkout process...');

  // 1. Validate Request
  if (!request.items.length) throw new Error('Cart is empty');

  // 2. Fetch variants/products and validate (Mocking DB call)
  const orderItems = request.items.map(item => {
    const product = products.find(p => p.id === item.variant_id);
    if (!product) throw new Error(`Product ${item.variant_id} not found`);
    return { ...product, quantity: item.quantity };
  });

  // 3. Calculate prices
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 200000 ? 0 : 10000; // Free shipping over ₹2000
  const total = subtotal + shippingFee;

  // 4. Create internal order (Mocking Supabase call)
  const orderId = `TNL-${Math.floor(10000 + Math.random() * 90000)}`;
  console.log(`[Checkout] Internal order created: ${orderId}`);

  // 5. Create Razorpay order
  const rzpOrder = await createRazorpayOrder(total, orderId);

  return {
    orderId,
    total,
    currency: 'INR',
    razorpay: rzpOrder,
  };
};
