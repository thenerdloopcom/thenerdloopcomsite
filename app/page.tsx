import { Storefront } from '@/components/storefront/storefront'
import {
  getActiveProducts,
  getCategories,
} from '@/lib/ecommerce/products'

export default async function Page() {
  const [products, categories] =
    await Promise.all([
      getActiveProducts(),
      getCategories(),
    ])

  return (
    <Storefront
      products={products}
      categories={categories}
    />
  )
}