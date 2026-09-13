import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { logoImage } from '@/data/catalog'

type Props = {
  title: string
  description: string
}

export function SimpleRoutePage({ title, description }: Props) {
  return (
    <main className="route-page">
      <header className="route-header">
        <Link href="/" className="wordmark">
          <img src={logoImage} alt="The NerdLoop" />
        </Link>

        <Link href="/" className="text-link">
          <ArrowLeft size={15} />
          BACK HOME
        </Link>
      </header>

      <div className="route-content">
        <div className="simple-route">
          <p className="eyebrow">THE NERDLOOP / ISSUE 001</p>
          <h1>{title}</h1>
          <p>{description}</p>

          <Link href="/" className="comic-button">
            EXPLORE THE LOOP
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>

      <footer>
        <Link href="/" className="wordmark">
          <img src={logoImage} alt="The NerdLoop" />
        </Link>

        <p>FAN-MADE OBJECTS FOR THE LONG WAY HOME.</p>

        <div>
          <Link href="/shipping">SHIPPING</Link>
          <Link href="/returns">RETURNS</Link>
          <Link href="/contact">CONTACT</Link>
        </div>
      </footer>
    </main>
  )
}
