'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

import {
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Minus,
} from 'lucide-react'

import {
  type Product,
  formatPrice,
} from '@/data/catalog'

import { useCart } from './cart-provider'

const colorClass: Record<string, string> = {
  red: 'product-red',
  blue: 'product-blue',
  black: 'product-black',
  yellow: 'product-yellow',
  orange: 'product-orange',
  purple: 'product-purple',
}

function ProductArt({
  product,
  large = false,
  image,
}: {
  product: Product
  large?: boolean
  image?: string
}) {
  return (
    <div
      className={`product-art ${
        colorClass[product.color] || 'product-black'
      } ${large ? 'product-art-large' : ''}`}
    >
      <img
        src={image || product.image}
        alt={`${product.name} artwork`}
      />

      <span className="art-label">
        TNL / {product.name}
      </span>
    </div>
  )
}

export function ProductDetail({
  product,
}: {
  product: Product
}) {
  const [selected, setSelected] = useState(0)

  const [quantity, setQuantity] = useState(1)

  const [cartAdded, setCartAdded] = useState(false)

  const [purchaseMode, setPurchaseMode] =
    useState<'as-is' | 'personalized'>('as-is')

  const { addItem } = useCart()

  const canPersonalize =
    product.cardType === 'photo-personalized'

  const isAccessCard =
    product.productType === 'access-card'

  const addToBag = () => {
    addItem(product, quantity)

    setCartAdded(true)

    setTimeout(() => {
      setCartAdded(false)
    }, 2000)
  }

  return (
    <>
      <div className="product-gallery">
        <div
          className={`gallery-main ${
            isAccessCard
              ? 'card-gallery-main'
              : ''
          }`}
        >
          <Image
            src={product.gallery[selected]}
            alt={`${product.name} view ${
              selected + 1
            }`}
            width={500}
            height={500}
          />
        </div>

        <div className="gallery-controls">
          <button
            aria-label="Previous product image"
            onClick={() =>
              setSelected(
                (current) =>
                  (current -
                    1 +
                    product.gallery.length) %
                  product.gallery.length,
              )
            }
          >
            <ChevronLeft size={18} />
          </button>

          {product.gallery.map(
            (image, index) => (
              <button
                key={image + index}
                className={
                  selected === index
                    ? 'selected'
                    : ''
                }
                onClick={() =>
                  setSelected(index)
                }
              >
                <img
                  src={image}
                  alt={`${product.name} view ${
                    index + 1
                  }`}
                />
              </button>
            ),
          )}

          <button
            aria-label="Next product image"
            onClick={() =>
              setSelected(
                (current) =>
                  (current + 1) %
                  product.gallery.length,
              )
            }
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="product-detail">
        <p className="eyebrow">
          {product.category} /{' '}
          {canPersonalize
            ? 'PHOTO PERSONALIZED'
            : isAccessCard
              ? 'ACCESS CARD'
              : 'FAN-MADE EDITION'}
        </p>

        <h1>{product.name}</h1>

        <p className="detail-subtitle">
          {product.subtitle}
        </p>

        <strong className="detail-price">
          {formatPrice(product.price)}
        </strong>

        <p>
          {product.description}
        </p>

        <ul>
          {product.details.map(
            (detail) => (
              <li key={detail}>
                <Check size={15} />
                {detail}
              </li>
            ),
          )}
        </ul>

        {canPersonalize && (
          <div className="card-purchase-options">
            <p className="eyebrow">
              CHOOSE YOUR CARD
            </p>

            <button
              type="button"
              className={`card-purchase-option ${
                purchaseMode === 'as-is'
                  ? 'selected'
                  : ''
              }`}
              onClick={() =>
                setPurchaseMode('as-is')
              }
            >
              <span>
                <strong>BUY AS-IS</strong>

                <small>
                  Get the card exactly as shown.
                </small>
              </span>

              <span className="purchase-option-indicator">
                {purchaseMode === 'as-is'
                  ? '●'
                  : '○'}
              </span>
            </button>

            <button
              type="button"
              className={`card-purchase-option ${
                purchaseMode ===
                'personalized'
                  ? 'selected'
                  : ''
              }`}
              onClick={() =>
                setPurchaseMode(
                  'personalized',
                )
              }
            >
              <span>
                <strong>
                  PERSONALIZE
                </strong>

                <small>
                  Add your own photo to
                  the card.
                </small>
              </span>

              <span className="purchase-option-indicator">
                {purchaseMode ===
                'personalized'
                  ? '●'
                  : '○'}
              </span>
            </button>
          </div>
        )}

        <div className="mb-8 flex items-center gap-4">
          <span className="eyebrow">
            QUANTITY
          </span>

          <div className="flex items-center border-2 border-black">
            <button
              type="button"
              className="p-2"
              aria-label="Decrease quantity"
              onClick={() =>
                setQuantity(
                  Math.max(
                    1,
                    quantity - 1,
                  ),
                )
              }
            >
              <Minus size={16} />
            </button>

            <span className="min-w-10 text-center font-bold">
              {quantity}
            </span>

            <button
              type="button"
              className="p-2"
              aria-label="Increase quantity"
              onClick={() =>
                setQuantity(
                  quantity + 1,
                )
              }
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {canPersonalize &&
        purchaseMode ===
          'personalized' ? (
          <Link
            href={`/products/${product.slug}/personalize`}
            className="checkout-button w-full"
          >
            PERSONALIZE CARD
            <ArrowUpRight
              size={18}
            />
          </Link>
        ) : (
          <button
            type="button"
            className="checkout-button w-full"
            onClick={addToBag}
          >
            {cartAdded
              ? 'ADDED TO BAG!'
              : 'ADD TO BAG'}

            <ArrowUpRight
              size={18}
            />
          </button>
        )}
      </div>
    </>
  )
}