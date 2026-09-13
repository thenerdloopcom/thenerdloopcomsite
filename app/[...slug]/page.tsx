import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getProduct, products, logoImage } from '@/data/catalog'
import { ProductDetail } from '@/components/storefront/product-detail'

export function generateStaticParams() {
  return [...products.map((p) => ({ slug: ['products', p.slug] })), { slug: ['shop'] }, { slug: ['about'] }, { slug: ['contact'] }, { slug: ['shipping'] }, { slug: ['returns'] }, { slug: ['privacy'] }, { slug: ['terms'] }, { slug: ['wishlist'] }, { slug: ['account'] }, { slug: ['checkout'] }]
}

export default async function RoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const [section, id] = slug
  const product = section === 'products' && id ? getProduct(id) : undefined
  if (section === 'products' && !product) notFound()
  const title = product?.name ?? ({ shop: 'SHOP ALL', about: 'OUR STORY', contact: 'SAY HELLO', shipping: 'SHIPPING', returns: 'RETURNS', privacy: 'PRIVACY', terms: 'TERMS', wishlist: 'WISHLIST', account: 'ACCOUNT', checkout: 'DEMO CHECKOUT' }[section] ?? 'THE LOOP')
  return <main className="route-page"><header className="route-header"><Link href="/" className="wordmark"><img src={logoImage} alt="The NerdLoop" /></Link><Link href="/" className="text-link"><ArrowLeft size={15} /> BACK HOME</Link></header><div className="route-content">{product ? <ProductDetail product={product} /> : <div className="simple-route"><p className="eyebrow">THE NERDLOOP / ISSUE 001</p><h1>{title}</h1><p>{section === 'about' ? 'We make small-batch artifacts for people who read the side quests. No licenses, no boardrooms, no boring. Just objects for the stories that stuck.' : section === 'checkout' ? 'This is a local demo checkout. No payment is taken and no order is sent to a fulfillment service.' : 'This page is part of the Loop. Browse the homepage to find the latest fan-made drop.'}</p><Link href="/" className="comic-button">EXPLORE THE LOOP <ArrowUpRight size={18} /></Link></div>}</div><footer><Link href="/" className="wordmark"><img src={logoImage} alt="The NerdLoop" /></Link><p>FAN-MADE OBJECTS FOR THE LONG WAY HOME.</p><div><Link href="/shipping">SHIPPING</Link><Link href="/returns">RETURNS</Link><Link href="/contact">CONTACT</Link></div></footer></main>
}
