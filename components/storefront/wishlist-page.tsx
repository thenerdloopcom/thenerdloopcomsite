'use client'

import Link from 'next/link'
import { ArrowUpRight, Heart } from 'lucide-react'

import { products } from '@/data/catalog'
import { useWishlist } from './wishlist-provider'
import { useCart } from './cart-provider'

export default function WishlistPage() {
  const { items, toggle } = useWishlist()
  const { addItem } = useCart()

  const wishlistProducts = products.filter((product) =>
    items.includes(product.slug),
  )

  return (
    <main className="route-page">
      <section className="shop-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR COLLECTION</p>
            <h1 className="shop-page-title">
              WISHLIST <span>FAVORITES</span>
            </h1>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="empty-shop">
            NOTHING SAVED YET.
          </div>
        ) : (
          <div className="product-grid">
            {wishlistProducts.map((product) => (
              <article
                key={product.id}
                className="product-card"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="card-image"
                >
                  <div
                    className={`product-art product-${product.color}`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  </div>
                </Link>

                <div className="card-info">
                  <div>
                    <p className="eyebrow">
                      {product.category}
                    </p>

                    <h3>{product.name}</h3>
                  </div>
                </div>

                <button
                  className="add-button"
                  onClick={() => {
                    addItem(product)
                  }}
                >
                  ADD TO BAG
                  <ArrowUpRight size={16} />
                </button>

                <button
                  className="wishlist-remove"
                  onClick={() => toggle(product.slug)}
                >
                  <Heart size={15} />
                  REMOVE
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}