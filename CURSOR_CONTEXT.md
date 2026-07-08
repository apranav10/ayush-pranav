# Ayush Pranav — Portfolio: Cursor Agent Context File
**Use this file at the start of every Cursor conversation. It contains all context needed to work on this project.**

---

## 0. What This Project Is

A fully CMS-powered personal portfolio website for Ayush Pranav — MBA student at CMU Tepper, ex-JioStar (OTT/AI strategy). Zero backend, zero build step. All content lives in Google Sheets, Google Docs, and Google Drive. GitHub Pages hosts the static files. Cursor/Claude only ever touches code — never content.

---

## 1. Who Ayush Is (for copy/design decisions)

- MBA student at CMU Tepper School of Business, Pittsburgh (graduating May 2027, STEM-designated)
- Formerly Assistant Manager at JioStar — Disney+Hotstar+Jio OTT joint venture. Fast-track promoted. Managed $250M content P&L, built a patent-pending revenue attribution model, deployed AI recommendation engine driving 1.5M incremental subscriptions.
- Before JioStar: Associate Consultant at Capgemini on pharma/healthcare data strategy (Novartis and others)
- GMAT: 715 (99th percentile). GPA: 4.18. Forté Fellow. Tepper Merit Scholar.
- Targeting: AI Growth Strategy, AI Product Management, AI Transformation Consulting
- Differentiator: OTT/media domain specialization + ability to execute (not just strategize)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + CSS + JavaScript (no frameworks, no build step) |
| Hosting | GitHub Pages |
| CMS — structured data | Google Sheets (published as JSON, fetched client-side) |
| CMS — long-form content | Google Docs (published as web pages, fetched + re-styled by JS) |
| Media / Images | Google Drive (direct URLs) |
| Rich embeds | Tableau Public iframes, Whimsical/mindmap iframes |
| Calendar | Calendly inline embed |

**Core principle:** To add a blog post, update a number, swap a photo, add a role — only touch Google Sheets, Docs, or Drive. GitHub is touched only for UI/code changes.

---

## 3. File Structure

```
/
├── index.html                  # Single-page app shell — all section containers
├── css/
│   ├── main.css                # CSS variables, typography, global resets
│   ├── components.css          # Cards, tags, buttons, embeds, modals
│   ├── layout.css              # Grid, nav, section layout, masonry
│   └── animations.css          # Scroll-reveal, modal, hover transitions
├── js/
│   ├── config.js               # SHEET_ID — only hardcoded value in codebase
│   ├── cms.js                  # fetchSheet(tabName) — Sheets fetcher + parser
│   ├── docs.js                 # fetchDoc(docId) + parseShortcodes(html)
│   ├── drive.js                # driveImg(fileId, width) helper
│   ├── router.js               # Anchor-based SPA routing + scroll behavior
│   ├── modal.js                # Beyond Work modal logic
│   └── main.js                 # App init — calls all render functions
├── assets/
│   └── favicon.ico
└── README.md
```

---

## 4. The One Config Value

```javascript
// js/config.js
const CONFIG = {
  SHEET_ID: '1izySQZO_KE1KL4ms2m2A-GJAf14zmc9XUT6_bEphwzI',
};
```

This is the only hardcoded value. Everything else comes from the CMS.

---

## 5. Google Sheets CMS — Live Sheet

**Sheet ID:** `1izySQZO_KE1KL4ms2m2A-GJAf14zmc9XUT6_bEphwzI`

**Fetch URL pattern:**
```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet={TAB_NAME}
```

**The sheet must be:**
1. Shared as "Anyone with the link → Viewer"
2. Published via File → Share → Publish to web

**Once published, day-to-day cell edits are live immediately** (hard refresh the site with Cmd/Ctrl+Shift+R). Only re-publish when adding a brand new tab.

### Tab Schema Reference

#### SITE_CONFIG (key-value format)
| key | description |
|---|---|
| site_name | Full name — used in nav, title, footer |
| tagline | Browser tab + meta |
| hero_headline | H1 on landing page |
| hero_subheadline | Subline under headline |
| profile_photo_drive_id | Drive File ID (not full URL) of profile photo |
| about_doc_id | Google Doc ID for About narrative |
| resume_drive_id | Drive File ID of resume PDF |
| calendly_url | Full Calendly URL for inline embed |
| linkedin_url | Full LinkedIn profile URL |
| email | Email address |
| github_url | Full GitHub URL |
| testimonial_form_url | Google Form URL for endorsements |
| meta_description | SEO meta description |

