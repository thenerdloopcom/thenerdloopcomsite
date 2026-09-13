'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Heart, Menu, Search, ShoppingBag, X, ArrowUpRight, Check, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { categories, formatPrice, products, type Product, type Category, logoImage } from '@/data/catalog'

const colorClass: Record<string, string> = { red: 'product-red', blue: 'product-blue', black: 'product-black', yellow: 'product-yellow' }

function ProductArt({ product, large = false, image }: { product: Product; large?: boolean; image?: string }) {
  return (
    <div className={`product-art ${colorClass[product.color] || 'product-black'} ${large ? 'product-art-large' : ''}`}>
      <img src={image || product.image} alt={`${product.name} graphic artwork`} />
      <span className="art-label">TNL / {product.name}</span>
      <span className="art-burst">OOF!</span>
    </div>
  )
}

function Header({ count, onCart, onSearch }: { count: number; onCart: () => void; onSearch: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="announcement">
        FREE SHIPPING ON ORDERS OVER ₹2000 <span>•</span> FAN-MADE / SMALL-BATCH / BIG ENERGY
      </div>
      <header className="site-header">
        <Link href="/" className="wordmark">
          <img src={logoImage} alt="The NerdLoop" />
        </Link>
        <nav className={open ? 'nav-open' : ''}>
          <Link href="/shop">SHOP ALL</Link>
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/shop?category=${cat.name}`}>
              {cat.name.toUpperCase()}
            </Link>
          ))}
          <Link href="/about">ABOUT</Link>
        </nav>
        <div className="header-actions">
          <button aria-label="Search" onClick={onSearch}>
            <Search size={20} />
          </button>
          <Link href="/wishlist" aria-label="Wishlist">
            <Heart size={20} />
          </Link>
          <button aria-label="Open cart" onClick={onCart} className="bag">
            <ShoppingBag size={20} />
            <b>{count}</b>
          </button>
          <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  )
}

function ProductCard({ product, onAdd, liked, onLike }: { product: Product; onAdd: (p: Product) => void; liked: boolean; onLike: (slug: string) => void }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="card-image">
        <ProductArt product={product} />
        {product.badge && <span className="badge">{product.badge}</span>}
        <button
          className={`like ${liked ? 'liked' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            onLike(product.slug)
          }}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </Link>
      <div className="card-info">
        <div>
          <p className="eyebrow">{product.category} {product.subcategory ? `/ ${product.subcategory}` : ''}</p>
          <h3>{product.name}</h3>
          <p className="subtitle">{product.subtitle}</p>
        </div>
        <strong>{formatPrice(product.price)}</strong>
      </div>
      <button className="add-button" onClick={() => onAdd(product)}>
        ADD TO BAG <ArrowUpRight size={16} />
      </button>
    </article>
  )
}

