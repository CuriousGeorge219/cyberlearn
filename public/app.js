/* =====================================================================
   CyberLearn — Interactive Cybersecurity Study Platform
   ===================================================================== */

'use strict';

const DATA = window.COURSE_DATA;

/* ----------------------------- Theme ------------------------------- */
// Red theme: recolor any leftover blue module accent to match.
(function applyModuleTheme() {
  if (!DATA || !DATA.modules) return;
  const colors = { cso: '#f43f5e' };
  for (const m of DATA.modules) if (colors[m.id]) m.color = colors[m.id];
})();

/* ----------------------------- Utilities ---------------------------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function el(id) { return document.getElementById(id); }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function todayStr(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return todayStr(d); }
function fmtDate(ts) { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }

/* ----------------------------- Store ------------------------------- */
// Keys that participate in cross-device cloud sync.
const SYNC_KEYS = ['cl.progress', 'cl.cards', 'cl.dismissed', 'cl.quiz', 'cl.stats', 'cl.game'];

const Store = {
  get(key, def) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
    if (SYNC_KEYS.indexOf(key) !== -1) scheduleSyncPush();
  },
};
const K = {
  progress: 'cl.progress',
  cards: 'cl.cards',
  dismissed: 'cl.dismissed',
  quiz: 'cl.quiz',
  stats: 'cl.stats',
  openMods: 'cl.openMods',
  game: 'cl.game',
};

/* ----------------------------- Data helpers ------------------------ */
function findModule(id) { return DATA.modules.find(m => m.id === id); }
function findLesson(id) {
  for (const m of DATA.modules) {
    const l = m.lessons.find(x => x.id === id);
    if (l) return { module: m, lesson: l };
  }
  return null;
}
function allLessons() { return DATA.modules.flatMap(m => m.lessons.map(l => ({ m, l }))); }
function allCards() { return DATA.modules.flatMap(m => m.lessons.flatMap(l => l.flashcards.map(c => ({ m, l, c })))); }

/* ----------------------------- Progress state ---------------------- */
function progress() { return Store.get(K.progress, {}); }
function isDone(lessonId) { return !!progress()[lessonId]; }
function setDone(lessonId, v) { const p = progress(); if (v) p[lessonId] = true; else delete p[lessonId]; Store.set(K.progress, p); }
function moduleDone(m) { return m.lessons.filter(l => isDone(l.id)).length; }

function cardState() { return Store.get(K.cards, {}); }
function saveCard(id, st) { const c = cardState(); c[id] = st; Store.set(K.cards, c); }
function dismissed() { return Store.get(K.dismissed, {}); }
function setDismissed(id, v) { const d = dismissed(); if (v) d[id] = true; else delete d[id]; Store.set(K.dismissed, d); }
function quizScores() { return Store.get(K.quiz, {}); }
function saveQuizScore(scopeId, pct) {
  const q = quizScores();
  const prev = q[scopeId] || { best: 0, attempts: 0 };
  q[scopeId] = { best: Math.max(prev.best, pct), attempts: (prev.attempts || 0) + 1, last: pct };
  Store.set(K.quiz, q);
}
function openMods() { return new Set(Store.get(K.openMods, [])); }
function toggleMod(id) { const s = openMods(); s.has(id) ? s.delete(id) : s.add(id); Store.set(K.openMods, [...s]); renderSidebar(); }

function isCardDue(c) { const st = cardState()[c.c.id]; return !st || (st.due || 0) <= Date.now(); }
function scheduledDue() {
  const cs = cardState();
  const now = Date.now();
  return allCards().filter(x => { const st = cs[x.c.id]; return st && (st.due || 0) <= now && !dismissed()[x.c.id]; }).length;
}
function newCardsCount() {
  const cs = cardState();
  return allCards().filter(x => !cs[x.c.id] && !dismissed()[x.c.id]).length;
}

/* ----------------------------- Streak ------------------------------ */
function stats() { return Store.get(K.stats, { lastDay: null, streak: 0, reviews: 0 }); }
function touchStudy() {
  const s = stats();
  const t = todayStr();
  if (s.lastDay === t) return s;
  s.streak = (s.lastDay === yesterdayStr()) ? s.streak + 1 : 1;
  s.lastDay = t;
  Store.set(K.stats, s);
  return s;
}
function bumpReviews(n) { const s = stats(); s.reviews = (s.reviews || 0) + n; Store.set(K.stats, s); touchStudy(); }

/* ----------------------------- Gamification ------------------------- */
const RANKS = [
  { xp: 0, name: 'Script Kiddie', icon: '🐣' },
  { xp: 100, name: 'Initiate', icon: '🌱' },
  { xp: 250, name: 'SOC Analyst I', icon: '🛡️' },
  { xp: 500, name: 'SOC Analyst II', icon: '🔍' },
  { xp: 900, name: 'Incident Responder', icon: '🚨' },
  { xp: 1500, name: 'Threat Hunter', icon: '🎯' },
  { xp: 2500, name: 'Security Engineer', icon: '⚙️' },
  { xp: 4000, name: 'Security Architect', icon: '🏛️' },
  { xp: 6000, name: 'CISO', icon: '👑' },
];

function game() { return Store.get(K.game, { xp: 0, badges: {}, daily: { date: todayStr(), xp: 0 } }); }
function levelIndex(xp) { let i = 0; for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].xp) i = k; return i; }
function rankInfo() {
  const g = game();
  const i = levelIndex(g.xp);
  const cur = RANKS[i], next = RANKS[i + 1] || null;
  const pct = next ? Math.min(100, Math.round((g.xp - cur.xp) / (next.xp - cur.xp) * 100)) : 100;
  return { index: i, cur, next, pct, xp: g.xp };
}

function toastXp(n, reason) {
  const root = el('toast-root');
  const t = document.createElement('div');
  t.className = 'toast xp';
  t.innerHTML = `<b style="color:var(--amber)">+${n} XP</b> ${esc(reason || '')}`;
  root.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2000);
}

function rankBarHtml() {
  const r = rankInfo();
  return `<div class="rank-row">
    <span class="rank-icon">${r.cur.icon}</span>
    <div class="rank-body">
      <div class="rank-line"><b>${esc(r.cur.name)}</b><span class="xp-num">${r.xp} XP</span></div>
      <div class="rank-bar"><span style="width:${r.pct}%"></span></div>
      ${r.next ? `<div class="rank-next">${r.next.xp - r.xp} XP to ${esc(r.next.name)}</div>` : '<div class="rank-next">Max rank reached 🎉</div>'}
    </div>
  </div>`;
}
function updateRankChrome() {
  const foot = el('streak-mini'); if (foot) foot.innerHTML = rankBarHtml();
  const r = rankInfo();
  const b = el('streak-badge'); if (b) b.innerHTML = `${r.cur.icon} <b style="color:var(--amber)">${stats().streak || 0}</b>🔥`;
}

function addXp(n, reason) {
  const g = game();
  const before = levelIndex(g.xp);
  g.xp += n;
  if (g.daily.date !== todayStr()) g.daily = { date: todayStr(), xp: 0 };
  g.daily.xp += n;
  Store.set(K.game, g);
  const after = levelIndex(g.xp);
  if (after > before) {
    showLevelUp(after);
    refreshChrome();
  } else {
    toastXp(n, reason);
    updateRankChrome();
  }
  return g;
}

function showLevelUp(i) {
  const r = RANKS[i];
  const root = el('modal-root');
  root.innerHTML = `<div class="modal-backdrop">
    <div class="modal-card">
      <div class="levelup-icon">${r.icon}</div>
      <div class="levelup-title">Rank up!</div>
      <div class="levelup-rank">${esc(r.name)}</div>
      <p class="muted">Keep going — your skills are levelling up.</p>
      <button class="btn primary" id="levelup-close">Continue</button>
    </div>
  </div>`;
  el('levelup-close').onclick = () => { root.innerHTML = ''; };
}

