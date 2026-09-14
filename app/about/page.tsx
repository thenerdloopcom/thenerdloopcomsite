const SECTIONS = [
  {
    id: 'why-we-started',
    title: 'WHY WE STARTED',
    body: `We kept making one-off props, masks and cards for ourselves and getting asked "wait, can you make me one too?" often enough that it turned into a store.`,
  },
  {
    id: 'how-we-started',
    title: 'HOW WE STARTED',
    body: `The Nerd Loop began as a weekend project between a handful of friends who loved fandom culture and hated boring, licensed merch. No boardrooms, no committees — just people who wanted better objects for the stories they cared about.`,
  },
  {
    id: 'what-we-make',
    title: 'WHAT WE MAKE',
    body: `Handmade masks, metallic signs, access cards and small-batch artifacts for true fans. Every batch is planned, printed and packed by hand, in small runs — which is also why a design sometimes sells out and doesn't come back the same way twice.`,
  },
]

export default function Page() {
  return (
    <main className="route-page about-page">
      <div className="about-container">

        {/* INTRO */}
        <section className="about-intro">
          <p className="eyebrow">THE NERDLOOP / ISSUE 001</p>

          <h1>
            OUR <span>STORY.</span>
          </h1>

          <p className="about-lead">
            We make small-batch artifacts for people who read the side quests.
            No licenses, no boardrooms, no boring. Just objects for the stories
            that stuck.
          </p>
        </section>

        {/* CONTENT */}
        <div className="about-content">

          {/* TABLE OF CONTENTS */}
          <aside className="about-sidebar">
            <p className="about-sidebar-title">ON THIS PAGE</p>

            <nav>
              {SECTIONS.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* SECTIONS */}
          <div className="about-sections">
            {SECTIONS.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="about-section"
              >
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>

        </div>
      </div>
    </main>
  )
}