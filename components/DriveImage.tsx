"use client";

import { useState } from "react";
import { driveImg, driveImgDirect, driveImgView } from "@/lib/drive";

type DriveImageProps = {
  fileId: string | undefined | null;
  alt: string;
  width?: number;
  className?: string;
};

export function DriveImage({
  fileId,
  alt,
  width = 800,
  className = "",
}: DriveImageProps) {
  const id = String(fileId || "").trim();
  const [stage, setStage] = useState(0);
  const [failed, setFailed] = useState(false);

  if (!id) return null;

  const src =
    stage === 0
      ? driveImg(id, width)
      : stage === 1
        ? driveImgDirect(id)
        : driveImgView(id);

  if (failed) {
    return (
      <div
        className={`bg-bg-alt flex items-center justify-center text-fg-faint text-xs ${className}`}
        aria-hidden
      >
        —
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (stage < 2) {
          setStage((s) => s + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