const ACHIEVEMENTS = [
  { id: 'first-lesson', icon: '🎓', name: 'First Steps', desc: 'Complete your first lesson', check: () => lessonsDone() >= 1 },
  { id: 'lessons-10', icon: '📚', name: 'On a Roll', desc: 'Complete 10 lessons', check: () => lessonsDone() >= 10 },
  { id: 'lessons-30', icon: '🏃', name: 'Halfway There', desc: 'Complete 30 lessons', check: () => lessonsDone() >= 30 },
  { id: 'lessons-all', icon: '🏆', name: 'Course Complete', desc: 'Complete all 60 lessons', check: () => lessonsDone() >= 60 },
  { id: 'first-card', icon: '🗂️', name: 'Recall Initiated', desc: 'Review your first flashcard', check: () => (stats().reviews || 0) >= 1 },
  { id: 'cards-50', icon: '🧠', name: 'Memory Builder', desc: 'Review 50 flashcards', check: () => (stats().reviews || 0) >= 50 },
  { id: 'cards-500', icon: '💪', name: 'Retention Machine', desc: 'Review 500 flashcards', check: () => (stats().reviews || 0) >= 500 },
  { id: 'first-quiz', icon: '📝', name: 'Test Yourself', desc: 'Complete your first quiz', check: () => quizAttempts() >= 1 },
  { id: 'perfect-quiz', icon: '💯', name: 'Flawless', desc: 'Score 100% on a quiz', check: () => perfectQuiz() },
  { id: 'streak-3', icon: '🔥', name: 'Warming Up', desc: '3-day study streak', check: () => (stats().streak || 0) >= 3 },
  { id: 'streak-7', icon: '⚡', name: 'Weekly Warrior', desc: '7-day study streak', check: () => (stats().streak || 0) >= 7 },
  { id: 'streak-30', icon: '🌋', name: 'Unstoppable', desc: '30-day study streak', check: () => (stats().streak || 0) >= 30 },
  { id: 'module-cso', icon: '🛡️', name: 'CSO Master', desc: 'Complete the CyberOps module', check: () => moduleComplete('cso') },
  { id: 'module-naf', icon: '🔍', name: 'NAF Master', desc: 'Complete Network Analysis & Forensics', check: () => moduleComplete('naf') },
  { id: 'module-firewall', icon: '🧱', name: 'Firewall Master', desc: 'Complete the Firewall module', check: () => moduleComplete('firewall') },
  { id: 'module-aic', icon: '🤖', name: 'AI Master', desc: 'Complete the AI in Cybersecurity module', check: () => moduleComplete('aic') },
];

function lessonsDone() { return allLessons().filter(x => isDone(x.l.id)).length; }
function quizAttempts() { return Object.values(quizScores()).reduce((a, s) => a + (s.attempts || 0), 0); }
function perfectQuiz() { return Object.values(quizScores()).some(s => (s.best || 0) === 100); }
function moduleComplete(id) { const m = findModule(id); return m && m.lessons.every(l => isDone(l.id)); }

function checkAchievements() {
  const g = game();
  let newly = [];
  for (const a of ACHIEVEMENTS) {
    if (g.badges[a.id]) continue;
    if (a.check()) { g.badges[a.id] = Date.now(); newly.push(a); }
  }
  Store.set(K.game, g);
  for (const a of newly) {
    const root = el('toast-root');
    const t = document.createElement('div');
    t.className = 'toast badge';
    t.innerHTML = `<b>${a.icon} Achievement unlocked</b> — ${esc(a.name)} <span style="color:var(--amber)">+20 XP</span>`;
    root.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3200);
  }
  if (newly.length) {
    const g2 = game();
    g2.xp += newly.length * 20;
    Store.set(K.game, g2);
    updateRankChrome();
  }
}

function refreshChrome() { renderSidebar(); const { view, arg } = parseHash(); updateTopbar(view, arg); }

/* ----------------------------- Highlight / term helpers ------------- */
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function buildHighlightTerms(lesson) {
  const terms = new Set();
  for (const t of lesson.takeaways || []) if (t.term.length <= 30) terms.add(t.term);
  for (const f of lesson.flashcards) {
    if (f.reverse) continue;
    if (/^[A-Z][A-Z0-9&/]{1,7}$/.test(f.front)) terms.add(f.front);
  }
  return [...terms].filter(t => t.length >= 2 && t.length <= 30).sort((a, b) => b.length - a.length).slice(0, 45);
}
function renderRichText(text, terms) {
  let t = esc(text);
  for (const term of terms) {
    if (term.length < 2) continue;
    t = t.replace(new RegExp('\\b' + escapeRegExp(esc(term)) + '\\b', 'g'), '<b class="term">$&</b>');
  }
  return t;
}

/* ----------------------------- Diagrams ---------------------------- */
function relatedDiagrams(lesson) {
  const hay = (lesson.title + ' ' + (lesson.topics || []).join(' ')).toLowerCase();
  return (window.DIAGRAMS || []).filter(d => d.keywords.some(k => hay.includes(k)));
}

/* ----------------------------- SM-2 engine ------------------------- */
function gradeCard(st, q) {
  const s = {
    ease: st && st.ease ? st.ease : 2.5,
    reps: st && st.reps ? st.reps : 0,
    interval: st && st.interval ? st.interval : 0,
    lapses: st && st.lapses ? st.lapses : 0,
  };
  if (q < 3) {
    s.reps = 0;
    s.interval = 0;
    s.lapses += 1;
  } else {
    if (s.reps === 0) s.interval = 1;
    else if (s.reps === 1) s.interval = 6;
    else s.interval = Math.max(1, Math.round(s.interval * s.ease));
    if (q === 5) s.interval = Math.max(s.interval, Math.round(s.interval * 1.3));
    if (q === 3) s.interval = Math.max(1, Math.round(s.interval * 0.5));
    s.reps += 1;
  }
  s.ease = Math.max(1.3, s.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  s.last = Date.now();
  s.due = Date.now() + s.interval * 86400000;
  return s;
}

/* ----------------------------- Router ------------------------------ */
const routes = {
  dashboard: renderDashboard,
  module: renderModule,
  lesson: renderLesson,
  flashcards: renderFlashcards,
  quiz: renderQuiz,
  diagrams: renderDiagrams,
  sync: renderSync,
  progress: renderProgress,
};

function parseHash() {
  const h = location.hash.replace(/^#\/?/, ''); // e.g. "module/cso" or "lesson/cso-1"
  if (!h) return { view: 'dashboard', arg: null };
  const [view, arg] = h.split('/');
  return { view: view || 'dashboard', arg: arg || null };
}

function navigate(view, arg) {
  const hash = arg ? `#/${view}/${arg}` : `#/${view}`;
  if (location.hash === hash) route(); else location.hash = hash;
}

function route() {
  const { view, arg } = parseHash();
  closeMobileSidebar();
  renderSidebar();
  updateTopbar(view, arg);
  const fn = routes[view] || renderDashboard;
  fn(arg);
  window.scrollTo({ top: 0 });
}

/* ----------------------------- Topbar ------------------------------ */
function updateTopbar(view, arg) {
  const titles = { dashboard: 'Dashboard', module: 'Module', lesson: 'Lesson', flashcards: 'Flashcards', quiz: 'Quiz', diagrams: 'Diagrams', sync: 'Sync', progress: 'Progress' };
  el('view-title').textContent = titles[view] || 'Dashboard';
  const r = rankInfo();
  el('streak-badge').innerHTML = `${r.cur.icon} <b style="color:var(--amber)">${stats().streak || 0}</b>🔥`;
}

/* ----------------------------- Sidebar ----------------------------- */
function renderSidebar() {
  const { view, arg } = parseHash();
  const dueCount = scheduledDue();
  const nav = el('nav');

  const items = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', route: 'dashboard' },
    { id: 'flashcards', icon: '🗂️', label: 'Flashcards', route: 'flashcards', badge: dueCount },
    { id: 'quiz', icon: '📝', label: 'Quiz', route: 'quiz' },
    { id: 'diagrams', icon: '🧩', label: 'Diagrams', route: 'diagrams' },
    { id: 'sync', icon: '☁️', label: 'Sync', route: 'sync' },
    { id: 'progress', icon: '📊', label: 'Progress', route: 'progress' },
  ];

  let html = '<div class="nav-label">Study</div>';
  for (const it of items) {
    html += `<div class="nav-item ${view === it.route ? 'active' : ''}" data-nav="${it.route}" title="${esc(it.label)}">
      <span class="ico">${it.icon}</span><span>${it.label}</span>${it.badge ? `<span class="count">${it.badge}</span>` : ''}
    </div>`;
  }
  html += '<div class="nav-label">Modules</div><div class="mod-list">';

  const open = openMods();
  for (const m of DATA.modules) {
    const done = moduleDone(m);
    const isOpen = open.has(m.id);
    html += `<div class="mod-item ${isOpen ? 'open' : ''}" data-mod="${m.id}">
      <button class="mod-head" data-mod-toggle="${m.id}" title="${esc(m.name)}">
        <span class="dot" style="background:${m.color}"></span>
        <span>${m.short}</span>
        <span class="chev">▶</span>
      </button>
      <div class="mod-progress"><span style="width:${Math.round(done / m.lessons.length * 100)}%;background:${m.color}"></span></div>
      <div class="lesson-list">`;
    for (const l of m.lessons) {
      const active = view === 'lesson' && arg === l.id;
      html += `<button class="lesson-link ${active ? 'active' : ''} ${isDone(l.id) ? 'done' : ''}" data-lesson="${l.id}">
        <span class="status">${isDone(l.id) ? '✓' : ''}</span>
        <span class="lt"><span class="l-emoji">${l.emoji || '📄'}</span> ${esc(l.title)}</span>
      </button>`;
    }
    html += '</div></div>';
  }
  html += '</div>';
  nav.innerHTML = html;

  // rank + XP bar in the footer
  const foot = el('streak-mini');
  if (foot) foot.innerHTML = rankBarHtml();
}

/* ----------------------------- Toast ------------------------------ */
function toast(msg) {
  const root = el('toast-root');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  root.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2200);
}

