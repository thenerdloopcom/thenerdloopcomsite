import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

// Fill in the real handles/addresses below.
const EMAIL = 'thenerdloop@gmail.com'
const INSTAGRAM_URL = 'https://instagram.com/thenerdloop'

export function ContactPage() {
  return (
    <main className="route-page">
      <section className="contact-page">

        {/* LEFT */}
        <div className="contact-intro">
          <p className="eyebrow">THE NERDLOOP / CONTACT</p>

          <h1>
            TALK TO
            <br />
            <span>THE LOOP</span>
          </h1>

          <p className="contact-description">
            Questions, collabs, weird ideas, or just want to say hi?
            We&apos;re listening.
          </p>
        </div>

        {/* RIGHT */}
        <div className="contact-links">

          <Link
            href={`mailto:${EMAIL}`}
            className="contact-box box-email"
          >
            <span>EMAIL</span>
            <ArrowUpRight size={22} />
          </Link>

          <Link
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="contact-box box-instagram"
          >
            <span>INSTAGRAM</span>
            <ArrowUpRight size={22} />
          </Link>
          <div className="contact-meta">
            <h3>WHERE WE LIVE</h3>

            <p>
              SOMEWHERE IN THE HEARTS OF NERDS
              <br />
              INDIA, OBVIOUSLY.
            </p>

            <small>
              No exact coordinates. We&apos;re probably online.
            </small>
          </div>

        </div>

      </section>
    </main>
  )
}