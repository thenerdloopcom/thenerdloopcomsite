import Link from 'next/link'
import { logoImage } from '@/data/catalog'

export function SiteFooter() {
  return (
    <footer>
      <Link href="/" className="wordmark">
        <img src={logoImage} alt="The NerdLoop" />
      </Link>

      <p>© 2026 THE NERDLOOP. ALL RIGHTS RESERVED.</p>

      <div>
        {/* <Link href="/terms">TERMS</Link>
        <Link href="/privacy">PRIVACY</Link>
        <Link href="/shipping">SHIPPING</Link>
        <Link href="/returns">RETURNS</Link> */}
        <Link href="/contact">CONTACT</Link>
      </div>
    </footer>
  )
}