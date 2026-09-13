# TheNerdLoop

## 1. Project overview

TheNerdLoop is an India-first D2C fandom merchandise storefront.

The initial catalog is intentionally small and may include:

- Handmade superhero masks
- Posters
- Fandom access cards / IDs
- Metallic posters and sign boards
- Other fandom-focused objects

The application is intentionally a **thin commerce layer**. We own the storefront experience and the business state; commodity infrastructure should be delegated to managed services.

### Current product goals

The MVP should allow a customer to:

1. Browse products.
2. Add products to a persistent cart.
3. Go through a dedicated checkout page.
4. Enter customer/shipping details.
5. Eventually pay through Razorpay.
6. Receive an order.
7. Eventually see fulfillment/tracking status end-to-end.

The current checkout/payment/shipping implementations are placeholders. Supabase and file storage are the next backend phase.

---

# 2. Core architecture principles

Do not turn this into a Shopify clone.

### Our application owns

- Product catalog
- Product behavior/type
- Pricing
- Cart UX
- Inventory/business rules
- Orders
- Order state
- Customer order experience
- Admin workflow

### Managed services should own

- PostgreSQL hosting
- Authentication
- Object/file storage
- Payment processing
- Courier/shipping integrations
- Transactional email
- Analytics
- Error monitoring

### Recommended target stack

```text
Next.js + TypeScript
        |
        +-- Supabase
        |     +-- PostgreSQL
        |     +-- Auth
        |
        +-- Cloudflare R2
        |     +-- customer-uploaded files
        |
        +-- Razorpay
        |     +-- payments
        |
        +-- Shipping aggregator
        |
        +-- Vercel
              +-- hosting
```

AWS S3 is not required at the current stage. Cloudflare R2 is the preferred object storage direction for customer-uploaded card photos because it is S3-compatible and has a generous free tier. Re-evaluate storage pricing/requirements before production.

---

# 3. Current repository structure

```text
app/
├── about/
├── account/
├── api/
│   └── checkout/
├── checkout/
├── contact/
├── privacy/
├── products/
│   └── [slug]/
├── returns/
├── shipping/
├── shop/
├── terms/
├── wishlist/
├── globals.css
├── layout.tsx
├── page.tsx
└── providers.tsx

components/
└── storefront/
    ├── cart-drawer.tsx
    ├── cart-provider.tsx
    ├── checkout-page.tsx
    ├── product-detail.tsx
    ├── shop-page.tsx
    ├── simple-info-page.tsx
    ├── site-footer.tsx
    ├── site-header.tsx
    ├── storefront.tsx
    ├── wishlist-page.tsx
    └── wishlist-provider.tsx

data/
└── catalog.ts

lib/
├── api/
│   └── checkout.ts
└── providers/
    ├── razorpay.ts
    └── shipping.ts

public/
└── product/logo assets

```

---

# 4. Global layout

`app/layout.tsx` owns the site-wide chrome.

The structure should remain:

```tsx
<Providers>
  <SiteHeader />
  <CartDrawer />

  {children}

  <SiteFooter />
</Providers>
```

This means:

- `Storefront` must NOT render another navbar.
- `Storefront` must NOT render another footer.
- Individual routes should normally NOT render another navbar/footer.
- `CartDrawer` should exist once globally.

If duplicate navigation/footer appears, first check for another `header`, `SiteHeader`, `footer`, `SiteFooter`, or old route-layout component.

The old `simple-route-page.tsx` pattern should not be reintroduced because it duplicates global layout concerns.

---

# 5. Global state

`app/providers.tsx` currently provides:

```text
CartProvider
  └── WishlistProvider
```

The cart is intentionally client-side for the MVP and persisted using `localStorage`.

Current cart storage key:

```text
tnl-cart-v2
```

Do not introduce a database-backed persistent cart unless there is a real product requirement for it.

The important distinction is:

```text
Cart = temporary customer intent

Order = permanent commerce record
```

At checkout, the server must become the source of truth for product/price/stock validation.

---

# 6. Cart model

Cart lines must have their own IDs.

Do NOT identify a cart item only by product ID.

Reason:

A customer can have two personalized copies of the same card with different uploaded photos.

The intended shape is:

