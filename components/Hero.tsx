"use client";

import type { SiteConfig } from "@/lib/types";
import { DriveImage } from "./DriveImage";
import { parsePipe } from "@/lib/utils";
import { LinkedInIcon, EmailIcon } from "./icons";

function HeroPhoto({ config }: { config: SiteConfig }) {
  const frameClass =
    "h-full min-h-[200px] w-full rounded-card bg-bg-alt border border-border overflow-hidden";

  if (!config.profile_photo_drive_id) {
    return (
      <div className={`${frameClass} flex items-center justify-center text-6xl text-fg-faint`}>
        👤
      </div>
    );
  }

  return (
    <div className={frameClass}>
      <DriveImage
        fileId={config.profile_photo_drive_id}
        alt={config.site_name || "Profile photo"}
        width={1000}
        className="w-full h-full object-cover object-[56%_15%]"
      />
    </div>
  );
}

function renderHeadline(text: string) {
  const lastDot = text.lastIndexOf(". ", text.length - 2);
  if (lastDot === -1) return <em className="font-normal">{text}</em>;
  const base = text.slice(0, lastDot + 1);
  const accent = text.slice(lastDot + 1).trim();
  return (
    <>
      <em className="font-normal">{base}</em>
      <br />
      <em className="text-primary font-bold">{accent}</em>
    </>
  );
}

export function Hero({ config }: { config: SiteConfig }) {
  const subheadlinePills = parsePipe(config.hero_subheadline);
  const availability = config.availability?.trim();

  return (
    <section
      id="home"
      aria-label="Home"
      className="h-screen max-h-screen flex flex-col bg-bg pt-nav snap-start snap-always overflow-hidden max-md:h-auto max-md:min-h-svh max-md:overflow-visible"
    >
      <div className="hero-layout flex-1 min-h-0 w-full page-shell flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-10 py-5 lg:py-6 pb-24 lg:pb-28">
        <div className="hero-photo-col lg:w-[44%] lg:max-w-[520px] shrink-0 min-h-0 flex animate-fade-in-left max-lg:h-[38vh] max-lg:max-h-[320px]">
          <HeroPhoto config={config} />
        </div>

        <div className="hero-content-col flex-1 min-w-0 min-h-0 flex flex-col justify-between gap-7 lg:gap-8 text-left max-lg:justify-start max-lg:gap-5">
          <div className="flex flex-col gap-7 lg:gap-8 max-lg:gap-5">
            {config.site_name && (
              <h1 className="m-0 shrink-0 font-display font-bold text-[clamp(40px,7.5vw,88px)] leading-none tracking-tight text-fg">
                {config.site_name}
              </h1>
            )}

            {config.tagline && (
              <p className="m-0 text-[clamp(18px,2.4vw,28px)] font-medium text-primary tracking-wide leading-snug">
                {config.tagline}
              </p>
            )}

            {config.hero_headline && (
              <p className="m-0 text-[clamp(16px,1.8vw,22px)] italic text-fg leading-snug max-w-3xl">
                {renderHeadline(config.hero_headline)}
              </p>
            )}

            {subheadlinePills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subheadlinePills.map((line, i) => (
                  <span
                    key={`${i}-${line}`}
                    className="inline-flex items-center px-4 py-1.5 bg-bg-alt border border-border-mid text-fg-muted rounded-tag text-sm font-medium tracking-wide"
                  >
                    {line}
                  </span>
                ))}
              </div>
            )}

            {availability && (
              <p className="hero-availability m-0">{availability}</p>
            )}
          </div>

          <div className="hero-cta-block shrink-0 flex flex-col items-start gap-2.5">
            <div className="flex flex-wrap items-center gap-3">
              {config.linkedin_url && (
                <a
                  href={config.linkedin_url}
                  target="_blank"
                  rel="noopener"
                  aria-label="LinkedIn"
                  className="hero-action-btn w-[46px] rounded-card border-2 border-border-mid bg-surface shadow-card flex items-center justify-center text-fg hover:text-white hover:bg-primary hover:border-primary transition-colors duration-300 ease-out"
                >
                  <LinkedInIcon className="!w-[24px] !h-[24px]" />
                </a>
              )}
              {config.email && (
                <a
                  href={`mailto:${config.email}`}
                  aria-label="Email"
                  className="hero-action-btn w-[46px] rounded-card border-2 border-border-mid bg-surface shadow-card flex items-center justify-center text-fg hover:text-white hover:bg-primary hover:border-primary transition-colors duration-300 ease-out"
                >
                  <EmailIcon className="!w-[24px] !h-[24px]" strokeWidth="2.2" />
                </a>
              )}
              <a
                href="#work"
                className="hero-action-btn inline-flex items-center gap-2 px-5 bg-primary text-white rounded-card text-sm font-medium tracking-wide transition-colors duration-300 ease-out hover:bg-secondary border-2 border-primary"
              >
                View my work →
              </a>
            </div>
            <a href="#experience" className="hero-secondary-cta">
              or see my experience →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
