import Link from "next/link";

export default function Home() {
  return (
    <main className="landing">
      <header className="landing-header">
        <div className="brand">MangaMake</div>
        <nav className="landing-nav">
          <Link href="/login">Sign In</Link>
          <Link href="/signup">Sign Up</Link>
          <Link className="badge" href="/admin">
            Admin
          </Link>
        </nav>
      </header>

      <section className="hero card">
        <h1>
          Create <span>Manga Art</span>
        </h1>
        <p>
          The ultimate tool for manga artists. Design poses, create dynamic
          panels, and bring your stories to life with an intuitive sketchbook.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/login">
            Start Creating
          </Link>
          <Link className="btn btn-secondary" href="/login">
            Open Project
          </Link>
        </div>
        <div className="hero-meta">
          <span>Free to use</span>
          <span>No credit card required</span>
          <span>Autosave enabled</span>
        </div>
      </section>

      <section className="features">
        <article className="feature card">
          <h3>Rapid Posing</h3>
          <p>Quickly iterate dynamic poses with reusable sprite libraries.</p>
        </article>
        <article className="feature card">
          <h3>Panel Layouts</h3>
          <p>Compose manga pages with drag and drop art blocks.</p>
        </article>
        <article className="feature card">
          <h3>Export Ready</h3>
          <p>Save your project as PNG or SVG when your page is complete.</p>
        </article>
      </section>
    </main>
  );
}