/* ----------------------------- Dashboard --------------------------- */
function renderDashboard() {
  const doneCount = allLessons().filter(x => isDone(x.l.id)).length;
  const totalLessons = allLessons().length;
  const due = scheduledDue();
  const newC = newCardsCount();
  const reviewed = stats().reviews || 0;
  const s = stats();
  const r = rankInfo();
  const g = game();
  const unlocked = Object.keys(g.badges || {}).length;

  // Hero: rank + XP + daily goal
  let html = `<div class="card hero">
    <div class="hero-icon">${r.cur.icon}</div>
    <div class="hero-main">
      <div class="hero-rank">${esc(r.cur.name)}</div>
      <div class="hero-sub">${r.xp} XP total${r.next ? ` · ${r.next.xp - r.xp} XP to ${esc(r.next.name)}` : ' · max rank'}</div>
      <div class="rank-bar hero-bar"><span style="width:${r.pct}%"></span></div>
    </div>
    <div class="hero-stats">
      <div class="hs"><div class="hs-num" style="color:var(--amber)">${s.streak || 0}</div><div class="hs-lbl">🔥 streak</div></div>
      <div class="hs"><div class="hs-num" style="color:var(--accent)">${g.daily.date === todayStr() ? g.daily.xp : 0}</div><div class="hs-lbl">XP today</div></div>
      <div class="hs"><div class="hs-num" style="color:var(--green)">${unlocked}</div><div class="hs-lbl">🏅 badges</div></div>
    </div>
  </div>`;

  html += `<div class="stat-row">
    <div class="stat"><div class="num" style="color:var(--accent)">${doneCount}<span class="muted" style="font-size:15px">/${totalLessons}</span></div><div class="lbl">Lessons completed</div></div>
    <div class="stat"><div class="num" style="color:var(--amber)">${due}</div><div class="lbl">Cards due for review</div></div>
    <div class="stat"><div class="num" style="color:var(--green)">${newC}</div><div class="lbl">New cards to learn</div></div>
    <div class="stat"><div class="num" style="color:var(--violet)">${reviewed}</div><div class="lbl">Total reviews</div></div>
    <div class="stat"><div class="num" style="color:var(--red)">${s.streak || 0}</div><div class="lbl">Day streak</div></div>
  </div>`;

  html += `<h2 class="section-title" style="margin-top:6px">Your modules</h2><div class="grid module-grid">`;
  for (const m of DATA.modules) {
    const done = moduleDone(m);
    const total = m.lessons.length;
    const cards = m.lessons.reduce((a, l) => a + l.flashcards.length, 0);
    const quizQ = m.lessons.reduce((a, l) => a + l.quiz.length, 0);
    html += `<div class="card module-card" data-nav="module" data-arg="${m.id}">
      <div class="mc-top"><div class="mc-icon">${m.icon}</div>
        <div><div class="mc-short">${m.short}</div><h3>${esc(m.name)}</h3></div></div>
      <p>${esc(m.description)}</p>
      <div class="mc-stats">
        <span>📚 ${total} lessons</span><span>🗂️ ${cards} cards</span><span>📝 ${quizQ} questions</span>
      </div>
      <div class="bar"><span style="width:${Math.round(done / total * 100)}%;background:${m.color}"></span></div>
      <div class="muted" style="font-size:12px;margin-top:8px">${done}/${total} lessons complete</div>
    </div>`;
  }
  html += '</div>';

  // Achievements
  const badges = g.badges || {};
  html += `<h2 class="section-title">Achievements <span class="muted" style="font-weight:400">(${unlocked}/${ACHIEVEMENTS.length})</span></h2>
    <div class="badge-grid">`;
  for (const a of ACHIEVEMENTS) {
    const got = !!badges[a.id];
    html += `<div class="badge ${got ? 'unlocked' : 'locked'}" title="${esc(a.desc)}">
      <span class="badge-icon">${a.icon}</span>
      <span class="badge-name">${esc(a.name)}</span>
    </div>`;
  }
  html += '</div>';

  // Continue studying suggestion
  const next = allLessons().find(x => !isDone(x.l.id));
  if (next) {
    html += `<div class="card mt" style="display:flex;align-items:center;justify-content:space-between;gap:14px">
      <div><div class="muted" style="font-size:12px">Continue where you left off</div>
      <div style="font-weight:600;font-size:16px">${next.m.icon} ${esc(next.l.title)}</div></div>
      <button class="btn primary" data-nav="lesson" data-arg="${next.l.id}">Continue →</button>
    </div>`;
  }

  el('content').innerHTML = html;
}

/* ----------------------------- Module view ------------------------- */
function renderModule(id) {
  const m = findModule(id);
  if (!m) return renderDashboard();
  const done = moduleDone(m);
  const dueCount = m.lessons.reduce((a, l) => a + l.flashcards.filter(c => isCardDue({ c })).length, 0);

  let html = `<div class="lesson-hero">
    <div>
      <div class="crumb">${m.icon} ${esc(m.name)}</div>
      <h2>${esc(m.short)} — Course Overview</h2>
    </div>
    <div class="lesson-actions">
      <button class="btn primary" data-nav="flashcards" data-arg="m:${m.id}">🗂️ Review cards</button>
      <button class="btn" data-nav="quiz" data-arg="m:${m.id}">📝 Take quiz</button>
    </div>
  </div>
  <p class="muted">${esc(m.description)}</p>
  <div class="stat-row mt">
    <div class="stat"><div class="num" style="color:${m.color}">${done}/${m.lessons.length}</div><div class="lbl">Lessons done</div></div>
    <div class="stat"><div class="num">${m.lessons.reduce((a,l)=>a+l.flashcards.length,0)}</div><div class="lbl">Flashcards</div></div>
    <div class="stat"><div class="num">${m.lessons.reduce((a,l)=>a+l.quiz.length,0)}</div><div class="lbl">Quiz questions</div></div>
    <div class="stat"><div class="num" style="color:var(--amber)">${dueCount}</div><div class="lbl">Cards due</div></div>
  </div>`;

  html += '<h2 class="section-title">Lessons</h2><div class="grid">';
  for (const l of m.lessons) {
    const d = isDone(l.id);
    const best = (quizScores()[l.id] || {}).best;
    html += `<div class="card" style="display:flex;align-items:center;gap:14px">
      <div style="flex:1;min-width:0">
        <div style="font-weight:600">${esc(l.title)}</div>
        <div class="muted" style="font-size:12.5px">🗂️ ${l.flashcards.length} cards · 📝 ${l.quiz.length} questions${best ? ' · best quiz ' + best + '%' : ''}</div>
      </div>
      ${d ? '<span style="color:var(--green)">✓</span>' : ''}
      <button class="btn sm" data-nav="lesson" data-arg="${l.id}">Study</button>
      <button class="btn sm ghost" data-nav="flashcards" data-arg="l:${l.id}">Cards</button>
    </div>`;
  }
  html += '</div>';
  el('content').innerHTML = html;
}

