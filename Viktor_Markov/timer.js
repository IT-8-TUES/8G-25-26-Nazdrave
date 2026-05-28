'use strict';

function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ff-theme', next);
  updateThemeBtn(next);
}
function updateThemeBtn(theme) {
  document.getElementById('theme-icon').textContent  = theme === 'dark' ? '☀️' : '🌙';
  document.getElementById('theme-label').textContent = theme === 'dark' ? 'Светла' : 'Тъмна';
}
(function applyTheme() {
  const t = localStorage.getItem('ff-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  document.addEventListener('DOMContentLoaded', () => updateThemeBtn(t));
})();

const MODES = {
  pomodoro: { label: 'Фокус',        seconds: 25 * 60, isBreak: false },
  short:    { label: 'Кратка пауза', seconds:  5 * 60, isBreak: true  },
  long:     { label: 'Дълга пауза',  seconds: 15 * 60, isBreak: true  },
};
const CIRCUMFERENCE = 2 * Math.PI * 108;
const PRIO_LABEL = { high: 'Висока',       medium: 'Средна',          low: 'Ниска'           };
const PRIO_COLOR = { high: 'var(--danger)', medium: 'var(--warning)',  low: 'var(--success)'  };
const LS = {
  TASKS: 'ff-tasks', ACTIVE: 'ff-active-task',
  SESSIONS: 'ff-sessions', MINUTES: 'ff-minutes', STREAK: 'ff-streak',
};

let mode    = 'pomodoro';
let total   = MODES.pomodoro.seconds;
let left    = total;
let running = false;
let ticker  = null;
let elapsed = 0;
let sessions = +( localStorage.getItem(LS.SESSIONS) || 0);
let minutes  = +( localStorage.getItem(LS.MINUTES)  || 0);
let streak   = +( localStorage.getItem(LS.STREAK)   || 0);

const toggleTimer = () => running ? pause() : start();

function start() {
  running = true;
  document.getElementById('btn-start').textContent = '⏸ Пауза';
  ticker = setInterval(tick, 1000);
}
function pause() {
  running = false;
  clearInterval(ticker);
  document.getElementById('btn-start').textContent = '▶ Продължи';
}
function resetTimer() {
  pause();
  left = total; elapsed = 0;
  document.getElementById('btn-start').textContent = '▶ Старт';
  draw();
}
function tick() {
  if (left <= 0) { endSession(true); return; }
  left--; elapsed++; draw();
}

function endSession(completed) {
  pause();
  document.getElementById('btn-start').textContent = '▶ Старт';
  if (!MODES[mode].isBreak) {
    sessions++;
    minutes += Math.floor(elapsed / 60);
    streak   = completed ? streak + 1 : 0;
    localStorage.setItem(LS.SESSIONS, sessions);
    localStorage.setItem(LS.MINUTES,  minutes);
    localStorage.setItem(LS.STREAK,   streak);
    elapsed = 0;
    updateStats();
    switchMode(sessions % 4 === 0 ? 'long' : 'short');
  } else {
    elapsed = 0;
    switchMode('pomodoro');
  }
  notify();
}

const skipSession = () => endSession(false);

function switchMode(m, btn) {
  mode = m; total = MODES[m].seconds; left = total; elapsed = 0;
  running = false; clearInterval(ticker);
  document.getElementById('btn-start').textContent        = '▶ Старт';
  document.getElementById('timer-mode-label').textContent = MODES[m].label;
  document.getElementById('ring').classList.toggle('break-mode', MODES[m].isBreak);
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
  (btn || document.querySelector(`[data-mode="${m}"]`))?.classList.add('active');
  draw();
}

function enterEditMode() {
  if (running) return;
  const el = document.getElementById('timer-display');
  const m  = String(Math.floor(left / 60)).padStart(2, '0');
  const s  = String(left % 60).padStart(2, '0');
  el.innerHTML = `<input id="edit-input" type="text" maxlength="6" value="${m}:${s}"
    style="width:160px;background:transparent;border:none;border-bottom:2px solid var(--accent);
    color:var(--text-primary);font-family:'DM Mono',monospace;font-size:2.8rem;font-weight:500;
    letter-spacing:4px;text-align:center;outline:none;caret-color:var(--accent);" />`;
  el.style.cssText += 'display:flex;align-items:center;justify-content:center;';

  const inp = document.getElementById('edit-input');
  inp.focus(); inp.select();

  inp.addEventListener('input', () => {
    let v = inp.value.replace(/[^0-9:]/g, '');
    if (/^\d{3,4}$/.test(v)) v = v.slice(0,2) + ':' + v.slice(2);
    inp.value = v;
  });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') { e.preventDefault(); closeEdit(); draw(); }
  });
  inp.addEventListener('blur', () => setTimeout(commitEdit, 100));
}

