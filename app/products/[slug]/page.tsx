import { notFound } from 'next/navigation'
import { getProduct, products } from '@/data/catalog'
import { ProductDetail } from '@/components/storefront/product-detail'

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = getProduct(slug)

  if (!product) {
    notFound()
  }

  return (
    <main className="route-page">
      <div className="route-content">
        <ProductDetail product={product} />
      </div>
    </main>
  )
}