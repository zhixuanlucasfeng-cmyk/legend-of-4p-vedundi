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
