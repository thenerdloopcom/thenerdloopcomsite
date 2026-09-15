'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import {
  type Product,
  type Category,
} from '@/data/catalog'

import { ProductCard } from './product-card'

const colorClass: Record<string, string> = {
  red: 'product-red',
  blue: 'product-blue',
  black: 'product-black',
  yellow: 'product-yellow',
}

export function Storefront({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSubcategory, setActiveSubcategory] =
    useState('All')
  
  const FEATURED_PAGE_SIZE = 4
  const [featuredPage, setFeaturedPage] = useState(1)

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

  const featuredTotalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / FEATURED_PAGE_SIZE),
  )

  const featuredPageProducts = filteredProducts.slice(
    (featuredPage - 1) * FEATURED_PAGE_SIZE,
    featuredPage * FEATURED_PAGE_SIZE,
  )

  
  const selectCategory = (category: string) => {
    setActiveCategory(category)
    setActiveSubcategory('All')
    setFeaturedPage(1)
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

          <div className="hero-art relative group rounded-tl-4xl overflow-hidden mt-16 border-t-2 border-l-2 border-black">
            {/* Empty for now — carousel images to be added here later */}
            {/* <div className="w-full h-full bg-blue-600" /> */}
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
            {featuredPageProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ),
            )}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-shop">
              DROPPING SOON IN THE LOOP.
            </div>
          )}

          {/* Homepage pagination indicator.
              Full pagination lives on /shop. */}
          <div className="mt-16 flex justify-center items-center gap-4">
            <button
              type="button"
              className="p-2 border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={featuredPage === 1}
              onClick={() =>
                setFeaturedPage((page) => Math.max(1, page - 1))
              }
              aria-label="Previous featured products"
            >
              <ChevronLeft />
            </button>

            <span className="font-mono font-bold">
              {featuredPage} / {featuredTotalPages}
            </span>

            <button
              type="button"
              className="p-2 border-2 border-black disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={featuredPage === featuredTotalPages}
              onClick={() =>
                setFeaturedPage((page) =>
                  Math.min(featuredTotalPages, page + 1),
                )
              }
              aria-label="Next featured products"
            >
              <ChevronRight />
            </button>
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