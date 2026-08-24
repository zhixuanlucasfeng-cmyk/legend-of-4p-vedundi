# Legend of 4P Vedundi Reader Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a bilingual (EN/中), atmospheric, static novel-reading website for 《四个P的传说》(The Legend of 4P Vedundi) to GitHub Pages.

**Architecture:** Single-page app shell (`index.html` + `src/app.js`), hash-routed, no bundler. Tailwind CSS v3 compiled once via CLI into a committed `dist/styles.css`. Chapter text lives in plain `.txt` files under `content/{lang}/`, indexed by `chapters.json`; the app fetches and renders them client-side with fade transitions.

**Tech Stack:** HTML5, vanilla JS (ES2020, no framework), Tailwind CSS v3 (CLI build only, no PostCSS pipeline beyond Tailwind itself), self-hosted Noto Serif / Noto Serif SC webfonts, GitHub Pages static hosting.

**Spec:** `docs/superpowers/specs/2026-08-24-legend-of-4p-vedundi-reader-design.md`

## Global Constraints

- Tailwind CSS **v3** (not v4) — `darkMode: 'class'` strategy
- No bundler, no CDN script tags, no runtime network requests except fetching same-origin `chapters.json` and `content/*.txt`
- Fonts are self-hosted `.woff2` files committed to the repo — no Google Fonts CDN link at runtime
- Chapter content files are plain text, paragraphs separated by a blank line — no Markdown
- Reading column: `max-width: 65ch`, `line-height: 1.75`
- Repo: `zhixuanlucasfeng-cmyk/legend-of-4p-vedundi`, public, Pages served from root of `main`
- No animation libraries, no particles, no 3D — CSS transitions + `IntersectionObserver` only
- Respect `prefers-reduced-motion: reduce`

---

## File Structure

```
package.json
tailwind.config.js
.gitignore
index.html
README.md
src/
  styles.input.css
  app.js
  fonts/
    noto-serif-400.woff2
    noto-serif-600.woff2
    noto-serif-sc-400.woff2
    noto-serif-sc-600.woff2
dist/
  styles.css          (generated, committed)
content/
  en/chapter-01.txt
  en/chapter-02.txt
  zh/chapter-01.txt
  zh/chapter-02.txt
chapters.json
```

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tailwind.config.js`
- Create: `.gitignore`
- Create: `README.md` (stub, filled in fully in Task 10)

**Interfaces:**
- Produces: `npm run build:css` script that later tasks rely on to compile `src/styles.input.css` → `dist/styles.css`
- Produces: Tailwind theme tokens `colors.paper/paper-dark`, `colors.ink/ink-dark`, `colors.accent/accent-dark`, `fontFamily.serif` — later tasks' HTML/CSS use these exact class names (`bg-paper`, `dark:bg-paper-dark`, `text-ink`, `dark:text-ink-dark`, `text-accent`, `dark:text-accent-dark`, `font-serif`)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "legend-of-4p-vedundi",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "build:css": "tailwindcss -i src/styles.input.css -o dist/styles.css --minify"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0"
  }
}
```

- [ ] **Step 2: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#f5f1e8', dark: '#221f1a' },
        ink: { DEFAULT: '#2b2620', dark: '#e8e0d0' },
        accent: { DEFAULT: '#8b6f47', dark: '#c9a876' },
      },
      fontFamily: {
        serif: ['"Noto Serif"', '"Noto Serif SC"', 'serif'],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
.DS_Store
```

- [ ] **Step 4: Create stub `README.md`**

```markdown
# Legend of 4P Vedundi — Reader Site

Setup and deployment instructions are added in a later step of the build.
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` created, no errors.

- [ ] **Step 6: Verify Tailwind CLI is available**

Run: `npx tailwindcss --help`
Expected: prints Tailwind CLI usage text (confirms the binary resolved from `node_modules`).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tailwind.config.js .gitignore README.md
git commit -m "Scaffold project: package.json, Tailwind config, gitignore"
```

---

### Task 2: Self-hosted serif webfonts

**Files:**
- Create: `src/fonts/noto-serif-400.woff2`
- Create: `src/fonts/noto-serif-600.woff2`
- Create: `src/fonts/noto-serif-sc-400.woff2`
- Create: `src/fonts/noto-serif-sc-600.woff2`

**Interfaces:**
- Produces: four `.woff2` files at the exact paths above — Task 3's `@font-face` rules in `src/styles.input.css` reference these exact filenames via relative path `../src/fonts/<name>.woff2` (the CSS lives in `src/`, but is compiled into `dist/`, so the relative path must resolve correctly from the *compiled file's* location — see Task 3 for why the path has a leading `../src/`)

