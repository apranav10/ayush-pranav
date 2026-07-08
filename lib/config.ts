export const CONFIG = {
  SHEET_ID: "1izySQZO_KE1KL4ms2m2A-GJAf14zmc9XUT6_bEphwzI",
};

export const SECTIONS = [
  "home",
  "work",
  "experience",
  "about",
  "beyond",
  "contact",
] as const;

export type SectionId = (typeof SECTIONS)[number];

/** Labels shown on section scroll hints */
export const SECTION_LABELS: Record<SectionId, string> = {
  home: "Home",
  work: "Selected Work",
  experience: "Experience",
  about: "About",
  beyond: "Beyond Work",
  contact: "Contact",
};

/** Short labels for top navigation */
export const SECTION_NAV_SHORT: Record<SectionId, string> = {
  home: "Home",
  work: "Projects",
  experience: "Experience",
  about: "About",
  beyond: "Beyond Work",
  contact: "Contact",
};

export function getNextSectionLabel(currentId: SectionId): string | null {
  const idx = SECTIONS.indexOf(currentId);
  if (idx < 0 || idx >= SECTIONS.length - 1) return null;
  return SECTION_LABELS[SECTIONS[idx + 1]];
}
