"use client";

import { useEffect, useState } from "react";
import type { Testimonial } from "@/lib/types";
import { driveImg } from "@/lib/drive";

const ROTATE_MS = 6000;
const VISIBLE = 3;

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [page, setPage] = useState(0);
  const [fade, setFade] = useState(true);

  const totalPages = Math.max(1, Math.ceil(testimonials.length / VISIBLE));
  const needsRotation = testimonials.length > VISIBLE;

  useEffect(() => {
    if (!needsRotation) return;
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPage((p) => (p + 1) % totalPages);
        setFade(true);
      }, 280);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [needsRotation, totalPages]);

  const visible = testimonials.slice(page * VISIBLE, page * VISIBLE + VISIBLE);

  return (
    <div className="relative">
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 transition-opacity duration-500 ease-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {visible.map((t) => (
          <div
            key={t.id}
            className="bg-surface border border-border rounded-card p-6 lg:p-7 shadow-card h-full flex flex-col"
          >
            <p className="text-sm leading-relaxed italic text-fg mb-5 flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3 shrink-0">
              {t.photo_drive_id ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={driveImg(t.photo_drive_id, 80)}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                  {(t.name || "?")[0]}
                </div>
              )}
              <div>
                <span className="block text-sm font-medium">{t.name}</span>
                <span className="block text-xs text-fg-muted mt-0.5">
                  {t.role}, {t.company}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {needsRotation && (
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show testimonials page ${i + 1}`}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setPage(i);
                  setFade(true);
                }, 200);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === page ? "w-6 bg-primary" : "w-1.5 bg-border-mid hover:bg-secondary"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