- [ ] **Step 1: Download Noto Serif (Latin) regular + semibold, latin subset only**

```bash
mkdir -p src/fonts /tmp/fontdl
curl -sL "https://gwfh.mranftl.com/api/fonts/noto-serif?download=zip&subsets=latin&variants=regular,600" -o /tmp/fontdl/noto-serif.zip
unzip -o /tmp/fontdl/noto-serif.zip -d /tmp/fontdl/noto-serif
ls /tmp/fontdl/noto-serif
```

Expected: a listing containing two `.woff2` files, one with `regular` in the name and one with `600` in the name.

- [ ] **Step 2: Download Noto Serif SC (Simplified Chinese) regular + semibold**

```bash
curl -sL "https://gwfh.mranftl.com/api/fonts/noto-serif-sc?download=zip&subsets=chinese-simplified&variants=regular,600" -o /tmp/fontdl/noto-serif-sc.zip
unzip -o /tmp/fontdl/noto-serif-sc.zip -d /tmp/fontdl/noto-serif-sc
ls /tmp/fontdl/noto-serif-sc
```

Expected: same pattern — one `regular` and one `600` `.woff2` file.

If either `gwfh.mranftl.com` call fails (network error, API changed shape), fall back to fetching directly from Google Fonts: `curl -sA "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600&family=Noto+Serif+SC:wght@400;600&display=swap"` and download the `url(...)` links found inside for the `latin` (for Noto Serif) and default (for Noto Serif SC) unicode-range blocks.

- [ ] **Step 3: Copy into place with fixed names**

```bash
cp /tmp/fontdl/noto-serif/*regular.woff2 src/fonts/noto-serif-400.woff2
cp /tmp/fontdl/noto-serif/*600.woff2 src/fonts/noto-serif-600.woff2
cp /tmp/fontdl/noto-serif-sc/*regular.woff2 src/fonts/noto-serif-sc-400.woff2
cp /tmp/fontdl/noto-serif-sc/*600.woff2 src/fonts/noto-serif-sc-600.woff2
```

- [ ] **Step 4: Verify all four files exist and are non-trivial in size**

Run: `ls -la src/fonts/`
Expected: four `.woff2` files, each larger than 1000 bytes (a 0-byte or missing file means the download/copy failed and must be retried).

- [ ] **Step 5: Commit**

```bash
git add src/fonts/
git commit -m "Add self-hosted Noto Serif / Noto Serif SC webfonts"
```

---

### Task 3: Tailwind input CSS (fonts, palette utilities, texture, animation classes) + build

**Files:**
- Create: `src/styles.input.css`
- Create (generated): `dist/styles.css`

**Interfaces:**
- Consumes: font files from Task 2 at `src/fonts/*.woff2`; Tailwind config tokens from Task 1
- Produces: compiled `dist/styles.css`, loaded by `index.html` (Task 5) via `<link rel="stylesheet" href="dist/styles.css">`. Produces utility classes `.paper-texture`, `.reveal`, `.reveal.is-visible` that Task 5 (HTML) and Task 8 (animations) use by exact name.

