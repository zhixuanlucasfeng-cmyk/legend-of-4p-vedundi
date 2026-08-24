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
