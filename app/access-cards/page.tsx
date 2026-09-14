import { AccessCardsPage } from '@/components/storefront/access-cards-page'
import { getActiveProducts } from '@/lib/ecommerce/products'

export default async function Page() {
  const products = await getActiveProducts()
  return <AccessCardsPage products={products} />
}