import { useEffect, useState } from 'react';
import Card from './card.jsx';
import DraggableIdCard from './id-card-scene.jsx';
import {
  ArrowUpRight,
  Check,
  Lock,
  Linkedin,
  Mail,
  Sparkles,
} from 'lucide-react';

const workingStyle = [
  {
    title: 'Design the structure',
    description:
      'I plan the system and interface together to create a cleaner development process.',
  },
  {
    title: 'Build the full stack',
    description:
      'I connect frontend interfaces with backend functionality and scalable data handling.',
  },
  {
    title: 'Polish the product',
    description:
      'I refine the small details that make the application feel intuitive and complete.',
  },
];

const toolkit = [
  { label: 'React', logoSrc: '/react.svg' },
  { label: 'JavaScript', logoSrc: '/javascript.svg' },
  { label: 'Laravel', logoSrc: '/laravel.svg' },
  { label: 'MySQL', logoSrc: '/mysql.svg' },
  { label: 'HTML', logoSrc: '/html5.svg' },
  { label: 'CSS', logoSrc: '/css.svg' },
  { label: 'REST APIs', logoSrc: '/postman.svg' },
  { label: 'Tailwind CSS', logoSrc: '/tailwindcss.svg' },
];

const services = [
  {
    title: 'Full-Stack Web Development',
    description: 'Developing complete web applications from frontend to backend with responsive and user-friendly designs. Focused on creating scalable, efficient, and functional systems for different business needs.',
    tags: ['React', 'Laravel', 'MySQL'],
  },
  {
    title: 'UI Development',
    description: 'Creating modern and responsive user interfaces. Designing clean layouts and interactive components that improve user experience across devices.',
    tags: ['React', 'Tailwind CSS', 'Responsive'],
  },
  {
    title: 'Backend & APIs',
    description: 'Building secure backend systems using Laravel with database integration and REST APIs. Managing server-side logic, authentication, and efficient data handling for web applications.',
    tags: ['Laravel', 'REST APIs', 'Databases'],
  },
  {
    title: 'System Development',
    description: 'Developing business and management systems with authentication features. Creating database-driven solutions that improve workflow efficiency and organization.',
    tags: ['Authentication', 'Databases', 'Business Systems'],
  },
];

const projects = [
  {
    status: 'FULL-STACK',
    title: 'Selfie Attendance',
    description:
      'A secure attendance system with role-based access, selfie records, and employee account management.',
    features: [
      'Secure login for admins and employees',
      'Admin can view check-in, breaks, and check-out records',
      'Admin can create, edit, and delete employee accounts',
      'Employees can take selfies as attendance records',
    ],
    images: [
      {
        src: '/SelfieAttendance-1.png',
        alt: 'Selfie Attendance admin desktop screenshot',
        label: 'Admin desktop',
        variant: 'wide',
      },
      {
        src: '/SelfieAttendance-2.png',
        alt: 'Selfie Attendance admin view screenshot',
        label: 'Admin view',
        variant: 'wide',
      },
      {
        src: '/SelfieAttendance-Mobile-1.png',
        alt: 'Selfie Attendance employee mobile screenshot',
        label: 'Employee mobile',
        variant: 'phone',
      },
      {
        src: '/SelfieAttendance-Mobile-2.png',
        alt: 'Selfie Attendance employee mobile detail screenshot',
        label: 'Employee detail',
        variant: 'phone',
      },
    ],
  },
  {
    status: 'Frontend',
    title: 'Security Management System',
    description:
      'A management interface with Excel imports, manual record creation, and activity monitoring.',
    features: [
      'Secure and authenticated login',
      'Security agency records can be imported from Excel',
      'Other records can be created manually',
      'User activity is monitored',
    ],
    images: [
      {
        src: '/SecurityManagementSystem-1.png',
        alt: 'Security Management System main screenshot',
        label: 'Main view',
        variant: 'wide',
      },
      {
        src: '/SecurityManagementSystem-2.png',
        alt: 'Security Management System admin view screenshot',
        label: 'Admin view',
        variant: 'wide',
      },
    ],
  },
  {
    status: 'FULL-STACK',
    title: 'LIMS',
    description:
      'A laboratory management system with module-based access, stored records, and an AI assistant for system questions.',
    features: [
      'Secure and authenticated login',
      'Admin has access to all modules',
      'Admin can assign modules to users',
      'Laboratory records can be created and stored',
      'AI assistant can answer system questions',
    ],
    images: [
      {
        src: '/LIMS-1.png',
        alt: 'LIMS main screenshot',
        label: 'Main view',
        variant: 'wide',
      },
      {
        src: '/LIMS-2.png',
        alt: 'LIMS admin view screenshot',
        label: 'Admin view',
        variant: 'wide',
      },
    ],
  },
];

