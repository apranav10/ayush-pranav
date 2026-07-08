import { SECTIONS, type SectionId } from "./config";

export const NAV_HEIGHT = 64;
/** Align section top flush below fixed nav (no previous-section color band). */
export const SCROLL_OFFSET = NAV_HEIGHT;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getSectionScrollTop(el: HTMLElement): number {
  return Math.max(
    0,
    Math.round(el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET),
  );
}

export function isSectionAligned(id: SectionId | string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  return Math.abs(el.getBoundingClientRect().top - SCROLL_OFFSET) <= 8;
}

function applySectionScroll(el: HTMLElement, behavior: ScrollBehavior) {
  window.scrollTo({ top: getSectionScrollTop(el), behavior });
}

export function scrollToSectionId(
  id: SectionId | string,
  behavior: ScrollBehavior = "smooth",
  updateHash = true,
) {
  const el = document.getElementById(id);
  if (!el) return;

  const scrollBehavior: ScrollBehavior =
    behavior === "auto" || prefersReducedMotion() ? "auto" : "smooth";

  applySectionScroll(el, scrollBehavior);

  if (scrollBehavior === "auto") {
    requestAnimationFrame(() => {
      applySectionScroll(el, "auto");
    });
  }

  if (updateHash && isSectionId(id)) {
    pushAppHash(id);
  }
}

export function parseAppHash(): { section: SectionId | null; subId: string | null } {
  const raw = window.location.hash.replace(/^#/, "").trim();
  if (!raw) return { section: null, subId: null };

  const slash = raw.indexOf("/");
  const sectionPart = slash === -1 ? raw : raw.slice(0, slash);
  const subId = slash === -1 ? null : raw.slice(slash + 1).trim() || null;

  if (isSectionId(sectionPart)) {
    return { section: sectionPart, subId };
  }

  return { section: null, subId: null };
}

export function pushAppHash(section: SectionId, subId?: string | null) {
  const hash = subId ? `${section}/${subId}` : section;
  if (window.location.hash.replace(/^#/, "") === hash) return;
  history.pushState(null, "", `#${hash}`);
}

export function isSectionId(id: string): id is SectionId {
  return (SECTIONS as readonly string[]).includes(id);
}
