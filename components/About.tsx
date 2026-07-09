"use client";

import { useRef, useState } from "react";
import type { AboutSection } from "@/lib/types";
import { scrollMobileAccordionHeader } from "@/lib/scroll";
import { DriveImage } from "./DriveImage";
import { SectionCard } from "./SectionCard";
import { SectionPageHeader } from "./SectionPageHeader";

function AboutRailItem({
  label,
  active,
  onClick,
}: {
  label: string;
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
      <span className="text-sm font-semibold text-fg">{label}</span>
    </button>
  );
}

function AboutPanel({ section }: { section: AboutSection }) {
  const imageId = String(section.image_drive_id || "").trim();
  const hasImage = Boolean(imageId);

  return (
    <div
      className={`about-panel-content animate-panel-slide${
        !hasImage ? " about-panel-content--full" : ""
      }`}
    >
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-fg mb-4 m-0 leading-snug">
          {section.section_header}
        </h3>
        <p className="text-base text-fg leading-[1.7] m-0">{section.description}</p>
      </div>
      {hasImage && (
        <div className="about-panel-image">
          <DriveImage
            fileId={imageId}
            alt={section.section_header}
            width={800}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

export function About({ sections }: { sections: AboutSection[] }) {
  const defaultIdx = Math.max(
    0,
    sections.findIndex((s) => Number(s.order) === 1),
  );
  const [activeIdx, setActiveIdx] = useState(defaultIdx);
  const [mobileActiveIdx, setMobileActiveIdx] = useState<number | null>(null);
  const mobileItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const active = sections[activeIdx];

  return (
    <SectionCard id="about" ariaLabel="About" bgClassName="bg-surface">
      <SectionPageHeader eyebrow="About" heading="The full picture." />

      <div className="section-card-body about-section-body flex flex-col justify-start min-h-0">
        {sections.length === 0 ? (
          <p className="text-fg-faint text-sm py-12 text-center">
            No about sections yet.
          </p>
        ) : (
          <>
            <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-4 lg:gap-5 items-start">
              <nav className="experience-rail shrink-0" aria-label="About sections">
                {sections.map((section, i) => (
                  <AboutRailItem
                    key={`${section.section_header}-${section.order ?? i}`}
                    label={section.section_header}
                    active={activeIdx === i}
                    onClick={() => setActiveIdx(i)}
                  />
                ))}
              </nav>

              <div className="experience-panel-card bg-surface border border-border rounded-card shadow-card">
                {active && <AboutPanel key={active.section_header} section={active} />}
              </div>
            </div>

            <div className="flex flex-col gap-2 md:hidden" aria-label="About sections">
              {sections.map((section, i) => {
                const isActive = mobileActiveIdx === i;

                return (
                  <div
                    key={`${section.section_header}-${section.order ?? i}`}
                    ref={(el) => {
                      mobileItemRefs.current[i] = el;
                    }}
                    className="flex flex-col gap-2"
                  >
                    <AboutRailItem
                      label={section.section_header}
                      active={isActive}
                      onClick={() => {
                        const willExpand = mobileActiveIdx !== i;
                        setMobileActiveIdx(willExpand ? i : null);
                        if (willExpand) {
                          setActiveIdx(i);
                          scrollMobileAccordionHeader(mobileItemRefs.current[i]);
                        }
                      }}
                    />
                    {isActive && (
                      <div className="experience-panel-card bg-surface border border-border rounded-card shadow-card">
                        <AboutPanel section={section} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}
