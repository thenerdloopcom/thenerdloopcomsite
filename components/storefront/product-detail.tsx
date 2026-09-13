'use client'

import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, ArrowUpRight, Plus, Minus } from 'lucide-react'
import { type Product, formatPrice } from '@/data/catalog'
import { useCart } from './cart-provider'

const colorClass: Record<string, string> = { 
  red: 'product-red', 
  blue: 'product-blue', 
  black: 'product-black', 
  yellow: 'product-yellow' 
}

function ProductArt({ product, large = false, image }: { product: Product; large?: boolean; image?: string }) {
  return (
    <div className={`product-art ${colorClass[product.color] || 'product-black'} ${large ? 'product-art-large' : ''}`}>
      <img src={image || product.image} alt={`${product.name} graphic artwork`} />
      <span className="art-label">TNL / {product.name}</span>
      <span className="art-burst">OOF!</span>
    </div>
  )
}

export function ProductDetail({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [cartAdded, setCartAdded] = useState(false)
  const { addItem } = useCart()

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
        <div className="gallery-main">
          <ProductArt product={product} large image={product.gallery[selected]} />
        </div>
        <div className="gallery-controls">
          <button
            aria-label="Previous product image"
            onClick={() => setSelected((selected - 1 + product.gallery.length) % product.gallery.length)}
          >
            <ChevronLeft size={18} />
          </button>
          {product.gallery.map((image, index) => (
            <button
              key={image + index}
              className={selected === index ? 'selected' : ''}
              onClick={() => setSelected(index)}
            >
              <img src={image} alt={`${product.name} view ${index + 1}`} />
            </button>
          ))}
          <button
            aria-label="Next product image"
            onClick={() => setSelected((selected + 1) % product.gallery.length)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="product-detail">
        <p className="eyebrow">{product.category} / FAN-MADE EDITION</p>
        <h1>{product.name}</h1>
        <p className="detail-subtitle">{product.subtitle}</p>
        <strong className="detail-price">{formatPrice(product.price)}</strong>
        
        <div className="mb-8 flex items-center gap-4">
           <span className="font-mono text-xs font-bold">QUANTITY</span>
           <div className="flex items-center border-2 border-black">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-yellow-400 border-r-2 border-black"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 font-mono font-bold">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-yellow-400 border-l-2 border-black"
              >
                <Plus size={16} />
              </button>
           </div>
        </div>

        <p>{product.description}</p>
        <ul>
          {product.details.map((detail) => (
            <li key={detail}>
              <Check size={15} /> {detail}
            </li>
          ))}
        </ul>
        <button className="checkout-button w-full" onClick={addToBag}>
          {cartAdded ? 'ADDED TO BAG!' : 'ADD TO BAG'} <ArrowUpRight size={18} />
        </button>
      </div>
    </>
  )
}
