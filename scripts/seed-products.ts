import { createClient } from "@supabase/supabase-js"
import { products } from "./products"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  )
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey
)

async function main() {
  console.log(`Found ${products.length} products in catalog.\n`)

  // ------------------------------------------------------------
  // 1. Resolve category slugs → category UUIDs
  // ------------------------------------------------------------

  const categorySlugs = [
    ...new Set(products.map((product) => product.category)),
  ]

  const { data: categories, error: categoryError } =
    await supabase
      .from("categories")
      .select("id, slug")
      .in("slug", categorySlugs)

  if (categoryError) {
    throw new Error(
      `Failed to fetch categories: ${categoryError.message}`
    )
  }

  if (!categories) {
    throw new Error("No categories returned from Supabase")
  }

  const categoryMap = new Map(
    categories.map((category) => [
      category.slug,
      category.id,
    ])
  )

  // ------------------------------------------------------------
  // 2. Verify every category exists
  // ------------------------------------------------------------

  for (const product of products) {
    if (!categoryMap.has(product.category)) {
      throw new Error(
        `Category "${product.category}" does not exist in Supabase`
      )
    }
  }

  // ------------------------------------------------------------
  // 3. Check which product slugs already exist
  // ------------------------------------------------------------

  const slugs = products.map((product) => product.slug)

  const { data: existingProducts, error: existingError } =
    await supabase
      .from("products")
      .select("slug")
      .in("slug", slugs)

  if (existingError) {
    throw new Error(
      `Failed to check existing products: ${existingError.message}`
    )
  }

  const existingSlugs = new Set(
    existingProducts?.map((product) => product.slug) ?? []
  )

  // ------------------------------------------------------------
  // 4. Skip products that already exist
  // ------------------------------------------------------------

  const productsToCreate = products.filter(
    (product) => !existingSlugs.has(product.slug)
  )

  if (productsToCreate.length === 0) {
    console.log("All products already exist. Nothing to create.")
    return
  }

  console.log(
    `Creating ${productsToCreate.length} new products...`
  )

  if (existingSlugs.size > 0) {
    console.log(
      `Skipping ${existingSlugs.size} existing product(s):`
    )

    for (const slug of existingSlugs) {
      console.log(`  - ${slug}`)
    }

    console.log()
  }

  // ------------------------------------------------------------
  // 5. Convert category slug → category_id
  // ------------------------------------------------------------

  const payload = productsToCreate.map(
    ({ category, ...product }) => ({
      ...product,
      category_id: categoryMap.get(category),
    })
  )

  // ------------------------------------------------------------
  // 6. Call bulk RPC
  // ------------------------------------------------------------

  const { data, error } = await supabase.rpc(
    "create_products",
    {
      p_products: payload,
    }
  )

  if (error) {
    throw new Error(
      `Failed to create products: ${error.message}`
    )
  }

  // ------------------------------------------------------------
  // 7. Print results
  // ------------------------------------------------------------

  console.log("\nCreated products:\n")

  for (const product of data) {
    console.log(
      `${product.id}  ${product.slug}  ${product.name}`
    )
  }

  console.log(
    `\nSuccessfully created ${data.length} product(s).`
  )
}

main().catch((error) => {
  console.error("\n❌ Seed failed:")
  console.error(error)
  process.exit(1)
})
// command to run this script: pnpm exec tsx scripts/seed-products.ts (if missing tsx, install it using: pnpm add -D tsx)