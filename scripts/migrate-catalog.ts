/**
 * One-off migration: reads your existing data/catalog.ts arrays and
 * inserts them into Supabase (categories -> products -> product_images).
 *
 * Run once with:
 *   npx tsx scripts/migrate-catalog.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in
 * your environment (e.g. `dotenv -e .env.local -- npx tsx scripts/migrate-catalog.ts`).
 */
import { createClient } from '@supabase/supabase-js'
import { categories, products } from '../data/catalog'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
}

const supabase = createClient(supabaseUrl, serviceKey)

function slugifySubcategory(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function migrateCategories() {
  const categorySlugToId = new Map<string, string>()

  for (const [index, category] of categories.entries()) {
    const { data: parent, error: parentError } = await supabase
      .from('categories')
      .upsert(
        {
          name: category.name,
          slug: category.slug,
          description: category.description ?? null,
          sort_order: index,
          active: true,
        },
        { onConflict: 'slug' },
      )
      .select()
      .single()

    if (parentError || !parent) throw parentError ?? new Error('Failed to upsert category')
    categorySlugToId.set(category.slug, parent.id)

    for (const [subIndex, subName] of (category.subcategories ?? []).entries()) {
      const subSlug = `${category.slug}-${slugifySubcategory(subName)}`
      const { data: sub, error: subError } = await supabase
        .from('categories')
        .upsert(
          {
            name: subName,
            slug: subSlug,
            parent_id: parent.id,
            sort_order: subIndex,
            active: true,
          },
          { onConflict: 'slug' },
        )
        .select()
        .single()

      if (subError || !sub) throw subError ?? new Error('Failed to upsert subcategory')
      categorySlugToId.set(subSlug, sub.id)
    }
  }

  return categorySlugToId
}

async function migrateProducts(categorySlugToId: Map<string, string>) {
  for (const product of products) {
    const matchingCategory = categories.find((c) => c.name === product.category)
    const categoryId = matchingCategory ? categorySlugToId.get(matchingCategory.slug) : undefined

    const { data: row, error } = await supabase
      .from('products')
      .upsert(
        {
          slug: product.slug,
          name: product.name,
          subtitle: product.subtitle,
          description: product.description,
          category_id: categoryId ?? null,
          product_type: product.productType,
          card_type: product.cardType ?? null,
          price: product.price,
          badge: product.badge ?? null,
          color: product.color,
          details: product.details,
          personalization: product.personalization ?? null,
          status: product.status,
          featured: product.featured,
        },
        { onConflict: 'slug' },
      )
      .select()
      .single()

    if (error || !row) throw error ?? new Error(`Failed to upsert product ${product.slug}`)

    // Replace this product's images (simplest correct approach for a
    // one-off migration script — safe to run repeatedly).
    await supabase.from('product_images').delete().eq('product_id', row.id)

    const imagesToInsert = product.gallery.map((url, index) => ({
      product_id: row.id,
      url,
      image_type: url.includes('-back') ? 'back' : index === 0 ? 'front' : 'gallery',
      sort_order: index,
    }))

    if (imagesToInsert.length > 0) {
      const { error: imagesError } = await supabase.from('product_images').insert(imagesToInsert)
      if (imagesError) throw imagesError
    }

    console.log(`Migrated product: ${product.slug}`)
  }
}

async function main() {
  console.log('Migrating categories...')
  const categorySlugToId = await migrateCategories()

  console.log('Migrating products...')
  await migrateProducts(categorySlugToId)

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
