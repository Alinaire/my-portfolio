export default function Card({ children, className = '', paddingClassName = 'p-6 md:p-7' }) {
  return (
    <div
      className={`rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${className}`}
    >
      {children && <div className={paddingClassName}>{children}</div>}
    </div>
  );
}