- [ ] **Step 1: Create `src/styles.input.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
  font-family: 'Noto Serif';
  src: url('../src/fonts/noto-serif-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Noto Serif';
  src: url('../src/fonts/noto-serif-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Noto Serif SC';
  src: url('../src/fonts/noto-serif-sc-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Noto Serif SC';
  src: url('../src/fonts/noto-serif-sc-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@layer utilities {
  .paper-texture {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
  }

  .reveal {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  .reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

**Why the font `url()` paths start with `../src/fonts/...` even though this file already lives in `src/`:** Tailwind CLI copies `url()` values into `dist/styles.css` unchanged — it does not rewrite asset paths like a bundler would. The browser resolves a stylesheet's relative URLs against the stylesheet's own served location, which will be `dist/styles.css`. So the path must be correct *from `dist/`*, i.e. `dist/../src/fonts/...` = `src/fonts/...`. Writing a path that's merely correct from `src/` (e.g. `./fonts/...`) would 404 once compiled into `dist/`.

- [ ] **Step 2: Build the CSS**

Run: `npm run build:css`
Expected: `dist/styles.css` is created with no errors.

- [ ] **Step 3: Verify compiled output contains the custom pieces**

Run: `grep -c "paper-texture" dist/styles.css && grep -c "Noto Serif" dist/styles.css`
Expected: both greps return a count of at least 1.

- [ ] **Step 4: Commit**

```bash
git add src/styles.input.css dist/styles.css
git commit -m "Add Tailwind input CSS with fonts, paper texture, reveal animation; build dist/styles.css"
```

---

### Task 4: Chapter manifest + placeholder content

**Files:**
- Create: `chapters.json`
- Create: `content/en/chapter-01.txt`
- Create: `content/en/chapter-02.txt`
- Create: `content/zh/chapter-01.txt`
- Create: `content/zh/chapter-02.txt`

**Interfaces:**
- Produces: `chapters.json` — an array of `{ slug: string, titleEn: string, titleZh: string }`, ordered — consumed by `app.js` (Task 6) as `state.chapters`
- Produces: `content/{en,zh}/{slug}.txt` files, each plain text with paragraphs separated by a blank line — consumed by `app.js`'s `renderChapterText()` (Task 6), which splits on blank lines

- [ ] **Step 1: Create `chapters.json`**

```json
[
  { "slug": "chapter-01", "titleEn": "Chapter One", "titleZh": "第一章" },
  { "slug": "chapter-02", "titleEn": "Chapter Two", "titleZh": "第二章" }
]
```

- [ ] **Step 2: Create `content/en/chapter-01.txt`**

```
This is placeholder text standing in for Chapter One of The Legend of 4P Vedundi, until the author's real manuscript is dropped into this file.

It exists only to prove the reading experience end to end: the serif typography, the 65-character column width, the generous line height, and the paragraph-by-paragraph fade-in as you scroll.

Replace the contents of this file with the real chapter text when it's ready. Paragraphs are separated by a single blank line, exactly like this one.

No markdown, no HTML — just plain paragraphs, the way a manuscript reads.
```

- [ ] **Step 3: Create `content/en/chapter-02.txt`**

```
This is placeholder text for Chapter Two.

Navigating here from Chapter One should feel like turning a page: the old chapter fades out, this one fades in, and the reading progress bar at the top resets to the beginning.

Once the real second chapter is ready, this file is where it goes.
```

- [ ] **Step 4: Create `content/zh/chapter-01.txt`**

```
这是《四个P的传说》第一章的占位文本，等作者把正式书稿放进这个文件后，这段文字就会被替换掉。

它存在的目的只是为了验证整套阅读体验：衬线字体、六十五字符宽的正文栏、宽松的行距，以及滚动时逐段淡入的效果。

准备好正式内容后，直接替换这个文件里的文字即可。段落之间用一个空行分隔，就像这样。

不需要 Markdown，也不需要 HTML——就是像手稿一样的纯段落。
```

- [ ] **Step 5: Create `content/zh/chapter-02.txt`**

```
这是第二章的占位文本。

从第一章跳转到这里时，应该有翻页的感觉：旧的章节淡出，新的章节淡入，顶部的阅读进度条会重新归零。

