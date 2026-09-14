'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import {
  formatPrice,
  type Product,
} from '@/data/catalog'

import { useCart } from './cart-provider'

function getCardAction(product: Product) {
  switch (product.cardType) {
    case 'photo-personalized':
      return {
        label: 'PERSONALIZE',
        href: `/products/${product.slug}/personalize`,
      }

    default:
      return {
        label: 'VIEW CARD',
        href: `/products/${product.slug}`,
      }
  }
}

function CardItem({
  product,
}: {
  product: Product
}) {
  const { addItem } = useCart()

  const action = getCardAction(product)

  const isReadyMade =
    product.cardType === 'ready-made'


  return (
    <article className="access-card-item">
      <Link
        href={action.href}
        className={`access-card-art`}
      >
        <div className="card-art-frame">
          <img
            className="card-front-image"
            src={product.image}
            alt={`${product.name} front`}
          />
        </div>
      </Link>

      <div className="access-card-info">
        <div>
          <p className="eyebrow">
            {product.cardType ===
            'photo-personalized'
              ? 'PHOTO PERSONALIZED'
              : 'READY-MADE'}
          </p>

          <h2>{product.name}</h2>

          <p className="subtitle">
            {product.subtitle}
          </p>
        </div>

        <strong>
          {formatPrice(product.price)}
        </strong>
      </div>

      {isReadyMade ? (
        <button
          type="button"
          className="add-button"
          onClick={() => addItem(product)}
        >
          ADD TO BAG
          <ArrowUpRight size={16} />
        </button>
      ) : (
        <Link
          href={action.href}
          className="add-button"
        >
          PERSONALIZE
          <ArrowUpRight size={16} />
        </Link>
      )}
    </article>
  )
}

export function AccessCardsPage({ products }: { products: Product[] }) {
  const cards = products.filter(
    (product) =>
      product.productType === 'access-card' &&
      product.status === 'active',
  )

  return (
    <main className="route-page">
      <section className="access-cards-page">
        <div className="access-cards-header">
          <div>
            <p className="eyebrow">
              THE NERDLOOP / ACCESS CARDS
            </p>

            <h1>
              ACCESS
              <span> CARDS.</span>
            </h1>

            <p>
              Credentials, collector cards and
              personalized artifacts for your
              favorite universes.
            </p>
          </div>

          <span className="access-card-count">
            {cards.length} CARDS
          </span>
        </div>

        <div className="access-card-grid">
          {cards.map((product) => (
            <CardItem
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
