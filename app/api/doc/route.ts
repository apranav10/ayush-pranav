import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  // Accept either a raw doc ID or a full published URL.
  // export?format=html works for any publicly shared doc without needing "publish to web".
  // Full published URLs (starting with http) are passed through as-is.
  const pubUrl = id.startsWith("http")
    ? id
    : `https://docs.google.com/document/d/${id}/export?format=html`;

  try {
    const res = await fetch(pubUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      next: { revalidate: 300 },
    });
    const html = await res.text();
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("[api/doc] fetch failed:", id, err);
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