等第二章的正式内容准备好后，放进这个文件即可。
```

- [ ] **Step 6: Verify JSON is valid and files are non-empty**

Run: `node -e "console.log(JSON.parse(require('fs').readFileSync('chapters.json','utf8')).length)"`
Expected: prints `2`

Run: `wc -l content/en/*.txt content/zh/*.txt`
Expected: each file has more than 0 lines

- [ ] **Step 7: Commit**

```bash
git add chapters.json content/
git commit -m "Add chapter manifest and placeholder EN/ZH chapters"
```

---

### Task 5: HTML shell

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `dist/styles.css` (Task 3), Tailwind classes `bg-paper`/`dark:bg-paper-dark`/`text-ink`/`dark:text-ink-dark`/`text-accent`/`dark:text-accent-dark`/`font-serif`/`paper-texture` (Tasks 1 & 3)
- Produces: DOM element IDs that `app.js` (Task 6+) binds to: `#progress-bar`, `#sidebar-toggle`, `#chapter-title`, `#lang-toggle`, `#theme-toggle`, `#theme-icon`, `#drawer-backdrop`, `#sidebar`, `#toc-list`, `#content-pane`, `#chapter-content`. `app.js` must use exactly these IDs.
- Produces: `localStorage` key `reader-theme` written by the inline anti-flash script — `app.js` (Task 6) must read/write the same key name.

- [ ] **Step 1: Create `index.html`**

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<script>
(function () {
  var stored = localStorage.getItem('reader-theme');
  var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();
</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
<title>The Legend of 4P Vedundi · 四个P的传说</title>
<link rel="stylesheet" href="dist/styles.css">
</head>
<body class="bg-paper dark:bg-paper-dark text-ink dark:text-ink-dark font-serif antialiased transition-colors duration-300">

  <div id="progress-bar" class="fixed top-0 left-0 h-0.5 bg-accent dark:bg-accent-dark z-50" style="width:0%"></div>

  <header class="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-2 border-b border-ink/10 dark:border-ink-dark/10 bg-paper/90 dark:bg-paper-dark/90 backdrop-blur z-40">
    <button id="sidebar-toggle" aria-label="Toggle table of contents" class="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
      <span class="text-xl">&#9776;</span>
    </button>
    <h1 id="chapter-title" class="text-sm md:text-base font-medium truncate px-2"></h1>
    <div class="flex items-center gap-1">
      <button id="lang-toggle" class="w-11 h-11 rounded-lg text-sm hover:bg-black/5 dark:hover:bg-white/5">中</button>
      <button id="theme-toggle" aria-label="Toggle dark mode" class="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
        <span id="theme-icon">&#127769;</span>
      </button>
    </div>
  </header>

  <div id="drawer-backdrop" class="hidden fixed inset-0 bg-black/30 z-30 md:hidden"></div>

  <aside id="sidebar" class="fixed top-14 left-0 bottom-0 overflow-hidden -translate-x-full md:translate-x-0 md:w-64 transition-all duration-300 border-r border-ink/10 dark:border-ink-dark/10 bg-paper dark:bg-paper-dark z-40">
    <nav id="toc-list" class="w-64 py-4 h-full overflow-y-auto"></nav>
  </aside>

  <main id="content-pane" class="pt-14 md:ml-64 h-screen overflow-y-auto paper-texture transition-[margin] duration-300">
    <div class="max-w-[65ch] mx-auto px-6 py-12">
      <div id="chapter-content" class="leading-[1.75] text-[1.05rem] transition-opacity duration-200"></div>
    </div>
  </main>

  <script src="src/app.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Verify the file is well-formed and contains every required ID**

```bash
for id in progress-bar sidebar-toggle chapter-title lang-toggle theme-toggle theme-icon drawer-backdrop sidebar toc-list content-pane chapter-content; do
  grep -q "id=\"$id\"" index.html || echo "MISSING: $id"
done
```

Expected: no output (no `MISSING:` lines printed).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add HTML shell: header, sidebar, progress bar, content pane"
```

---

### Task 6: Core app — state, chapter loader, hash router, theme/language toggles

**Files:**
- Create: `src/app.js`

**Interfaces:**
- Consumes: DOM IDs from Task 5; `chapters.json` and `content/{lang}/{slug}.txt` from Task 4
- Produces (for Tasks 7 & 8 to build on):
  - `state` object: `{ lang, chapters, currentSlug }`
  - `const contentPane = document.getElementById('content-pane')` — module-level, Task 8 attaches the scroll listener to this
  - `async function navigateTo(slug)` — Task 8 wraps this with progress-bar reset and fade timing (already includes a basic fade in this task; Task 8 only adds the scroll-progress and `IntersectionObserver` calls, it does not change `navigateTo`'s signature)
  - `function renderChapterText(text)` — renders paragraphs into `#chapter-content`; Task 8 calls `observeReveals()` from inside this function (added in Task 8, not this task — this task's version of `renderChapterText` just renders plain paragraphs with class `reveal` already on each `<p>`, ready for Task 8 to observe)
  - `function renderTOC()` — Task 7 replaces this task's stub implementation with the full sidebar list; this task defines the function so `navigateTo` can call it without erroring, but leaves the body mostly empty (`// filled in by Task 7`)
  - `function chapterTitle(chapter)` — returns the title in the current language; used by both this task and Task 7

- [ ] **Step 1: Create `src/app.js`**

```js
const STORAGE_KEYS = { theme: 'reader-theme', lang: 'reader-lang' };

const state = {
  lang: localStorage.getItem(STORAGE_KEYS.lang) || 'en',
  chapters: [],
  currentSlug: null,
};

const contentPane = document.getElementById('content-pane');

function chapterTitle(chapter) {
  return state.lang === 'zh' ? chapter.titleZh : chapter.titleEn;
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  document.getElementById('theme-icon').textContent = theme === 'dark' ? '☀' : '\u{1F319}';
}

function currentTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function renderChapterText(text) {
  const container = document.getElementById('chapter-content');
  container.innerHTML = '';
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  paragraphs.forEach((p) => {
    const el = document.createElement('p');
    el.className = 'reveal mb-6';
    el.textContent = p;
    container.appendChild(el);
  });
}

function renderTOC() {
  // filled in by Task 7
}

function getSlugFromHash() {
  const raw = decodeURIComponent(location.hash.replace('#', ''));
  const found = state.chapters.find((c) => c.slug === raw);
  return found ? raw : state.chapters[0] && state.chapters[0].slug;
}

async function navigateTo(slug) {
  const chapter = state.chapters.find((c) => c.slug === slug);
  if (!chapter) return;

  const contentEl = document.getElementById('chapter-content');
  contentEl.classList.add('opacity-0');
  await new Promise((resolve) => setTimeout(resolve, 200));

  const res = await fetch(`content/${state.lang}/${slug}.txt`);
  const text = await res.text();

  state.currentSlug = slug;
  renderChapterText(text);
  document.getElementById('chapter-title').textContent = chapterTitle(chapter);
  contentPane.scrollTop = 0;
  renderTOC();

  contentEl.classList.remove('opacity-0');
}

async function loadChapters() {
  const res = await fetch('chapters.json');
  state.chapters = await res.json();
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
});

document.getElementById('lang-toggle').addEventListener('click', async () => {
  state.lang = state.lang === 'en' ? 'zh' : 'en';
  localStorage.setItem(STORAGE_KEYS.lang, state.lang);
  document.getElementById('lang-toggle').textContent = state.lang === 'en' ? '中' : 'EN';
  await navigateTo(state.currentSlug);
});

async function init() {
  applyTheme(currentTheme());
  document.getElementById('lang-toggle').textContent = state.lang === 'en' ? '中' : 'EN';
  await loadChapters();
  await navigateTo(getSlugFromHash());
  window.addEventListener('hashchange', () => navigateTo(getSlugFromHash()));
}

init();
```

- [ ] **Step 2: Serve the site locally and verify it loads**

```bash
python3 -m http.server 8765 &
SERVER_PID=$!
sleep 1
curl -s http://localhost:8765/ | grep -q "chapter-content" && echo "OK: index.html served"
curl -s http://localhost:8765/chapters.json | grep -q "chapter-01" && echo "OK: chapters.json served"
kill $SERVER_PID
```

Expected: both `OK:` lines print.

- [ ] **Step 3: Manual browser check**

Open `http://localhost:8765/` (start the server again if needed) in a real browser. Confirm:
- Chapter One's placeholder text renders as separate paragraphs
- Clicking the theme toggle switches light/dark and the icon changes
- Reloading the page keeps the theme you picked
- Clicking the language toggle switches the chapter text and header title between English and Chinese, and persists after reload
- Manually setting the URL hash to `#chapter-02` and pressing Enter loads Chapter Two

- [ ] **Step 4: Commit**

```bash
git add src/app.js
git commit -m "Add core app: state, chapter loader, hash router, theme/language toggles"
```

---

### Task 7: Sidebar / drawer table of contents

**Files:**
- Modify: `src/app.js` — replace the stub `renderTOC()` from Task 6, add `setSidebarOpen()` and its event bindings, add a call to `setSidebarOpen()` in `init()`

**Interfaces:**
- Consumes: `state.chapters`, `state.currentSlug`, `chapterTitle()`, `#sidebar`, `#toc-list`, `#sidebar-toggle`, `#drawer-backdrop`, `#content-pane` from Task 6/5
- Produces: `function setSidebarOpen(open)` — a plain boolean setter, no other task depends on its internals beyond calling it the same way `init()` does

- [ ] **Step 1: Read the current `src/app.js` and locate the stub `renderTOC` function**

```bash
grep -n "function renderTOC" src/app.js
```

- [ ] **Step 2: Replace the stub `renderTOC` function**

Replace:
```js
function renderTOC() {
  // filled in by Task 7
}
```

With:
```js
function renderTOC() {
  const nav = document.getElementById('toc-list');
  nav.innerHTML = '';
  state.chapters.forEach((chapter) => {
    const a = document.createElement('a');
    a.href = `#${chapter.slug}`;
    a.textContent = chapterTitle(chapter);
    a.className = 'block px-4 py-3 rounded-lg text-sm mx-2 mb-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5';
    if (chapter.slug === state.currentSlug) {
      a.classList.add('bg-black/5', 'dark:bg-white/10', 'font-semibold');
    }
    a.addEventListener('click', () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    });
    nav.appendChild(a);
  });
}

let sidebarOpen = true;

function setSidebarOpen(open) {
  sidebarOpen = open;
  const sidebar = document.getElementById('sidebar');
  const pane = document.getElementById('content-pane');
  const backdrop = document.getElementById('drawer-backdrop');

  sidebar.classList.toggle('-translate-x-full', !open);
  sidebar.classList.toggle('md:w-64', open);
  sidebar.classList.toggle('md:w-0', !open);
  sidebar.classList.toggle('md:border-r-0', !open);

  pane.classList.toggle('md:ml-64', open);
  pane.classList.toggle('md:ml-0', !open);

  backdrop.classList.toggle('hidden', !(open && window.innerWidth < 768));
}

document.getElementById('sidebar-toggle').addEventListener('click', () => setSidebarOpen(!sidebarOpen));
document.getElementById('drawer-backdrop').addEventListener('click', () => setSidebarOpen(false));
```

- [ ] **Step 3: Wire the initial sidebar state into `init()`**

Find this line in `init()`:
```js
  document.getElementById('lang-toggle').textContent = state.lang === 'en' ? '中' : 'EN';
  await loadChapters();
```

Replace it with:
```js
  document.getElementById('lang-toggle').textContent = state.lang === 'en' ? '中' : 'EN';
  setSidebarOpen(window.innerWidth >= 768);
  await loadChapters();
```

- [ ] **Step 4: Build CSS is unaffected (no new Tailwind classes were introduced beyond ones already in `content` globs), but rebuild to be safe**

Run: `npm run build:css`
Expected: no errors, `dist/styles.css` unchanged or updated silently.

- [ ] **Step 5: Manual browser check**

Serve locally (`python3 -m http.server 8765`) and in a real browser at both a desktop width (>768px) and a narrow mobile width (use browser dev tools device toolbar, e.g. 390px wide):
- Desktop: sidebar is visible by default, listing "Chapter One" / "Chapter Two"; clicking the hamburger button collapses it (content pane expands to fill the freed space) and clicking again reopens it
- Mobile: sidebar starts hidden; clicking the hamburger slides it in as an overlay with a dimmed backdrop; clicking a chapter link navigates and closes the drawer; clicking the backdrop also closes it
- The current chapter's link is visually highlighted in the list

- [ ] **Step 6: Commit**

```bash
git add src/app.js dist/styles.css
git commit -m "Add sidebar/drawer table of contents with responsive collapse"
```

---

### Task 8: Progress bar, paragraph fade-in, chapter transition polish

**Files:**
- Modify: `src/app.js` — add `updateProgressBar()`, add `IntersectionObserver` setup (`observeReveals()`), call `observeReveals()` from `renderChapterText()`, add scroll listener, reset progress bar in `navigateTo()`

**Interfaces:**
- Consumes: `#progress-bar`, `contentPane` from Task 6; `.reveal` class from Task 3's CSS
- Produces: nothing further tasks depend on — this is the last app.js task

- [ ] **Step 1: Add the `IntersectionObserver` and progress-bar functions**

Add this block right after the `contentPane` declaration near the top of `src/app.js`:

```js
let revealObserver = null;

function observeReveals() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { root: contentPane, threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}

let progressTicking = false;

function updateProgressBar() {
  const max = contentPane.scrollHeight - contentPane.clientHeight;
  const pct = max > 0 ? Math.min(100, (contentPane.scrollTop / max) * 100) : 0;
  document.getElementById('progress-bar').style.width = `${pct}%`;
}

contentPane.addEventListener('scroll', () => {
  if (!progressTicking) {
    requestAnimationFrame(() => {
      updateProgressBar();
      progressTicking = false;
    });
    progressTicking = true;
  }
});
```

- [ ] **Step 2: Call `observeReveals()` at the end of `renderChapterText`**

Find:
```js
    el.textContent = p;
    container.appendChild(el);
  });
}
```

Replace with:
```js
    el.textContent = p;
    container.appendChild(el);
  });
  observeReveals();
}
```

- [ ] **Step 3: Reset the progress bar on chapter change**

Find, inside `navigateTo`:
```js
  contentPane.scrollTop = 0;
  renderTOC();
```

Replace with:
```js
  contentPane.scrollTop = 0;
  updateProgressBar();
  renderTOC();
```

- [ ] **Step 4: Manual browser check**

Serve locally and in a real browser:
- Scroll down inside a chapter: paragraphs fade in (slide up + opacity) the first time each one enters the viewport, and stay visible on scrolling back up
- The top progress bar fills proportionally as you scroll, and is empty at the very top / full at the very bottom
- Switch chapters (via TOC or hash): the progress bar resets to empty and the new chapter's paragraphs fade in again on scroll
- In system settings, enable "reduce motion" (macOS: System Settings → Accessibility → Display → Reduce Motion), reload the page, and confirm paragraphs appear immediately with no fade/slide (the `prefers-reduced-motion` CSS from Task 3 should suppress the animation)

- [ ] **Step 5: Commit**

```bash
git add src/app.js
git commit -m "Add scroll progress bar and paragraph fade-in on scroll"
```

---

### Task 9: Responsive & touch-target polish, full manual QA pass

**Files:**
- Modify: `index.html` (only if the QA pass below finds a concrete issue — e.g. a tap target under 44px, text touching the viewport edge on very narrow screens)

**Interfaces:**
- None — this task only verifies and, if needed, makes small CSS-class tweaks to `index.html`. No new functions or IDs are introduced.

- [ ] **Step 1: Run the full manual QA checklist from the spec**

Serve locally (`python3 -m http.server 8765`) and, using browser dev tools' device toolbar, check each of the following at three widths: **375px** (phone), **834px** (iPad portrait), **1194px** (iPad landscape / small desktop):

- [ ] Chapter 1 loads, text is readable, no horizontal scroll/overflow at any width
- [ ] Reading column never exceeds 65 characters wide even at the 1194px width — confirm there's visible margin on both sides of the text column on wide viewports
- [ ] Theme toggle button, language toggle button, and hamburger button are each at least 44x44px tap targets (they use `w-11 h-11` = 44px, confirm visually with the ruler/inspector)
- [ ] At 375px: sidebar is a drawer, opens/closes correctly, doesn't cause page-level horizontal scroll when open
- [ ] At 834px and 1194px: sidebar is persistent by default and content reflows correctly when collapsed
- [ ] Dark mode toggle, reload, still dark — repeat for light
- [ ] Language toggle, reload, still on the chosen language
- [ ] Switching chapters resets scroll to top and the progress bar to 0%

- [ ] **Step 2: Fix any concrete issue found**

If Step 1 surfaces a specific problem (e.g. a button smaller than 44px, an element causing horizontal overflow), fix it directly in `index.html` with the minimal Tailwind class change needed, then re-run the relevant check from Step 1 to confirm the fix.

If no issues are found, skip to Step 3 with no code changes.

- [ ] **Step 3: Commit (only if Step 2 made changes)**

```bash
git add index.html
git commit -m "Fix responsive/touch-target issues found in QA pass"
```

If Step 2 made no changes, skip this commit — there is nothing to commit.

---

### Task 10: README, GitHub repo, GitHub Pages deployment

**Files:**
- Modify: `README.md` (replace stub from Task 1 with full instructions)

**Interfaces:**
- None — this is the final, deployment-only task.

- [ ] **Step 1: Write the full `README.md`**

```markdown
# Legend of 4P Vedundi — Reader Site

A bilingual (English / 中文) reading site for 《四个P的传说》(The Legend of 4P Vedundi), built as a static single-page app and hosted on GitHub Pages.

## Local development

```bash
npm install
npm run build:css
python3 -m http.server 8765
```

Then open http://localhost:8765/.

## Adding or editing a chapter

1. Add the chapter text as plain `.txt` files:
   - `content/en/chapter-XX.txt` (English)
   - `content/zh/chapter-XX.txt` (Chinese)
   - Paragraphs are separated by a single blank line. No Markdown, no HTML.
2. Add a matching entry to `chapters.json`:
   ```json
   { "slug": "chapter-XX", "titleEn": "Chapter Title", "titleZh": "章节标题" }
   ```
3. No other code changes are needed — the site reads `chapters.json` and the matching `.txt` files at runtime.

## Changing styles

Edit `src/styles.input.css` or `tailwind.config.js`, then rebuild:

```bash
npm run build:css
```

Commit the updated `dist/styles.css` along with your source changes — GitHub Pages serves the repo as-is, with no build step of its own.

## Deployment

This site is served directly from the `main` branch root via GitHub Pages. Pushing to `main` is the deploy step — nothing else is needed.
```

- [ ] **Step 2: Confirm the local branch is named `main`**

```bash
git branch --show-current
```

If the output is not `main`, run: `git branch -m main`

- [ ] **Step 3: Create the GitHub repository and push**

```bash
git add README.md
git commit -m "Write full README with setup, content, and deployment instructions"
gh repo create zhixuanlucasfeng-cmyk/legend-of-4p-vedundi --public --source=. --remote=origin --push
```

Expected: command prints the new repo URL, and `git remote -v` now shows `origin` pointing at `https://github.com/zhixuanlucasfeng-cmyk/legend-of-4p-vedundi`.

- [ ] **Step 4: Enable GitHub Pages, serving from the root of `main`**

```bash
gh api -X POST repos/zhixuanlucasfeng-cmyk/legend-of-4p-vedundi/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

If this command errors (the Pages API occasionally rejects programmatic creation depending on account settings), enable it manually instead: open `https://github.com/zhixuanlucasfeng-cmyk/legend-of-4p-vedundi/settings/pages` in a browser, under "Build and deployment" set Source to "Deploy from a branch", Branch to `main` / `/ (root)`, and save.

- [ ] **Step 5: Verify the live site**

Wait about a minute for the first Pages build, then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://zhixuanlucasfeng-cmyk.github.io/legend-of-4p-vedundi/
```

Expected: `200`. If it prints `404`, wait another minute and retry — the first deployment can take a few minutes to go live.

Open `https://zhixuanlucasfeng-cmyk.github.io/legend-of-4p-vedundi/` in a real browser and re-run the Task 9 QA checklist against the live URL to confirm the deployed site matches local behavior.

---

## Done

At this point the site is live, bilingual, themeable, and ready for the author to drop in real chapter text and (in a future, separately-scoped iteration) the music files.
