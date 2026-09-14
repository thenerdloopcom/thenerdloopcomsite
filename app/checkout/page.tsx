import { redirect } from 'next/navigation'
import { CheckoutPage } from '@/components/storefront/checkout-page'
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/account?next=/checkout')
  }

  return <CheckoutPage />
}