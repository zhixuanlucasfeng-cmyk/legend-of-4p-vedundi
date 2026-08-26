const STORAGE_KEYS = { theme: 'reader-theme', lang: 'reader-lang' };

const state = {
  lang: localStorage.getItem(STORAGE_KEYS.lang) || 'en',
  chapters: [],
  currentSlug: null,
};

const contentPane = document.getElementById('content-pane');

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
  document
    .getElementById('chapter-content')
    .querySelectorAll('.reveal')
    .forEach((el) => revealObserver.observe(el));
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
  observeReveals();
}

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

function getSlugFromHash() {
  const raw = decodeURIComponent(location.hash.replace('#', ''));
  if (!raw) return null;
  const found = state.chapters.find((c) => c.slug === raw);
  return found ? raw : null;
}

function bookTitle() {
  return state.lang === 'zh' ? '四个P的传说' : 'The Legend of 4P Vedundi';
}

function renderHome() {
  const container = document.getElementById('chapter-content');
  container.innerHTML = '';

  const cover = document.createElement('img');
  cover.src = 'covers/season-01.jpg';
  cover.alt = state.lang === 'zh' ? 'Legendary of Four P：第一季封面' : 'Legendary of Four P: Season One cover';
  cover.className = 'w-full max-w-sm mx-auto rounded-lg shadow-lg mb-10';
  container.appendChild(cover);

  const list = document.createElement('nav');
  list.className = 'space-y-2';
  state.chapters.forEach((chapter) => {
    const a = document.createElement('a');
    a.href = `#${chapter.slug}`;
    a.textContent = chapterTitle(chapter);
    a.className = 'block px-4 py-3 rounded-lg border border-ink/10 dark:border-ink-dark/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors';
    list.appendChild(a);
  });
  container.appendChild(list);
}

async function navigateTo(slug) {
  const contentEl = document.getElementById('chapter-content');
  contentEl.classList.add('opacity-0');
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!slug) {
      state.currentSlug = null;
      renderHome();
      document.getElementById('chapter-title').textContent = bookTitle();
      contentPane.scrollTop = 0;
      updateProgressBar();
      renderTOC();
      return;
    }

    const chapter = state.chapters.find((c) => c.slug === slug);
    if (!chapter) return;

    let text;
    try {
      const res = await fetch(`content/${state.lang}/${slug}.txt`);
      if (!res.ok) throw new Error(`Failed to load chapter (${res.status})`);
      text = await res.text();
    } catch (err) {
      text = 'Sorry, this chapter could not be loaded. Please try again later.';
    }

    state.currentSlug = slug;
    renderChapterText(text);
    document.getElementById('chapter-title').textContent = chapterTitle(chapter);
    contentPane.scrollTop = 0;
    updateProgressBar();
    renderTOC();
  } finally {
    contentEl.classList.remove('opacity-0');
  }
}

async function loadChapters() {
  try {
    const res = await fetch('chapters.json');
    if (!res.ok) throw new Error(`Failed to load chapters (${res.status})`);
    state.chapters = await res.json();
  } catch (err) {
    const target = document.getElementById('chapter-content') || document.getElementById('content-pane');
    target.textContent = 'Sorry, this site failed to load. Please try refreshing the page.';
  }
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
});

document.getElementById('lang-toggle').addEventListener('click', async () => {
  state.lang = state.lang === 'en' ? 'zh' : 'en';
  localStorage.setItem(STORAGE_KEYS.lang, state.lang);
  document.documentElement.lang = state.lang === 'zh' ? 'zh' : 'en';
  await navigateTo(state.currentSlug);
});

async function init() {
  applyTheme(currentTheme());
  document.documentElement.lang = state.lang === 'zh' ? 'zh' : 'en';
  setSidebarOpen(window.innerWidth >= 768);
  await loadChapters();
  await navigateTo(getSlugFromHash());
  window.addEventListener('hashchange', () => navigateTo(getSlugFromHash()));
}

init();
