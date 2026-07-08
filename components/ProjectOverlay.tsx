"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Project } from "@/lib/types";
import { fetchDoc } from "@/lib/docs";
import { parsePipe } from "@/lib/utils";
import { DriveImage } from "./DriveImage";

const RAIL_STICKY_TOP_PX = 24;

function getRelativeTop(el: HTMLElement, container: HTMLElement): number {
  return el.getBoundingClientRect().top - container.getBoundingClientRect().top;
}

function getCoverImageId(project: Project): string {
  return (project.cover_image_id || project.cover_drive_id || "").trim();
}

function RelatedProjectsRail({
  related,
  onOpenProject,
  stickyTop = RAIL_STICKY_TOP_PX,
}: {
  related: Project[];
  onOpenProject: (id: string) => void;
  stickyTop?: number;
}) {
  if (!related.length) return null;

  return (
    <aside
      className="project-more-rail"
      aria-label="More projects"
      style={{ top: stickyTop }}
    >
      <p className="project-more-rail-label">More Projects</p>
      <div className="project-more-rail-stack">
        {related.map((item) => (
          <button
            key={item.id}
            type="button"
            className="project-more-rail-card"
            onClick={() => onOpenProject(item.id)}
          >
            <span className="project-more-rail-card-title">{item.title}</span>
            {item.subtitle && (
              <span className="project-more-rail-card-subtitle">{item.subtitle}</span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}

/** Anchor the rail to Overview / the start of case study content — ignore late headings. */
function getDocContentAnchor(docEl: HTMLElement): HTMLElement {
  const overviewHeading = Array.from(docEl.querySelectorAll("h2")).find((h2) =>
    /overview/i.test(h2.textContent ?? ""),
  );
  if (overviewHeading instanceof HTMLElement) return overviewHeading;

  const docTop = docEl.getBoundingClientRect().top;
  const isNearDocStart = (el: Element) =>
    el.getBoundingClientRect().top - docTop < 480;

  const hr = docEl.querySelector("hr");
  if (hr instanceof HTMLElement && isNearDocStart(hr)) return hr;

  const firstH2 = docEl.querySelector("h2");
  if (firstH2 instanceof HTMLElement && isNearDocStart(firstH2)) return firstH2;

  return docEl;
}

function getRailSpacerHeight(
  layout: HTMLElement,
  railSlot: HTMLElement,
  doc: HTMLElement,
): number {
  const slotTop = getRelativeTop(railSlot, layout);
  const docTop = getRelativeTop(doc, layout);
  const anchor = getDocContentAnchor(doc);
  const anchorTop = getRelativeTop(anchor, layout);

  // Never push the rail below the doc start — guards against late h2/hr anchors.
  const maxSpacer = docTop - slotTop + 48;
  return Math.max(0, Math.min(anchorTop - slotTop, maxSpacer));
}

function ProjectBackButton({
  backRef,
  onClose,
  overlaid,
}: {
  backRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  overlaid?: boolean;
}) {
  return (
    <button
      ref={backRef}
      type="button"
      onClick={onClose}
      className={overlaid ? "project-overlay-back project-overlay-back--cover" : "project-overlay-back"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}

export function ProjectOverlay({
  project,
  related,
  onClose,
  onOpenProject,
  scrollLockY,
}: {
  project: Project | null;
  related: Project[];
  onClose: () => void;
  onOpenProject: (id: string) => void;
  scrollLockY: number;
}) {
  const [docHtml, setDocHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [railAlign, setRailAlign] = useState<{ spacerHeight: number } | undefined>();
  const [showFloatingClose, setShowFloatingClose] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const railSlotRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const lockedScrollY = useRef(0);

  const updateRailAlign = useCallback(() => {
    if (typeof window === "undefined" || window.innerWidth < 1024) {
      setRailAlign(undefined);
      return;
    }

    const layout = layoutRef.current;
    const railSlot = railSlotRef.current;
    const doc = docRef.current;
    if (!layout || !railSlot || !doc) return;

    const slotRect = railSlot.getBoundingClientRect();
    if (slotRect.width < 1) return;

    const spacerHeight = getRailSpacerHeight(layout, railSlot, doc);

    setRailAlign({ spacerHeight });
  }, []);

  useEffect(() => {
    if (!project) return;
    setLoading(true);
    setDocHtml("");
    setRailAlign(undefined);
    setShowFloatingClose(false);
    fetchDoc(project.doc_id).then((html) => {
      setDocHtml(html || "<p>Case study coming soon.</p>");
      setLoading(false);
    });
  }, [project]);

  useEffect(() => {
    if (!project) return;

    lockedScrollY.current = scrollLockY;
    const html = document.documentElement;
    const { body } = document;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${lockedScrollY.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
    };
  }, [project, scrollLockY]);

  useEffect(() => {
    if (!project || !overlayRef.current) return;
    overlayRef.current.scrollTop = 0;
  }, [project]);

  useEffect(() => {
    if (loading || !docHtml) return;

    const run = () => requestAnimationFrame(updateRailAlign);
    run();

    const observer = new ResizeObserver(run);
    if (overlayRef.current) observer.observe(overlayRef.current);
    if (layoutRef.current) observer.observe(layoutRef.current);
    if (railSlotRef.current) observer.observe(railSlotRef.current);
    if (docRef.current) observer.observe(docRef.current);

    window.addEventListener("resize", run);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", run);
    };
  }, [loading, docHtml, updateRailAlign]);

  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, onClose]);

  useEffect(() => {
    if (!project || loading) return;

    const root = overlayRef.current;
    const back = backRef.current;
    if (!root || !back) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowFloatingClose(!entry.isIntersecting),
      { root, threshold: 0 },
    );

    observer.observe(back);
    return () => observer.disconnect();
  }, [project, loading, docHtml]);

  if (!project) return null;

  const coverImageId = getCoverImageId(project);
  const hasCover = !!coverImageId;

  const contentGrid = (
    <div ref={layoutRef} className="project-overlay-layout">
      <div className="project-overlay-main">
        <h1 className="text-[clamp(28px,4vw,48px)] font-semibold tracking-tight mb-4 text-fg">
          {project.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-10">
          {parsePipe(project.tags).map((t) => (
            <span key={t} className="tag-pill">{t}</span>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <div
            ref={docRef}
            className="doc-content"
            dangerouslySetInnerHTML={{ __html: docHtml }}
          />
        )}
      </div>

      <div ref={railSlotRef} className="project-more-rail-slot">
        {railAlign && (
          <div
            className="project-more-rail-spacer"
            style={{ height: railAlign.spacerHeight }}
            aria-hidden="true"
          />
        )}
        <RelatedProjectsRail
          related={related}
          onOpenProject={onOpenProject}
        />
      </div>
    </div>
  );

  return (
    <div ref={overlayRef} className="project-overlay-root">
      {showFloatingClose && (
        <button
          type="button"
          onClick={onClose}
          className="project-overlay-close-fab"
          aria-label="Close project"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {hasCover ? (
        <>
          <div className="project-overlay-cover-bleed">
            <DriveImage
              fileId={coverImageId}
              alt=""
              width={1600}
              className="project-overlay-cover-img"
            />
            <ProjectBackButton backRef={backRef} onClose={onClose} overlaid />
          </div>
          <div className="page-shell project-overlay-body project-overlay-body--with-cover pb-20 w-full">
            {contentGrid}
          </div>
        </>
      ) : (
        <div className="page-shell project-overlay-body py-20 w-full">
          <ProjectBackButton backRef={backRef} onClose={onClose} />
          {contentGrid}
        </div>
      )}
    </div>
  );
}