/* ----------------------------- Lesson view ------------------------- */
function renderLesson(id) {
  const found = findLesson(id);
  if (!found) return renderDashboard();
  const { module: m, lesson: l } = found;
  const d = isDone(l.id);
  const best = (quizScores()[l.id] || {}).best;
  const terms = buildHighlightTerms(l);
  const diagrams = relatedDiagrams(l);

  let html = `<div class="lesson-hero">
    <div>
      <div class="crumb"><span data-nav="module" data-arg="${m.id}" style="cursor:pointer">${m.icon} ${esc(m.name)}</span></div>
      <h2><span class="l-emoji-lg">${l.emoji || '📄'}</span> ${esc(l.title)}</h2>
    </div>
    <div class="lesson-actions">
      <button class="btn ${d ? 'success' : 'primary'}" id="toggle-done">${d ? '✓ Completed' : 'Mark complete'}</button>
      <button class="btn" data-nav="flashcards" data-arg="l:${l.id}">🗂️ Cards</button>
      <button class="btn" data-nav="quiz" data-arg="l:${l.id}">📝 Quiz</button>
    </div>
  </div>`;

  // Key takeaways
  if ((l.takeaways || []).length) {
    html += `<div class="takeaways card">
      <div class="takeaways-title">💡 Key takeaways</div>
      <ul>`;
    for (const t of l.takeaways) {
      html += `<li><b class="term">${esc(t.term)}</b> — ${renderRichText(t.def, terms)}</li>`;
    }
    html += '</ul></div>';
  }

  // Roadmap
  if ((l.topics || []).length) {
    html += `<div class="roadmap">
      <div class="roadmap-label">In this lesson</div>
      <div class="roadmap-chips">`;
    l.topics.forEach((t, i) => {
      html += `<span class="roadmap-chip">${i + 1}. ${esc(t)}</span>`;
    });
    html += '</div></div>';
  }

  html += `<div class="mode-toggle mb">
    <button id="mode-read" class="active">Read</button>
    <button id="mode-recall">Active recall</button>
  </div>`;

  html += '<div class="doc" id="doc">';
  for (const b of l.blocks) {
    if (b.type === 'divider') { html += '<hr class="divider">'; }
    else if (b.type === 'heading') { html += `<h3>${esc(b.text)}</h3>`; }
    else if (b.type === 'p') { html += `<p>${renderRichText(b.text, terms)}</p>`; }
    else if (b.type === 'bullets') {
      html += '<ul>';
      for (const it of b.items) {
        html += `<li class="recall-item" data-reveal><span class="recall-text">${renderRichText(it, terms)}</span></li>`;
      }
      html += '</ul>';
    }
  }
  if (!l.blocks.length) html += '<p class="muted">This deck is primarily diagram/visual based — review the original slides for the full detail.</p>';
  html += '</div>';

  // Related diagrams
  if (diagrams.length) {
    html += `<h2 class="section-title">🧩 Related diagrams</h2><div class="diagram-grid">`;
    for (const dg of diagrams) {
      html += `<div class="diagram-card" data-diagram="${dg.id}">
        <div class="diagram-svg">${dg.svg}</div>
        <div class="diagram-cap"><b>${esc(dg.title)}</b></div>
      </div>`;
    }
    html += '</div>';
  }

  html += `<div class="lesson-meta">
    <span class="chip">Source: ${esc(l.file)}</span>
    <span class="chip">🗂️ ${l.flashcards.length} flashcards</span>
    <span class="chip">📝 ${l.quiz.length} questions</span>
    ${best ? `<span class="chip">Best quiz: ${best}%</span>` : ''}
  </div>`;

  el('content').innerHTML = html;

  el('toggle-done').onclick = () => {
    const wasDone = isDone(l.id);
    setDone(l.id, !wasDone);
    if (!wasDone) { addXp(50, 'Lesson complete'); checkAchievements(); }
    renderLesson(l.id);
  };
  el('mode-read').onclick = () => setRecallMode(false);
  el('mode-recall').onclick = () => setRecallMode(true);

  function setRecallMode(on) {
    el('mode-read').classList.toggle('active', !on);
    el('mode-recall').classList.toggle('active', on);
    el('doc').querySelectorAll('.recall-item').forEach(li => {
      const span = li.querySelector('.recall-text');
      if (on) { span.classList.add('recall-hidden'); li.dataset.state = 'hidden'; }
      else { span.classList.remove('recall-hidden'); li.dataset.state = 'shown'; }
    });
  }
}

/* ----------------------------- Flashcards -------------------------- */
let fc = { deck: null, queue: [], i: 0, scope: null, scopeLabel: '' };

function buildDeck(scope) {
  if (scope === 'due') {
    return allCards().filter(x => { const st = cardState()[x.c.id]; return st && (st.due || 0) <= Date.now() && !dismissed()[x.c.id]; });
  }
  let list;
  if (scope.startsWith('m:')) list = allCards().filter(x => x.m.id === scope.slice(2));
  else if (scope.startsWith('l:')) list = allCards().filter(x => x.l.id === scope.slice(2));
  else list = allCards().filter(x => x.l.id === scope);
  return list.filter(x => !dismissed()[x.c.id] && isCardDue(x));
}

function renderFlashcards(scope) {
  scope = scope || 'due';
  const decks = [
    { id: 'due', label: '⚡ Due for review' },
    ...DATA.modules.map(m => ({ id: 'm:' + m.id, label: m.icon + ' ' + m.short })),
  ];

  let html = `<div class="lesson-hero"><div>
    <div class="crumb">Active recall · Spaced repetition</div><h2>Flashcards</h2></div></div>`;

  html += '<div class="deck-picker">';
  for (const dk of decks) {
    html += `<button class="deck-chip ${scope === dk.id ? 'active' : ''}" data-deck="${dk.id}">${esc(dk.label)}</button>`;
  }
  html += '</div><div id="fc-body"></div>';
  el('content').innerHTML = html;
  startFlashcardSession(scope);
}

function startFlashcardSession(scope) {
  fc.scope = scope;
  fc.queue = shuffle(buildDeck(scope));
  fc.i = 0;
  fc.scopeLabel = scope === 'due' ? 'Due for review'
    : scope.startsWith('m:') ? findModule(scope.slice(2)).name
    : findLesson(scope.slice(2)).lesson.title;
  renderCard();
}

function renderCard() {
  const body = el('fc-body');
  if (fc.i >= fc.queue.length) {
    const isDue = fc.scope === 'due';
    const newAvail = newCardsCount() > 0;
    const msg = isDue
      ? (newAvail ? 'Nothing due for spaced-repetition review yet — pick a module above to start learning new cards.'
        : 'All caught up! No cards are due for review right now.')
      : 'No cards in this deck yet.';
    body.innerHTML = `<div class="card fc-empty">
      <div class="big">${isDue ? '🌱' : '🎉'}</div>
      <h3>${isDue ? 'Start learning' : 'All done'}</h3>
      <p class="muted">${msg}</p>
      ${isDue && newAvail ? '<button class="btn primary" data-nav="flashcards" data-arg="m:cso">Learn CSO cards</button>' : '<button class="btn primary" data-nav="dashboard" data-arg="">Back to dashboard</button>'}
    </div>`;
    return;
  }
  const x = fc.queue[fc.i];
  const card = x.c;
  const st = cardState()[card.id];
  const remaining = fc.queue.length - fc.i;

  body.innerHTML = `
    <div class="fc-stage">
      <div class="fc-counter">${fc.scopeLabel} · <b>${fc.i + 1}</b> / ${fc.queue.length} <span class="muted">(${remaining} left)</span></div>
      <div class="fc-card" id="fc-card">
        <div class="fc-inner">
          <div class="fc-face front"><span class="hint">Question</span><div class="text">${esc(card.front)}</div></div>
          <div class="fc-face fc-back back"><span class="hint">Answer</span><div class="text">${esc(card.back)}</div></div>
        </div>
      </div>
      <div class="fc-grades" id="fc-grades" style="visibility:hidden">
        <button class="grade-btn g-again" data-q="1">Again<br><small>1</small></button>
        <button class="grade-btn g-hard" data-q="3">Hard<br><small>3</small></button>
        <button class="grade-btn g-good" data-q="4">Good<br><small>4</small></button>
        <button class="grade-btn g-easy" data-q="5">Easy<br><small>5</small></button>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn ghost sm" id="fc-flip">🔄 Flip (space)</button>
        <button class="btn ghost sm" id="fc-skip">⏭️ Skip</button>
        <button class="btn ghost sm" id="fc-dismiss">🚫 Don't show again</button>
      </div>
    </div>`;

  const cardEl = el('fc-card');
  const grades = el('fc-grades');
  let flipped = false;

  function flip() {
    flipped = !flipped;
    cardEl.classList.toggle('flipped', flipped);
    grades.style.visibility = flipped ? 'visible' : 'hidden';
  }
  cardEl.onclick = flip;
  el('fc-flip').onclick = flip;

  grades.querySelectorAll('.grade-btn').forEach(btn => {
    btn.onclick = () => gradeCurrent(parseInt(btn.dataset.q));
  });

  el('fc-skip').onclick = () => { fc.i++; renderCard(); };
  el('fc-dismiss').onclick = () => {
    setDismissed(card.id, true);
    bumpReviews(1);
    toast('Card dismissed');
    fc.i++; renderCard();
  };
  fc.flip = flip;
}

function gradeCurrent(q) {
  const x = fc.queue[fc.i];
  const card = x.c;
  const st = gradeCard(cardState()[card.id], q);
  saveCard(card.id, st);
  bumpReviews(1);
  addXp(q >= 4 ? 5 : 2, 'Card reviewed');
  checkAchievements();
  if (q < 3) {
    // move to end of queue to review again this session
    fc.queue.push(fc.queue.splice(fc.i, 1)[0]);
  } else {
    fc.i++;
  }
  renderCard();
}

