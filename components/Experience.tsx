"use client";

import { useEffect, useState } from "react";
import type {
  EducationExperienceEntry,
  ExperienceEntry,
  SiteConfig,
  WorkExperienceEntry,
} from "@/lib/types";
import {
  formatDateRange,
  parseLabelValuePairs,
  parsePipe,
  parseValueLabelPairs,
} from "@/lib/utils";
import { DriveImage } from "./DriveImage";
import { SectionCard } from "./SectionCard";
import { SectionPageHeader } from "./SectionPageHeader";

const DEFAULT_LABELS = {
  work_zone1: "What I led",
  work_zone2: "Impact",
  work_zone3: "Beyond the role",
  edu_zone1: "Concentrations",
  edu_zone2: "Credentials",
  edu_zone3: "Honors",
  edu_zone4: "Involvement",
  edu_zone5: "Beyond academics",
};

function entityInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

type EntryCategory = "EDUCATION" | "EXPERIENCE";

function getEntryCategory(entry: ExperienceEntry): EntryCategory {
  if (entry._type === "education") return "EDUCATION";
  const type = entry.type?.trim().toLowerCase();
  return type === "education" ? "EDUCATION" : "EXPERIENCE";
}

function getRailEntryName(entry: ExperienceEntry): string {
  if (entry._type === "work") return entry.company;
  const railName = entry.institution_rail?.trim();
  return railName || entry.institution;
}

function EntryTypeLabel({ category }: { category: EntryCategory }) {
  return <span className="experience-entry-type">{category}</span>;
}

function PanelLogo({
  logoId,
  alt,
}: {
  logoId?: string;
  alt: string;
}) {
  return (
    <div className="experience-panel-header-logo">
      {logoId ? (
        <DriveImage
          fileId={logoId}
          alt={alt}
          width={160}
          className="experience-panel-logo-image"
        />
      ) : (
        <span className="text-sm font-medium text-fg-muted">
          {entityInitials(alt)}
        </span>
      )}
    </div>
  );
}

