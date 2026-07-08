import { CONFIG } from "./config";
import type {
  AboutSection,
  ContactPageConfig,
  EducationEntry,
  ExperienceEntry,
  ExperienceRole,
  SiteConfig,
} from "./types";
import { sortByOrder } from "./utils";

type SheetRow = Record<string, string | number | boolean>;

async function fetchSheetRaw(tabName: string) {
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  const text = await res.text();
  return JSON.parse(text.slice(47, -2)) as {
    table: {
      cols: Array<{ label?: string }>;
      rows: Array<{ c: Array<{ v?: string | number | boolean | null } | null> }>;
    };
  };
}

export async function fetchSheet<T extends SheetRow = SheetRow>(
  tabName: string,
): Promise<T[]> {
  try {
    const json = await fetchSheetRaw(tabName);
    const cols = json.table.cols;
    const rows = json.table.rows;

    const headers = cols.map((c) =>
      (c.label || "").toLowerCase().replace(/\s+/g, "_"),
    );

    return rows
      .map((row) =>
        Object.fromEntries(
          headers.map((h, i) => [h, row.c[i]?.v ?? "" as string | number | boolean]),
        ) as T,
      )
      .filter((row) =>
        Object.values(row).some(
          (v) => v !== "" && v !== null && v !== undefined,
        ),
      );
  } catch (err) {
    console.error(`[CMS] Failed to fetch tab "${tabName}":`, err);
    return [];
  }
}

export function mergeExperienceEntries(
  work: ExperienceRole[],
  education: EducationEntry[],
): ExperienceEntry[] {
  const workEntries = work.map(
    (row) => ({ ...row, _type: "work" as const }),
  );
  const educationEntries = education.map(
    (row) => ({ ...row, _type: "education" as const }),
  );

  return [...workEntries, ...educationEntries].sort((a, b) => {
    const orderA = Number(a.order ?? 99);
    const orderB = Number(b.order ?? 99);
    if (orderA !== orderB) return orderA - orderB;
    if (a._type === "work" && b._type === "education") return -1;
    if (a._type === "education" && b._type === "work") return 1;
    return 0;
  });
}

export async function fetchExperienceEntries(): Promise<ExperienceEntry[]> {
  const [work, education] = await Promise.all([
    fetchSheet<ExperienceRole>("EXPERIENCE"),
    fetchSheet<EducationEntry>("EDUCATION"),
  ]);
  return mergeExperienceEntries(work, education);
}

export async function fetchAboutSections(): Promise<AboutSection[]> {
  const rows = await fetchSheet<AboutSection>("ABOUT");
  return sortByOrder(rows, 0);
}

async function parseKeyValueSheet(tabName: string): Promise<Record<string, string>> {
  const json = await fetchSheetRaw(tabName);
  const sheetRows = json.table?.rows || [];
  if (!sheetRows.length) return {};

  const cellVal = (row: { c: Array<{ v?: unknown } | null> }, i: number) => {
    const v = row.c[i]?.v;
    return v == null ? "" : String(v).trim();
  };

  const firstRowVals = sheetRows[0].c.map((_, i) => cellVal(sheetRows[0], i));

  if (firstRowVals[0] === "key") {
    const config: Record<string, string> = {};
    sheetRows.slice(1).forEach((row) => {
      const key = cellVal(row, 0);
      const value = cellVal(row, 1);
      if (key) config[key] = value;
    });
    return config;
  }

  const config: Record<string, string> = {};
  const valueRow = sheetRows[1] || sheetRows[0];
  firstRowVals.forEach((key, i) => {
    if (key) config[key] = cellVal(valueRow, i);
  });
  return config;
}

export async function fetchContactPage(): Promise<ContactPageConfig> {
  try {
    return await parseKeyValueSheet("CONTACT_PAGE");
  } catch (err) {
    console.error("[CMS] Failed to fetch CONTACT_PAGE:", err);
    return {};
  }
}

export async function fetchConfig(): Promise<SiteConfig> {
  try {
    return await parseKeyValueSheet("SITE_CONFIG");
  } catch (err) {
    console.error("[CMS] Failed to fetch SITE_CONFIG:", err);
    return {};
  }
}
