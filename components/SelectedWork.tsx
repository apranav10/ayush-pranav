"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import {
  captureProjectReturnContext,
  FEATURED_TAB_KEY,
  type ProjectReturnContext,
} from "@/lib/projectNavigation";
import { isTruthy, sortByOrder } from "@/lib/utils";
import { SectionCard } from "./SectionCard";
import { SectionPageHeader } from "./SectionPageHeader";
import { ProjectCard } from "./ProjectCard";

const PROJECTS_PER_PAGE = 6;

type WorkTab = { key: string; label: string };

function buildWorkTabs(projects: Project[]): WorkTab[] {
  const published = sortByOrder(projects.filter((p) => p.status !== "draft"));
  const categories = [
    ...new Set(
      published
        .map((p) => String(p.project_category ?? "").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return [
    { key: FEATURED_TAB_KEY, label: "Featured" },
    ...categories.map((category) => ({ key: category, label: category })),
  ];
}

function getProjectsForTab(tab: string, projects: Project[]): Project[] {
  const published = projects.filter((p) => p.status !== "draft");

  if (tab === FEATURED_TAB_KEY) {
    return sortByOrder(published.filter((p) => isTruthy(p.featured))).slice(0, 6);
  }

  const tabLower = tab.toLowerCase();
  return sortByOrder(
    published.filter(
      (p) => String(p.project_category ?? "").trim().toLowerCase() === tabLower,
    ),
  );
}

function ProjectGrid({
  projects,
  onOpenProject,
}: {
  projects: Project[];
  onOpenProject: (id: string) => void;
}) {
  return (
    <div className="project-grid">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} onClick={onOpenProject} />
      ))}
    </div>
  );
}

function ProjectPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="shrink-0 flex items-center justify-center gap-3 pt-4">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="btn-outline !px-4 !py-1.5 !text-sm disabled:opacity-40 disabled:pointer-events-none"
      >
        Previous
      </button>
      <span className="text-sm text-fg-muted tabular-nums">
        {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        className="btn-outline !px-4 !py-1.5 !text-sm disabled:opacity-40 disabled:pointer-events-none"
      >
        Next
      </button>
    </div>
  );
}

export function SelectedWork({
  projects,
  onOpenProject,
  restoreContext,
  restoreKey = 0,
}: {
  projects: Project[];
  onOpenProject: (id: string, returnContext: ProjectReturnContext) => void;
  restoreContext?: ProjectReturnContext | null;
  restoreKey?: number;
}) {
  const tabs = useMemo(() => buildWorkTabs(projects), [projects]);
  const [activeTab, setActiveTab] = useState(FEATURED_TAB_KEY);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!restoreContext) return;

    const tabExists = tabs.some((tab) => tab.key === restoreContext.tab);
    setActiveTab(tabExists ? restoreContext.tab : FEATURED_TAB_KEY);
    setPage(restoreContext.page);
  }, [restoreContext, restoreKey, tabs]);

  const tabProjects = getProjectsForTab(activeTab, projects);
  const paginate = activeTab !== FEATURED_TAB_KEY;
  const totalPages = paginate
    ? Math.max(1, Math.ceil(tabProjects.length / PROJECTS_PER_PAGE))
    : 1;
  const visibleProjects = paginate
    ? tabProjects.slice(page * PROJECTS_PER_PAGE, (page + 1) * PROJECTS_PER_PAGE)
    : tabProjects;

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? activeTab;

  const handleOpenProject = (id: string) => {
    onOpenProject(id, captureProjectReturnContext({ tab: activeTab, page }));
  };

  return (
    <SectionCard id="work" ariaLabel="Selected Work" bgClassName="bg-surface">
      <SectionPageHeader eyebrow="Selected Work" heading="Built, shipped, delivered." />

      <div className="section-card-body flex flex-col justify-start min-h-0">
        <div className="shrink-0 flex gap-1 mb-4 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-base font-medium -mb-px border-b-2 motion-tab ${
                activeTab === tab.key
                  ? "text-fg border-primary"
                  : "text-fg-muted border-transparent hover:text-fg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {tabProjects.length === 0 ? (
          <p className="text-fg-faint text-sm py-12 text-center">
            No {activeLabel.toLowerCase()} projects yet.
          </p>
        ) : (
          <div key={`${activeTab}-${page}`} className="animate-content-in">
            <ProjectGrid projects={visibleProjects} onOpenProject={handleOpenProject} />
            {paginate && (
              <ProjectPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