```ts
type CartItem = {
  id: string
  product: Product
  quantity: number

  customization?: {
    type: 'photo-personalized'

    name?: string

    imageStorageKey?: string
    imagePreviewUrl?: string

    instructions?: string
  }
}
```

For ready-made products:

```text
customization = undefined
```

For personalized cards:

```text
customization = {
  type: 'photo-personalized',
  ...
}
```

Ready-made identical products may be merged into one cart line.

Personalized products should normally remain separate cart lines because each line may contain a different customer photo/information set.

---

# 7. Access Cards are a first-class product experience

Access Cards are important enough to have their own collection page and specialized product behavior.

Primary collection route:

```text
/access-cards
```

The navbar should link Access Cards to this route rather than treating them as just another generic `/shop?category=...` filter.

## There are TWO access-card product types

### 1. Ready-made

The card is already designed and is printed exactly as shown.

Customer flow:

```text
Access Cards
    ↓
Card
    ↓
Add to Bag
    ↓
Checkout
```

No customer photo.
No customization form.
No special instructions.

Example:

```text
A character/fandom card
```

TVA/Damon are examples only. They are NOT special cases and must never be hardcoded into the implementation.

### 2. Photo-personalized

The card uses an existing template but has a customer-specific photo inserted into it.

Customer flow:

```text
Access Cards
    ↓
Card
    ↓
Personalize
    ↓
Upload photo
    ↓
Optional instructions
    ↓
Add to Bag
    ↓
Checkout
```

Example:

```text
A TVA-style identity/access card
```

Again, TVA is only an example. There may be many photo-personalized card products later.

---

# 8. There is currently NO fully-custom card product

Do not implement or retain a `fully-custom` card flow.

There should NOT be:

```text
/products/[slug]/customize
```

for access cards at this stage.

There should NOT be a:

```ts
cardType: 'fully-custom'
```

variant.

There should NOT be:

- A generic custom-design request flow
- A mandatory design-instructions workflow for a fully custom card
- A `CardCustomizePage` component

If such files/components have already been created, delete them unless another feature uses them.

The current supported card behavior is ONLY:

```ts
type CardType =
  | 'ready-made'
  | 'photo-personalized'
```

---

# 9. Product model

The static catalog currently lives in:

```text
data/catalog.ts
```

The desired model is:

```ts
export type CardType =
  | 'ready-made'
  | 'photo-personalized'

export type Product = {
  id: string
  slug: string
  name: string
  subtitle: string
  price: number // paise

  category: string
  subcategory?: string

  productType:
    | 'standard'
    | 'access-card'

  cardType?: CardType

  badge?: string

  color: string
  description: string
  details: string[]

  image: string
  gallery: string[]

  status:
    | 'active'
    | 'draft'
    | 'archived'

  featured: boolean
}
```

The important architectural rule:

> Product behavior is data-driven. Never write product-specific conditionals such as `if product.name === "TVA..."`.

Use:

```ts
product.productType
product.cardType
```

instead.

This allows the catalog to grow without creating new components or routes for every fandom/character.

---

# 10. Adding new Access Cards

To add a ready-made card:

```ts
{
  id: 'some-id',
  slug: 'some-character-card',
  name: 'Some Character Card',
  subtitle: 'Collector Character Card',
  price: 29900,

  category: 'Access Cards',

  productType: 'access-card',
  cardType: 'ready-made',

  badge: 'READY-MADE',

  color: 'black',

  description: '...',
  details: [
    'Premium card',
    'Front + back print'
  ],

  image: '/cards/some-card-front.png',
  gallery: [
    '/cards/some-card-front.png',
    '/cards/some-card-back.png'
  ],

  status: 'active',
  featured: false
}
```

To add a photo-personalized card:

```ts
{
  id: 'some-id',
  slug: 'some-personalized-card',
  name: 'Some Personalized Access Card',
  subtitle: 'Personalized Credential',
  price: 39900,

  category: 'Access Cards',

  productType: 'access-card',
  cardType: 'photo-personalized',

  badge: 'PERSONALIZED',

  color: 'orange',

  description: '...',
  details: [
    'Premium card',
    'Front + back print',
    'Personalized photo'
  ],

  image: '/cards/some-card-front.png',
  gallery: [
    '/cards/some-card-front.png',
    '/cards/some-card-back.png'
  ],

  status: 'active',
  featured: false
}
```