#### IMPACT_METRICS
`order` | `value` | `label` | `context`

#### SELECTED_WORK
`id` | `title` | `subtitle` | `category` (Professional/Personal/Blog) | `tags` (pipe-separated) | `doc_id` | `cover_drive_id` | `featured` (TRUE/FALSE) | `status` (live/draft/coming-soon) | `order` | `impact_metric`

#### BLOG
`id` | `title` | `date` | `category` | `doc_id` | `cover_drive_id` | `tags` | `featured` | `status` | `order` | `read_time` | `linkedin_post_url`

#### EXPERIENCE
`id` | `company` | `role_title` | `type` (Full-time/Internship/Education) | `start_date` | `end_date` | `location` | `logo_drive_id` | `headline` | `highlights` (pipe-separated) | `extracurricular` (pipe-separated) | `metrics` (pipe-separated) | `order`

Sample data:
| id | company | role_title | start_date | end_date | order |
|---|---|---|---|---|---|
| cmu-mba | CMU Tepper | MBA Student | Aug 2025 | Present | 1 |
| jiostar-am | JioStar | Assistant Manager | Aug 2023 | Aug 2025 | 2 |
| jiostar-se | JioStar | Senior Executive | Feb 2022 | Jul 2023 | 3 |
| capgemini-ac | Capgemini | Associate Consultant | Jul 2019 | Jan 2022 | 4 |

#### SKILLS
`group` (Product/Strategy/Analytics/Technical) | `skill_name` | `project_id` (links to SELECTED_WORK id) | `order`

Skills by group:
- **Product:** PRD writing, A/B testing, roadmap prioritization, GTM strategy
- **Strategy:** Scenario planning, competitive analysis, M&A analysis, business case design
- **Analytics:** Cohort analysis, ROI modeling, KPI frameworks, variance analysis
- **Technical:** SQL, Python, Tableau, Databricks, Excel (financial modeling), Hive

#### TESTIMONIALS
`id` | `name` | `role` | `company` | `quote` | `photo_drive_id` | `approved` (TRUE/FALSE) | `order`

#### BEYOND_WORK
`id` | `drive_image_id` | `caption` (5 words max) | `category` (Travel/Fitness/Gaming/Cooking/Reading/Friends/Family/Music/Trekking) | `story` (2-4 sentences) | `reflection` (one italic closing line) | `aspect_ratio` (portrait/landscape/square) | `order` | `approved` (TRUE/FALSE)

#### ABOUT_NARRATIVE (key-value)
`skills_intro` | `testimonials_intro`

---

## 6. Google Drive Image Conventions

Drive images are served via these URL patterns (implemented in `drive.js`):

```javascript
// Thumbnail (resizable) — use this for most images
driveImg(fileId, width)  →  https://drive.google.com/thumbnail?id={fileId}&sz=w{width}

// Direct (fastest, no size control)
driveImgDirect(fileId)   →  https://lh3.googleusercontent.com/d/{fileId}

// PDF download
drivePdf(fileId)         →  https://drive.google.com/uc?export=download&id={fileId}
```

**The `fileId` is always just the ID string** — e.g. `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74` — never the full Drive URL.

To get a File ID: open the file in Drive → share URL looks like `https://drive.google.com/file/d/{FILE_ID}/view`. Copy only the `{FILE_ID}` part.

All Drive files must be shared as "Anyone with the link → Viewer".

---

## 7. Google Docs CMS

**Fetch pattern:**
```javascript
fetchDoc(docId)  →  fetches https://docs.google.com/document/d/{docId}/pub
```

The `docId` comes from the edit URL: `https://docs.google.com/document/d/{DOC_ID}/edit` — copy only `{DOC_ID}`.

**JS processing pipeline:**
1. Fetch the `/pub` URL
2. Extract `<div id="contents">`
3. Strip all `style="..."` attributes
4. Run `parseShortcodes(html)`
5. Apply site CSS to H2/H3/p/ul/li
6. Inject into page

**About doc structure:**
```
H2: The Journey
H2: Why Product and Strategy
H2: Why the MBA
H2: What Drives Me
```

**Project/Blog doc structure:**
```
H1: Title (skipped — title comes from Sheets)
H2: Section heading
H3: Subsection
Body paragraphs
[SHORTCODE]
```

---

## 8. Shortcode Reference (for Google Docs)

Each shortcode goes on its **own paragraph line** in the Doc.

