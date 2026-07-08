"use client";

import type { Project } from "@/lib/types";
import { parsePipe } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  Personal:     { color: "#166534", bg: "#DCFCE7" },
  Professional: { color: "#92400E", bg: "#FEF3C7" },
  Blog:         { color: "#991B1B", bg: "#FEE2E2" },
};

export function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick?: (id: string) => void;
}) {
  const tags = parsePipe(project.tags);
  const isComingSoon = project.status === "coming-soon";
  const typeKey = String(project.project_type ?? "").trim();
  const typeStyle = TYPE_CONFIG[typeKey];

  return (
    <article
      className={`project-card motion-card ${
        isComingSoon
          ? "opacity-70 cursor-default"
          : "cursor-pointer hover:-translate-y-0.5 hover:shadow-hover hover:border-border-mid"
      }`}
      onClick={() => !isComingSoon && onClick?.(project.id)}
    >
      <div className="project-card-header">
        <h3 className="project-card-title">{project.title.trim()}</h3>
        {(typeStyle || isComingSoon) && (
          <div className="flex shrink-0 items-center gap-1">
            {typeStyle && (
              <span
                className="project-card-category"
                style={{ color: typeStyle.color, background: typeStyle.bg }}
              >
                {typeKey}
              </span>
            )}
            {isComingSoon && (
              <span className="px-2 py-0.5 bg-fg text-bg rounded-tag text-[10px] font-medium leading-none whitespace-nowrap">
                Soon
              </span>
            )}
          </div>
        )}
      </div>

      <div className="project-card-body">
        {project.impact_metric && (
          <p className="project-card-metric">
            {project.impact_metric}
          </p>
        )}

        <p className="project-card-subtitle">{project.subtitle}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 shrink-0 mt-auto pt-1.5">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="tag-pill !text-xs !py-1">{t}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
