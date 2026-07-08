"use client";

import { SECTIONS, type SectionId } from "@/lib/config";

const LAST_SECTION = SECTIONS[SECTIONS.length - 1];

export function ScrollCue({
  activeSection,
  onClick,
}: {
  activeSection: SectionId;
  onClick: (id: SectionId) => void;
}) {
  if (activeSection === LAST_SECTION) return null;

  const next = SECTIONS[SECTIONS.indexOf(activeSection) + 1];
  if (!next) return null;

  return (
    <button
      type="button"
      onClick={() => onClick(next)}
      aria-label="Scroll to next section"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] flex flex-col items-center gap-0 text-fg-muted hover:text-primary transition-colors max-md:hidden"
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="animate-scroll-cue-1" aria-hidden>
        <path d="m6 9 6 6 6-6" />
      </svg>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="-mt-5 animate-scroll-cue-2" aria-hidden>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
