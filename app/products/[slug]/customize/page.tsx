import { notFound } from 'next/navigation'

import {
  getProduct,
  products,
} from '@/data/catalog'
import { CardCustomizePage } from '@/components/storefront/card-customize-page'



export function generateStaticParams() {
  return products
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
    !product
  ) {
    notFound()
  }

  return (
    <CardCustomizePage product={product} />
  )
}