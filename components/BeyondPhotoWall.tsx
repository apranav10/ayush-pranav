"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BeyondWorkItem } from "@/lib/types";
import { isTruthy } from "@/lib/utils";
import { DriveImage } from "./DriveImage";

type AspectKind = "portrait" | "landscape" | "square";

type TileSpan = { colSpan: number; rowSpan: number };

type TilePlacement = TileSpan & {
  colStart: number;
  rowStart: number;
};

type PackedLayout = {
  placements: TilePlacement[];
  totalRows: number;
  holes: number;
};

const GRID_GAP_PX = 2;
const GRID_PADDING_PX = 2;
const MIN_ROW_UNIT_PX = 60;
const VIEWPORT_HEIGHT_RATIO = 0.75;
/** Nav + section header + page padding */
const SECTION_TOP_RESERVE_PX = 200;
/** Scroll cue (bottom-8) + chevron stack + ~32px clearance */
const SCROLL_CUE_CLEARANCE_PX = 40;

function computeMaxHeightPx(): number {
  if (typeof window === "undefined") return 480;
  const viewport = window.innerHeight;
  const capped = Math.min(
    viewport * VIEWPORT_HEIGHT_RATIO,
    viewport - SECTION_TOP_RESERVE_PX - SCROLL_CUE_CLEARANCE_PX,
  );
  return Math.max(320, capped);
}

/** Known gap-closure overrides for the 8-entry desktop mix (4 columns). */
const DESKTOP_SPAN_OVERRIDES: Record<string, TileSpan> = {
  "travel-weekend": { colSpan: 1, rowSpan: 1 },
  "reading-nonfiction": { colSpan: 1, rowSpan: 1 },
};

function getDefaultSpans(kind: AspectKind, cols: number, itemId?: string): TileSpan {
  if (cols === 4 && itemId && DESKTOP_SPAN_OVERRIDES[itemId]) {
    return DESKTOP_SPAN_OVERRIDES[itemId];
  }
  if (cols === 1) {
    if (kind === "portrait") return { colSpan: 1, rowSpan: 2 };
    return { colSpan: 1, rowSpan: 1 };
  }
  if (cols === 2) {
    if (kind === "portrait") return { colSpan: 1, rowSpan: 2 };
    if (kind === "landscape") return { colSpan: 2, rowSpan: 1 };
    return { colSpan: 1, rowSpan: 1 };
  }
  if (kind === "portrait") return { colSpan: 1, rowSpan: 2 };
  if (kind === "landscape") return { colSpan: 2, rowSpan: 1 };
  return { colSpan: 1, rowSpan: 1 };
}

function normalizeAspect(raw?: string): AspectKind {
  const value = (raw || "landscape").toLowerCase();
  if (value === "portrait") return "portrait";
  if (value === "square") return "square";
  return "landscape";
}

function getDriveImageId(item: BeyondWorkItem): string {
  const record = item as BeyondWorkItem & Record<string, unknown>;
  return String(record.drive_image_id || record.image_drive_id || "").trim();
}

function canPlace(
  occupied: boolean[][],
  col: number,
  row: number,
  colSpan: number,
  rowSpan: number,
  cols: number,
): boolean {
  if (col + colSpan > cols) return false;
  for (let r = row; r < row + rowSpan; r++) {
    if (!occupied[r]) occupied[r] = Array(cols).fill(false);
    for (let c = col; c < col + colSpan; c++) {
      if (occupied[r][c]) return false;
    }
  }
  return true;
}

function markPlace(
  occupied: boolean[][],
  col: number,
  row: number,
  colSpan: number,
  rowSpan: number,
) {
  for (let r = row; r < row + rowSpan; r++) {
    if (!occupied[r]) occupied[r] = [];
    for (let c = col; c < col + colSpan; c++) {
      occupied[r][c] = true;
    }
  }
}

function countHoles(occupied: boolean[][], totalRows: number, cols: number): number {
  let holes = 0;
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!occupied[r]?.[c]) holes++;
    }
  }
  return holes;
}