No React changes should be necessary for additional cards of either type.

---

# 11. Access Card UI

The Access Cards collection should list all cards together.

Each card should communicate its purchase flow through the CTA.

### Ready-made

```text
READY-MADE

Card Name
Subtitle
₹299

[ ADD TO BAG ]
```

### Photo-personalized

```text
PHOTO PERSONALIZED

Card Name
Subtitle
₹399

[ PERSONALIZE ]
```

The goal is to make the difference obvious before the customer opens the product.

---

# 12. Photo-personalized card UI

Route:

```text
/products/[slug]/personalize
```

This is generic and works for every `cardType === 'photo-personalized'` product.

The page should provide:

```text
Back to Access Cards

PERSONALIZE YOUR CARD.

Template preview

YOUR PHOTO
[ Upload Photo ]

Optional instructions
[ Anything we should know... ]

[ ADD TO BAG ]
```

The uploaded photo should be previewed locally before submission.

The customer should understand that their uploaded photo replaces the photo area of the predefined template.

Do not build a full browser design editor yet.

---

# 13. Ready-made card UI

Ready-made cards should use the existing generic product detail experience.

Route:

```text
/products/[slug]
```

The product detail page should show:

- Gallery
- Product name
- Description
- Price
- Quantity
- Add to Bag

No upload step.

No personalization step.

---

# 14. Card assets

Card-specific artwork should live under:

```text
public/cards/
```

Recommended pattern:

```text
public/cards/
├── <slug>-front.png
├── <slug>-back.png
```

Examples are only naming patterns. Do not hardcode character names in the implementation.

The current product catalog supports multiple gallery images, so front/back cards can use:

```ts
gallery: [
  '/cards/<slug>-front.png',
  '/cards/<slug>-back.png'
]
```

---

# 15. Important current limitation: uploads

The personalized-card UI may currently use a browser object URL for preview.

Example:

```text
File
 ↓
URL.createObjectURL()
 ↓
Preview
```

This is only a temporary UI mechanism.

Do NOT treat `imagePreviewUrl` as permanent order data.

The production flow should become:

```text
Customer selects file
        ↓
Next.js backend requests/presigns upload
        ↓
Browser uploads directly to object storage
        ↓
Storage key returned
        ↓
Cart contains storage key
        ↓
Checkout
        ↓
Order item customization stores storage key
```

---

# 16. Future database model

When Supabase is introduced, the core schema should be approximately:

```text
users
products
product_variants
product_images
addresses

orders
order_items
order_item_customizations

payments
shipments
order_events
```

The important card-specific relationship:

```text
products
   |
   | defines product behavior
   |
   v
order_items
   |
   +-- product snapshot
   +-- price snapshot
   +-- quantity
   |
   +-- order_item_customizations
          |
          +-- type
          +-- customer name
          +-- uploaded file storage key
          +-- instructions
```

Customization belongs to the order item because it is order-specific data.

Do not put a customer's photo/name/instructions directly on the `products` table.

---

# 17. Future `order_item_customizations`

Intended direction:

```sql
create table order_item_customizations (
  id uuid primary key default gen_random_uuid(),

  order_item_id uuid not null
    references order_items(id)
    on delete cascade,

  customization_type text not null,

  customer_name text,
  image_storage_key text,
  image_original_name text,
  instructions text,

  created_at timestamptz not null default now()
);
```

For the currently supported personalized card workflow:

```text
customization_type = photo-personalized
```

Ready-made items have no customization record.

---

# 18. Supabase

Supabase is the intended application/data platform.

Use it for:

```text
PostgreSQL
Auth
Row Level Security
```

Eventually:

```text
Static catalog
      ↓
Supabase products
      ↓
Supabase variants
      ↓
Supabase orders
```

Do not wire individual UI components directly to ad-hoc Supabase queries everywhere.

Keep database access behind reusable server-side functions/modules.

---

# 19. Authentication

Supabase Auth will eventually provide:

- Login
- Signup
- Session management
- Customer account
- Order history

The current `/account` page is intentionally only a UI placeholder.

Guest checkout should remain supported.

Do not force login before checkout.

---

# 20. File storage

Preferred direction:

