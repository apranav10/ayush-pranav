"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SectionId } from "@/lib/config";
import { SECTIONS, SECTION_NAV_SHORT } from "@/lib/config";

type IndicatorStyle = {
  left: number;
  width: number;
};

export function SiteNav({
  siteName,
  activeSection,
  navScrolled,
  resumeUrl,
  onNavigate,
}: {
  siteName: string;
  activeSection: SectionId;
  navScrolled: boolean;
  resumeUrl?: string;
  onNavigate: (id: SectionId) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [indicator, setIndicator] = useState<IndicatorStyle>({ left: 0, width: 0 });
  const navTrackRef = useRef<HTMLDivElement>(null);

  const updateIndicator = useCallback(() => {
    const track = navTrackRef.current;
    if (!track) return;

    const activeEl = track.querySelector<HTMLElement>(`[data-nav-id="${activeSection}"]`);
    if (!activeEl) return;

    const trackRect = track.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    setIndicator({
      left: activeRect.left - trackRect.left,
      width: activeRect.width,
    });
  }, [activeSection]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] h-nav backdrop-blur-md transition-[box-shadow,background-color,border-color] duration-300 ease-out ${
        navScrolled ? "border-b border-border shadow-sm bg-bg-alt" : "bg-bg/90 border-b border-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="page-shell h-full flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="text-sm font-semibold tracking-tight text-fg"
        >
          {siteName}
        </button>

        <div ref={navTrackRef} className="nav-links-track">
          {SECTIONS.map((id) => (
            <button
              key={id}
              type="button"
              data-nav-id={id}
              onClick={() => onNavigate(id)}
              className={`nav-link ${activeSection === id ? "active" : ""}`}
            >
              {SECTION_NAV_SHORT[id]}
            </button>
          ))}
          <span
            className="nav-indicator"
            aria-hidden
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: indicator.width,
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          {resumeUrl && (
            <a
              href={resumeUrl}
              download
              className="btn-accent !px-[18px] !py-2 !text-[13px]"
            >
              Resume
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3v13M6 11l6 6 6-6M3 20h18" />
              </svg>
            </a>
          )}

          <button
            type="button"
            className="md:hidden p-2 text-fg-muted hover:text-fg transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-[110] bg-bg border-b border-border shadow-card">
          <div className="page-shell py-4 flex flex-col gap-1">
            {SECTIONS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => { onNavigate(id); setMobileOpen(false); }}
                className={`nav-link text-left w-full py-3 ${activeSection === id ? "active" : ""}`}
              >
                {SECTION_NAV_SHORT[id]}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
