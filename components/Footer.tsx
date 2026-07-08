export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer border-t border-border bg-bg-alt py-6 text-fg-muted">
      <div className="page-shell flex items-center justify-center">
        <span className="text-sm font-semibold">© {year} Ayush Pranav</span>
      </div>
    </footer>
  );
}
