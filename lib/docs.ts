import { driveImg } from "./drive";

function stripDocStyles(html: string): string {
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
}

/** Remove the doc's first H1 only — sheet supplies the page title. */
function stripFirstDocHeading(html: string): string {
  const firstHeading = html.match(/<h([1-6])[^>]*>[\s\S]*?<\/h\1>/i);
  if (firstHeading) {
    if (firstHeading[1] !== "1") return html;
    const index = html.indexOf(firstHeading[0]);
    return (
      html.slice(0, index) +
      html.slice(index + firstHeading[0].length).replace(/^\s*/, "")
    );
  }

  // Fallback for export HTML that uses a title class on <p> instead of <h1>
  return html.replace(
    /<p[^>]*class="[^"]*\btitle\b[^"]*"[^>]*>[\s\S]*?<\/p>\s*/i,
    "",
  );
}

function stripDocAttributes(html: string): string {
  let cleaned = html;
  for (let pass = 0; pass < 3; pass++) {
    cleaned = cleaned.replace(
      /\s(?:style|class|color|bgcolor|face|size|id)\s*=\s*"[^"]*"/gi,
      "",
    );
    cleaned = cleaned.replace(
      /\s(?:style|class|color|bgcolor|face|size|id)\s*=\s*'[^']*'/gi,
      "",
    );
  }
  return cleaned;
}

