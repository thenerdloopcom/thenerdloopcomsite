import { notFound } from 'next/navigation'
import { getProduct, getActiveProducts } from '@/lib/ecommerce/products'
import { CardCustomizePage } from '@/components/storefront/card-customize-page'



export async function generateStaticParams() {
  const products = await getActiveProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await getProduct(slug)

  if (
    !product
  ) {
    notFound()
  }

  return (
    <CardCustomizePage product={product} />
  )
}