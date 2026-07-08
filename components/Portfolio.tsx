"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchAboutSections,
  fetchConfig,
  fetchContactPage,
  fetchExperienceEntries,
  fetchSheet,
} from "@/lib/cms";
import type {
  AboutSection,
  BeyondWorkItem,
  ContactPageConfig,
  ExperienceEntry,
  Project,
  SiteConfig,
} from "@/lib/types";
import type { ProjectReturnContext } from "@/lib/projectNavigation";
import { captureProjectReturnContext, FEATURED_TAB_KEY, restoreProjectReturnContext } from "@/lib/projectNavigation";
import { parseAppHash, pushAppHash, scrollToSectionId } from "@/lib/scroll";
import { shuffleArray } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { SiteNav } from "./SiteNav";
import { Hero } from "./Hero";
import { SelectedWork } from "./SelectedWork";
import { Experience } from "./Experience";
import { About } from "./About";
import { BeyondWork } from "./BeyondWork";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { ProjectOverlay } from "./ProjectOverlay";
import { ScrollCue } from "./ScrollCue";
import { drivePdf } from "@/lib/drive";

export function Portfolio() {
  const { activeSection, navScrolled, scrollToSection } = useScrollSpy();

  const [config, setConfig] = useState<SiteConfig>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<ExperienceEntry[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [beyondItems, setBeyondItems] = useState<BeyondWorkItem[]>([]);
  const [contactPage, setContactPage] = useState<ContactPageConfig>({});
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [workRestoreContext, setWorkRestoreContext] = useState<ProjectReturnContext | null>(
    null,
  );
  const [workRestoreKey, setWorkRestoreKey] = useState(0);
  const [scrollLockY, setScrollLockY] = useState(0);
  const [experienceEntryId, setExperienceEntryId] = useState<string | null>(null);

  const returnContextRef = useRef<ProjectReturnContext | null>(null);
  const deepLinkHandledRef = useRef(false);

  useReveal(!loading);

  useEffect(() => {
    async function load() {
      const siteConfig = await fetchConfig();
      setConfig(siteConfig);

      const [selectedWork, experienceEntries, about, beyond, contact] = await Promise.all([
        fetchSheet<Project>("SELECTED_WORK"),
        fetchExperienceEntries(),
        fetchAboutSections(),
        fetchSheet<BeyondWorkItem>("BEYOND_WORK"),
        fetchContactPage(),
      ]);

      setProjects(selectedWork);
      setEntries(experienceEntries);
      setAboutSections(about);
      setBeyondItems(beyond);
      setContactPage(contact);
      setLoading(false);
    }
    load();
  }, []);

  const openProject = useCallback(
    (id: string, returnContext?: ProjectReturnContext) => {
      const project = projects.find((p) => p.id === id);
      if (!project) return;

      if (returnContext) {
        returnContextRef.current = returnContext;
        setScrollLockY(returnContext.windowScrollY);
      }

      setActiveProject(project);
      pushAppHash("work", id);
    },
    [projects],
  );

  const handleExperienceEntrySelect = useCallback((id: string) => {
    setExperienceEntryId(id);
    pushAppHash("experience", id);
  }, []);

  const closeProject = useCallback(() => {
    const context = returnContextRef.current;
    setActiveProject(null);
    pushAppHash("work");

    if (!context) return;

    setWorkRestoreContext(context);
    setWorkRestoreKey((key) => key + 1);

    requestAnimationFrame(() => {
      restoreProjectReturnContext(context);
      scrollToSectionId("work", "auto");
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    if (deepLinkHandledRef.current) return;
    deepLinkHandledRef.current = true;

    const { section, subId } = parseAppHash();
    if (!section) return;

    if (section === "experience" && subId) {
      setExperienceEntryId(subId);
    }

    if (section === "work" && subId) {
      const project = projects.find((p) => p.id === subId);
      if (project) {
        requestAnimationFrame(() => {
          openProject(
            subId,
            captureProjectReturnContext({ tab: FEATURED_TAB_KEY, page: 0 }),
          );
        });
        return;
      }
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSection(section, "auto");
      });
    });
  }, [loading, projects, openProject, scrollToSection]);

  const relatedProjects = useMemo(() => {
    if (!activeProject) return [];
    const pool = projects.filter(
      (p) => p.id !== activeProject.id && p.status !== "draft",
    );
    return shuffleArray(pool).slice(0, 3);
  }, [activeProject, projects]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="loading-spinner" />
      </div>
    );
  }

  const projectOpen = !!activeProject;

  return (
    <>
      <div
        className={projectOpen ? "hidden" : undefined}
        aria-hidden={projectOpen}
      >
        <SiteNav
          siteName={config.site_name || "Portfolio"}
          activeSection={activeSection}
          navScrolled={navScrolled}
          resumeUrl={config.resume_drive_id ? drivePdf(config.resume_drive_id) : undefined}
          onNavigate={scrollToSection}
        />

        <Hero config={config} />

        <SelectedWork
          projects={projects}
          onOpenProject={openProject}
          restoreContext={workRestoreContext}
          restoreKey={workRestoreKey}
        />

        <Experience
          entries={entries}
          config={config}
          activeEntryId={experienceEntryId}
          onEntrySelect={handleExperienceEntrySelect}
        />

        <About sections={aboutSections} />

        <BeyondWork items={beyondItems} />

        <Contact config={config} contactPage={contactPage} />

        <Footer />

        {activeSection !== "contact" && (
          <ScrollCue activeSection={activeSection} onClick={scrollToSection} />
        )}
      </div>

      <ProjectOverlay
        project={activeProject}
        related={relatedProjects}
        onClose={closeProject}
        onOpenProject={openProject}
        scrollLockY={scrollLockY}
      />
    </>
  );
}
