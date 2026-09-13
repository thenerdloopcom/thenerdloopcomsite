const pages = {
  contact: {
    eyebrow: 'THE NERDLOOP / CONTACT',
    title: 'SAY HELLO.',
    body: 'For questions about products, orders or collaborations, reach us through the contact channel provided by the store.',
  },
  shipping: {
    eyebrow: 'THE NERDLOOP / SHIPPING',
    title: 'SHIPPING.',
    body: 'Orders are prepared in small batches and shipped across India. Tracking information will appear here once a shipment is created.',
  },
  returns: {
    eyebrow: 'THE NERDLOOP / RETURNS',
    title: 'RETURNS.',
    body: 'Return and replacement details will be published here before live checkout is enabled.',
  },
  privacy: {
    eyebrow: 'THE NERDLOOP / PRIVACY',
    title: 'PRIVACY.',
    body: 'Our privacy policy will be published here before production launch.',
  },
  terms: {
    eyebrow: 'THE NERDLOOP / TERMS',
    title: 'TERMS.',
    body: 'Store terms and conditions will be published here before production launch.',
  },
} as const

export function SimpleInfoPage({
  page,
}: {
  page: keyof typeof pages
}) {
  const content = pages[page]

  return (
    <main className="route-page">
      <section className="simple-route">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p>{content.body}</p>
      </section>
    </main>
  )
}