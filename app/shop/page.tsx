import { Suspense } from 'react'
import { ShopPage } from '@/components/storefront/shop-page'
import { getActiveProducts, getCategories } from '@/lib/ecommerce/products'

export default async function Page() {
  const [products, categories] = await Promise.all([getActiveProducts(), getCategories()])
  return (
    <Suspense fallback={null}>
      <ShopPage products={products} categories={categories} />
    </Suspense>
  )
}