/* ----------------------------- Quiz -------------------------------- */
let quiz = null;

const QUIZ_DIFFS = [
  { id: 'mixed',  label: 'Mixed',   desc: 'A balanced mix of medium & hard questions — skips the trivial true/false confirmations.' },
  { id: 'easy',   label: 'Easy',    desc: 'Quick true/false confirmation questions.' },
  { id: 'medium', label: 'Medium',  desc: 'Multiple-choice plus spot-the-error true/false.' },
  { id: 'hard',   label: 'Hard',    desc: 'Fill-in-the-blank recall questions.' },
];

function quizDifficultyPref() { return Store.get('cl.quizDiff', 'mixed'); }
function setQuizDifficultyPref(d) { Store.set('cl.quizDiff', d); }

function questionDifficulty(q) {
  if (q.type === 'cloze') return 'hard';
  if (q.type === 'tf') return q.answer === true ? 'easy' : 'medium';
  return 'medium'; // mcq
}
function filterQuizPool(pool, diff) {
  if (diff === 'mixed') return pool.filter(q => questionDifficulty(q) !== 'easy');
  return pool.filter(q => questionDifficulty(q) === diff);
}

function quizScope(scope) {
  scope = scope || '';
  const isModule = scope.startsWith('m:');
  const isLesson = scope.startsWith('l:');
  let pool = [], title = 'All modules';
  if (isModule) { const mm = findModule(scope.slice(2)); if (mm) { pool = mm.lessons.flatMap(l => l.quiz); title = mm.name; } }
  else if (isLesson) { const ll = findLesson(scope.slice(2)); if (ll) { pool = ll.lesson.quiz; title = ll.lesson.title; } }
  else { pool = DATA.modules.flatMap(m => m.lessons.flatMap(l => l.quiz)); }
  return { scope, isModule, isLesson, pool, title };
}

function renderQuiz(scope) {
  const qs = quizScope(scope);
  const diff = quizDifficultyPref();
  const filtered = filterQuizPool(qs.pool, diff);
  const diffMeta = QUIZ_DIFFS.find(d => d.id === diff);

  let html = `<div class="lesson-hero"><div>
    <div class="crumb">Self-test</div><h2>Quiz</h2></div></div>
    <div class="quiz-setup">`;

  // 1 · scope
  html += `<div class="card mb"><h3 class="setup-h">1 · Choose scope</h3>
    <div class="quiz-chips">
      <button class="btn ${!qs.scope ? 'primary' : ''}" data-nav="quiz" data-arg="">All modules</button>
      ${DATA.modules.map(m => `<button class="btn ${qs.scope === 'm:' + m.id ? 'primary' : ''}" data-nav="quiz" data-arg="m:${m.id}">${m.icon} ${m.short}</button>`).join('')}
    </div>
    <div class="muted scope-note">Scope: <b>${esc(qs.title)}</b> · ${qs.pool.length} questions total</div>
  </div>`;

  // 2 · difficulty
  html += `<div class="card mb"><h3 class="setup-h">2 · Choose difficulty</h3>
    <div class="quiz-chips" id="diff-picker">
      ${QUIZ_DIFFS.map(d => `<button class="diff-chip ${diff === d.id ? 'active' : ''}" data-diff="${d.id}">${d.label}</button>`).join('')}
    </div>
    <div class="muted diff-note">${esc(diffMeta.desc)}</div>
  </div>`;

  // 3 · count
  if (filtered.length) {
    const opts = [5, 10, 20, 30];
    html += `<div class="card mb"><h3 class="setup-h">3 · How many questions?</h3>
      <div class="quiz-chips">
        ${opts.filter(c => filtered.length >= c).map(c => `<button class="btn" data-start-quiz="${c}">${c}</button>`).join('')}
        <button class="btn primary" data-start-quiz="${filtered.length}">All (${filtered.length})</button>
      </div>
    </div>`;
  } else {
    html += `<div class="card empty-state">No <b>${esc(diffMeta.label)}</b> questions in this scope — try another difficulty.</div>`;
  }

  html += '</div>';
  el('content').innerHTML = html;

  el('content').querySelectorAll('[data-start-quiz]').forEach(b => {
    b.onclick = () => startQuiz(qs.scope, parseInt(b.dataset.startQuiz), diff);
  });
  const picker = el('diff-picker');
  if (picker) picker.querySelectorAll('.diff-chip').forEach(b => {
    b.onclick = () => { setQuizDifficultyPref(b.dataset.diff); renderQuiz(qs.scope); };
  });
}

function startQuiz(scope, n, diff) {
  const qs = quizScope(scope);
  const pool = shuffle(filterQuizPool(qs.pool, diff)).slice(0, n);
  const diffLabel = (QUIZ_DIFFS.find(d => d.id === diff) || {}).label || 'Mixed';
  quiz = { scope, label: qs.title, difficulty: diffLabel, questions: pool, i: 0, correct: 0, answers: [] };
  renderQuizRun();
}

function renderQuizRun() {
  if (!quiz) return renderQuiz();
  if (quiz.i >= quiz.questions.length) return renderQuizResult();
  const q = quiz.questions[quiz.i];
  const idx = quiz.i;
  const typeLabel = q.type === 'mcq' ? 'Multiple choice' : q.type === 'tf' ? 'True / False' : 'Fill in the blank';
  const letters = 'ABCDEFGHIJ';

  let html = `<div class="q-card">
    <div class="q-meta">
      <span class="crumb">${esc(quiz.label)}</span>
      <span class="q-badge">${esc(quiz.difficulty)}</span>
    </div>
    <div class="q-progress"><span style="width:${Math.round((idx + 1) / quiz.questions.length * 100)}%"></span></div>

    <div class="q-question card">
      <div class="q-kicker">${esc(typeLabel)} · Question ${idx + 1} of ${quiz.questions.length}</div>
      <div class="q-prompt">${esc(q.q)}</div>
      ${q.stem ? `<div class="q-stem">${blankHtml(esc(q.stem))}</div>` : ''}
    </div>

    <div class="q-answers">
      <div class="q-answers-label">Choose your answer</div>
      <div id="q-answers"></div>
    </div>

    <div id="q-feedback"></div>
  </div>`;
  el('content').innerHTML = html;

  const ansBox = el('q-answers');
  const fb = el('q-feedback');
  let answered = false;

  function respond(correct, chosenText) {
    if (answered) return;
    answered = true;
    quiz.answers.push({ q, correct, chosenText });
    if (correct) { quiz.correct++; addXp(10, 'Correct answer'); }
    renderFeedback(q, correct);
  }

  if (q.type === 'tf') {
    const tfOpts = [{ l: 'A', v: true, label: 'True' }, { l: 'B', v: false, label: 'False' }];
    ansBox.innerHTML = tfOpts.map(o => `<button class="q-option" data-tf="${o.v}"><span class="q-letter">${o.l}</span><span>${o.label}</span></button>`).join('');
    ansBox.querySelectorAll('[data-tf]').forEach(b => b.onclick = () => {
      const val = b.dataset.tf === 'true';
      respond(val === q.answer, val ? 'True' : 'False');
      ansBox.querySelectorAll('[data-tf]').forEach(x => {
        x.disabled = true;
        const xv = x.dataset.tf === 'true';
        if (xv === q.answer) x.classList.add('correct');
        else if (xv === val) x.classList.add('wrong');
      });
    });
  } else if (q.type === 'mcq' || (q.type === 'cloze' && q.options)) {
    const options = q.options;
    const correctIndex = q.type === 'mcq' ? q.answer : q.options.indexOf(q.answer);
    options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'q-option';
      btn.innerHTML = `<span class="q-letter">${letters[i] || (i + 1)}</span><span>${esc(opt)}</span>`;
      btn.onclick = () => {
        respond(i === correctIndex, opt);
        ansBox.querySelectorAll('.q-option').forEach((b, k) => {
          b.disabled = true;
          if (k === correctIndex) b.classList.add('correct');
          else if (k === i) b.classList.add('wrong');
        });
      };
      ansBox.appendChild(btn);
    });
  } else if (q.type === 'cloze') {
    ansBox.innerHTML = `<input class="q-cloze-input" id="cloze-in" placeholder="Type your answer…" autocomplete="off">
      <button class="btn primary mt" id="cloze-submit">Check</button>`;
    const input = el('cloze-in');
    const submit = () => {
      const val = input.value.trim();
      if (!val) return;
      const correct = val.toLowerCase() === String(q.answer).toLowerCase();
      respond(correct, val);
      input.disabled = true;
      el('cloze-submit').disabled = true;
    };
    el('cloze-submit').onclick = submit;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  }

  function renderFeedback(q, correct) {
    fb.innerHTML = `<div class="q-feedback ${correct ? 'good' : 'bad'}">
      <b>${correct ? '✓ Correct' : '✗ Incorrect'}</b>
      <div class="mt">${esc(q.explanation || '')}</div>
      <button class="btn primary mt" id="q-next">Next →</button>
    </div>`;
    el('q-next').onclick = () => { quiz.i++; renderQuizRun(); };
  }
}