```text
Supabase
  └── data/auth

Cloudflare R2
  └── customer-uploaded files
```

Customer photos should remain private.

Store only a storage key/reference in Postgres, not a binary file/blob.

Recommended object naming pattern:

```text
custom-card/
  <random-id>/
    <random-file>.jpg
```

Never construct storage paths from customer names or other predictable identifiers.

Eventually use signed URLs for authenticated viewing/downloads.

---

# 21. Checkout architecture

Current checkout is a placeholder.

Future intended flow:

```text
Cart
  ↓
POST /api/checkout
  ↓
Server validates products
  ↓
Server validates stock
  ↓
Server calculates price
  ↓
Server creates order
  ↓
Server creates Razorpay order
  ↓
Browser opens Razorpay
  ↓
Razorpay webhook
  ↓
Server verifies payment
  ↓
Order marked paid
```

Never trust client-provided totals.

Never mark an order paid merely because the browser says payment succeeded.

---

# 22. Payment provider

Current file:

```text
lib/providers/razorpay.ts
```

is a placeholder abstraction.

Keep payment-provider-specific logic isolated there.

The rest of the application should deal with a provider abstraction rather than hardcoding Razorpay API calls throughout the codebase.

Eventually support:

```ts
interface PaymentProvider {
  createPayment(...)
  verifyPayment(...)
  refund(...)
}
```

---

# 23. Shipping provider

Current file:

```text
lib/providers/shipping.ts
```

is also a placeholder.

Shipping should eventually be handled through a shipping aggregator rather than implementing separate courier integrations in the application.

Conceptually:

```text
Order
 ↓
ShippingProvider
 ↓
Aggregator
 ↓
Courier
 ↓
AWB / tracking
 ↓
Shipping webhook
 ↓
Order event
```

Keep the provider implementation isolated.

---

# 24. Order status

Payment and fulfillment should remain separate.

### Payment

```text
pending
paid
failed
refunded
partially_refunded
```

### Fulfillment

```text
unfulfilled
processing
packed
shipped
delivered
cancelled
```

Order history should also have immutable events such as:

```text
ORDER_PLACED
PAYMENT_CONFIRMED
ORDER_PROCESSING
ORDER_PACKED
ORDER_SHIPPED
OUT_FOR_DELIVERY
ORDER_DELIVERED
ORDER_CANCELLED
REFUND_ISSUED
```

---

# 25. Order events

The `order_events` table will eventually power the customer timeline.

Example:

```text
Order placed
      ↓
Payment confirmed
      ↓
Processing
      ↓
Packed
      ↓
Shipped
      ↓
Out for delivery
      ↓
Delivered
```

Provider webhooks should be translated into our own normalized event/status model.

---

# 26. API surface

Initial target API surface:

```text
GET  /api/products
GET  /api/products/:slug

POST /api/checkout

POST /api/payments/verify
POST /api/webhooks/razorpay

GET  /api/orders
GET  /api/orders/:id

POST /api/uploads/presign

GET  /api/shipments/:id
POST /api/webhooks/shipping
```

Admin endpoints will be added later:

```text
GET   /api/admin/orders
GET   /api/admin/orders/:id

PATCH /api/admin/orders/:id

POST  /api/admin/orders/:id/ship

POST  /api/admin/products
PATCH /api/admin/products/:id
```

All admin mutations must be server-authorized.

---

# 27. Shop architecture

The general shop route is:

```text
/shop
```

It supports query-string driven filtering/pagination:

```text
/shop
/shop?category=Masks
/shop?category=Metallic%20Items
/shop?q=spiderman
/shop?page=2
```

Access Cards have their own focused route:

```text
/access-cards
```

Do not create character-specific collection routes unless there is a real merchandising reason.

---

# 28. Design language

The design should remain consistent with the current comic-book editorial aesthetic.

Core palette:

```text
Yellow  #FFE900
Black   #050505
Blue    #303CFF
Red     #F52222
White   #FFFFFF
Purple  #8B3DFF (secondary accent)
Orange  #FF6A00 (useful for card artwork/content)
```

Use these intentionally:

```text
Black  → structure, borders, typography
White  → primary paper/background
Yellow → primary accent, selected/hover states, stickers
Blue   → large graphic blocks
Red    → strong CTA / impact
Purple → secondary accent
Orange → card-specific artwork/accent where appropriate
```

