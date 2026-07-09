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

/** Scroll so an element's top sits just below the fixed nav (mobile accordion headers, etc.). */
export function scrollHeaderBelowNav(
  el: HTMLElement | null,
  behavior: ScrollBehavior = "smooth",
) {
  if (!el) return;

  const scrollBehavior: ScrollBehavior =
    behavior === "smooth" && prefersReducedMotion() ? "auto" : behavior;

  window.scrollTo({
    top: getSectionScrollTop(el),
    behavior: scrollBehavior,
  });
}

/** After a mobile accordion panel opens, scroll its header below the fixed nav. */
export function scrollMobileAccordionHeader(el: HTMLElement | null) {
  if (!el || typeof window === "undefined" || window.innerWidth > 767) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollHeaderBelowNav(el));
  });
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
