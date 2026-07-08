function cleanId(fileId: string | undefined | null): string {
  return String(fileId || "")
    .trim()
    .replace(/\/+$/, "");
}

export function driveImg(fileId: string | undefined | null, width = 800): string {
  const id = cleanId(fileId);
  if (!id) return "";
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
}

export function driveImgDirect(fileId: string | undefined | null): string {
  const id = cleanId(fileId);
  if (!id) return "";
  return `https://lh3.googleusercontent.com/d/${id}`;
}

export function driveImgView(fileId: string | undefined | null): string {
  const id = cleanId(fileId);
  if (!id) return "";
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

export function drivePdf(fileId: string | undefined | null): string {
  const id = cleanId(fileId);
  if (!id) return "#";
  return `https://drive.google.com/uc?export=download&id=${id}`;
}
