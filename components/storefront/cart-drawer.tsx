'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  Minus,
  Plus,
  X,
} from 'lucide-react'

import { formatPrice } from '@/data/catalog'
import { useCart } from './cart-provider'

export function CartDrawer() {
  const {
    items,
    subtotal,
    cartOpen,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart()

  if (!cartOpen) return null

  return (
    <div
      className="drawer-backdrop"
      onClick={closeCart}
    >
      <aside
        className="cart-drawer"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="drawer-head">
          <h2>
            YOUR <span>BAG</span>
          </h2>

          <button
            onClick={closeCart}
            aria-label="Close cart"
          >
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>
                YOUR BAG IS AS EMPTY AS THE VOID.
              </p>

              <button
                className="comic-button"
                onClick={closeCart}
              >
                GO FILL IT
              </button>
            </div>
          ) : (
            items.map((item) => {
              const {
                product,
                quantity,
                customization,
              } = item

              return (
                <div
                  key={item.id}
                  className="cart-item"
                >
                  <div className="mini-art">
                    <img
                      src={
                        customization?.imagePreviewUrl ||
                        product.image
                      }
                      alt={product.name}
                    />
                  </div>

                  <div className="cart-item-info">
                    <b>{product.name}</b>

                    {customization?.type ===
                      'photo-personalized' && (
                      <p className="cart-custom-label">
                        PERSONALIZED
                      </p>
                    )}

                    {customization?.type ===
                      'fully-custom' && (
                      <p className="cart-custom-label">
                        CUSTOM
                      </p>
                    )}

                    {customization?.name && (
                      <p>
                        NAME: {customization.name}
                      </p>
                    )}

                    {customization?.imagePreviewUrl && (
                      <p>PHOTO: UPLOADED</p>
                    )}

                    <p>
                      {formatPrice(product.price)}
                    </p>

                    <div className="cart-quantity">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            quantity - 1,
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>

                      <span>{quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            quantity + 1,
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      removeItem(item.id)
                    }
                    aria-label={`Remove ${product.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-total">
              <span>TOTAL</span>
              <span>
                {formatPrice(subtotal)}
              </span>
            </div>

            <Link
              href="/checkout"
              className="checkout-button w-full"
              onClick={closeCart}
            >
              PROCEED TO CHECKOUT
              <ArrowUpRight size={18} />
            </Link>

            <p className="demo-note">
              RAZORPAY INTEGRATION PLACEHOLDER — NO
              PAYMENT TAKEN
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}