/** Split CMS pipe-separated values into trimmed segments, e.g. "A | B" → ["A", "B"] */
export function parsePipe(str: string | undefined | null): string[] {
  if (!str) return [];
  const raw = String(str).trim();
  if (!raw) return [];

  if (raw.includes("|")) {
    return raw
      .split(/\s*\|\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [raw];
}

export function parseComma(str: string | undefined | null): string[] {
  if (!str) return [];
  return String(str)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isTruthy(val: unknown): boolean {
  if (val === true) return true;
  if (val === false) return false;
  return String(val).toLowerCase() === "true";
}

export function sortByOrder<T extends { order?: number | string }>(
  items: T[],
  fallback = 99,
): T[] {
  return [...items].sort(
    (a, b) => Number(a.order ?? fallback) - Number(b.order ?? fallback),
  );
}

/** Parse pipe-separated `Label:Value` pairs, e.g. `GPA:4.18|GMAT:715` */
export function parseLabelValuePairs(
  str: string | undefined | null,
): { label: string; value: string }[] {
  return parsePipe(str)
    .map((entry) => {
      const colonIdx = entry.indexOf(":");
      if (colonIdx >= 0) {
        return {
          label: entry.slice(0, colonIdx).trim(),
          value: entry.slice(colonIdx + 1).trim(),
        };
      }
      return { label: entry.trim(), value: "" };
    })
    .filter((pair) => pair.label);
}

/** Parse pipe-separated `Value : Label` pairs, e.g. `$17M : ROI improvement` */
export function parseValueLabelPairs(
  str: string | undefined | null,
): { label: string; value: string }[] {
  return parsePipe(str)
    .map((entry) => {
      const colonIdx = entry.indexOf(":");
      if (colonIdx >= 0) {
        return {
          value: entry.slice(0, colonIdx).trim(),
          label: entry.slice(colonIdx + 1).trim(),
        };
      }
      return { value: entry.trim(), label: "" };
    })
    .filter((pair) => pair.value || pair.label);
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Google Sheets gviz dates arrive as strings like Date(2025,7,1) (month is 0-indexed). */
export function formatSheetDate(value: unknown): string {
  if (value == null || value === "") return "";
  const str = String(value).trim();
  const match = str.match(/^Date\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const d = new Date(year, month, day);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
  }
  return str;
}

export function formatDateRange(start: unknown, end?: unknown): string {
  const startLabel = formatSheetDate(start);
  const hasEnd = end != null && String(end).trim() !== "";
  const endLabel = hasEnd ? formatSheetDate(end) : "Present";

  if (!startLabel) return hasEnd ? endLabel : "";
  if (!hasEnd) return `${startLabel} – Present`;
  return `${startLabel} – ${endLabel}`;
}
