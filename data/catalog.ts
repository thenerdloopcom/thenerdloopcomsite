export type CardType =
  | 'ready-made'
  | 'photo-personalized'

export type Product = {
  id: string
  slug: string
  name: string
  subtitle: string
  price: number

  category: string
  subcategory?: string

  productType:
    | 'standard'
    | 'access-card'

  cardType?: CardType

  /**
   * Used only for access cards.
   * When true, the card collection will automatically
   * use /cards/${slug}-back.png on hover.
   */
  hasBackView?: boolean

  /**
   * Used for photo-personalized cards.
   * Percentage-based coordinates define the photo slot
   * inside the card template.
   */
  personalization?: {
    photoFrame?: {
      left: number
      top: number
      width: number
      height: number
      radius?: number
    }
  }

  badge?: string
  color: string
  description: string
  details: string[]

  image: string
  gallery: string[]

  status: 'active' | 'draft' | 'archived'
  featured: boolean
}

export type Category = {
  name: string
  slug: string
  description?: string
  subcategories?: string[]
}

export const categories: Category[] = [
  { name: 'Masks', slug: 'masks', description: 'Handmade superhero masks, primarily Spider-Man', subcategories: ['Classic', 'Special Edition'] },
  { name: 'Posters', slug: 'posters', description: 'High quality fandom posters' },
  { name: 'Access Cards', slug: 'access-cards', description: 'Fandom access cards and IDs' },
  { name: 'Metallic Items', slug: 'metallic-items', description: 'Metallic posters, signs, and keychains', subcategories: ['Metallic Posters', 'Metallic Signs', 'Keychains'] },
]

export const products: Product[] = [
  {
    id: 'tva-001',
    slug: 'tva-access-card',
    name: 'Time Variance Authority Access Card',
    subtitle: 'Personalized TVA Credential',
    price: 39900,

    category: 'Access Cards',

    productType: 'access-card',
    cardType: 'photo-personalized',
    hasBackView: true,

    badge: 'PERSONALIZED',
    color: 'orange',

    personalization: {
      photoFrame: {
        left: 27,
        top: 43,
        width: 46,
        height: 40,
        radius: 5,
      },
    },

    image: '/cards/tva-front.png',

    gallery: [
      '/cards/tva-front.png',
      '/cards/tva-back.png',
    ],

    description:
      'A TVA-style access credential personalized with your own photo.',

    details: [
      'Premium PVC card',
      'Front + back print',
      'Personalized photo',
    ],

    status: 'active',
    featured: true,
  },
  {
    id: 'damon-001',
    slug: 'damon-salvatore-card',
    name: 'Damon Salvatore Character Card',
    subtitle: 'Collector Character Card',
    price: 29900,

    category: 'Access Cards',

    productType: 'access-card',
    cardType: 'ready-made',

    badge: 'READY-MADE',
    color: 'black',

    description:
      'A ready-to-print character card for your fandom collection.',

    details: [
      'Premium card stock',
      'Front + back print',
      'Ready-made design',
    ],

    image: '/cards/damon-front.png',
    gallery: [
      '/cards/damon-front.png',
      '/cards/damon-back.png',
    ],

    status: 'active',
    featured: true,
  },
]

export const formatPrice = (priceInPaise: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(priceInPaise / 100)
}

export const getProduct = (slug: string) => products.find((product) => product.slug === slug)
export const getFeatured = () => products.filter(p => p.featured)
export const getRelated = (slug: string) => products.filter((product) => product.slug !== slug).slice(0, 3)

export const logoImage = '/TNL-Logo-NoBG.png'
