"use client";

import { useCallback, useEffect, useRef } from "react";

const OVERLAY_STATE_KEY = "overlay";

export function useOverlayHistory(isOpen: boolean, onClose: () => void) {
  const suppressPopCloseRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    history.pushState({ [OVERLAY_STATE_KEY]: true }, "");

    const handlePopState = () => {
      if (suppressPopCloseRef.current) {
        suppressPopCloseRef.current = false;
        return;
      }
      onClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, onClose]);

  const requestClose = useCallback(() => {
    const state = history.state as Record<string, unknown> | null;
    if (state?.[OVERLAY_STATE_KEY]) {
      suppressPopCloseRef.current = true;
      history.back();
    }
    onClose();
  }, [onClose]);

  return requestClose;
}