| Shortcode | Output |
|---|---|
| `[EMBED:tableau:URL]` | Full-width Tableau iframe (500px) |
| `[EMBED:mindmap:URL]` | Responsive Whimsical/Miro iframe |
| `[EMBED:image:DRIVE_ID\|caption]` | Full-width Drive image + caption |
| `[EMBED:iframe:URL\|height_px]` | Custom-height iframe |
| `[EMBED:youtube:VIDEO_ID]` | Responsive YouTube iframe |
| `[CALLOUT:text]` | Highlighted block with left accent border |
| `[METRIC:value\|label]` | Large bold value + small label |
| `[COL2:left text\|right text]` | 50/50 side-by-side columns |
| `[TAGS:tag1,tag2,tag3]` | Row of styled tag pills |
| `[DIVIDER]` | Styled horizontal rule |
| `[BUTTON:label\|URL]` | Accent-colored link button |
| `[GITHUB:label\|REPO_URL]` | GitHub-styled link badge |
| `[QUOTE:text]` | Large centered italic blockquote |

---

## 9. Design Tokens

```css
:root {
  --color-bg:           #F8F7F4;   /* warm off-white */
  --color-bg-alt:       #F0EDE8;
  --color-fg:           #111111;   /* near-black */
  --color-fg-muted:     #555555;
  --color-fg-faint:     #999999;
  --color-accent:       #C8622A;   /* burnt amber — CTAs, metrics, highlights */
  --color-accent-light: rgba(200, 98, 42, 0.08);
  --color-border:       rgba(0,0,0,0.08);
  --color-border-mid:   rgba(0,0,0,0.15);
  --color-surface:      #FFFFFF;

  --font-display:  'Playfair Display', Georgia, serif;  /* headlines only */
  --font-body:     'Inter', sans-serif;                  /* everything else */

  --radius-card:  12px;
  --radius-tag:   20px;
  --radius-modal: 16px;

  --max-content:  1160px;
  --nav-height:   64px;
  --section-pad:  100px;
}
```

**Aesthetic references:** `read.cv` (minimalism), `leerob.io` (technical credibility), `paco.me` (typographic restraint)

**Motion rules:**
- Scroll-reveal: `.reveal` class → `fadeInUp` via IntersectionObserver (threshold 0.1)
- Card hover: `translateY(-2px)` + border darkens (150ms ease)
- Beyond Work hover: overlay fades in (200ms ease)
- Modal open: `scale(0.95) opacity(0)` → `scale(1) opacity(1)` (250ms ease)
- No parallax. No heavy animations.

---

## 10. Site Architecture — Sections

Single-page app with anchor routing: `#home` `#work` `#experience` `#about` `#beyond` `#contact`

| Section | Anchor | Data Source | Purpose |
|---|---|---|---|
| Home | #home | SITE_CONFIG + IMPACT_METRICS | Hero + 4 impact numbers |
| Selected Work | #work | SELECTED_WORK (featured=TRUE) | 3×2 project grid + View All |
| Experience | #experience | EXPERIENCE | Left-rail role selector + right panel |
| About | #about | about_doc_id + SKILLS + TESTIMONIALS | Narrative + skills grid + endorsements |
| Beyond Work | #beyond | BEYOND_WORK | Masonry photo wall + modal |
| Contact | #contact | SITE_CONFIG | Calendly + resume + socials |

---

## 11. Key JS Functions Reference

### cms.js
```javascript
fetchSheet(tabName)   // → array of row objects. Row 1 = headers, rows 2+ = data
fetchConfig()         // → key-value object from SITE_CONFIG tab
parsePipe(str)        // → array from pipe-separated string e.g. "A|B|C" → ["A","B","C"]
parseComma(str)       // → array from comma-separated string
```

### drive.js
```javascript
driveImg(fileId, width)   // thumbnail URL, width in px (default 800)
driveImgDirect(fileId)    // direct lh3 URL (no size control)
drivePdf(fileId)          // download URL for PDFs
```

### docs.js
```javascript
fetchDoc(docId)           // fetches + parses Google Doc, returns HTML string
parseShortcodes(html)     // processes all 13 shortcode types, returns HTML string
```

### main.js — render functions
```javascript
renderHome()              // hero photo, headline, subheadline, social links, impact metrics
renderSelectedWork()      // 3×2 featured project grid
renderViewAll(projects)   // all projects tabbed by category
renderExperience()        // left-rail role list + right-panel detail
renderAbout()             // doc narrative + skills grid + testimonials
renderBeyondWork()        // masonry photo grid
renderContact()           // Calendly embed + resume link + social links
```