function blankHtml(text) {
  // highlight "_____" blanks
  return text.split('_____').join('<span style="color:var(--amber);font-weight:700;border-bottom:2px solid var(--amber)">______</span>');
}

function renderQuizResult() {
  const total = quiz.questions.length;
  const pct = total ? Math.round(quiz.correct / total * 100) : 0;
  saveQuizScore(quiz.scope || 'all', pct);
  touchStudy();
  addXp(25, 'Quiz complete');
  checkAchievements();

  const wrong = quiz.answers.filter(a => !a.correct);
  let html = `<div class="card result-ring">
    <div class="pct">Your score</div>
    <div class="score" style="color:${pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)'}">${pct}%</div>
    <p class="muted">${quiz.correct} of ${total} correct</p>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:8px">
      <button class="btn primary" data-nav="quiz" data-arg="${quiz.scope || ''}">Retry</button>
      <button class="btn" data-nav="dashboard" data-arg="">Dashboard</button>
    </div>
  </div>`;

  if (wrong.length) {
    html += '<h2 class="section-title">Review missed questions</h2>';
    for (const a of wrong) {
      const q = a.q;
      const answerText = q.type === 'tf' ? (q.answer ? 'True' : 'False')
        : (q.type === 'mcq' ? q.options[q.answer] : q.answer);
      html += `<div class="card mb">
        <div class="muted" style="font-size:12px">${q.type === 'mcq' ? 'Multiple choice' : q.type === 'tf' ? 'True / False' : 'Fill in the blank'}</div>
        <div style="font-weight:600;margin:6px 0">${esc(q.q)}</div>
        ${q.stem ? `<div class="q-stem">${blankHtml(esc(q.stem))}</div>` : ''}
        <div style="color:var(--red);font-size:13.5px">Your answer: ${esc(a.chosenText)}</div>
        <div style="color:var(--green);font-size:13.5px">Correct: ${esc(answerText)}</div>
        ${q.explanation ? `<div class="muted" style="font-size:13px;margin-top:6px">${esc(q.explanation)}</div>` : ''}
      </div>`;
    }
  }
  el('content').innerHTML = html;
}

/* ----------------------------- Progress ---------------------------- */
/* ----------------------------- Diagrams ---------------------------- */
function renderDiagrams() {
  const dgs = window.DIAGRAMS || [];
  let html = `<div class="lesson-hero"><div>
    <div class="crumb">Visual learning</div><h2>Concept diagrams</h2></div></div>
    <p class="muted">Visual summaries of the core ideas across all modules. Click any to enlarge and find related lessons.</p>
    <div class="diagram-grid lg">`;
  for (const dg of dgs) {
    html += `<div class="diagram-card" data-diagram="${dg.id}">
      <div class="diagram-svg">${dg.svg}</div>
      <div class="diagram-cap"><b>${esc(dg.title)}</b><div class="muted" style="font-size:11.5px">${esc(dg.description)}</div></div>
    </div>`;
  }
  html += '</div>';
  el('content').innerHTML = html;
}

function showDiagram(id) {
  const dg = (window.DIAGRAMS || []).find(d => d.id === id);
  if (!dg) return;
  const related = allLessons().filter(x => relatedDiagrams(x.l).some(r => r.id === id));
  const root = el('modal-root');
  root.innerHTML = `<div class="modal-backdrop" id="dg-backdrop">
    <div class="modal-card dg-modal">
      <button class="modal-close" id="dg-close">✕</button>
      <h2 style="margin:0 0 6px">${esc(dg.title)}</h2>
      <p class="muted">${esc(dg.description)}</p>
      <div class="diagram-svg big">${dg.svg}</div>
      ${related.length ? `<h3 style="margin:14px 0 8px">Related lessons</h3><div class="rel-lessons">
        ${related.slice(0, 6).map(x => `<button class="btn sm" data-nav="lesson" data-arg="${x.l.id}">${x.l.emoji || '📄'} ${esc(x.l.title)}</button>`).join('')}
      </div>` : ''}
    </div>
  </div>`;
  el('dg-close').onclick = () => { root.innerHTML = ''; };
  el('dg-backdrop').addEventListener('click', e => { if (e.target.id === 'dg-backdrop') root.innerHTML = ''; });
}

function renderProgress() {
  const doneCount = allLessons().filter(x => isDone(x.l.id)).length;
  const totalLessons = allLessons().length;
  const s = stats();
  const cards = cardState();
  const learned = Object.values(cards).filter(c => c.reps >= 1).length;
  const mastered = Object.values(cards).filter(c => c.interval >= 21).length;

  let html = `<div class="lesson-hero"><div><div class="crumb">Your learning</div><h2>Progress</h2></div></div>
    <div class="stat-row">
      <div class="stat"><div class="num" style="color:var(--accent)">${doneCount}/${totalLessons}</div><div class="lbl">Lessons complete</div></div>
      <div class="stat"><div class="num" style="color:var(--green)">${learned}</div><div class="lbl">Cards learned</div></div>
      <div class="stat"><div class="num" style="color:var(--violet)">${mastered}</div><div class="lbl">Cards mastered (≥21d)</div></div>
      <div class="stat"><div class="num" style="color:var(--amber)">${s.streak || 0}</div><div class="lbl">Day streak</div></div>
    </div>`;

  html += '<h2 class="section-title">By module</h2><div class="grid">';
  for (const m of DATA.modules) {
    const done = moduleDone(m);
    const q = quizScores();
    const best = Math.max(0, ...m.lessons.map(l => (q[l.id] || {}).best || 0));
    html += `<div class="card">
      <div class="mc-top"><div class="mc-icon">${m.icon}</div><div><h3 style="margin:0">${esc(m.name)}</h3></div></div>
      <div class="bar" style="margin-top:12px"><span style="width:${Math.round(done / m.lessons.length * 100)}%;background:${m.color}"></span></div>
      <div class="muted" style="font-size:12.5px;margin-top:10px">${done}/${m.lessons.length} lessons · best quiz ${best}%</div>
    </div>`;
  }
  html += '</div>';

  html += `<div class="card mt"><h3 style="margin-top:0">Reset data</h3>
    <p class="muted" style="font-size:13px">Clears all progress, flashcards scheduling, and quiz scores. This cannot be undone.</p>
    <button class="btn" id="reset-data" style="border-color:var(--red);color:var(--red)">Reset all progress</button></div>`;

  el('content').innerHTML = html;
  el('reset-data').onclick = () => {
    if (confirm('Reset all progress, flashcard schedules and quiz scores?')) {
      Object.values(K).forEach(k => localStorage.removeItem(k));
      toast('All progress reset');
      if (syncActive()) { syncDirty = true; pushSync(true); }
      route();
    }
  };
}

/* ----------------------------- Cloud sync ------------------------- */
let syncTimer = null;
let syncDirty = false;

// The sync backend is fixed — users only need to enter their own sync key.
const SYNC_WORKER_URL = 'https://cyberlearn-sync.dawn-meadow-7c7a.workers.dev';

function syncConfig() { return Store.get('cl.syncConfig', { enabled: false, key: '' }); }
function syncActive() { const c = syncConfig(); return !!(c.enabled && c.key); }
function syncMeta() { return Store.get('cl.syncMeta', { updatedAt: 0 }); }
function setSyncMeta(ts) { Store.set('cl.syncMeta', { updatedAt: ts }); }
function syncStatus() { return Store.get('cl.syncStatus', { state: 'idle', at: 0 }); }
function setSyncStatus(state, msg) { Store.set('cl.syncStatus', { state, at: Date.now(), msg: msg || '' }); updateSyncIndicator(); updateSyncStatusBox(); }

// fetch with a hard timeout so a dead Worker can't hang the UI forever
async function syncFetch(url, opts) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    return await fetch(url, Object.assign({}, opts, { signal: ctrl.signal }));
  } finally {
    clearTimeout(t);
  }
}
function syncUrl() {
  return SYNC_WORKER_URL + '/sync?key=' + encodeURIComponent(syncConfig().key || '');
}

function currentBundle() {
  const data = {};
  for (const k of SYNC_KEYS) {
    const v = Store.get(k, null);
    if (v !== null && v !== undefined) data[k] = v;
  }
  return { version: 2, updatedAt: Date.now(), data };
}

function scheduleSyncPush() {
  if (!syncActive()) return;
  syncDirty = true;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => pushSync(false), 1200);
}

