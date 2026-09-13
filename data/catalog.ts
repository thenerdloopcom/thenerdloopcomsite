export type Product = {
  id: string
  slug: string
  name: string
  subtitle: string
  price: number // in paise
  category: string
  subcategory?: string
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
    id: '1',
    slug: 'spiderman-classic-mask',
    name: 'Classic Spider-Man Mask',
    subtitle: 'Handmade Fabric Mask',
    price: 149900,
    category: 'Masks',
    subcategory: 'Classic',
    badge: 'WIP',
    color: 'red',
    description: 'A hand-finished Spider-Man mask for your friendly neighborhood rotation. (WIP)',
    details: ['Premium fabric', 'Adjustable fit', 'Hand-stitched details'],
    image: '/tnl-masks.png',
    gallery: ['/tnl-masks.png'],
    status: 'active',
    featured: true
  },
  {
    id: '2',
    slug: 'avengers-poster',
    name: 'Avengers Assemble Poster',
    subtitle: 'High Quality Print',
    price: 49900,
    category: 'Posters',
    color: 'blue',
    description: 'High quality gloss finish poster featuring the original Avengers.',
    details: ['A3 Size', '300 GSM Paper', 'Glossy Finish'],
    image: '/placeholder.jpg',
    gallery: ['/placeholder.jpg'],
    status: 'active',
    featured: true
  },
  {
    id: '3',
    slug: 'stark-industries-id',
    name: 'Stark Industries Access Card',
    subtitle: 'Fandom ID Card',
    price: 29900,
    category: 'Access Cards',
    color: 'black',
    description: 'Official-looking Stark Industries employee access card.',
    details: ['PVC Card', 'High Quality Print', 'Authentic Design'],
    image: '/placeholder.jpg',
    gallery: ['/placeholder.jpg'],
    status: 'active',
    featured: true
  },
  {
    id: '4',
    slug: 'iron-man-metallic-poster',
    name: 'Iron Man Metallic Poster',
    subtitle: 'Premium Metal Print',
    price: 199900,
    category: 'Metallic Items',
    subcategory: 'Metallic Posters',
    color: 'red',
    description: 'Premium metallic poster with vibrant colors and durable finish.',
    details: ['Rust-proof Metal', 'Vibrant Colors', 'Easy to Mount'],
    image: '/placeholder.jpg',
    gallery: ['/placeholder.jpg'],
    status: 'active',
    featured: true
  },
  {
    id: '5',
    slug: 'batman-metallic-sign',
    name: 'Wayne Manor Metallic Sign',
    subtitle: 'Vintage Style Sign',
    price: 89900,
    category: 'Metallic Items',
    subcategory: 'Metallic Signs',
    color: 'black',
    description: 'Vintage style metallic sign for Wayne Manor.',
    details: ['Embossed Metal', 'Vintage Finish', 'Pre-drilled Holes'],
    image: '/placeholder.jpg',
    gallery: ['/placeholder.jpg'],
    status: 'active',
    featured: false
  },
  {
    id: '6',
    slug: 'shield-keychain',
    name: 'S.H.I.E.L.D. Metallic Keychain',
    subtitle: 'Premium Zinc Alloy',
    price: 19900,
    category: 'Metallic Items',
    subcategory: 'Keychains',
    color: 'blue',
    description: 'High quality metallic keychain with the S.H.I.E.L.D. logo.',
    details: ['Zinc Alloy', 'Enamel Finish', 'Durable Ring'],
    image: '/placeholder.jpg',
    gallery: ['/placeholder.jpg'],
    status: 'active',
    featured: false
  }
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

export const logoImage = '/placeholder-logo.png'