function sanitizeDocHtml(html: string): string {
  let cleaned = stripDocAttributes(html);

  cleaned = cleaned.replace(/<\/?(?:span|font)[^>]*>/gi, "");
  cleaned = cleaned.replace(/<a[^>]*href="#[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, "$1");
  cleaned = cleaned.replace(
    /<p[^>]*>\s*(?:<br\s*\/?>\s*|&nbsp;|\u00a0|\s)*<\/p>/gi,
    "",
  );

  return cleaned;
}

export async function fetchDoc(docId: string | undefined | null): Promise<string> {
  const id = String(docId || "")
    .trim()
    .replace(/\/+$/, "");
  if (!id) return "";

  const url = `/api/doc?id=${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url);
    const html = await res.text();

    // Published format: <div id="contents"> (stop before footer or end)
    // Export format: <body> content directly
    let innerHTML = "";
    const contentsDiv = html.match(/<div id="contents">([\s\S]*?)(?=<div id="footer"|<\/body>)/i);
    if (contentsDiv) {
      innerHTML = contentsDiv[1];
    } else {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (!bodyMatch) return "<p>Document not found.</p>";
      innerHTML = bodyMatch[1];
    }

    innerHTML = stripDocStyles(innerHTML);
    innerHTML = stripFirstDocHeading(innerHTML);
    innerHTML = sanitizeDocHtml(innerHTML);

    // Strip "Published using Google Docs" info box if it snuck in
    innerHTML = innerHTML.replace(/<[^>]+>[\s\S]*?Published using Google Docs[\s\S]*?<\/[^>]+>/gi, "");

    return parseShortcodes(innerHTML);
  } catch (err) {
    console.error("[Docs] Failed to fetch doc:", id, err);
    return "<p>Could not load document content.</p>";
  }
}

const TABLEAU_DEFAULT_HEIGHT = 700;

function parseShortcodes(html: string): string {
  html = html.replace(
    /<p[^>]*>\s*\[EMBED:tableau:([^|\]]+)\|?(\d*)\]\s*<\/p>/gi,
    (_, url, height) => {
      const frameHeight = height?.trim() ? Number(height) : TABLEAU_DEFAULT_HEIGHT;
      return `<div class="embed-tableau my-8 rounded-card overflow-hidden border border-border"><iframe src="${url.trim()}" width="100%" height="${frameHeight}" frameborder="0" allowfullscreen></iframe></div>`;
    },
  );

  html = html.replace(
    /<p[^>]*>\s*\[EMBED:mindmap:([^\]]+)\]\s*<\/p>/gi,
    (_, url) =>
      `<div class="embed-mindmap my-8 rounded-card overflow-hidden border border-border"><iframe src="${url.trim()}" width="100%" height="450" frameborder="0" allowfullscreen></iframe></div>`,
  );

  html = html.replace(
    /<p[^>]*>\s*\[EMBED:image:([^|\]]+)\|?([^\]]*)\]\s*<\/p>/gi,
    (_, id, caption) =>
      `<figure class="my-8"><img src="${driveImg(id.trim(), 1200)}" alt="${caption.trim()}" loading="lazy" class="w-full rounded-card border border-border" />${caption.trim() ? `<figcaption class="text-center text-xs text-fg-faint mt-2 italic">${caption.trim()}</figcaption>` : ""}</figure>`,
  );

  html = html.replace(
    /<p[^>]*>\s*\[EMBED:iframe:([^|\]]+)\|?(\d*)\]\s*<\/p>/gi,
    (_, url, height) =>
      `<div class="my-8 rounded-card overflow-hidden border border-border"><iframe src="${url.trim()}" width="100%" height="${height || 400}" frameborder="0" allowfullscreen></iframe></div>`,
  );

  html = html.replace(
    /<p[^>]*>\s*\[EMBED:youtube:([^\]]+)\]\s*<\/p>/gi,
    (_, id) =>
      `<div class="my-8 rounded-card overflow-hidden border border-border"><iframe src="https://www.youtube.com/embed/${id.trim()}" width="100%" height="400" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`,
  );

  html = html.replace(
    /<p[^>]*>\s*\[CALLOUT:([^\]]+)\]\s*<\/p>/gi,
    (_, text) =>
      `<div class="bg-primary/10 border-l-[3px] border-primary rounded-r-sm py-4 px-5 my-6 text-sm leading-relaxed">${text.trim()}</div>`,
  );

  html = html.replace(
    /<p[^>]*>\s*\[METRIC:([^|\]]+)\|([^\]]+)\]\s*<\/p>/gi,
    (_, value, label) =>
      `<div class="inline-flex flex-col items-start my-4 mr-4"><span class="font-display text-4xl font-bold text-primary leading-none">${value.trim()}</span><span class="text-xs text-fg-muted mt-1 uppercase tracking-widest">${label.trim()}</span></div>`,
  );

  html = html.replace(
    /<p[^>]*>\s*\[COL2:([^|\]]+)\|([^\]]+)\]\s*<\/p>/gi,
    (_, left, right) =>
      `<div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-6"><div>${left.trim()}</div><div>${right.trim()}</div></div>`,
  );

  html = html.replace(
    /<p[^>]*>\s*\[TAGS:([^\]]+)\]\s*<\/p>/gi,
    (_, tags) => {
      const pills = tags
        .split(",")
        .map((t: string) => `<span class="tag-pill">${t.trim()}</span>`)
        .join("");
      return `<div class="flex flex-wrap gap-2 my-4">${pills}</div>`;
    },
  );

  html = html.replace(
    /<p[^>]*>\s*\[DIVIDER\]\s*<\/p>/gi,
    '<hr class="border-none border-t border-border my-10" />',
  );

  html = html.replace(
    /<p[^>]*>\s*\[BUTTON:([^|\]]+)\|([^\]]+)\]\s*<\/p>/gi,
    (_, label, url) =>
      `<div class="my-6"><a href="${url.trim()}" class="btn-accent" target="_blank" rel="noopener">${label.trim()}</a></div>`,
  );

  html = html.replace(
    /<p[^>]*>\s*\[GITHUB:([^|\]]+)\|([^\]]+)\]\s*<\/p>/gi,
    (_, label, url) =>
      `<div class="my-6"><a href="${url.trim()}" class="btn-github" target="_blank" rel="noopener">${label.trim()}</a></div>`,
  );

  html = html.replace(
    /<p[^>]*>\s*\[QUOTE:([^\]]+)\]\s*<\/p>/gi,
    (_, text) =>
      `<blockquote class="font-display italic text-xl text-center py-8 px-12 my-8 border-y border-border leading-snug">${text.trim()}</blockquote>`,
  );

  return html;
}
