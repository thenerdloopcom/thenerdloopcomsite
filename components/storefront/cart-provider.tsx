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

export type CartItem = {
  product: Product
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (product: Product, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'tnl-cart-v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  // Restore persisted cart.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)

      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch {
      // Ignore malformed local storage.
    } finally {
      setHydrated(true)
    }
  }, [])

  // Persist changes after initial hydration.
  useEffect(() => {
    if (!hydrated) return

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = (product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id,
      )

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [...current, { product, quantity }]
    })

    setCartOpen(true)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  const removeItem = (productId: string) => {
    setItems((current) =>
      current.filter((item) => item.product.id !== productId),
    )
  }

  const clearCart = () => setItems([])

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
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
    throw new Error('useCart must be used inside CartProvider')
  }

  return context
}