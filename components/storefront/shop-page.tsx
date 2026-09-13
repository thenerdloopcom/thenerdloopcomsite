'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

import {
  categories,
  formatPrice,
  products,
  type Product,
} from '@/data/catalog'
import { useCart } from './cart-provider'
import { useWishlist } from './wishlist-provider'

const PAGE_SIZE = 8

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()

  const liked = has(product.slug)

  return (
    <article className="product-card">
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

          {product.badge && (
            <span className="badge">{product.badge}</span>
          )}

          <button
            className={`like ${liked ? 'liked' : ''}`}
            onClick={(event) => {
              event.preventDefault()
              toggle(product.slug)
            }}
            aria-label="Add to wishlist"
          >
            <Heart
              size={18}
              fill={liked ? 'currentColor' : 'none'}
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
          <p className="subtitle">{product.subtitle}</p>
        </div>

        <strong>{formatPrice(product.price)}</strong>
      </div>

      <button
        className="add-button"
        onClick={() => addItem(product)}
      >
        ADD TO BAG
        <ArrowUpRight size={16} />
      </button>
    </article>
  )
}

export function ShopPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const category = searchParams.get('category') ?? 'All'
  const subcategory = searchParams.get('subcategory') ?? 'All'
  const query = searchParams.get('q') ?? ''
  const page = Math.max(
    1,
    Number(searchParams.get('page') ?? '1') || 1,
  )

  const currentCategory = categories.find(
    (item) => item.name === category,
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        category === 'All' || product.category === category

      const subcategoryMatch =
        subcategory === 'All' ||
        product.subcategory === subcategory

      const queryMatch =
        !query ||
        `${product.name} ${product.subtitle} ${product.category} ${
          product.subcategory ?? ''
        }`
          .toLowerCase()
          .includes(query.toLowerCase())

      return categoryMatch && subcategoryMatch && queryMatch
    })
  }, [category, subcategory, query])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  )

  const currentPage = Math.min(page, totalPages)

  const pageProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const updateQuery = (
    updates: Record<string, string | null>,
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'All') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    params.delete('page')

    router.push(`/shop?${params.toString()}`)
  }

  return (
    <main className="route-page">
      <section className="shop-section shop-page-main">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE VAULT</p>

            <h1 className="shop-page-title">
              {category === 'All'
                ? 'SHOP'
                : category.toUpperCase()}{' '}
              <span>ALL</span>
            </h1>
          </div>

          <span className="font-mono text-xs">
            {filteredProducts.length} ITEMS
          </span>
        </div>

        {query && (
          <div className="shop-search-state">
            SEARCH RESULTS FOR “{query.toUpperCase()}”
          </div>
        )}

        <div className="filter-row">
          <button
            className={category === 'All' ? 'active' : ''}
            onClick={() =>
              updateQuery({
                category: null,
                subcategory: null,
              })
            }
          >
            ALL
          </button>

          {categories.map((item) => (
            <button
              key={item.slug}
              className={
                category === item.name ? 'active' : ''
              }
              onClick={() =>
                updateQuery({
                  category: item.name,
                  subcategory: null,
                })
              }
            >
              {item.name.toUpperCase()}
            </button>
          ))}
        </div>

        {currentCategory?.subcategories && (
          <div className="filter-row">
            <button
              className={
                subcategory === 'All' ? 'active' : ''
              }
              onClick={() =>
                updateQuery({ subcategory: null })
              }
            >
              ALL {category.toUpperCase()}
            </button>

            {currentCategory.subcategories.map((item) => (
              <button
                key={item}
                className={
                  subcategory === item ? 'active' : ''
                }
                onClick={() =>
                  updateQuery({ subcategory: item })
                }
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <div className="product-grid">
          {pageProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {pageProducts.length === 0 && (
          <div className="empty-shop">
            NO OBJECTS FOUND IN THE LOOP.
          </div>
        )}

        <div className="shop-pagination">
          <button
            disabled={currentPage <= 1}
            onClick={() =>
              router.push(
                `/shop?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(currentPage - 1),
                })}`,
              )
            }
          >
            <ChevronLeft />
          </button>

          <span>
            PAGE {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() =>
              router.push(
                `/shop?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  page: String(currentPage + 1),
                })}`,
              )
            }
          >
            <ChevronRight />
          </button>
        </div>
      </section>
    </main>
  )
}