"use client";

import type { ContactPageConfig, SiteConfig } from "@/lib/types";
import { drivePdf } from "@/lib/drive";
import { LinkedInIcon, EmailIcon, LocationIcon } from "./icons";
import { SectionCard } from "./SectionCard";

function parseLocationField(raw?: string): { place: string; timezone: string | null } {
  const value = raw?.trim();
  if (!value) return { place: "", timezone: null };

  const pipeIndex = value.indexOf("|");
  if (pipeIndex === -1) return { place: value, timezone: null };

  const place = value.slice(0, pipeIndex).trim();
  const timezone = value.slice(pipeIndex + 1).trim() || null;
  return { place, timezone };
}

export function Contact({
  config,
  contactPage,
}: {
  config: SiteConfig;
  contactPage: ContactPageConfig;
}) {
  const { place, timezone } = parseLocationField(contactPage.location);
  const replyTime = contactPage.reply_time?.trim() || "";
  const status = contactPage.status?.trim();
  const closingStatement = contactPage.closing_statement?.trim();
  const showMeta = Boolean(place || timezone || replyTime);

  return (
    <SectionCard id="contact" ariaLabel="Contact" bgClassName="bg-surface">
      <div className="contact-page-header shrink-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
          <p className="section-eyebrow !mb-0 shrink-0">Contact</p>
          <h2 className="section-heading !mb-0 min-w-0">Let&apos;s talk.</h2>
        </div>
        {contactPage.quote && (
          <blockquote className="contact-quote">
            <p>{contactPage.quote}</p>
          </blockquote>
        )}
      </div>

      <div className="section-card-body">
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 lg:gap-8 items-stretch w-full min-w-0">
          <div className="experience-panel-card bg-surface border border-border rounded-card shadow-card w-full min-w-0 h-full flex flex-col gap-5">
            {contactPage.subtext && (
              <p className="text-fg-muted text-base lg:text-lg leading-relaxed m-0">
                {contactPage.subtext}
              </p>
            )}

            {contactPage.calendly_url && (
              <a
                href={contactPage.calendly_url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-booking-cta"
              >
                <span className="contact-booking-cta-label">
                  {contactPage.booking_cta_label || "Book a call"}
                </span>
                <span className="contact-booking-cta-hint">Opens in a new tab</span>
              </a>
            )}

            {status && (
              <p className="contact-status m-0">{status}</p>
            )}

            {showMeta && (
              <div className="contact-meta-row mt-auto">
                {(place || timezone) && (
                  <p className="contact-meta-location m-0">
                    <LocationIcon className="text-fg-muted" />
                    <span>
                      {place}
                      {place && timezone && " · "}
                      {timezone && <span className="italic">{timezone}</span>}
                    </span>
                  </p>
                )}
                {replyTime && (
                  <p className="contact-meta-reply m-0 italic">{replyTime}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col h-full w-full min-w-0">
            <div>
              <p className="section-eyebrow !mb-3">Resume</p>
              {config.resume_drive_id && (
                <a
                  href={drivePdf(config.resume_drive_id)}
                  className="btn-outline !py-2 !text-sm"
                  download
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0"
                    aria-hidden
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download Resume
                </a>
              )}
            </div>

            <div className="mt-auto pt-5 lg:pt-6">
              <p className="section-eyebrow !mb-3">Connect</p>
              <div className="flex flex-col gap-2.5">
                {config.linkedin_url && (
                  <a
                    href={config.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3.5 py-3 bg-surface border border-border rounded-card text-sm font-medium hover:border-border-mid hover:bg-bg transition-colors"
                  >
                    <LinkedInIcon className="text-fg-muted" />
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}
                {config.email && (
                  <a
                    href={`mailto:${config.email}`}
                    className="flex items-center gap-3 px-3.5 py-3 bg-surface border border-border rounded-card text-sm font-medium hover:border-border-mid hover:bg-bg transition-colors"
                  >
                    <EmailIcon className="text-fg-muted" />
                    <span className="truncate">{config.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {closingStatement && (
          <blockquote className="contact-closing">
            <p>{closingStatement}</p>
          </blockquote>
        )}
      </div>
    </SectionCard>
  );
}