function parseTime(v) {
  v = v.trim();
  if (v.includes(':')) {
    const [m, s] = v.split(':');
    return Math.min(999, Math.max(0, +m||0)) * 60 + Math.min(59, Math.max(0, +s||0));
  }
  return Math.min(999, Math.max(0, +v||0)) * 60;
}

function commitEdit() {
  const inp = document.getElementById('edit-input');
  if (!inp) return;
  const t = parseTime(inp.value);
  if (t > 0) { total = left = t; elapsed = 0; }
  closeEdit(); draw();
}

function closeEdit() {
  const el = document.getElementById('timer-display');
  el.innerHTML = '';
  el.style.display = el.style.alignItems = el.style.justifyContent = '';
}

function draw() {
  if (document.getElementById('edit-input')) return;
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  document.getElementById('timer-display').textContent    = `${m}:${s}`;
  document.getElementById('ring').style.strokeDashoffset = CIRCUMFERENCE * (1 - left / total);
  document.title = `${m}:${s} — FocusFlow`;
}

function updateStats() {
  const st = JSON.parse(localStorage.getItem('ff-stats') || '{"done":0}');
  document.getElementById('stat-sessions').textContent   = sessions;
  document.getElementById('stat-minutes').textContent    = minutes;
  document.getElementById('stat-tasks-done').textContent = st.done;
  document.getElementById('stat-streak').textContent     = streak;
}

const getTasks   = () => JSON.parse(localStorage.getItem(LS.TASKS)  || '[]');
const getActive  = () => localStorage.getItem(LS.ACTIVE);
const renderSidebar = () => { renderActive(); renderList(); };

function setActiveTask(id) {
  getActive() == id ? localStorage.removeItem(LS.ACTIVE) : localStorage.setItem(LS.ACTIVE, id);
  renderSidebar();
}

function renderActive() {
  const task = getTasks().find(t => String(t.id) === String(getActive()) && !t.done);
  const el   = document.getElementById('active-task-display');
  if (!task) {
    el.innerHTML = `<p class="no-active">Няма избрана задача.<br>Избери от списъка или <a href="tasks.html">добави нова</a>.</p>`;
    return;
  }
  el.innerHTML = `
    <div class="active-task-card">
      <div class="active-task-name">${esc(task.text)}</div>
      <div class="active-task-meta">
        <span class="live-badge">в процес</span>
        <span style="font-family:'DM Mono',monospace;font-size:.68rem;color:${PRIO_COLOR[task.priority]}">${PRIO_LABEL[task.priority]}</span>
        <button class="mini-complete-btn" onclick="doneFromTimer(${task.id})">✓ готово</button>
      </div>
    </div>`;
}

function renderList() {
  const active = getActive();
  const list   = getTasks().filter(t => !t.done);
  const el     = document.getElementById('task-mini-list');
  if (!list.length) {
    el.innerHTML = `<p class="mini-empty">Няма активни задачи. <a href="tasks.html" style="color:var(--accent)">Добави →</a></p>`;
    return;
  }
  el.innerHTML = list.slice(0, 6).map(t => {
    const on = String(t.id) === String(active);
    return `
    <div class="task-mini${on ? ' is-active-mini' : ''}" onclick="setActiveTask(${t.id})">
      <div class="mini-dot prio-${t.priority}"></div>
      <span class="mini-text">${esc(t.text)}</span>
      <div class="mini-actions">
        <button class="mini-complete-btn" onclick="event.stopPropagation();doneFromTimer(${t.id})">✓</button>
        <button class="mini-set-btn">${on ? '●' : '▶'}</button>
      </div>
    </div>`;
  }).join('');
}

function doneFromTimer(id) {
  const tasks = getTasks();
  const task  = tasks.find(t => t.id === id);
  if (!task || task.done) return;
  task.done = true;
  localStorage.setItem(LS.TASKS, JSON.stringify(tasks));
  const st = JSON.parse(localStorage.getItem('ff-stats') || '{"total":0,"done":0}');
  st.done++;
  localStorage.setItem('ff-stats', JSON.stringify(st));
  if (getActive() == id) localStorage.removeItem(LS.ACTIVE);
  updateStats(); renderSidebar();
}

function notify() {
  if (Notification?.permission !== 'granted') return;
  new Notification('FocusFlow', {
    body: MODES[mode].isBreak ? '🍅 Сесията приключи! Почини малко.' : '☕ Почивката свърши. Обратно към работа!',
  });
}
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

if (Notification?.permission === 'default') Notification.requestPermission();
draw(); updateStats(); renderSidebar();
window.addEventListener('storage', e => {
  if (e.key === LS.TASKS || e.key === LS.ACTIVE) { renderSidebar(); updateStats(); }
});