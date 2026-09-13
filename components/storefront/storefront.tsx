'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart,
} from 'lucide-react'

import {
  categories,
  formatPrice,
  products,
  type Product,
  logoImage,
} from '@/data/catalog'

import { useCart } from './cart-provider'
import { useWishlist } from './wishlist-provider'

const colorClass: Record<string, string> = {
  red: 'product-red',
  blue: 'product-blue',
  black: 'product-black',
  yellow: 'product-yellow',
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
        alt={`${product.name} graphic artwork`}
      />

      <span className="art-label">
        TNL / {product.name}
      </span>

      <span className="art-burst">
        OOF!
      </span>
    </div>
  )
}

function ProductCard({
  product,
}: {
  product: Product
}) {
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()

  const liked = has(product.slug)

  return (
    <article className="product-card">
      <Link
        href={`/products/${product.slug}`}
        className="card-image"
      >
        <ProductArt product={product} />

        {product.badge && (
          <span className="badge">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          className={`like ${liked ? 'liked' : ''}`}
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
            fill={liked ? 'currentColor' : 'none'}
          />
        </button>
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

export function Storefront() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSubcategory, setActiveSubcategory] =
    useState('All')

  const currentCategory = categories.find(
    (category) => category.name === activeCategory,
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        activeCategory === 'All' ||
        product.category === activeCategory

      const subcategoryMatch =
        activeSubcategory === 'All' ||
        product.subcategory === activeSubcategory

      return (
        categoryMatch &&
        subcategoryMatch &&
        product.status === 'active'
      )
    })
  }, [activeCategory, activeSubcategory])

  const selectCategory = (category: string) => {
    setActiveCategory(category)
    setActiveSubcategory('All')
  }

  return (
    <div className="storefront">
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              DROP 002 / THE FANDOM COLLECTION
            </p>

            <h1>
              GEAR FOR
              <br />
              <em>THE</em>{' '}
              <span>NERDS.</span>
            </h1>

            <p className="hero-description">
              Handmade masks, metallic signs, and
              artifacts for the true fans. Built to last,
              designed to impress.
            </p>

            <div className="flex gap-4">
              <Link
                href="/shop"
                className="comic-button"
              >
                SHOP THE DROP
                <ArrowUpRight size={19} />
              </Link>
            </div>
          </div>

          <div className="hero-art relative group">
            <div className="w-full h-full flex items-center justify-center bg-blue-600 overflow-hidden relative">
              <ProductArt
                product={products[0]}
                large
              />

              <Link
                href={`/products/${products[0].slug}`}
                aria-label={`View ${products[0].name}`}
                className="absolute inset-0"
              />

              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  type="button"
                  className="bg-white/20 p-2 rounded-full"
                  aria-label="Previous featured product"
                >
                  <ChevronLeft />
                </button>

                <button
                  type="button"
                  className="bg-white/20 p-2 rounded-full"
                  aria-label="Next featured product"
                >
                  <ChevronRight />
                </button>
              </div>

              <div className="absolute bottom-8 flex gap-2">
                <span className="w-2 h-2 bg-white rounded-full" />
                <span className="w-2 h-2 bg-white/40 rounded-full" />
                <span className="w-2 h-2 bg-white/40 rounded-full" />
              </div>
            </div>

            <div className="price-sticker">
              FROM
              <br />
              <b>₹199</b>
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section className="manifesto">
          <span>THE NERDLOOP</span>

          <p>
            NOT MERCH.{' '}
            <strong>MEMORY.</strong>
          </p>

          <span>EST. 2026</span>
        </section>

        {/* Categories */}
        <section className="shop-section bg-gray-50 home-categories">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                EXPLORE BY
              </p>

              <h2>
                CATEGORIES
              </h2>
            </div>

            <Link
              href="/shop"
              className="text-link"
            >
              VIEW ALL
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => {
                  selectCategory(category.name)

                  document
                    .getElementById('shop')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    })
                }}
                className="group relative overflow-hidden border-2 border-black aspect-square bg-[#fffbe0] hover:bg-yellow-400 transition-colors"
              >
                <div className="p-6 flex flex-col h-full justify-between">
                  <span className="text-2xl font-mono font-bold tracking-widest">
                    {category.name.toUpperCase()}
                  </span>

                  <ArrowUpRight className="self-end group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Homepage product section */}
        <section
          id="shop"
          className="shop-section"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                THE VAULT
              </p>

              <h2>
                {activeCategory === 'All'
                  ? 'ALL'
                  : activeCategory.toUpperCase()}{' '}
                <span>COLLECTION</span>
              </h2>
            </div>

            <Link
              href="/shop"
              className="text-link"
            >
              SHOP ALL
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Category filters */}
          <div className="filter-row">
            <button
              type="button"
              className={
                activeCategory === 'All'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                selectCategory('All')
              }
            >
              ALL
            </button>

            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                className={
                  activeCategory === category.name
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  selectCategory(category.name)
                }
              >
                {category.name.toUpperCase()}
              </button>
            ))}

            <span>
              {filteredProducts.length} ITEMS
            </span>
          </div>

          {/* Subcategory filters */}
          {currentCategory?.subcategories &&
            currentCategory.subcategories.length > 0 && (
              <div className="filter-row mb-8 border-none pt-0">
                <button
                  type="button"
                  className={
                    activeSubcategory === 'All'
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setActiveSubcategory('All')
                  }
                >
                  ALL{' '}
                  {activeCategory.toUpperCase()}
                </button>

                {currentCategory.subcategories.map(
                  (subcategory) => (
                    <button
                      key={subcategory}
                      type="button"
                      className={
                        activeSubcategory ===
                        subcategory
                          ? 'active'
                          : ''
                      }
                      onClick={() =>
                        setActiveSubcategory(
                          subcategory,
                        )
                      }
                    >
                      {subcategory.toUpperCase()}
                    </button>
                  ),
                )}
              </div>
            )}

          {/* Products */}
          <div className="product-grid">
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ),
            )}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-shop">
              NO OBJECTS FOUND IN THE LOOP.
            </div>
          )}

          {/* Homepage pagination indicator.
              Full pagination lives on /shop. */}
          <div className="mt-16 flex justify-center items-center gap-4">
            <Link
              href="/shop"
              className="p-2 border-2 border-black"
            >
              <ChevronLeft />
            </Link>

            <span className="font-mono font-bold">
              FEATURED / {filteredProducts.length}
            </span>

            <Link
              href="/shop"
              className="p-2 border-2 border-black"
            >
              <ChevronRight />
            </Link>
          </div>
        </section>

        {/* Story */}
        <section className="story-strip">
          <div>
            <p className="eyebrow">
              THE CRAFT
            </p>

            <h2>
              HANDMADE{' '}
              <span>IN INDIA.</span>
            </h2>
          </div>

          <p>
            Every mask is hand-stitched, every poster
            is QC&apos;d by fans, and every metallic
            item is crafted for durability. We don&apos;t
            just sell items; we sell pieces of the
            universe you love.
          </p>

          <Link
            href="/about"
            className="comic-button dark"
          >
            READ THE STORY
            <ArrowUpRight size={18} />
          </Link>
        </section>

        {/* Newsletter */}
        <section className="newsletter">
          <p className="eyebrow">
            STAY IN THE LOOP
          </p>

          <h2>
            JOIN THE{' '}
            <span>RESISTANCE.</span>
          </h2>

          <p>
            Get early access to drops, limited
            editions, and nerd lore.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault()
            }}
          >
            <input
              type="email"
              placeholder="EMAIL@DOMAIN.COM"
              required
            />

            <button type="submit">
              ENLIST
              <ArrowUpRight size={16} />
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
