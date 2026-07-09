"use client";

import { useEffect } from "react";
import type { BeyondWorkItem } from "@/lib/types";
import { useOverlayHistory } from "@/hooks/useOverlayHistory";
import { DriveImage } from "./DriveImage";

export function BeyondModal({
  item,
  onClose,
}: {
  item: BeyondWorkItem | null;
  onClose: () => void;
}) {
  const requestClose = useOverlayHistory(!!item, onClose);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, requestClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/55"
      onClick={(e) => e.target === e.currentTarget && requestClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Photo detail"
    >
      <div
        className="beyond-modal animate-modal-in"
        style={{
          boxShadow: "0 12px 40px rgba(15,23,42,0.22), 0 2px 8px rgba(15,23,42,0.08)",
        }}
      >
        <div className="flex justify-end px-4 pt-3 md:hidden">
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center p-1.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fg text-base text-white shadow-card transition-colors hover:bg-primary">
              ×
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={requestClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 z-20 hidden h-8 w-8 items-center justify-center rounded-full bg-fg text-lg text-white shadow-card transition-colors hover:bg-primary md:flex"
        >
          ×
        </button>

        {item.reflection && (
          <p className="beyond-modal-reflection">{item.reflection}</p>
        )}

        <div className="beyond-modal-photo-wrap">
          <DriveImage
            fileId={item.drive_image_id}
            alt={item.caption || ""}
            width={1400}
            className="w-full h-full object-cover"
          />
        </div>

        {(item.caption || item.category) && (
          <div className="beyond-modal-caption-row">
            {item.category && (
              <span className="beyond-modal-category tag-pill !text-[10px] uppercase tracking-widest">
                {item.category}
              </span>
            )}
            {item.caption && (
              <p className="beyond-modal-caption">{item.caption}</p>
            )}
          </div>
        )}

        {item.story && (
          <>
            <hr className="beyond-modal-divider" />
            <p className="beyond-modal-story">{item.story}</p>
          </>
        )}
      </div>
    </div>
  );
}
