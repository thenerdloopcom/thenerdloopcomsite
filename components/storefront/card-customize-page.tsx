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

export function CardCustomizePage({
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

  const [name, setName] =
    useState('')

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

  const [uploading, setUploading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!file || !name.trim() || !instructions.trim()) {
      return
    }

    setUploading(true)
    try {
      const presignRes = await fetch('/api/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      })
      const { uploadId, uploadUrl } = await presignRes.json()
      if (!presignRes.ok) throw new Error('Upload failed')

      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      await fetch('/api/uploads/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
      })

      addItem(product, 1, {
        type: 'fully-custom',
        name: name.trim(),
        imageStorageKey: uploadId,
        imagePreviewUrl: preview,
        instructions: instructions.trim(),
      })
    } finally {
      setUploading(false)
    }
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

        <div className="custom-card-header">
          <p className="eyebrow">
            FULLY CUSTOM
          </p>

          <h1>
            CREATE
            <span> YOUR CARD.</span>
          </h1>

          <p>
            Send us the details and artwork you
            want printed. We&apos;ll take care of
            the final production.
          </p>
        </div>

        <form
          className="custom-card-form"
          onSubmit={submit}
        >
          <div className="custom-card-fields">
            <section>
              <span className="custom-step">
                01 / YOUR NAME
              </span>

              <input
                required
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="ENTER NAME"
              />
            </section>

            <section>
              <span className="custom-step">
                02 / YOUR ARTWORK
              </span>

              {!preview ? (
                <label className="upload-dropzone">
                  <ImagePlus size={28} />

                  <strong>
                    UPLOAD FILE
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
                    alt="Uploaded artwork preview"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      setPreview('')
                    }}
                  >
                    <X size={15} />
                    CHANGE FILE
                  </button>
                </div>
              )}
            </section>

            <section>
              <span className="custom-step">
                03 / SPECIAL INSTRUCTIONS
              </span>

              <textarea
                required
                value={instructions}
                onChange={(event) =>
                  setInstructions(
                    event.target.value,
                  )
                }
                placeholder="Tell us anything we need to know about the print..."
                rows={7}
              />
            </section>
          </div>

          <div className="customization-submit">
            <div>
              <span>
                CUSTOM CARD
              </span>

              <strong>
                {formatPrice(product.price)}
              </strong>
            </div>

            <button
              type="submit"
              className="checkout-button"
              disabled={
                !file ||
                !name.trim() ||
                !instructions.trim() ||
                uploading
              }
            >
              {uploading ? 'UPLOADING...' : 'ADD TO BAG'}
              <ArrowUpRight size={18} />
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}