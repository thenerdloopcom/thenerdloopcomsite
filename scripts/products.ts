export type SeedProduct = {
  slug: string
  name: string
  subtitle?: string
  description?: string

  category: string

  product_type: "standard" | "access-card"
  card_type?: "ready-made" | "photo-personalized" | null

  price: number
  compare_at_price?: number | null

  badge?: string | null
  status?: "active" | "draft" | "archived"
  featured?: boolean
  inventory_count?: number | null

  color?: string | null
  details?: string[]

  personalization?: {
    photoFrame?: {
      left: number
      top: number
      width: number
      height: number
      radius?: number
    }
  } | null

  images?: {
    url: string
    image_type?: string
    sort_order?: number
    alt_text?: string
  }[]
}

export const products: SeedProduct[] = [
  {
    slug: "arctic-monkeys-card",
    name: "Arctic Monkeys Card",
    subtitle: "Collector Character Card",
    description:
      "A ready-to-print Arctic Monkeys card for your fandom collection.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "ready-made",

    price: 29900,
    compare_at_price: null,

    badge: "READY-MADE",
    status: "active",
    featured: false,
    inventory_count: null,

    color: "black",

    details: [
      "Premium card stock",
      "Front + back print",
      "Ready-made design",
    ],

    personalization: null,

    images: [
      {
        url: "/cards/arctic-monkeys-front.png",
        image_type: "front",
        sort_order: 0,
      },
      {
        url: "/cards/arctic-monkeys-back.png",
        image_type: "back",
        sort_order: 1,
      },
    ],
  },

  {
    slug: "jjk-student-id-card",
    name: "JJK Student ID Card",
    subtitle: "Jujutsu Kaisen Student ID",
    description:
      "A ready-to-print Jujutsu Kaisen student ID card for your collection.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "ready-made",

    price: 29900,
    compare_at_price: null,

    badge: "READY-MADE",
    status: "active",
    featured: false,
    inventory_count: null,

    color: "black",

    details: [
      "Premium card stock",
      "Front + back print",
      "Ready-made design",
    ],

    personalization: null,

    images: [
      {
        url: "/cards/jjk-student-id-front.png",
        image_type: "front",
        sort_order: 0,
      },
      {
        url: "/cards/jjk-student-id-back.png",
        image_type: "back",
        sort_order: 1,
      },
    ],
  },

  {
    slug: "spiderman-card",
    name: "Spider-Man Card",
    subtitle: "Spider-Man Collector Card",
    description:
      "A ready-to-print Spider-Man card for your fandom collection.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "ready-made",

    price: 29900,
    compare_at_price: null,

    badge: "READY-MADE",
    status: "active",
    featured: false,
    inventory_count: null,

    color: "red",

    details: [
      "Premium card stock",
      "Front + back print",
      "Ready-made design",
    ],

    personalization: null,

    images: [
      {
        url: "/cards/spiderman-front.png",
        image_type: "front",
        sort_order: 0,
      },
      {
        url: "/cards/spiderman-back.png",
        image_type: "back",
        sort_order: 1,
      },
    ],
  },

  {
    slug: "tva-access-card",
    name: "TVA Access Card 101",
    subtitle: "Personalized TVA Credential",
    description:
      "A TVA-style access credential personalized with your own photo.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "photo-personalized",

    price: 39900,
    compare_at_price: null,

    badge: "CUSTOMIZE IT",
    status: "active",
    featured: true,
    inventory_count: null,

    color: "orange",

    details: [
      "Premium PVC card",
      "Front + back print",
      "Personalized photo",
    ],

    personalization: {
      photoFrame: {
        left: 27,
        top: 43,
        width: 46,
        height: 40,
        radius: 5,
      },
    },

    images: [
      {
        url: "/cards/tva-front.png",
        image_type: "front",
        sort_order: 0,
      },
      {
        url: "/cards/tva-back.png",
        image_type: "back",
        sort_order: 1,
      },
    ],
  },

  {
    slug: "dexter-card",
    name: "Dexter Card",
    subtitle: "Dexter Collector Card",
    description:
      "A ready-to-print Dexter card for your fandom collection.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "ready-made",

    price: 29900,
    compare_at_price: null,

    badge: "READY-MADE",
    status: "active",
    featured: false,
    inventory_count: null,

    color: "red",

    details: [
      "Premium card stock",
      "Front + back print",
      "Ready-made design",
    ],

    personalization: null,

    images: [
      {
        url: "/cards/dexter-front.png",
        image_type: "front",
        sort_order: 0,
      },
      {
        url: "/cards/dexter-back.png",
        image_type: "back",
        sort_order: 1,
      },
    ],
  },

  {
    slug: "oscorp-access-card",
    name: "Oscorp Access Card",
    subtitle: "Oscorp Employee Access Card",
    description:
      "A ready-to-print Oscorp access card for your collection.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "ready-made",

    price: 29900,
    compare_at_price: null,

    badge: "READY-MADE",
    status: "active",
    featured: false,
    inventory_count: null,

    color: "green",

    details: [
      "Premium card stock",
      "Front + back print",
      "Ready-made design",
    ],

    personalization: null,

    images: [
      {
        url: "/cards/oscorp-front.png",
        image_type: "front",
        sort_order: 0,
      },
      {
        url: "/cards/oscorp-back.png",
        image_type: "back",
        sort_order: 1,
      },
    ],
  },

  {
    slug: "fight-club-card",
    name: "Fight Club Card",
    subtitle: "Fight Club Collector Card",
    description:
      "A ready-to-print Fight Club card for your collection.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "ready-made",

    price: 29900,
    compare_at_price: null,

    badge: "READY-MADE",
    status: "active",
    featured: false,
    inventory_count: null,

    color: "black",

    details: [
      "Premium card stock",
      "Front + back print",
      "Ready-made design",
    ],

    personalization: null,

    images: [
      {
        url: "/cards/fight-club-front.png",
        image_type: "front",
        sort_order: 0,
      },
      {
        url: "/cards/fight-club-back.png",
        image_type: "back",
        sort_order: 1,
      },
    ],
  },

  {
    slug: "supernatural-card",
    name: "Supernatural Card",
    subtitle: "Supernatural Collector Card",
    description:
      "A ready-to-print Supernatural card for your fandom collection.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "ready-made",

    price: 29900,
    compare_at_price: null,

    badge: "READY-MADE",
    status: "active",
    featured: false,
    inventory_count: null,

    color: "black",

    details: [
      "Premium card stock",
      "Front + back print",
      "Ready-made design",
    ],

    personalization: null,

    images: [
      {
        url: "/cards/supernatural-front.png",
        image_type: "front",
        sort_order: 0,
      },
      {
        url: "/cards/supernatural-back.png",
        image_type: "back",
        sort_order: 1,
      },
    ],
  },

  {
    slug: "supernatural-2-card",
    name: "Supernatural 2.0 Card",
    subtitle: "Supernatural 2.0 Collector Card",
    description:
      "A ready-to-print Supernatural 2.0 card for your fandom collection.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "ready-made",

    price: 29900,
    compare_at_price: null,

    badge: "READY-MADE",
    status: "active",
    featured: false,
    inventory_count: null,

    color: "black",

    details: [
      "Premium card stock",
      "Front + back print",
      "Ready-made design",
    ],

    personalization: null,

    images: [
      {
        url: "/cards/supernatural-2.0-front.png",
        image_type: "front",
        sort_order: 0,
      },
      {
        url: "/cards/supernatural-2.0-back.png",
        image_type: "back",
        sort_order: 1,
      },
    ],
  },

  {
    slug: "tvd-damon-card",
    name: "Damon Salvatore Character Card",
    subtitle: "Collector Character Card",
    description:
      "A ready-to-print character card for your fandom collection.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "ready-made",

    price: 29900,
    compare_at_price: null,

    badge: "",
    status: "active",
    featured: true,
    inventory_count: null,

    color: "black",

    details: [
      "Premium card stock",
      "Front + back print",
      "Ready-made design",
    ],

    personalization: null,

    images: [
      {
        url: "/cards/tvd-damon-front.png",
        image_type: "front",
        sort_order: 0,
      },
      {
        url: "/cards/tvd-damon-back.png",
        image_type: "back",
        sort_order: 1,
      },
    ],
  },

  {
    slug: "relaxed-mario",
    name: "Relaxed Mario",
    subtitle: "Mario Collector Card",
    description:
      "A ready-to-print Mario card for your collection.",

    category: "access-cards",

    product_type: "access-card",
    card_type: "ready-made",

    price: 29900,
    compare_at_price: null,

    badge: "READY-MADE",
    status: "active",
    featured: false,
    inventory_count: null,

    color: "red",

    details: [
      "Premium card stock",
      "Ready-made design",
    ],

    personalization: null,

    images: [
      {
        url: "/cards/relaxed_mario.png",
        image_type: "gallery",
        sort_order: 0,
      },
    ],
  },
]