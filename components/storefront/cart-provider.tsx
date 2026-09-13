'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { Product } from '@/data/catalog'

export type CartCustomization = {
  type: 'photo-personalized' | 'fully-custom'

  name?: string

  imageStorageKey?: string

  // Browser-only preview while we are still using localStorage.
  imagePreviewUrl?: string

  instructions?: string
}

export type CartItem = {
  id: string
  product: Product
  quantity: number
  customization?: CartCustomization
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number

  addItem: (
    product: Product,
    quantity?: number,
    customization?: CartCustomization,
  ) => void

  updateQuantity: (
    cartItemId: string,
    quantity: number,
  ) => void

  removeItem: (cartItemId: string) => void

  clearCart: () => void

  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext =
  createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'tnl-cart-v2'

export function CartProvider({
  children,
}: {
  children: ReactNode
}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(STORAGE_KEY)

      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch {
      // Ignore malformed cart storage.
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    )
  }, [items, hydrated])

  const addItem = (
    product: Product,
    quantity = 1,
    customization?: CartCustomization,
  ) => {
    setItems((current) => {
      /*
       * Ready-made products can be merged.
       * Personalized/custom products get their own cart
       * line because two copies may have different photos,
       * names or instructions.
       */
      if (!customization) {
        const existing = current.find(
          (item) =>
            item.product.id === product.id &&
            !item.customization,
        )

        if (existing) {
          return current.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + quantity,
                }
              : item,
          )
        }
      }

      return [
        ...current,
        {
          id: crypto.randomUUID(),
          product,
          quantity,
          customization,
        },
      ]
    })

    setCartOpen(true)
  }

  const updateQuantity = (
    cartItemId: string,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeItem(cartItemId)
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  const removeItem = (cartItemId: string) => {
    setItems((current) =>
      current.filter(
        (item) => item.id !== cartItemId,
      ),
    )
  }

  const clearCart = () => setItems([])

  const count = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
    [items],
  )

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          item.product.price *
            item.quantity,
        0,
      ),
    [items],
  )

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        cartOpen,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider',
    )
  }

  return context
}