### modal.js
```javascript
openModal(item)     // opens Beyond Work photo modal with item data
closeModal()        // closes modal, restores scroll
```

### router.js
```javascript
initRouter()        // sets up nav clicks, scroll-next buttons, IntersectionObserver for active nav
```

---

## 12. Section-by-Section Spec

### Home
- Full-viewport hero: left = circular profile photo, right = headline + subheadline + CTAs + social icons
- Below fold: 4-number impact metric row (alternating bg)
- Down-arrow CTA scrolls to next section
- **Rule:** Impact numbers live here ONLY. Never repeated in About.

### Selected Work
- 6 cards in 3×2 grid (desktop), `featured=TRUE` rows only
- Card: cover image + title + subtitle + tag pills + impact badge
- "View All →" expands inline panel with 3 tabs: Professional / Personal / Blog
- Click card → opens project detail overlay (full-page, fetches Google Doc)
- Project detail: hero image, title, tags, Doc content rendered with shortcodes, related projects sidebar

### Experience
- Left rail: company logo + role title + date range (ordered by `order` column)
- Right panel: updates on click — role headline, highlights as bullet list, extracurricular, key metrics
- Default: most recent role selected (order = 1)
- Left rail is `position: sticky` on desktop

### About
- Google Doc narrative (4-5 paragraphs, first person, no bullets)
- Skills grid: 4 groups × N skills, each skill optionally links to a project
- Testimonials: horizontal scroll row, `approved=TRUE` only
- **Does NOT contain:** impact numbers, personal photos, resume download

### Beyond Work (standalone — never merge with About)
- CSS masonry: `columns: 3` desktop / `columns: 2` tablet / `columns: 1` mobile
- Hover: photo darkens (rgba(0,0,0,0.45) overlay) + caption + category tag appear
- Click: modal opens (70-80% viewport) with larger image, story text, italic reflection, category pill
- Modal: ESC / × / click-outside to close. Body scroll locked while open.

### Contact
- Calendly/Cal.com inline embed (not popup)
- Single resume download button (PDF from Drive)
- LinkedIn, email, GitHub icon links
- "Worked with me? Endorse me →" → Google Form

---

## 13. Beyond Work Modal HTML (in index.html)

```html
<div id="beyond-modal" class="modal-backdrop" aria-modal="true" role="dialog">
  <div class="modal-card">
    <button class="modal-close" aria-label="Close">×</button>
    <img class="modal-img" src="" alt="">
    <div class="modal-body">
      <span class="modal-category tag-pill"></span>
      <p class="modal-caption"></p>
      <p class="modal-story"></p>
      <p class="modal-reflection"></p>
    </div>
  </div>
</div>
```

---

## 16. How to Run Locally

```bash
# In the project folder
python3 -m http.server 8080
# Then open http://localhost:8080
```

**Never open index.html directly** — Chrome blocks cross-origin fetches from `file://` URLs. Always use the local server.

**Hard refresh after CMS edits:** `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

---

## 17. How to Deploy (GitHub Pages)

1. Push the folder to a GitHub repo
2. Repo Settings → Pages → Source: `main` branch, root `/`
3. Site live at `https://{username}.github.io/{repo-name}`
4. No build step. No CI needed.

---

## 18. Workflow — Who Does What

| Task | Tool |
|---|---|
| Update a metric, headline, or any text | Google Sheets (SITE_CONFIG or relevant tab) |
| Add a project or blog post | Google Sheets row + Google Doc for content |
| Write/edit case study or About narrative | Google Docs |
| Add a photo (Beyond Work, project cover) | Google Drive upload + add row in Sheets |
| Fix a small CSS bug or copy tweak | Cursor (edit the relevant .css or .html file) |
| Add a new section or major feature | Cursor (bring this context file) |
| Change layout, animation, or design | Cursor (bring this context file) |

---


## 20. Google Drive Folder Structure

```
/Portfolio/
├── profile/          ← profile photo
├── projects/         ← cover images for each project
├── logos/            ← company logos for Experience section
├── beyond/           ← personal photos for Beyond Work
├── resume/           ← single resume PDF
└── testimonials/     ← endorser headshots
```

All files: Share → "Anyone with the link" → Viewer. Always use the File ID (not full URL) in Sheets.

---