"use client";

import { useState } from "react";
import type { BeyondWorkItem } from "@/lib/types";
import { SectionCard } from "./SectionCard";
import { SectionPageHeader } from "./SectionPageHeader";
import { BeyondPhotoWall } from "./BeyondPhotoWall";
import { BeyondModal } from "./BeyondModal";

export function BeyondWork({ items }: { items: BeyondWorkItem[] }) {
  const [modalItem, setModalItem] = useState<BeyondWorkItem | null>(null);

  return (
    <>
      <SectionCard id="beyond" ariaLabel="Beyond Work" bgClassName="bg-bg">
        <SectionPageHeader eyebrow="Beyond Work" heading="Life outside the spreadsheet." />

        <div className="section-card-body beyond-section-body">
          <BeyondPhotoWall items={items} onSelect={setModalItem} />
        </div>
      </SectionCard>

      <BeyondModal item={modalItem} onClose={() => setModalItem(null)} />
    </>
  );
}
