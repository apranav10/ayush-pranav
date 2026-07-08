"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SECTIONS, type SectionId } from "@/lib/config";
import {
  isSectionAligned,
  parseAppHash,
  scrollToSectionId,
  SCROLL_OFFSET,
} from "@/lib/scroll";

export function getActiveSectionFromScroll(): SectionId {
  const marker = SCROLL_OFFSET;
  let current: SectionId = "home";

  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= marker + 1) {
      current = id;
    }
  }

  return current;
}

export function useScrollSpy() {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [navScrolled, setNavScrolled] = useState(false);
  const scrollTargetRef = useRef<SectionId | null>(null);

  const syncActiveSection = useCallback(() => {
    if (scrollTargetRef.current) return;
    setActiveSection(getActiveSectionFromScroll());
  }, []);

  useEffect(() => {
    const { section } = parseAppHash();
    if (section) {
      setActiveSection(section);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 20);
      syncActiveSection();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    syncActiveSection();

    return () => window.removeEventListener("scroll", onScroll);
  }, [syncActiveSection]);

  const scrollToSection = useCallback(
    (id: SectionId, behavior: ScrollBehavior = "smooth") => {
      scrollTargetRef.current = id;
      setActiveSection(id);
      scrollToSectionId(id, behavior);

      const finishScroll = () => {
        if (!isSectionAligned(id)) {
          scrollToSectionId(id, "auto", false);
        }
        scrollTargetRef.current = null;
        setActiveSection(id);
      };

      if (behavior === "auto") {
        requestAnimationFrame(() => {
          requestAnimationFrame(finishScroll);
        });
        return;
      }

      if ("onscrollend" in window) {
        window.addEventListener("scrollend", finishScroll, { once: true });
        return;
      }

      window.setTimeout(finishScroll, 750);
    },
    [],
  );

  return { activeSection, navScrolled, scrollToSection };
}
