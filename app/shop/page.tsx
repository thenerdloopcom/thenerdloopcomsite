import { ShopPage } from '@/components/storefront/shop-page'
import { Suspense } from "react"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShopPage />
    </Suspense>
  )
}