'use client'

import Link from 'next/link'
import { ArrowUpRight, Heart } from 'lucide-react'

import {
  formatPrice,
  type Product,
} from '@/data/catalog'

import { useCart } from './cart-provider'
import { useWishlist } from './wishlist-provider'

export function ProductCard({
  product,
}: {
  product: Product
}) {
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()

  const liked = has(product.slug)

  const canPersonalize =
    product.cardType === 'photo-personalized'

  return (
    <article className="product-card">
      <Link
        href={`/products/${product.slug}`}
        className="card-image"
      >
        <div className="product-art">
          <img
            src={product.image}
            alt={product.name}
          />

          {canPersonalize && (
            <span className="customize-tag">
              CUSTOMIZE IT →
            </span>
          )}

          <button
            type="button"
            className={`like ${
              liked ? 'liked' : ''
            }`}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              toggle(product.slug)
            }}
            aria-label={
              liked
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
          >
            <Heart
              size={18}
              fill={
                liked
                  ? 'currentColor'
                  : 'none'
              }
            />
          </button>
        </div>
      </Link>

      <div className="card-info">
        <div>
          <p className="eyebrow">
            {product.category}
            {product.subcategory
              ? ` / ${product.subcategory}`
              : ''}
          </p>

          <h3>{product.name}</h3>

          <p className="subtitle">
            {product.subtitle}
          </p>
        </div>

        <strong>
          {formatPrice(product.price)}
        </strong>
      </div>

      <button
        type="button"
        className="add-button"
        onClick={() => addItem(product, 1)}
      >
        ADD TO BAG
        <ArrowUpRight size={16} />
      </button>
    </article>
  )
}