export function Storefront() {
  const [cart, setCart] = useState<Product[]>([])
  const [liked, setLiked] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSubcategory, setActiveSubcategory] = useState('All')
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleAdd = (event: Event) => {
      const product = (event as CustomEvent<Product>).detail
      if (product) {
        setCart((current) => [...current, product])
        setCartOpen(true)
      }
    }
    window.addEventListener('tnl:add-to-bag', handleAdd)
    return () => window.removeEventListener('tnl:add-to-bag', handleAdd)
  }, [])

  const currentCategoryObj = categories.find(c => c.name === activeCategory)
  
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryMatch = activeCategory === 'All' || p.category === activeCategory
      const subcategoryMatch = activeSubcategory === 'All' || p.subcategory === activeSubcategory
      return categoryMatch && subcategoryMatch
    })
  }, [activeCategory, activeSubcategory])

  const searchResults = useMemo(() => {
    return query.trim()
      ? products
          .filter((p) =>
            `${p.name} ${p.subtitle} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase())
          )
          .slice(0, 5)
      : []
  }, [query])

  const addToCart = (p: Product) => {
    setCart((c) => [...c, p])
    setCartOpen(true)
  }

  const toggleLike = (slug: string) => {
    setLiked((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  const total = cart.reduce((sum, p) => sum + p.price, 0)

  return (
    <div className="storefront">
      <Header count={cart.length} onCart={() => setCartOpen(true)} onSearch={() => setSearchOpen(!searchOpen)} />
      
      {searchOpen && (
        <div className="search-wrap">
          <div className="search-bar">
            <Search size={20} />
            <input
              autoFocus
              placeholder="SEARCH THE LOOP..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={() => {
                setSearchOpen(false)
                setQuery('')
              }}
              aria-label="Close search"
            >
              <X />
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((product) => (
                <Link
                  href={`/products/${product.slug}`}
                  key={product.slug}
                  onClick={() => {
                    setSearchOpen(false)
                    setQuery('')
                  }}
                >
                  <ProductArt product={product} />
                  <span>
                    <b>{product.name}</b>
                    <small>
                      {product.subtitle} / {formatPrice(product.price)}
                    </small>
                  </span>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          )}
          {query.trim() && searchResults.length === 0 && (
            <div className="search-empty">NO OBJECTS FOUND IN THE LOOP.</div>
          )}
        </div>
      )}

      <main>
        {/* Hero Section with Carousel Placeholder */}
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">DROP 002 / THE FANDOM COLLECTION</p>
            <h1>
              GEAR FOR<br />
              <em>THE</em> <span>NERDS.</span>
            </h1>
            <p className="hero-description">
              Handmade masks, metallic signs, and artifacts for the true fans. 
              Built to last, designed to impress.
            </p>
            <div className="flex gap-4">
              <Link href="#shop" className="comic-button">
                SHOP THE DROP <ArrowUpRight size={19} />
              </Link>
            </div>
          </div>
          <div className="hero-art relative group">
            {/* Carousel Placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-blue-600 overflow-hidden relative">
               <ProductArt product={products[0]} large />
               <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white/20 p-2 rounded-full hover:bg-white/40"><ChevronLeft /></button>
                  <button className="bg-white/20 p-2 rounded-full hover:bg-white/40"><ChevronRight /></button>
               </div>
               <div className="absolute bottom-8 flex gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span className="w-2 h-2 bg-white/40 rounded-full"></span>
                  <span className="w-2 h-2 bg-white/40 rounded-full"></span>
               </div>
            </div>
            <div className="price-sticker">
              FROM<br />
              <b>₹199</b>
            </div>
          </div>
        </section>

        <section className="manifesto">
          <span>THE NERDLOOP</span>
          <p>
            NOT MERCH. <strong>MEMORY.</strong>
          </p>
          <span>EST. 2024</span>
        </section>

        {/* Categories Section */}
        <section className="shop-section bg-gray-50">
           <div className="section-heading">
              <div>
                <p className="eyebrow">EXPLORE BY</p>
                <h2>CATEGORIES</h2>
              </div>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <button 
                  key={cat.slug} 
                  onClick={() => {
                    setActiveCategory(cat.name)
                    setActiveSubcategory('All')
                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="group relative overflow-hidden border-2 border-black aspect-square bg-white hover:bg-yellow-400 transition-colors"
                >
                  <div className="p-6 flex flex-col h-full justify-between">
                    <span className="text-xs font-mono font-bold tracking-widest">{cat.name.toUpperCase()}</span>
                    <ArrowUpRight className="self-end group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </button>
              ))}
           </div>
        </section>

        {/* Main Shop Section with Filters */}
        <section id="shop" className="shop-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE VAULT</p>
              <h2>
                {activeCategory === 'All' ? 'ALL' : activeCategory.toUpperCase()} <span>COLLECTION</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Filter size={18} />
              <span className="font-mono text-xs font-bold">FILTERS</span>
            </div>
          </div>

          <div className="filter-row">
            <button
              className={activeCategory === 'All' ? 'active' : ''}
              onClick={() => {
                setActiveCategory('All')
                setActiveSubcategory('All')
              }}
            >
              ALL
            </button>
            {categories.map((c) => (
              <button
                key={c.name}
                className={activeCategory === c.name ? 'active' : ''}
                onClick={() => {
                  setActiveCategory(c.name)
                  setActiveSubcategory('All')
                }}
              >
                {c.name.toUpperCase()}
              </button>
            ))}
            <span>{filteredProducts.length} ITEMS</span>
          </div>

          {currentCategoryObj?.subcategories && (
            <div className="filter-row mb-8 border-none pt-0">
               <button
                className={activeSubcategory === 'All' ? 'active' : ''}
                onClick={() => setActiveSubcategory('All')}
              >
                ALL {activeCategory.toUpperCase()}
              </button>
              {currentCategoryObj.subcategories.map((sub) => (
                <button
                  key={sub}
                  className={activeSubcategory === sub ? 'active' : ''}
                  onClick={() => setActiveSubcategory(sub)}
                >
                  {sub.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                onAdd={addToCart}
                liked={liked.includes(product.slug)}
                onLike={toggleLike}
              />
            ))}
          </div>
          
          {/* Pagination Placeholder */}
          <div className="mt-16 flex justify-center items-center gap-4">
             <button className="p-2 border-2 border-black disabled:opacity-30" disabled><ChevronLeft /></button>
             <span className="font-mono font-bold">PAGE 1 / 1</span>
             <button className="p-2 border-2 border-black disabled:opacity-30" disabled><ChevronRight /></button>
          </div>
        </section>

        {/* Story Strip */}
        <section className="story-strip">
          <div>
            <p className="eyebrow">THE CRAFT</p>
            <h2>
              HANDMADE <span>IN INDIA.</span>
            </h2>
          </div>
          <p>
            Every mask is hand-stitched, every poster is QC'd by fans, and every metallic item is crafted for durability. We don't just sell items; we sell pieces of the universe you love.
          </p>
          <Link href="/about" className="comic-button dark">
            READ THE STORY <ArrowUpRight size={18} />
          </Link>
        </section>

        <section className="newsletter">
          <p className="eyebrow">STAY IN THE LOOP</p>
          <h2>
            JOIN THE <span>RESISTANCE.</span>
          </h2>
          <p>Get early access to drops, limited editions, and nerd lore.</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="EMAIL@DOMAIN.COM" required />
            <button type="submit">
              ENLIST <ArrowUpRight size={16} />
            </button>
          </form>
        </section>
      </main>

      <footer>
        <div className="wordmark">
          <img src={logoImage} alt="The NerdLoop" />
        </div>
        <p>© 2024 THE NERDLOOP. ALL RIGHTS RESERVED.</p>
        <div>
          <Link href="/terms">TERMS</Link>
          <Link href="/privacy">PRIVACY</Link>
          <Link href="/shipping">SHIPPING</Link>
        </div>
      </footer>

      {/* Cart Drawer Placeholder */}
      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>
                YOUR <span>BAG</span>
              </h2>
              <button onClick={() => setCartOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>YOUR BAG IS AS EMPTY AS THE VOID.</p>
                  <button className="comic-button" onClick={() => setCartOpen(false)}>
                    GO FILL IT
                  </button>
                </div>
              ) : (
                cart.map((item, i) => (
                  <div key={i} className="cart-item">
                    <div className="mini-art border-2 border-black bg-blue-500">
                      <img src={item.image} alt={item.name} className="w-full" />
                    </div>
                    <div>
                      <b>{item.name}</b>
                      <p>{formatPrice(item.price)}</p>
                    </div>
                    <button onClick={() => setCart(cart.filter((_, idx) => idx !== i))}>
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="drawer-footer">
                <div className="drawer-total">
                  <span>TOTAL</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <Link href="/checkout" className="checkout-button w-full">
                  PROCEED TO CHECKOUT <ArrowUpRight size={18} />
                </Link>
                <p className="text-[10px] text-center mt-4 font-mono opacity-60">
                   Secure payments via Razorpay
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
