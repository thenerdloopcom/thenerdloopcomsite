import { notFound } from 'next/navigation'
import { getProduct, getActiveProducts } from '@/lib/ecommerce/products'
import { ProductDetail } from '@/components/storefront/product-detail'

export async function generateStaticParams() {
  const products = await getActiveProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await getProduct(slug)

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