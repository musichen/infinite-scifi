/* ============================================================
   Infinite Sci-Fi - catalog viewer application
   Alpine.js store + fuzzy search + starfield + hash routing
   ============================================================ */

(function () {
  'use strict';

  /* ---------- small helpers ---------- */

  const $ = (sel, root) => (root || document).querySelector(sel);

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- kind metadata (labels + icons) ---------- */

  const KIND_META = {
    novel: { label: 'Novel', icon: 'book' },
    collection: { label: 'Collection', icon: 'stack' },
    movie: { label: 'Movie', icon: 'film' },
    series: { label: 'TV Series', icon: 'tv' },
    comic: { label: 'Comic', icon: 'comic' },
    audiobook: { label: 'Audiobook', icon: 'headphones' },
    author: { label: 'Author', icon: 'person' },
  };

  const ICONS = {
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    stack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>',
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
    comic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    headphones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .3.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  };

  function kindIcon(kind) {
    return ICONS[KIND_META[kind] ? KIND_META[kind].icon : 'book'] || '';
  }

  /* ---------- fuzzy search ----------
     Two passes over each record:

     1. Contiguous phrase match against the full haystack (covers prose in
        notes/descriptions; also the only pass that handles short queries).
     2. Per-word match against the metadata words (title, authors, category,
        section, year, narrator, directors). Every query word must hit some
        metadata word via exact / prefix / in-word subsequence / 1-edit typo
        tolerance. This is what makes "nevromancer" find "Neuromancer"
        without letting a scattered d-u-n-e subsequence match everything. */

  const WORD_RE = /[a-z0-9]+/g;
  const TYPO_LEN = 5; // only tolerate 1-edit typos for words this long+

  /** Levenshtein distance capped at 1 (returns 2 for anything larger). */
  function editDist1(a, b) {
    if (a === b) return 0;
    const la = a.length;
    const lb = b.length;
    if (Math.abs(la - lb) > 1) return 2;
    const row = new Array(lb + 1);
    for (let j = 0; j <= lb; j++) row[j] = j;
    for (let i = 1; i <= la; i++) {
      let prev = row[0];
      row[0] = i;
      for (let j = 1; j <= lb; j++) {
        const cur = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = row[j];
        row[j] = cur;
      }
      if (Math.min(...row) > 1) return 2; // already over the typo budget
    }
    return row[lb] > 1 ? 2 : row[lb];
  }

  /** Score one query word against one metadata word. */
  function wordScore(qw, w) {
    if (qw === w) return 200;
    if (w.startsWith(qw)) return 150 + Math.min(qw.length, 12) * 2;
    if (qw.length >= TYPO_LEN) {
      // in-word subsequence (covers dropped letters, e.g. "neuromancr")
      if (w.length > qw.length) {
        let wi = 0;
        let streak = 0;
        let best = 0;
        let ok = true;
        for (let qi = 0; qi < qw.length; qi++) {
          const f = w.indexOf(qw[qi], wi);
          if (f === -1) { ok = false; break; }
          if (f === wi) streak++;
          else streak = 0;
          if (streak > best) best = streak;
          wi = f + 1;
        }
        if (ok && best > 0) {
          let s = 40 + Math.min(qw.length, 12);
          if (best >= 3) s += 10;
          if (best >= qw.length) s += 22;
          return s;
        }
      }
      // 1-edit typo tolerance (covers substitutions like v/u in neuromancer)
      if (w[0] === qw[0] && editDist1(qw, w) === 1) {
        return 60 + Math.min(qw.length, 12) * 2;
      }
    }
    return 0;
  }

  function fuzzyScore(query, rec) {
    if (!query) return 0;
    const q = query.toLowerCase().trim();
    if (!q || q.length > 80) return 0;
    const t = rec.haystack;

    // Pass 1: contiguous phrase anywhere in the haystack (incl. prose).
    let contiguous = 0;
    const idx = t.indexOf(q);
    if (idx !== -1) {
      contiguous = 100;
      if (idx === 0) contiguous += 40; // prefix match
      else if (/[\s(-]/.test(t[idx - 1])) contiguous += 26; // word start
      contiguous += Math.min(q.length, 12) * 2;
      contiguous += Math.max(0, 8 - idx) * 2; // earlier is better
    }
    if (q.length <= 4) return contiguous; // short queries: contiguous only

    // Pass 2: every query word must hit a metadata word.
    const qWords = q.match(WORD_RE) || [];
    let total = 0;
    for (const qw of qWords) {
      let best = 0;
      for (const w of rec.words) {
        const s = wordScore(qw, w);
        if (s > best) best = s;
        if (best === 200) break;
      }
      if (!best) return contiguous; // this word hit nothing: fall back
      total += best;
    }
    return Math.max(contiguous, total);
  }

  /* ---------- starfield ---------- */

  function initStarfield(canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    let w = 0;
    let h = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function build() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.min(260, Math.floor((w * h) / 4200));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        a: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.012,
        hue: Math.random() < 0.82 ? '255,255,255' : Math.random() < 0.6 ? '103,232,249' : '167,139,250',
        big: Math.random() < 0.06,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.a += s.speed;
        const alpha = 0.28 + Math.abs(Math.sin(s.a)) * 0.72;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.hue},${alpha.toFixed(3)})`;
        ctx.fill();
        if (s.big) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${s.hue},${(alpha * 0.14).toFixed(3)})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(frame);
    }

    build();
    let raf = requestAnimationFrame(frame);
    const onResize = () => { build(); };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }

  /* ---------- rating color ---------- */

  function ratingColor(r, kind) {
    if (r == null) return 'rgba(148,163,184,0.35)';
    const min = kind === 'movie' || kind === 'series' ? 6 : 3.4;
    const max = kind === 'movie' || kind === 'series' ? 9.4 : 4.7;
    const t = Math.max(0, Math.min(1, (r - min) / (max - min)));
    const hue = 150 * t; // red -> green
    return `hsl(${hue}, 62%, 52%)`;
  }

  function ratingLabel(r, avg) {
    if (r == null) return null;
    return avg ? r.toFixed(2).replace(/\.?0+$/, '') + ' (avg)' : String(r);
  }

  /* ---------- the app ---------- */

  function app() {
    return {
      data: null,
      loading: true,
      error: null,
      query: '',
      quickOpen: false,
      quickIndex: 0,
      activeCategory: null, // category id
      openGroups: { novels: true },
      kindFilter: 'all',
      classicOnly: false,
      hotOnly: false,
      sortBy: 'relevance',
      expandedDesc: {},
      expandedNotes: {},
      sidebarOpen: false,
      showTop: false,
      searchable: [],
      stats: null,

      /* lifecycle */
      async init() {
        // starfield
        const canvas = $('#stars canvas');
        if (canvas && window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
          initStarfield(canvas);
        }

        // global hotkeys: "/" and Cmd/Ctrl+K focus search, Escape closes
        document.addEventListener('keydown', (e) => {
          if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
            e.preventDefault();
            this.focusSearch();
          } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            this.focusSearch();
          } else if (e.key === 'Escape') {
            this.quickOpen = false;
            if (this.query && document.activeElement && document.activeElement.id === 'site-search') {
              this.query = '';
            }
          }
        });

        window.addEventListener('scroll', () => {
          this.showTop = window.scrollY > 600;
        }, { passive: true });

        window.addEventListener('hashchange', () => this.route());

        try {
          const res = await fetch('data.json', { cache: 'no-store' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const json = await res.json();
          this.data = json;
          this.buildSearchable();
          this.stats = {
            total: json.stats.total,
            novels: json.stats.entries.novel || 0,
            movies: json.stats.entries.movie || 0,
            series: json.stats.entries.series || 0,
            comics: json.stats.entries.comic || 0,
            collections: json.stats.entries.collection || 0,
            authors: json.stats.entries.author || 0,
          };
          this.loading = false;
          this.route();
        } catch (err) {
          this.loading = false;
          this.error = 'Could not load data.json. Serve the site over HTTP (e.g. npx serve docs) rather than opening the file directly.';
        }
      },

      buildSearchable() {
        const list = [];
        for (const section of this.data.sections) {
          for (const cat of section.subsections) {
            for (const entry of cat.entries) {
              list.push(this.makeSearchRecord(entry));
              if (entry.subEntries) {
                for (const sub of entry.subEntries) {
                  list.push(this.makeSearchRecord(entry, sub));
                }
              }
            }
          }
        }
        this.searchable = list;
      },

      makeSearchRecord(entry, sub) {
        const metaParts = [
          sub ? sub.title : entry.title,
          (entry.authors || []).map((a) => a.name).join(' '),
          entry.category,
          entry.section,
          entry.year || '',
          sub ? sub.year : '',
          entry.narrator || '',
          (entry.directors || []).map((d) => d.name).join(' '),
          (entry.categories || []).join(' '),
        ];
        const textParts = metaParts.concat([
          sub ? (sub.notes || '') : (entry.notes || ''),
          sub ? (sub.description || '') : (entry.description || ''),
        ]);
        return {
          entry,
          sub: sub || null,
          kind: entry.kind,
          haystack: textParts.join('').toLowerCase(),
          // Unique metadata tokens for the per-word fuzzy pass.
          words: Array.from(new Set(metaParts.join(' ').toLowerCase().match(WORD_RE) || [])),
          title: sub ? sub.title : entry.title,
        };
      },

      /* ---------- derived ---------- */

      allCategories() {
        if (!this.data) return [];
        const out = [];
        for (const section of this.data.sections) {
          for (const cat of section.subsections) {
            out.push({ ...cat, section: section.name });
          }
        }
        return out;
      },

      topSections() {
        if (!this.data) return [];
        return this.data.sections.map((s) => ({
          ...s,
          entryCount: s.subsections.reduce((n, c) => n + c.entries.length, 0),
        }));
      },

      visibleCategories() {
        if (!this.data) return [];
        const list = [];
        for (const section of this.data.sections) {
          for (const cat of section.subsections) {
            const entries = cat.entries.filter((e) => this.matchesFilters(e));
            if (entries.length) list.push({ ...cat, entries, section: section.name });
          }
        }
        return list;
      },

      matchesFilters(entry) {
        if (this.kindFilter !== 'all' && entry.kind !== this.kindFilter) return false;
        if (this.classicOnly && !entry.classic) return false;
        if (this.hotOnly && !entry.hot) return false;
        return true;
      },

      kindCounts() {
        const counts = { all: 0, novel: 0, collection: 0, movie: 0, series: 0, comic: 0, audiobook: 0, author: 0 };
        if (!this.data) return counts;
        for (const sec of this.data.sections) {
          for (const cat of sec.subsections) {
            for (const e of cat.entries) {
              counts.all++;
              counts[e.kind] = (counts[e.kind] || 0) + 1;
            }
          }
        }
        return counts;
      },

      /* quick jump results */
      quickResults() {
        const q = this.query.trim();
        if (!q) return [];
        const scored = [];
        for (const rec of this.searchable) {
          const s = fuzzyScore(q, rec);
          if (s > 0) scored.push({ ...rec, score: s });
        }
        scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
        return scored.slice(0, 14);
      },

      /* full search results */
      searchResults() {
        const q = this.query.trim();
        if (!q) return [];
        let out = [];
        if (q.startsWith('#')) {
          // category quick path: #cyberpunk
          const catId = q.slice(1).toLowerCase().replace(/[^a-z0-9]+/g, '-');
          for (const cat of this.allCategories()) {
            if (cat.id === catId || cat.name.toLowerCase().includes(catId)) {
              out = cat.entries.map((e) => ({ entry: e, sub: null, kind: e.kind, score: 200 }));
            }
          }
        } else {
          for (const rec of this.searchable) {
            const s = fuzzyScore(q, rec);
            if (s > 0) out.push({ ...rec, score: s });
          }
          out.sort((a, b) => b.score - a.score);
          if (this.sortBy === 'rating') {
            out.sort((a, b) => (b.entry.rating || 0) - (a.entry.rating || 0));
          } else if (this.sortBy === 'year') {
            out.sort((a, b) => this.yearNum(b.entry) - this.yearNum(a.entry));
          } else if (this.sortBy === 'title') {
            out.sort((a, b) => a.title.localeCompare(b.title));
          }
        }
        const seen = new Set();
        return out.filter((r) => {
          const key = r.sub ? r.entry.id + '|' + r.sub.title : r.entry.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      },

      yearNum(entry) {
        const m = String(entry.year || '').match(/(\d{4})/);
        return m ? parseInt(m[1], 10) : -1;
      },

      isSearching() {
        return this.query.trim().length > 0;
      },

      /* categories shown in the browse view (single category or all) */
      browseCategories() {
        if (!this.data) return [];
        if (this.activeCategory) {
          for (const sec of this.data.sections) {
            for (const cat of sec.subsections) {
              if (cat.id === this.activeCategory) {
                return [{ ...cat, section: sec.name }];
              }
            }
          }
          return [];
        }
        return this.visibleCategories();
      },

      /* ---------- actions ---------- */

      focusSearch() {
        const el = $('#site-search');
        if (el) {
          el.focus();
          el.select();
          this.quickOpen = true;
        }
      },

      onSearchInput() {
        this.quickOpen = true;
        this.quickIndex = 0;
      },

      closeQuick() {
        // keep the dropdown open while the input is focused with text
        if (this.query.trim() && document.activeElement && document.activeElement.id === 'site-search') return;
        this.quickOpen = false;
      },

      jump(item) {
        const id = item.sub ? item.entry.id + '::' + item.sub.title : item.entry.id;
        this.query = '';
        this.quickOpen = false;
        this.goEntry(id);
      },

      goEntry(id) {
        window.location.hash = '#/entry/' + encodeURIComponent(id);
      },

      route() {
        const hash = window.location.hash || '';
        if (!hash || hash === '#/') {
          this.activeCategory = null;
          return;
        }
        const m = hash.match(/^#\/entry\/(.+)$/);
        if (m) {
          const id = decodeURIComponent(m[1]);
          this.activeCategory = null;
          this.$nextTick(() => this.scrollToEntry(id, true));
          return;
        }
        const c = hash.match(/^#\/category\/(.+)$/);
        if (c) {
          const catId = decodeURIComponent(c[1]);
          this.activeCategory = catId;
          this.$nextTick(() => this.scrollToCategory(catId));
          return;
        }
        const s = hash.match(/^#\/search\/(.+)$/);
        if (s) {
          this.query = decodeURIComponent(s[1]);
          this.activeCategory = null;
        }
      },

      selectCategory(id, name) {
        this.query = '';
        this.quickOpen = false;
        this.sidebarOpen = false;
        this.activeCategory = id;
        window.location.hash = '#/category/' + encodeURIComponent(id);
      },

      selectAll() {
        this.query = '';
        this.quickOpen = false;
        this.sidebarOpen = false;
        this.activeCategory = null;
        if (window.location.hash && window.location.hash !== '#/') {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      toggleGroup(id) {
        this.openGroups[id] = !this.openGroups[id];
      },

      scrollToEntry(id, flash) {
        const el = document.getElementById('entry-' + CSS.escape(id));
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (flash) {
          el.classList.remove('flash');
          void el.offsetWidth;
          el.classList.add('flash');
        }
      },

      scrollToCategory(id) {
        const el = document.getElementById('cat-' + CSS.escape(id));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      setKind(k) {
        this.kindFilter = k;
      },

      toggleDesc(id) {
        this.expandedDesc[id] = !this.expandedDesc[id];
      },

      toggleNotes(id) {
        this.expandedNotes[id] = !this.expandedNotes[id];
      },

      clearFilters() {
        this.kindFilter = 'all';
        this.classicOnly = false;
        this.hotOnly = false;
      },

      isDescOpen(e) {
        return !!this.expandedDesc[e.id];
      },

      isNotesOpen(e) {
        return !!this.expandedNotes[e.id];
      },

      scrollTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },

      /* ---------- template helpers ---------- */

      esc: escapeHtml,
      icons() { return ICONS; },
      activeCatName() {
        const c = this.allCategories().find((c) => c.id === this.activeCategory);
        return c ? c.name : '';
      },
      kindIcon,
      kindLabel(kind) {
        return KIND_META[kind] ? KIND_META[kind].label : kind;
      },
      ratingColor,
      ratingLabel,
      yearLabel(e) {
        if (e.kind === 'author' && e.lifeYears) return e.lifeYears;
        return e.year || '';
      },
      formatScore(r) {
        return r;
      },
      entryAuthors(e) {
        return e.authors || [];
      },
      highlight(text) {
        const q = this.query.trim();
        if (!q) return text;
        const lower = text.toLowerCase();
        const i = lower.indexOf(q.toLowerCase());
        if (i === -1) return text;
        return (
          text.slice(0, i) +
          '<mark>' + escapeHtml(text.slice(i, i + q.length)) + '</mark>' +
          text.slice(i + q.length)
        );
      },
      catEntries(cat) {
        return cat.entries.filter((e) => this.matchesFilters(e));
      },
    };
  }

  // Register with Alpine so x-data="app" resolves reliably.
  // Must be registered on alpine:init (Alpine's CDN dispatches it synchronously
  // at script execution, so this file is loaded BEFORE the alpinejs script tag).
  document.addEventListener('alpine:init', () => {
    window.Alpine.data('app', () => app());
  });
})();