/** First-fit dense packing with explicit coordinates (matches document order). */
function packTiles(spans: TileSpan[], cols: number): PackedLayout {
  const occupied: boolean[][] = [];
  const placements: TilePlacement[] = [];
  let totalRows = 0;

  for (const span of spans) {
    let placed = false;
    for (let row = 0; row < 200 && !placed; row++) {
      for (let col = 0; col <= cols - span.colSpan; col++) {
        if (canPlace(occupied, col, row, span.colSpan, span.rowSpan, cols)) {
          markPlace(occupied, col, row, span.colSpan, span.rowSpan);
          placements.push({
            ...span,
            colStart: col + 1,
            rowStart: row + 1,
          });
          totalRows = Math.max(totalRows, row + span.rowSpan);
          placed = true;
          break;
        }
      }
    }
  }

  return {
    placements,
    totalRows: Math.max(totalRows, 1),
    holes: countHoles(occupied, totalRows, cols),
  };
}

function popcount(n: number): number {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}

/**
 * Close packing gaps by compacting the fewest tiles to 1×1.
 * Pinned tiles are never compacted. Among equal override counts, prefer
 * compacting later, non-pinned entries (e.g. travel + reading on desktop).
 */
function resolveGapFreeLayout(
  kinds: AspectKind[],
  cols: number,
  pinned: boolean[],
  itemIds: string[],
): { spans: TileSpan[]; layout: PackedLayout } {
  const defaults = kinds.map((kind, index) =>
    getDefaultSpans(kind, cols, itemIds[index]),
  );
  const defaultLayout = packTiles(defaults, cols);

  if (defaultLayout.holes === 0 || cols !== 4) {
    return { spans: defaults, layout: defaultLayout };
  }

  const tileCount = kinds.length;

  for (let overrideCount = 1; overrideCount <= tileCount; overrideCount++) {
    const validMasks: number[] = [];

    for (let mask = 1; mask < 1 << tileCount; mask++) {
      if (popcount(mask) !== overrideCount) continue;
      if (pinned.some((isPinned, index) => isPinned && (mask & (1 << index)))) continue;

      const spans = defaults.map((span, index) =>
        mask & (1 << index) ? { colSpan: 1, rowSpan: 1 } : span,
      );
      const layout = packTiles(spans, cols);
      if (layout.holes === 0) validMasks.push(mask);
    }

    if (validMasks.length) {
      validMasks.sort((a, b) => overridePriority(a, pinned, kinds) - overridePriority(b, pinned, kinds));
      const mask = validMasks[0];
      const spans = defaults.map((span, index) =>
        mask & (1 << index) ? { colSpan: 1, rowSpan: 1 } : span,
      );
      return { spans, layout: packTiles(spans, cols) };
    }
  }

  return { spans: defaults, layout: defaultLayout };
}

function overridePriority(
  mask: number,
  pinned: boolean[],
  kinds: AspectKind[],
): number {
  let score = 0;
  for (let index = 0; index < kinds.length; index++) {
    if (!(mask & (1 << index))) continue;
    const kind = kinds[index];
    if (kind === "portrait") score += 30;
    else if (kind === "landscape") score += 10;
    else score += 5;
    score += (index + 1) * 2;
    if (pinned[index]) score += 1000;
  }
  return score;
}

function computeRowUnit(availableHeight: number, totalRows: number): number {
  const totalGap = GRID_GAP_PX * Math.max(0, totalRows - 1);
  const usable = availableHeight - GRID_PADDING_PX * 2 - totalGap;
  return Math.max(MIN_ROW_UNIT_PX, Math.floor(usable / totalRows));
}

function gridContentHeight(rowUnit: number, totalRows: number): number {
  return rowUnit * totalRows + GRID_PADDING_PX * 2 + GRID_GAP_PX * Math.max(0, totalRows - 1);
}

function imageWidthForTile(colWidthPx: number, colSpan: number): number {
  return Math.min(1800, Math.max(960, Math.ceil(colWidthPx * colSpan * 2)));
}

function useGridColumns() {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width < 640) setCols(1);
      else if (width < 1024) setCols(2);
      else setCols(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
}