const contactLinks = [
  {
    label: 'Email me',
    href: 'https://mail.google.com/mail/?view=cm&fs=1&to=cunanalinaire23@gmail.com',
    icon: Mail,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/alinaire-cunan-a0b25b411',
    icon: Linkedin,
  },
];

function SectionIntro({ eyebrow, title, description, align = 'left' }) {
  const alignment = align === 'center' ? 'mx-auto text-center' : '';

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-poppins text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
        {description}
      </p>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-medium text-[var(--text)]">
      {children}
    </span>
  );
}

function ToolkitTag({ label, logoSrc }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-medium text-[var(--text)]">
      <img
        src={logoSrc}
        alt=""
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 object-contain"
        loading="lazy"
        decoding="async"
      />
      {label}
    </span>
  );
}

function ProjectCard({ project, reverse = false, onOpen }) {
  const [primaryImage, secondaryImage] = project.images;
  const secondaryPosition = reverse ? 'left-4 right-auto' : 'right-4';
  const secondarySize = secondaryImage.variant === 'phone'
    ? 'w-[29%] max-w-[118px]'
    : 'w-[43%] max-w-[188px]';
  const primaryAspect = primaryImage.variant === 'phone'
    ? 'aspect-[9/19]'
    : 'aspect-[16/9]';
  const secondaryAspect = secondaryImage.variant === 'phone'
    ? 'aspect-[9/19]'
    : 'aspect-[16/10]';

  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      className="group block h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      aria-label={`Open gallery for ${project.title}`}
    >
      <Card className="flex h-full overflow-hidden" paddingClassName="p-0 flex-1">
      <div className="flex h-full flex-col">
        <div className="border-b border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(255,255,255,0.28))] p-4 sm:p-5">
          <div className="relative pb-14 sm:pb-16">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(16,24,40,0.04),rgba(16,24,40,0.01))] p-2 shadow-[0_22px_50px_rgba(15,23,42,0.12)]">
              <div className={`relative overflow-hidden rounded-[1rem] bg-[var(--surface-strong)] ${primaryAspect}`}>
                <img
                  src={primaryImage.src}
                  alt={primaryImage.alt}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.26),transparent_40%,rgba(255,255,255,0.06))]" />
            </div>

            <div className={`absolute ${secondaryPosition} bottom-0 ${secondarySize}`}>
              <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-strong)] p-2.5 shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
                <div className={`overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,rgba(16,24,40,0.04),rgba(16,24,40,0.01))] ${secondaryAspect}`}>
                  <img
                    src={secondaryImage.src}
                    alt={secondaryImage.alt}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[var(--muted)]">
                    {secondaryImage.label}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              {project.status}
            </span>
          </div>

          <h3 className="mt-4 font-poppins text-2xl font-semibold tracking-tight text-[var(--text)]">
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {project.description}
          </p>
        </div>
      </div>
    </Card>
    </button>
  );
}

