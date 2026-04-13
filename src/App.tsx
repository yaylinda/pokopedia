import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Pokopedia</p>
        <h1>Reference app scaffolding is in place.</h1>
        <p className="lede">
          This starter app gives us a clean React and TypeScript foundation for
          the Pokopia reference experience. No game features are implemented
          yet.
        </p>
      </section>

      <section className="card-grid" aria-label="Project status">
        <article className="card">
          <h2>Frontend</h2>
          <p>Vite, React, and TypeScript are configured for local development.</p>
        </article>
        <article className="card">
          <h2>Data</h2>
          <p>
            Existing normalized source files remain in <code>data/json</code> for
            the next phase.
          </p>
        </article>
        <article className="card">
          <h2>Deployment</h2>
          <p>GitHub Actions is set up to build and deploy the app to Pages.</p>
        </article>
      </section>
    </main>
  )
}

export default App
