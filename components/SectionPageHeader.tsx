export function SectionPageHeader({
  eyebrow,
  heading,
  action,
  children,
}: {
  eyebrow: string;
  heading: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="shrink-0 mb-[var(--section-header-gap)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
          <p className="section-eyebrow !mb-0 shrink-0">{eyebrow}</p>
          <h2 className="section-heading !mb-0 min-w-0">{heading}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
