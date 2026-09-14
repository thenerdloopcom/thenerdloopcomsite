import { notFound } from 'next/navigation'
import { getProduct, getActiveProducts } from '@/lib/ecommerce/products'
import { CardPersonalizePage } from '@/components/storefront/card-personalize-page'


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
    !product ||
    product.cardType !==
      'photo-personalized'
  ) {
    notFound()
  }

  return (
    <CardPersonalizePage product={product} />
  )
}