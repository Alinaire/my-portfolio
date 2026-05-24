import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-8 backdrop-blur-xl md:px-10 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <p>Copyright {year} Alinaire Cunan. Crafted with React and Tailwind CSS.</p>
        <a
          href="#home"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Back to top</span>
        </a>
      </div>
    </footer>
  );
}