function ImpactStatCards({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="experience-impact-grid">
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="experience-impact-card">
          <span className="experience-impact-value">{item.value}</span>
          {item.label && (
            <span className="experience-impact-label">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ZoneLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs uppercase tracking-[0.08em] text-fg-muted mb-3">
      {children}
    </h4>
  );
}

function PanelIdentity({
  logoId,
  alt,
  primary,
  secondary,
  meta,
}: {
  logoId?: string;
  alt: string;
  primary: string;
  secondary?: string;
  meta?: string;
}) {
  return (
    <div className="experience-panel-header">
      <PanelLogo logoId={logoId} alt={alt} />
      <div className="experience-panel-header-text flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-fg leading-[1.35] m-0">{primary}</h3>
        {secondary && (
          <p className="text-sm font-medium text-fg m-0 leading-[1.35]">{secondary}</p>
        )}
        {meta && (
          <p className="text-sm text-fg-muted m-0 leading-[1.35]">{meta}</p>
        )}
      </div>
    </div>
  );
}

function PanelDivider() {
  return <hr className="experience-panel-divider" />;
}

function EmptyZone() {
  return <p className="text-sm text-fg-faint m-0">—</p>;
}

function WorkPanel({
  role,
  labels,
}: {
  role: WorkExperienceEntry;
  labels: typeof DEFAULT_LABELS;
}) {
  const highlights = parsePipe(role.highlights);
  const extras = parsePipe(role.extracurricular);
  const metrics = parseValueLabelPairs(role.metrics);
  const dateRange = formatDateRange(role.start_date, role.end_date);
  const meta = [role.location, dateRange].filter(Boolean).join(" · ");

  const hasRightContent = extras.length > 0 || metrics.length > 0;

  return (
    <div className="animate-panel-slide">
      <PanelIdentity
        logoId={role.logo_drive_id}
        alt={role.company}
        primary={role.company}
        secondary={role.role_title}
        meta={meta}
      />

      <PanelDivider />

      <div className="experience-work-content">
        <div
          className={`experience-work-col-left${
            !hasRightContent ? " md:col-span-2 md:border-r-0 md:pr-0" : ""
          }`}
        >
          <ZoneLabel>{labels.work_zone1}</ZoneLabel>
          {highlights.length > 0 ? (
            <div className="space-y-2.5">
              {highlights.map((h) => (
                <p key={h} className="text-sm text-fg leading-[1.55] m-0">
                  {h}
                </p>
              ))}
            </div>
          ) : (
            <EmptyZone />
          )}
        </div>

        {hasRightContent && (
          <div className="experience-work-col-right experience-panel-sections">
            {extras.length > 0 && (
              <div>
                <ZoneLabel>{labels.work_zone3}</ZoneLabel>
                <div className="space-y-2.5">
                  {extras.map((e) => (
                    <p key={e} className="text-sm text-fg leading-[1.55] m-0">
                      {e}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {metrics.length > 0 && (
              <div>
                <ZoneLabel>{labels.work_zone2}</ZoneLabel>
                <ImpactStatCards items={metrics} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EducationPanel({
  edu,
  labels,
}: {
  edu: EducationExperienceEntry;
  labels: typeof DEFAULT_LABELS;
}) {
  const credentials = parseLabelValuePairs(edu.credentials);
  const concentrations = parsePipe(edu.concentrations);
  const involvement = parsePipe(edu.involvement);
  const honors = parsePipe(edu.honors);
  const beyondAcademics = parsePipe(edu.beyond_academics);
  const dateRange = formatDateRange(edu.start_date, edu.end_date);
  const meta = [edu.location, dateRange].filter(Boolean).join(" · ");

  const hasLeftContent =
    concentrations.length > 0 || credentials.length > 0 || honors.length > 0;
  const hasRightContent = involvement.length > 0 || beyondAcademics.length > 0;

  return (
    <div className="animate-panel-slide">
      <PanelIdentity
        logoId={edu.logo_drive_id}
        alt={edu.institution}
        primary={edu.institution}
        secondary={edu.program}
        meta={meta}
      />

      <PanelDivider />

      <div className="experience-education-content">
        <div
          className={`experience-work-col-left experience-panel-sections${
            !hasRightContent ? " md:col-span-2 md:border-r-0 md:pr-0" : ""
          }`}
        >
          {concentrations.length > 0 && (
            <div>
              <ZoneLabel>{labels.edu_zone1}</ZoneLabel>
              <div className="flex flex-wrap gap-2">
                {concentrations.map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-bg-alt px-2.5 py-1 rounded-card text-fg"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {credentials.length > 0 && (
            <div>
              <ZoneLabel>{labels.edu_zone2}</ZoneLabel>
              <ImpactStatCards items={credentials} />
            </div>
          )}
          {honors.length > 0 && (
            <div>
              <ZoneLabel>{labels.edu_zone3}</ZoneLabel>
              <p className="text-sm text-fg leading-[1.55] m-0">
                {honors.join(" · ")}
              </p>
            </div>
          )}
          {!hasLeftContent && <EmptyZone />}
        </div>

        {hasRightContent && (
          <div className="experience-work-col-right experience-panel-sections">
            {involvement.length > 0 && (
              <div>
                <ZoneLabel>{labels.edu_zone4}</ZoneLabel>
                <p className="text-sm text-fg leading-[1.55] m-0">
                  {involvement.join(" · ")}
                </p>
              </div>
            )}
            {beyondAcademics.length > 0 && (
              <div>
                <ZoneLabel>{labels.edu_zone5}</ZoneLabel>
                <div className="space-y-2.5">
                  {beyondAcademics.map((item) => (
                    <p key={item} className="text-sm text-fg leading-[1.55] m-0">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const RAIL_DEFAULT_VISIBLE = 5;

function RailItem({
  category,
  name,
  subtitle,
  dateRange,
  active,
  onClick,
}: {
  category: EntryCategory;
  name: string;
  subtitle: string;
  dateRange: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`experience-rail-item ${
        active ? "experience-rail-item-active" : "experience-rail-item-inactive"
      }`}
    >
      <span className="text-sm font-semibold text-fg">{name}</span>
      <span className="text-xs text-fg-muted">{subtitle}</span>
      <div className="experience-rail-item-footer">
        {dateRange ? (
          <span className="text-xs text-fg-faint">{dateRange}</span>
        ) : (
          <span aria-hidden="true" />
        )}
        <EntryTypeLabel category={category} />
      </div>
    </button>
  );
}

export function Experience({
  entries,
  config,
  activeEntryId,
  onEntrySelect,
}: {
  entries: ExperienceEntry[];
  config: SiteConfig;
  activeEntryId?: string | null;
  onEntrySelect?: (id: string) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAllRail, setShowAllRail] = useState(false);
  const active = entries[activeIdx];

  useEffect(() => {
    if (!activeEntryId) return;
    const idx = entries.findIndex((entry) => entry.id === activeEntryId);
    if (idx >= 0) {
      setActiveIdx(idx);
      if (idx >= RAIL_DEFAULT_VISIBLE) setShowAllRail(true);
    }
  }, [activeEntryId, entries]);

  const visibleEntries = showAllRail
    ? entries
    : entries.slice(0, RAIL_DEFAULT_VISIBLE);
  const hiddenCount = Math.max(0, entries.length - RAIL_DEFAULT_VISIBLE);

  const labels = {
    work_zone1: config.work_zone1_label || DEFAULT_LABELS.work_zone1,
    work_zone2: config.work_zone2_label || DEFAULT_LABELS.work_zone2,
    work_zone3: config.work_zone3_label || DEFAULT_LABELS.work_zone3,
    edu_zone1: config.edu_zone1_label || DEFAULT_LABELS.edu_zone1,
    edu_zone2: DEFAULT_LABELS.edu_zone2,
    edu_zone3: config.edu_zone3_label || DEFAULT_LABELS.edu_zone3,
    edu_zone4: config.edu_zone2_label || DEFAULT_LABELS.edu_zone4,
    edu_zone5: config.edu_zone4_label || DEFAULT_LABELS.edu_zone5,
  };

  const renderPanel = (entry: ExperienceEntry) =>
    entry._type === "work" ? (
      <WorkPanel key={entry.id} role={entry} labels={labels} />
    ) : (
      <EducationPanel key={entry.id} edu={entry} labels={labels} />
    );

  return (
    <SectionCard id="experience" ariaLabel="Experience" bgClassName="bg-bg">
      <SectionPageHeader eyebrow="Experience" heading="The work so far." />

      <div className="section-card-body experience-section-body flex flex-col justify-start min-h-0">
        {entries.length === 0 ? (
          <p className="text-fg-faint text-sm py-12 text-center">
            No experience entries yet.
          </p>
        ) : (
          <>
            <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-4 lg:gap-5 items-start">
              <nav
                className={`experience-rail shrink-0${showAllRail ? " experience-rail--expanded" : ""}`}
                aria-label="Experience entries"
              >
                {visibleEntries.map((entry) => {
                  const i = entries.findIndex((item) => item.id === entry.id);
                  const isWork = entry._type === "work";
                  const name = getRailEntryName(entry);
                  const subtitle = isWork ? entry.role_title : entry.program;
                  const dateRange = formatDateRange(entry.start_date, entry.end_date);

                  return (
                    <RailItem
                      key={entry.id}
                      category={getEntryCategory(entry)}
                      name={name}
                      subtitle={subtitle}
                      dateRange={dateRange}
                      active={activeIdx === i}
                      onClick={() => {
                        setActiveIdx(i);
                        onEntrySelect?.(entry.id);
                      }}
                    />
                  );
                })}

                {!showAllRail && hiddenCount > 0 && (
                  <button
                    type="button"
                    className="experience-rail-more hero-secondary-cta"
                    onClick={() => setShowAllRail(true)}
                  >
                    Show {hiddenCount} more →
                  </button>
                )}
              </nav>

              <div className="experience-panel-card bg-surface border border-border rounded-card shadow-card">
                {active && renderPanel(active)}
              </div>
            </div>

            <div className="flex flex-col gap-2 md:hidden" aria-label="Experience entries">
              {visibleEntries.map((entry) => {
                const i = entries.findIndex((item) => item.id === entry.id);
                const isWork = entry._type === "work";
                const name = getRailEntryName(entry);
                const subtitle = isWork ? entry.role_title : entry.program;
                const dateRange = formatDateRange(entry.start_date, entry.end_date);
                const isActive = activeIdx === i;

                return (
                  <div key={entry.id} className="flex flex-col gap-2">
                    <RailItem
                      category={getEntryCategory(entry)}
                      name={name}
                      subtitle={subtitle}
                      dateRange={dateRange}
                      active={isActive}
                      onClick={() => {
                        setActiveIdx(i);
                        onEntrySelect?.(entry.id);
                      }}
                    />
                    {isActive && (
                      <div className="experience-panel-card bg-surface border border-border rounded-card shadow-card">
                        {renderPanel(entry)}
                      </div>
                    )}
                  </div>
                );
              })}

              {!showAllRail && hiddenCount > 0 && (
                <button
                  type="button"
                  className="experience-rail-more hero-secondary-cta"
                  onClick={() => setShowAllRail(true)}
                >
                  Show {hiddenCount} more →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}
