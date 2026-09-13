import { notFound } from 'next/navigation'

import {
  getProduct,
  products,
} from '@/data/catalog'
import { CardPersonalizePage } from '@/components/storefront/card-personalize-page'


export function generateStaticParams() {
  return products
    .filter(
      (product) =>
        product.cardType ===
        'photo-personalized',
    )
    .map((product) => ({
      slug: product.slug,
    }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = getProduct(slug)

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