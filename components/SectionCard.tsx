export function SectionCard({
  id,
  ariaLabel,
  bgClassName,
  children,
}: {
  id: string;
  ariaLabel: string;
  bgClassName: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`section-card scroll-mt-nav ${bgClassName}`}
    >
      <div className="section-card-inner">{children}</div>
    </section>
  );
}