function ProjectModal({ project, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageCount = project.images.length;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [project]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveImageIndex((currentIndex) => {
          const nextIndex = currentIndex - 1;
          return nextIndex < 0 ? imageCount - 1 : nextIndex;
        });
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveImageIndex((currentIndex) => {
          const nextIndex = currentIndex + 1;
          return nextIndex >= imageCount ? 0 : nextIndex;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, imageCount]);

  const currentImage = project.images[activeImageIndex] ?? project.images[0];
  const currentImageVariant = currentImage.variant === 'phone' ? 'phone' : 'wide';
  const currentImageAspect = currentImageVariant === 'phone'
    ? 'aspect-[9/19] max-w-[360px] mx-auto'
    : 'aspect-[16/10]';

  const goPrevious = () => {
    setActiveImageIndex((currentIndex) => {
      const nextIndex = currentIndex - 1;
      return nextIndex < 0 ? imageCount - 1 : nextIndex;
    });
  };

  const goNext = () => {
    setActiveImageIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      return nextIndex >= imageCount ? 0 : nextIndex;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(8,15,20,0.72)] px-4 py-6 backdrop-blur-xl"
      onClick={onClose}
      role="presentation"
    >
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-center">
        <div
          className="flex max-h-full w-full flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface-strong)] shadow-[0_40px_120px_rgba(15,23,42,0.35)]"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} gallery`}
        >
          <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  {project.status}
                </p>
                <h3 className="mt-3 font-poppins text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
                  {project.title}
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                  {project.description}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                aria-label={`Close ${project.title} gallery`}
              >
                Close
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-13rem)] overflow-y-auto px-5 py-5 sm:px-6">
            <div className="space-y-5 rounded-[1.7rem] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
              {project.features?.length ? (
                <div className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                    Features
                  </p>
                  <ul className="mt-4 space-y-3">
                    {project.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm leading-7 text-[var(--muted)]"
                      >
                        <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className={`relative overflow-hidden rounded-[1.35rem] bg-[linear-gradient(180deg,rgba(16,24,40,0.04),rgba(16,24,40,0.01))] ${currentImageAspect}`}>
                <img
                  src={currentImage.src}
                  alt={currentImage.alt}
                  className="h-full w-full object-contain"
                  loading="eager"
                  decoding="async"
                  draggable="false"
                />

                {imageCount > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrevious}
                      className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-[rgba(8,15,20,0.72)] text-white shadow-lg backdrop-blur-md transition hover:-translate-y-1/2 hover:bg-[rgba(8,15,20,0.88)]"
                      aria-label={`Show previous image for ${project.title}`}
                    >
                      <ArrowUpRight className="h-5 w-5 rotate-[-135deg]" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-[rgba(8,15,20,0.72)] text-white shadow-lg backdrop-blur-md transition hover:-translate-y-1/2 hover:bg-[rgba(8,15,20,0.88)]"
                      aria-label={`Show next image for ${project.title}`}
                    >
                      <ArrowUpRight className="h-5 w-5 rotate-45" />
                    </button>
                  </>
                ) : null}

                <div className="absolute bottom-4 right-4 rounded-full bg-[rgba(8,15,20,0.72)] px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-md">
                  {activeImageIndex + 1} / {imageCount}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function Body() {
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('project-modal-open', Boolean(activeProject));

    return () => {
      document.documentElement.classList.remove('project-modal-open');
    };
  }, [activeProject]);

  return (
    <main className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12%] top-10 h-72 w-72 rounded-full bg-[var(--accent-soft)] blur-3xl animate-drift" />
        <div className="absolute right-[-8%] top-44 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl animate-float" />
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_70%)]" />
      </div>

      <section id="home" className="mx-auto max-w-7xl px-6 pb-20 pt-4 md:px-10 md:pt-0 lg:px-12 lg:pb-24">
        <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="max-w-3xl">

            <h1 className="mt-0 max-w-2xl font-poppins text-5xl font-semibold leading-[0.92] tracking-tight text-[var(--text)] sm:text-6xl lg:text-7xl">
              <span className="block">Full Stack</span>
              <span className="block text-[var(--accent)]">Web Developer</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl sm:leading-9">
              I create modern and user-friendly web applications that are fast, responsive, and
              reliable. Using React, Laravel, APIs, and databases, I turn ideas into functional
              digital solutions that deliver smooth user experiences.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#projects"
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--accent-soft)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]"
              >
                View selected work
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--text)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
              >
                Get in touch
              </a>
            </div>

          </div>

          <DraggableIdCard />
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
            About
          </p>
          <h2 className="mt-4 mb-4 font-poppins text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            I focus on building products that are clean, accessible, and user-centered.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_42%)]" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                    Profile
                  </p>
                  <h3 className="mt-3 font-poppins text-3xl font-semibold text-[var(--text)]">
                    Alinaire Cunan
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                    Full-stack web developer focused on building responsive and user-friendly web
                    applications with clean interfaces, dependable backend systems, and
                    maintainable product structures.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_42%)]" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                  My Tech Stack
                </p>
                <h3 className="mt-3 font-poppins text-2xl font-semibold text-[var(--text)]">
                  Tools I use most often
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  These are the technologies I lean on when I build full stack web applications
                  and design responsive user experiences.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {toolkit.map((tech) => (
                    <ToolkitTag key={tech.label} label={tech.label} logoSrc={tech.logoSrc} />
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card className="relative h-full overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_42%)]" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                    Working style
                  </p>
                </div>
                <h3 className="mt-3 font-poppins text-2xl font-semibold text-[var(--text)]">
                  How I work
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  A simple process that keeps each build focused from start to finish.
                </p>

                <div className="mt-5 grid gap-3">
                  {workingStyle.map((item, index) => (
                    <div
                      key={item.title}
                      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]"
                    >
                      <div className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,var(--accent),var(--accent-soft))]" />
                      <div className="pl-2">
                        <h4 className="font-medium text-[var(--text)]">
                          {String(index + 1).padStart(2, '0')} — {item.title}
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {item.description}
                        </p>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12 lg:py-24">
        <SectionIntro
          eyebrow="Services"
          title="The work I enjoy most sits between design, code, APIs, and data."
          description="I create modern and user-friendly web applications that are fast, responsive, and reliable. Using React, Laravel, APIs, and databases, I turn ideas into functional digital solutions that deliver smooth user experiences."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {services.map((service, index) => (
            <Card key={service.title} className="h-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] font-poppins text-lg font-semibold text-[var(--accent)]">
                0{index + 1}
              </div>
              <h3 className="mt-5 font-poppins text-2xl font-semibold text-[var(--text)]">
                {service.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{service.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12 lg:py-24">
        <SectionIntro
          eyebrow="Projects"
          title="Here are the most recent projects that I created."
          align="center"
        />

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-xs font-medium text-[var(--muted)] shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <Lock className="h-3.5 w-3.5 text-[var(--accent)]" />
            Links are omitted because these are company-owned production systems and locally deployed systems.
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              reverse={index % 2 === 1}
              onOpen={setActiveProject}
            />
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12 lg:py-24">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_42%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                Contact
              </p>
              <h2 className="mt-4 font-poppins text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
                Have a project, role, or idea that needs a strong full stack web build?
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                I am open to full stack web opportunities, collaborations, and product refreshes. If
                you want a web app that feels polished and easy to navigate, let&apos;s talk.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Tag>Open to opportunities</Tag>
                <Tag>React + Laravel</Tag>
                <Tag>APIs + Databases</Tag>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-64">
              {contactLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4 text-sm font-semibold text-[var(--text)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-lg"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[var(--accent)]" />
                      {link.label}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[var(--muted)]" />
                  </a>
                );
              })}
            </div>
          </div>
        </Card>
      </section>

      {activeProject ? (
        <ProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      ) : null}
    </main>
  );
}
