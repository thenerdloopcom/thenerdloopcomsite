'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  ImagePlus,
  X,
} from 'lucide-react'

import {
  formatPrice,
  type Product,
} from '@/data/catalog'

import { useCart } from './cart-provider'

export function CardPersonalizePage({
  product,
}: {
  product: Product
}) {
  const { addItem } = useCart()

  const [file, setFile] = useState<File | null>(
    null,
  )

  const [preview, setPreview] =
    useState<string>('')

  const [instructions, setInstructions] =
    useState('')

  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }

    const url =
      URL.createObjectURL(file)

    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  const submit = (
    event: React.FormEvent,
  ) => {
    event.preventDefault()

    if (!file) return

    addItem(product, 1, {
      type: 'photo-personalized',
      imagePreviewUrl: preview,
      instructions:
        instructions.trim() || undefined,
    })
  }

  return (
    <main className="route-page">
      <section className="card-customization-page">
        <Link
          href="/access-cards"
          className="text-link"
        >
          <ArrowLeft size={15} />
          BACK TO ACCESS CARDS
        </Link>

        <div className="card-customization-layout">
          <div className="card-template-preview">
            <p className="eyebrow">
              TEMPLATE PREVIEW
            </p>

            <div className="personalized-card-preview">
              {/* Actual card template */}
              <img
                  className="personalized-card-template"
                  src={product.image}
                  alt={`${product.name} template`}
              />
            </div>

            <p className="card-preview-note">
              Your uploaded image will replace the
              photo area in the final printed card.
            </p>
          </div>

          <div className="card-customization-form">
            <p className="eyebrow">
              PHOTO PERSONALIZED
            </p>

            <h1>
              PERSONALIZE
              <span> YOUR CARD.</span>
            </h1>

            <p className="card-form-intro">
              Use our existing card template and
              replace the photo with your own.
            </p>

            <form onSubmit={submit}>
              <div className="upload-section">
                <label>
                  YOUR PHOTO
                </label>

                {!preview ? (
                  <label className="upload-dropzone">
                    <ImagePlus size={28} />

                    <strong>
                      UPLOAD PHOTO
                    </strong>

                    <span>
                      JPG / PNG / WEBP
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        setFile(
                          event.target.files?.[0] ??
                            null,
                        )
                      }
                    />
                  </label>
                ) : (
                  <div className="upload-preview">
                    <img
                      src={preview}
                      alt="Uploaded photo preview"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setPreview('')
                      }}
                    >
                      <X size={15} />
                      CHANGE PHOTO
                    </button>
                  </div>
                )}
              </div>

              <div className="instruction-section">
                <label htmlFor="instructions">
                  SPECIAL INSTRUCTIONS
                  <span>
                    OPTIONAL
                  </span>
                </label>

                <textarea
                  id="instructions"
                  value={instructions}
                  onChange={(event) =>
                    setInstructions(
                      event.target.value,
                    )
                  }
                  placeholder="Anything we should know before printing..."
                  rows={5}
                />
              </div>

              <div className="customization-submit">
                <div>
                  <span>
                    TOTAL
                  </span>

                  <strong>
                    {formatPrice(product.price)}
                  </strong>
                </div>

                <button
                  type="submit"
                  disabled={!file}
                  className="checkout-button"
                >
                  ADD TO BAG
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}