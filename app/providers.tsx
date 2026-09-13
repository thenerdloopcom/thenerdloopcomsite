'use client'

import type { ReactNode } from 'react'
import { CartProvider } from '@/components/storefront/cart-provider'
import { WishlistProvider } from '@/components/storefront/wishlist-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        {children}
      </WishlistProvider>
    </CartProvider>
  )
}