async function pushSync(force) {
  if (!syncActive()) return;
  if (!force && !syncDirty) return;
  if (syncTimer) { clearTimeout(syncTimer); syncTimer = null; }
  setSyncStatus('saving');
  const bundle = currentBundle();
  try {
    const res = await syncFetch(syncUrl(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bundle),
    });
    if (res.ok) { syncDirty = false; setSyncMeta(bundle.updatedAt); setSyncStatus('synced'); }
    else setSyncStatus('error', 'HTTP ' + res.status + ' — ' + res.statusText);
  } catch (e) {
    setSyncStatus('error', e.name === 'AbortError' ? 'Timed out — check the Worker URL' : (e.message || 'Network error'));
  }
}

async function pullSync() {
  if (!syncActive()) return;
  setSyncStatus('saving');
  try {
    const res = await syncFetch(syncUrl());
    if (res.status === 404) { setSyncStatus('synced'); await pushSync(true); return; }
    if (!res.ok) { setSyncStatus('error', 'HTTP ' + res.status + ' — ' + res.statusText); return; }
    const remote = await res.json();
    if ((remote.updatedAt || 0) > syncMeta().updatedAt) {
      const data = remote.data || {};
      for (const k of SYNC_KEYS) {
        if (data[k] !== undefined) localStorage.setItem(k, JSON.stringify(data[k]));
        else localStorage.removeItem(k);
      }
      setSyncMeta(remote.updatedAt);
      refreshChrome();
      toast('Progress synced from cloud');
    }
    setSyncStatus('synced');
  } catch (e) {
    setSyncStatus('error', e.name === 'AbortError' ? 'Timed out — check the Worker URL' : (e.message || 'Network error'));
  }
}

function updateSyncIndicator() {
  const elx = document.getElementById('sync-indicator');
  if (!elx) return;
  const st = syncStatus();
  const cfg = syncConfig();
  if (!cfg.enabled || !cfg.key) { elx.innerHTML = ''; elx.className = 'sync-indicator'; return; }
  const map = { idle: '☁️', saving: '🔄', synced: '✅', error: '⚠️' };
  const base = { idle: 'Sync idle', saving: 'Syncing…', synced: 'Synced ' + (st.at ? fmtDate(st.at) : ''), error: 'Sync error' };
  elx.innerHTML = map[st.state] || '☁️';
  elx.className = 'sync-indicator ' + st.state;
  elx.title = (base[st.state] || 'Cloud sync') + (st.msg ? ' — ' + st.msg : '');
}

// Keep the status text on the Sync page in sync with the current state
// (the page re-renders on save, but async pull/push complete after that).
function updateSyncStatusBox() {
  const elx = document.getElementById('sync-status');
  if (!elx) return;
  const st = syncStatus();
  const map = {
    idle: 'Not synced yet',
    saving: 'Syncing…',
    synced: 'Synced' + (st.at ? ' · ' + new Date(st.at).toLocaleString() : ''),
    error: '⚠️ ' + (st.msg || 'Sync error — check the worker URL and key'),
  };
  elx.textContent = map[st.state] || '';
}

function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let s = '';
  const a = new Uint32Array(32);
  crypto.getRandomValues(a);
  for (let i = 0; i < 32; i++) s += chars[a[i] % chars.length];
  return s;
}

function renderSync() {
  const c = syncConfig();
  const st = syncStatus();
  const statusText = {
    idle: 'Not synced yet',
    saving: 'Syncing…',
    synced: 'Synced' + (st.at ? ' · ' + new Date(st.at).toLocaleString() : ''),
    error: '⚠️ ' + (st.msg || 'Sync error — check the worker URL and key'),
  }[st.state] || '';

  let html = `<div class="lesson-hero"><div>
    <div class="crumb">Cross-device progress</div><h2>Cloud sync</h2></div></div>`;

  html += `<div class="card mb">
    <h3 style="margin-top:0">How it works</h3>
    <p class="muted" style="font-size:13.5px">Your progress is saved to a secure cloud store using your own secret sync key. Enter the <b>same key</b> on each device and your lessons, flashcard schedules, quiz scores, XP, rank and streak will follow you automatically.</p>
    <p class="muted" style="font-size:12.5px">🔒 Treat your sync key like a password — make it long and random, and never share it.</p>
  </div>`;

  html += `<div class="card mb">
    <h3 style="margin-top:0">Sync key</h3>
    <label class="field">
      <div style="display:flex;gap:8px">
        <input id="sync-key" class="q-cloze-input" style="max-width:100%;flex:1" placeholder="enter or generate your key" value="${esc(c.key)}" />
        <button class="btn sm" id="sync-gen" title="Generate a random key">🎲</button>
      </div>
      <small class="muted">Use the <b>same key</b> on every device you want synced.</small>
    </label>
    <div style="display:flex;gap:10px;align-items:center;margin-top:16px;flex-wrap:wrap">
      <button class="btn primary" id="sync-save">💾 Save &amp; enable</button>
      <button class="btn ghost" id="sync-disable" ${c.enabled ? '' : 'disabled'}>Disable sync</button>
      <button class="btn" id="sync-now" ${c.enabled ? '' : 'disabled'}>🔄 Sync now</button>
    </div>
    <div class="sync-status" id="sync-status">${statusText}</div>
  </div>`;

  el('content').innerHTML = html;

  el('sync-gen').onclick = () => { el('sync-key').value = generateKey(); };
  el('sync-save').onclick = () => {
    const key = el('sync-key').value.trim();
    if (!key) { toast('Enter or generate a sync key'); return; }
    Store.set('cl.syncConfig', { enabled: true, key });
    syncDirty = true;
    toast('Sync enabled');
    pullSync().then(() => pushSync(true));
    renderSync();
  };
  el('sync-disable').onclick = () => {
    Store.set('cl.syncConfig', { enabled: false, key: c.key });
    syncDirty = false;
    toast('Sync disabled');
    updateSyncIndicator();
    renderSync();
  };
  el('sync-now').onclick = async () => {
    setSyncStatus('saving');
    await pullSync();
    await pushSync(true);
    renderSync();
  };
}

/* ----------------------------- Search ------------------------------ */
function setupSearch() {
  const input = el('search-input');
  const box = el('search-results');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { box.classList.add('hidden'); return; }
    const results = [];
    for (const { m, l } of allLessons()) {
      if (l.title.toLowerCase().includes(q)) results.push({ type: 'lesson', m, l, score: 1 });
      for (const c of l.flashcards) {
        if (c.front.toLowerCase().includes(q) && results.length < 40) results.push({ type: 'term', m, l, c, score: 0.8 });
      }
    }
    results.sort((a, b) => b.score - a.score).slice(0, 12);
    if (!results.length) { box.innerHTML = '<div class="sr-item muted">No results</div>'; box.classList.remove('hidden'); return; }
    box.innerHTML = results.map(r => {
      if (r.type === 'lesson') return `<div class="sr-item" data-go="${r.l.id}"><div class="sr-title">${r.m.icon} ${esc(r.l.title)}</div><div class="sr-sub">Lesson</div></div>`;
      return `<div class="sr-item" data-go="${r.l.id}"><div class="sr-title">${esc(r.c.front)}</div><div class="sr-sub">${esc(r.c.back.slice(0, 80))} — ${esc(r.l.title)}</div></div>`;
    }).join('');
    box.classList.remove('hidden');
  });
  box.addEventListener('mousedown', e => {
    const item = e.target.closest('[data-go]');
    if (item) { navigate('lesson', item.dataset.go); input.value = ''; box.classList.add('hidden'); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) box.classList.add('hidden'); });
}

/* ----------------------------- Events ------------------------------ */
function setupGlobalEvents() {
  // delegated nav clicks
  document.addEventListener('click', e => {
    const navEl = e.target.closest('[data-nav]');
    if (navEl) { navigate(navEl.dataset.nav, navEl.dataset.arg || ''); return; }
    const deckEl = e.target.closest('[data-deck]');
    if (deckEl) { navigate('flashcards', deckEl.dataset.deck); return; }
    const mt = e.target.closest('[data-mod-toggle]');
    if (mt) { toggleMod(mt.dataset.modToggle); return; }
    const ls = e.target.closest('[data-lesson]');
    if (ls) { navigate('lesson', ls.dataset.lesson); return; }
    const rev = e.target.closest('[data-reveal]');
    if (rev) {
      const span = rev.querySelector('.recall-text');
      if (span) {
        const hidden = span.classList.contains('recall-hidden');
        if (hidden) span.classList.remove('recall-hidden');
      }
    }
    const dg = e.target.closest('[data-diagram]');
    if (dg) { showDiagram(dg.dataset.diagram); return; }
  });

  // keyboard shortcuts for flashcards
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    const view = parseHash().view;
    if (view !== 'flashcards' || fc.i >= fc.queue.length) return;
    if (e.code === 'Space') { e.preventDefault(); if (fc.flip) fc.flip(); }
    else if (e.key === '1') gradeCurrent(1);
    else if (e.key === '2') gradeCurrent(3);
    else if (e.key === '3') gradeCurrent(4);
    else if (e.key === '4') gradeCurrent(5);
  });

  el('menu-btn').onclick = () => {
    if (window.innerWidth <= 1024) toggleMobileSidebar();
    else toggleSidebarRail();
  };

  el('sidebar-backdrop').onclick = () => closeMobileSidebar();
}

