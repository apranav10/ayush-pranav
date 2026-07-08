# Ayush Pranav — Portfolio

CMS-powered personal portfolio built with **Next.js**, **React**, and **Tailwind CSS**. All content lives in Google Sheets, Docs, and Drive — no backend required.

## Tech stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 3
- Google Sheets / Docs / Drive as CMS

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## CMS configuration

The only hardcoded value is the Google Sheet ID in `lib/config.ts`. Everything else comes from the CMS tabs documented in `CURSOR_CONTEXT.md`.

## Deploy

**Vercel** (recommended): connect the repo and deploy — zero config.

**GitHub Pages**: use `output: 'export'` in `next.config.ts` and deploy the `out/` folder.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