export function BeyondPhotoWall({
  items,
  onSelect,
}: {
  items: BeyondWorkItem[];
  onSelect: (item: BeyondWorkItem) => void;
}) {
  const cols = useGridColumns();
  const shellRef = useRef<HTMLDivElement>(null);
  const [maxHeightPx, setMaxHeightPx] = useState(computeMaxHeightPx);

  const approved = useMemo(
    () =>
      items
        .filter((item) => isTruthy(item.approved))
        .sort((a, b) => {
          const aPinned = isTruthy(a.pinned) ? 0 : 1;
          const bPinned = isTruthy(b.pinned) ? 0 : 1;
          return aPinned - bPinned;
        }),
    [items],
  );

  useEffect(() => {
    const driveIds = approved.map(getDriveImageId).filter(Boolean);
    const duplicates = driveIds.filter((id, index) => driveIds.indexOf(id) !== index);
    if (duplicates.length) {
      console.warn(
        "[BeyondPhotoWall] Distinct CMS entries share the same drive_image_id (not a render bug):",
        [...new Set(duplicates)],
      );
    }
  }, [approved]);

  useEffect(() => {
    const update = () => setMaxHeightPx(computeMaxHeightPx());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { tiles, totalRows, rowUnit, shellHeightPx } = useMemo(() => {
    const kinds = approved.map((item) => normalizeAspect(item.aspect_ratio));
    const pinned = approved.map((item) => isTruthy(item.pinned));
    const { spans, layout } = resolveGapFreeLayout(
      kinds,
      cols,
      pinned,
      approved.map((item) => item.id),
    );

    const available = maxHeightPx || gridContentHeight(140, layout.totalRows);
    const unit = computeRowUnit(available, layout.totalRows);
    const height = gridContentHeight(unit, layout.totalRows);

    const tileData = approved.map((item, index) => ({
      item,
      kind: kinds[index],
      index,
      driveId: getDriveImageId(item),
      ...spans[index],
      colStart: layout.placements[index]?.colStart ?? 1,
      rowStart: layout.placements[index]?.rowStart ?? 1,
    }));

    return {
      tiles: tileData,
      totalRows: layout.totalRows,
      rowUnit: unit,
      shellHeightPx: height,
    };
  }, [approved, cols, maxHeightPx]);

  const colWidthPx = useMemo(() => {
    const shellWidth = shellRef.current?.clientWidth ?? 960;
    return Math.max(96, (shellWidth - GRID_PADDING_PX * 2) / cols);
  }, [cols]);

  if (!tiles.length) {
    return <p className="text-fg-faint text-sm text-center py-8">Photos coming soon.</p>;
  }

  return (
    <div
      ref={shellRef}
      className="beyond-photo-grid-shell"
      style={{ height: shellHeightPx, maxHeight: maxHeightPx }}
    >
      <div
        className="beyond-photo-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridAutoRows: `${rowUnit}px`,
          height: shellHeightPx,
        }}
        aria-label="Photo wall"
      >
        {tiles.map((tile) => (
          <button
            key={`beyond-${tile.index}-${tile.item.id}`}
            type="button"
            onClick={() => onSelect(tile.item)}
            className="beyond-photo-tile group"
            data-aspect={tile.kind}
            style={{
              gridColumn: `${tile.colStart} / span ${tile.colSpan}`,
              gridRow: `${tile.rowStart} / span ${tile.rowSpan}`,
            }}
          >
            {tile.driveId ? (
              <DriveImage
                fileId={tile.driveId}
                alt={tile.item.caption || "Beyond work photo"}
                width={imageWidthForTile(colWidthPx, tile.colSpan)}
                className="beyond-photo-tile-image"
              />
            ) : (
              <div
                className="beyond-photo-tile-image bg-bg-alt border border-dashed border-border-mid"
                aria-hidden
              />
            )}
            <div className="beyond-photo-tile-overlay" aria-hidden />
            {tile.item.category && (
              <span className="beyond-photo-tile-category">{tile.item.category}</span>
            )}
            {tile.item.caption && (
              <span className="beyond-photo-tile-caption">{tile.item.caption}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
