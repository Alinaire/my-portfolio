import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Theme from './theme.jsx';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateLayout = () => setIsDesktop(window.innerWidth >= 768);

    updateLayout();
    window.addEventListener('resize', updateLayout);

    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  useEffect(() => {
    if (isDesktop) setIsOpen(false);
  }, [isDesktop]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10 lg:px-12">
        <a href="#home" className="group flex items-center gap-2">
          <div className="hidden sm:block">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--muted)]">
              Portfolio
            </p>
            <p className="font-poppins text-lg font-semibold text-[var(--text)]">
              Alinaire Cunan
            </p>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-5">
          <nav className="flex items-center gap-6 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 backdrop-blur-xl">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[var(--muted)] transition hover:-translate-y-0.5 hover:text-[var(--text)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Theme />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Theme />
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow)] backdrop-blur-xl transition hover:-translate-y-0.5"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden border-t border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl transition-[max-height,opacity] duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 md:px-10">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-2xl border border-transparent px-4 py-3 text-base font-medium text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
