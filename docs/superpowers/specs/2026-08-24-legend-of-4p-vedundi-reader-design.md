# Legend of 4P Vedundi — Reading Site Design

## Purpose

A bilingual (EN/中) atmospheric novel-reading website for 《四个P的传说》(The Legend of 4P Vedundi), hosted free on GitHub Pages. Optimized for long-form reading on iPad and phone.

## Non-goals (this iteration)

- No music/audio player (author will send music later; scoped separately once requirements are clear)
- No CMS or admin UI — chapters are added by editing text files and a JSON manifest directly
- No backend, no build framework beyond a one-time Tailwind CLI compile

## Architecture

Single-page app (SPA) shell, hash-routed, no bundler:

```
index.html              # app shell: sidebar, top bar, progress bar, content pane
/src/styles.input.css   # Tailwind source (directives + custom layer)
/dist/styles.css        # Tailwind CLI compiled output, committed to repo
/src/app.js             # router, content loader, theme/lang state, animations
/src/fonts/             # self-hosted serif webfonts (EN + ZH)
/content/en/chapter-01.txt
/content/en/chapter-02.txt
/content/zh/chapter-01.txt
/content/zh/chapter-02.txt
/chapters.json          # ordered manifest: [{ slug, titleEn, titleZh }, ...]
```

Routing: `#chapter-01` etc. `app.js` reads the hash, looks up the chapter in `chapters.json`, fetches the matching language `.txt` file, and renders it. Deep links and browser back/forward work via `hashchange`.

Adding a chapter later = drop two `.txt` files (en + zh) into `content/` and add one entry to `chapters.json`. No code changes needed.

## Build

Tailwind v3 compiled locally via CLI, output committed:

```
npx tailwindcss -i src/styles.input.css -o dist/styles.css --minify
```

GitHub Pages serves the repo as-is — no CI build step. Re-run the CLI command locally whenever Tailwind classes change, then commit `dist/styles.css`.

## Content model

Each chapter `.txt` file: plain text, paragraphs separated by a blank line. `app.js` splits on `\n\n` and wraps each paragraph in a `<p>`. No Markdown, no HTML authoring needed in chapter files.

`chapters.json` shape:
```json
[
  { "slug": "chapter-01", "titleEn": "Chapter 1", "titleZh": "第一章" },
  { "slug": "chapter-02", "titleEn": "Chapter 2", "titleZh": "第二章" }
]
```

This build ships with 2 placeholder chapters (matching the 2 chapters the author has actually written) so the reading flow, TOC, and transitions can be verified end-to-end before real text is dropped in.

## Reading experience (per author's 7 requirements)

1. **Typography**: self-hosted serif webfonts (one Latin, one CJK), `line-height: 1.75`, `max-width: 65ch` on the text column, centered — text never spans full viewport width even on wide screens.
2. **Theme**: Tailwind `dark:` class strategy. Toggle button flips a `dark` class on `<html>`; choice persisted in `localStorage`; defaults to `prefers-color-scheme` on first visit.
3. **Sidebar TOC**: desktop = persistent collapsible rail (toggle button collapses to icon-only); mobile/tablet = slide-in drawer triggered by a menu button, closes on chapter selection or outside tap. Built from `chapters.json`, highlights the active chapter.
4. **Progress bar**: fixed top bar, width driven by scroll position within the current chapter's content pane (`scrollTop / (scrollHeight - clientHeight)`), updates on scroll via `requestAnimationFrame` throttling.
5. **Fade-in animation**: `IntersectionObserver` adds an `is-visible` class to paragraphs as they enter the viewport; CSS transitions `opacity` + small `translateY`. No animation library, no particles, no 3D.
6. **Palette & texture**: low-saturation warm-neutral palette (light: warm off-white / ink text; dark: warm charcoal / soft cream text). Paper texture is an inline SVG fractal-noise data URI as a low-opacity background layer — no external image asset, no network request.
7. **Chapter transitions**: on hash change, `app.js` fades out the current content pane, swaps content, resets scroll and progress bar, fades the new content in. Pure CSS transition, no navigation library.

## Language switching

Toggle button (EN / 中) in the top bar, same page, same URL. Switches which `content/{lang}/...` file is fetched for the current chapter; persisted in `localStorage` alongside theme.

## Responsive behavior

- Breakpoint-driven via Tailwind: sidebar is an overlay drawer below `md`, persistent rail at `md` and above.
- Touch-friendly tap targets (min 44px) for iPad/phone: theme toggle, language toggle, TOC entries, drawer open/close.
- Progress bar and top bar remain fixed and legible at all viewport widths.

## Testing

Manual verification (no test framework needed for a static content site):
- Load site, confirm placeholder chapter 1 renders, paragraphs fade in on scroll
- Toggle theme, reload page, confirm persisted
- Toggle language, confirm content and TOC labels switch, persisted
- Open TOC on mobile viewport, jump to chapter 2, confirm smooth transition + progress bar resets
- Resize desktop → mobile, confirm sidebar collapses to drawer
- Verify max-width/line-height hold at common breakpoints (iPhone, iPad portrait/landscape, desktop)

## Deployment

- Repo: `zhixuanlucasfeng-cmyk/legend-of-4p-vedundi` (public, for free GitHub Pages)
- Pages source: root of `main` branch
- URL: `https://zhixuanlucasfeng-cmyk.github.io/legend-of-4p-vedundi/`
