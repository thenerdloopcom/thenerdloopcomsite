'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { categories, logoImage } from '@/data/catalog'
import { useCart } from './cart-provider'
import { useWishlist } from './wishlist-provider'

export function SiteHeader() {
  const { count, openCart } = useCart()
  const { items: wishlist } = useWishlist()

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const closeMenu = () => setMenuOpen(false)

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()

    const value = query.trim()

    if (!value) return

    window.location.href = `/shop?q=${encodeURIComponent(value)}`
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <>
      <div className="announcement">
        FREE SHIPPING ON ORDERS OVER ₹2000
        <span>•</span>
        FAN-MADE / SMALL-BATCH / BIG ENERGY
      </div>

      <header className="site-header">
        <Link
          href="/"
          className="wordmark"
          onClick={closeMenu}
        >
          <img src={logoImage} alt="The NerdLoop" />
        </Link>

        <nav className={menuOpen ? 'nav-open' : ''}>
          <Link href="/shop" onClick={closeMenu}>
            SHOP ALL
          </Link>

          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              onClick={closeMenu}
            >
              {category.name.toUpperCase()}
            </Link>
          ))}

          <Link href="/about" onClick={closeMenu}>
            ABOUT
          </Link>
        </nav>

        <div className="header-actions">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search size={20} />
          </button>

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="header-icon-with-count"
          >
            <Heart size={20} />
            {wishlist.length > 0 && <b>{wishlist.length}</b>}
          </Link>

          <Link href="/account" aria-label="Account">
            <User size={20} />
          </Link>

          <button
            aria-label="Open cart"
            onClick={openCart}
            className="bag"
          >
            <ShoppingBag size={20} />
            {count > 0 && <b>{count}</b>}
          </button>

          <button
            className="mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="search-wrap">
          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={20} />

            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="SEARCH THE LOOP..."
            />

            <button
              type="button"
              aria-label="Close search"
              onClick={() => {
                setSearchOpen(false)
                setQuery('')
              }}
            >
              <X />
            </button>
          </form>
        </div>
      )}
    </>
  )
}