Do not turn every section into a different saturated color. The palette should feel like a comic print system.

---

# 29. CSS conventions

Current styling is a combination of:

- Custom CSS in `app/globals.css`
- Tailwind utility classes for small layout adjustments

Continue using the existing design system instead of introducing a second visual system.

Existing important classes include:

```text
site-header
hero
hero-copy
hero-art
manifesto
shop-section
section-heading
filter-row
product-grid
product-card
product-art
product-detail
story-strip
newsletter
checkout-button
comic-button
cart-drawer
```

Before creating a new component style, check whether an existing class can be reused.

---

# 30. Coding guidelines

### Prefer data-driven behavior

Good:

```ts
if (product.cardType === 'photo-personalized') {
  ...
}
```

Bad:

```ts
if (product.name === 'Time Variance Authority Access Card') {
  ...
}
```

### Keep provider-specific logic isolated

Good:

```text
lib/providers/razorpay.ts
lib/providers/shipping.ts
```

Bad:

```text
Razorpay logic scattered throughout components
```

### Keep business logic outside visual components

Good:

```text
components/
lib/orders/
lib/payments/
lib/shipping/
```

Components should mostly own presentation and interaction.

### Avoid unnecessary infrastructure

Do not introduce:

- Microservices
- Kubernetes
- Redis
- Elasticsearch
- Custom auth servers
- Custom payment infrastructure
- Direct integrations with every courier
- ERP/WMS
- Complex inventory reservation
- Recommendation engines

unless the business actually requires them.

---

# 31. Important product/business rule

The site sells fandom-inspired/fan-made objects.

Do not assume a product is officially licensed merely because its design resembles a known franchise.

Product copy and metadata should accurately reflect what is actually being sold and its licensing status.

---

# 32. Before adding new features

Ask:

1. Does this solve a real customer/business problem?
2. Can a managed service handle it?
3. Can it be represented as product/order data instead of a hardcoded special case?
4. Does it introduce another permanent piece of infrastructure?
5. Can it be added without breaking the current thin commerce architecture?

Prefer the simplest design that works.

---

# 33. Current phase / next phase

## Current phase

The storefront is still backed by a local/static catalog.

Payment and shipping are placeholders.

Customer authentication is a placeholder.

The cart is localStorage-based.

The immediate focus is validating the storefront UX, especially Access Cards.

## Next backend phase

Implement:

```text
1. Supabase project
2. Database schema
3. RLS policies
4. Supabase Auth
5. Replace static product reads with Supabase
6. R2 private bucket
7. Presigned uploads
8. Persist personalized-card customization
9. Persist orders
10. Razorpay integration
11. Shipping integration
12. Webhooks
13. Customer order history/tracking
```

Do these incrementally. Avoid replacing the entire frontend at once.

---

# 34. Access Card implementation checklist

Before considering the Access Card work complete:

```text
[ ] /access-cards exists
[ ] All access cards appear in one collection
[ ] Ready-made cards show ADD TO BAG
[ ] Photo-personalized cards show PERSONALIZE
[ ] Ready-made cards open generic product detail
[ ] Photo-personalized cards open /personalize
[ ] Photo upload has local preview
[ ] Photo can be replaced
[ ] Instructions are optional for personalized cards
[ ] Personalized card can be added to cart
[ ] Personalized cart lines have unique IDs
[ ] Two personalized copies can coexist in cart
[ ] Cart displays that a card is personalized
[ ] No fully-custom card flow exists
[ ] No character-specific hardcoded UI exists
[ ] Adding another card only requires product data/assets
```

---

# 35. Git workflow

Use feature branches.

Current recommended branch for the Access Card UI work:

```bash
feature/access-card-experience
```

Suggested commit:

```bash
feat: add data-driven access card experience and personalized card flow
```

Keep commits focused enough that individual feature work can be reverted or reviewed independently.

---

# 36. One-sentence architectural summary

> TheNerdLoop is a small, data-driven Next.js commerce storefront where products define their behavior, global state handles temporary cart/wishlist UX, Supabase will own durable commerce/auth data, R2 will own private customer uploads, and external providers will handle payments and shipping.