function toggleSidebarRail() {
  const app = el('app');
  const collapsed = app.classList.toggle('sidebar-collapsed');
  Store.set('cl.sidebarCollapsed', collapsed);
}

function toggleMobileSidebar() {
  const open = el('sidebar').classList.toggle('open');
  el('sidebar-backdrop').classList.toggle('show', open);
}
function closeMobileSidebar() {
  el('sidebar').classList.remove('open');
  el('sidebar-backdrop').classList.remove('show');
}

/* ----------------------------- AI Tutor ---------------------------- */
// AI tutor chat endpoint. Local dev proxies via server.js; production goes
// through the chat Worker (chat-worker.js), which keeps the API key server-side.
const AI_CHAT_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? '/chat'                                          // dev: local server.js proxies to OpenRouter
  : 'https://cyberlearn-chat.dawn-meadow-7c7a.workers.dev/chat'; // prod: chat Worker proxies to OpenRouter

const TUTOR_SYSTEM_PROMPT = `You are the CyberLearn AI study tutor, helping a student learn cybersecurity from the CyberLearn platform (Cisco CyberOps Associate, Network Analysis & Forensics, Firewall Technologies, and AI in Cybersecurity).

Guidelines:
- Be accurate, concise and friendly. Use plain language and explain acronyms.
- Prefer to answer from the lesson context and flashcards provided below when they are relevant.
- If the context does not cover the question, answer from general cybersecurity knowledge.
- Use short paragraphs and, where helpful, a bullet list or a concrete example.
- Occasionally suggest a way the student can test themselves (e.g. a quiz question).`;

let tutorChat = [];   // message history: [{role, content}]
let tutorBusy = false;

// Daily token budget shown in the tutor's usage bar (tokens used today vs this).
const TUTOR_TOKEN_BUDGET = 100000;

function tutorTokenState() {
  const st = Store.get('cl.tutorTokens', { date: todayStr(), tokens: 0 });
  if (st.date !== todayStr()) st = { date: todayStr(), tokens: 0 };
  return st;
}
function addTutorTokens(n) {
  const st = tutorTokenState();
  st.tokens += n;
  Store.set('cl.tutorTokens', st);
  updateTutorUsage();
}
function updateTutorUsage() {
  const fill = el('tutor-usage-fill');
  const text = el('tutor-usage-text');
  if (!fill || !text) return;
  const st = tutorTokenState();
  const pct = Math.min(100, Math.round(st.tokens / TUTOR_TOKEN_BUDGET * 100));
  fill.style.width = pct + '%';
  text.textContent = st.tokens.toLocaleString() + ' / ' + TUTOR_TOKEN_BUDGET.toLocaleString() + ' tokens today (' + pct + '%)';
}

function buildTutorContext() {
  const { view, arg } = parseHash();
  let ctx = '';
  if (view === 'lesson') {
    const f = findLesson(arg);
    if (f) {
      ctx += 'The student is currently viewing this lesson:\n';
      ctx += 'Module: ' + f.module.name + '\n';
      ctx += 'Lesson: ' + f.lesson.title + '\n';
      if ((f.lesson.takeaways || []).length) {
        ctx += '\nKey takeaways:\n';
        for (const t of f.lesson.takeaways.slice(0, 20)) ctx += '- ' + t.term + ': ' + t.def + '\n';
      }
      const parts = [];
      for (const b of f.lesson.blocks) {
        if (b.type === 'heading') parts.push('## ' + b.text);
        else if (b.type === 'p') parts.push(b.text);
        else if (b.type === 'bullets') parts.push(b.items.join(' · '));
      }
      if (parts.length) ctx += '\nLesson content:\n' + parts.join('\n').slice(0, 4000) + '\n';
    }
  }
  return ctx;
}

function searchCourse(query) {
  const words = (query || '').toLowerCase().split(/\W+/).filter(w => w.length > 2);
  if (!words.length) return '';
  const hits = [];
  for (const { m, l, c } of allCards()) {
    const hay = (c.front + ' ' + c.back).toLowerCase();
    let score = 0;
    for (const w of words) if (hay.includes(w)) score++;
    if (score) hits.push({ score, m, c });
  }
  hits.sort((a, b) => b.score - a.score);
  const top = hits.slice(0, 8);
  if (!top.length) return '';
  return 'Relevant flashcards from the course (for reference):\n' +
    top.map(h => '- [' + h.m.short + '] ' + h.c.front + ' — ' + h.c.back).join('\n');
}

function buildTutorMessages(userText) {
  let sys = TUTOR_SYSTEM_PROMPT;
  const ctx = buildTutorContext();
  if (ctx) sys += '\n\n' + ctx;
  const ref = searchCourse(userText);
  if (ref) sys += '\n\n' + ref;
  return [{ role: 'system', content: sys }, ...tutorChat, { role: 'user', content: userText }];
}

function mdLite(text) {
  let t = esc(String(text || ''));
  t = t.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
  t = t.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
  t = t.replace(/(^|\n)- (.+)/g, '$1• $2');
  return t;
}

function appendTutorMessage(role, html) {
  const box = el('tutor-messages');
  const div = document.createElement('div');
  div.className = 'tutor-msg ' + role;
  div.innerHTML = html;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

function sendTutor() {
  if (tutorBusy) return;
  const input = el('tutor-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = 'auto';
  appendTutorMessage('user', esc(text));
  tutorChat.push({ role: 'user', content: text });

  const typing = appendTutorMessage('assistant', '<span class="typing">Thinking…</span>');
  tutorBusy = true;
  el('tutor-send').disabled = true;

  fetch(AI_CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'auto', messages: buildTutorMessages(text) }),
  })
    .then(r => r.json().catch(() => ({})))
    .then(data => {
      const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
        || (data.error && (data.error.message || JSON.stringify(data.error)))
        || 'Sorry, I could not get a response.';
      typing.className = 'tutor-msg assistant';
      typing.innerHTML = mdLite(reply);
      tutorChat.push({ role: 'assistant', content: reply });
      const used = data && data.usage && data.usage.total_tokens;
      if (used) addTutorTokens(used);
    })
    .catch(e => {
      typing.className = 'tutor-msg assistant err';
      typing.innerHTML = '⚠️ ' + esc('Could not reach the AI tutor — ' + e.message);
    })
    .finally(() => {
      tutorBusy = false;
      el('tutor-send').disabled = false;
    });
}

function setupTutor() {
  el('tutor-fab').onclick = () => el('tutor-panel').classList.toggle('hidden');
  el('tutor-close').onclick = () => el('tutor-panel').classList.add('hidden');
  el('tutor-send').onclick = sendTutor;
  updateTutorUsage();
  const input = el('tutor-input');
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTutor(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
}

/* ----------------------------- Init -------------------------------- */
function init() {
  if (!DATA || !DATA.modules) { el('content').innerHTML = '<div class="card">Could not load course data. Run <code>npm run build</code> first.</div>'; return; }
  setupGlobalEvents();
  setupSearch();
  setupTutor();
  renderSidebar();
  updateSyncIndicator();
  if (Store.get('cl.sidebarCollapsed', false)) el('app').classList.add('sidebar-collapsed');
  window.addEventListener('hashchange', route);
  route();

  // reading progress bar (lesson view only)
  window.addEventListener('scroll', () => {
    const view = parseHash().view;
    const bar = el('read-progress');
    if (view !== 'lesson') { bar.style.transform = 'scaleX(0)'; return; }
    const doc = document.documentElement;
    const total = doc.scrollHeight - doc.clientHeight;
    const pct = total > 0 ? Math.min(1, window.scrollY / total) : 0;
    bar.style.transform = 'scaleX(' + pct + ')';
  }, { passive: true });

  // Cross-device sync: pull latest on load, push on unload/hide.
  if (syncActive()) { pullSync(); }
  window.addEventListener('beforeunload', () => { if (syncActive() && syncDirty) pushSync(true); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && syncActive() && syncDirty) pushSync(true); });
}

document.addEventListener('DOMContentLoaded', init);
