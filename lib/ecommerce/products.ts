import { createPublicClient } from '@/lib/supabase/public'
import type { Product, Category } from '@/data/catalog'

/**
 * These functions return data shaped exactly like the old
 * data/catalog.ts arrays, so your existing components
 * (ProductCard, CardCustomizePage, /shop filters, etc.) keep working
 * unchanged. Swap your imports from '@/data/catalog' to
 * '@/lib/ecommerce/products' and you're done.
 */

type ProductRow = {
  id: string
  slug: string
  name: string
  subtitle: string | null
  price: number
  product_type: 'standard' | 'access-card'
  card_type: 'ready-made' | 'photo-personalized' | null
  badge: string | null
  color: string | null
  description: string | null
  details: string[]
  personalization: unknown
  status: 'active' | 'draft' | 'archived'
  featured: boolean
  categories: { name: string } | null
  product_images: { url: string; image_type: string; sort_order: number }[]
}

function toProduct(row: ProductRow): Product {
  const sortedImages = [...row.product_images].sort((a, b) => a.sort_order - b.sort_order)
  const front = sortedImages.find((i) => i.image_type === 'front') ?? sortedImages[0]

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle ?? '',
    price: row.price,

    category: row.categories?.name ?? '',

    productType: row.product_type,
    cardType: row.card_type ?? undefined,

    hasBackView: sortedImages.some((i) => i.image_type === 'back'),

    personalization: (row.personalization as Product['personalization']) ?? undefined,

    badge: row.badge ?? undefined,
    color: row.color ?? 'black',
    description: row.description ?? '',
    details: row.details ?? [],

    image: front?.url ?? '',
    gallery: sortedImages.map((i) => i.url),

    status: row.status,
    featured: row.featured,
  }
}

const PRODUCT_SELECT = `
  id, slug, name, subtitle, price, product_type, card_type, badge,
  color, description, details, personalization, status, featured,
  categories ( name ),
  product_images ( url, image_type, sort_order )
`

export async function getActiveProducts(): Promise<Product[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'active')

  if (error) throw error
  return (data as unknown as ProductRow[]).map(toProduct)
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  if (!data) return undefined
  return toProduct(data as unknown as ProductRow)
}

export async function getFeatured(): Promise<Product[]> {
  const products = await getActiveProducts()
  return products.filter((p) => p.featured)
}

export async function getRelated(slug: string): Promise<Product[]> {
  const products = await getActiveProducts()
  return products.filter((p) => p.slug !== slug).slice(0, 3)
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('categories')
    .select('name, slug, description')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data as Category[]
}
