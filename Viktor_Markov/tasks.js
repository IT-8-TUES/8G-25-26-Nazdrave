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

const PRIO_LABEL = { low: 'Ниска', medium: 'Средна', high: 'Висока' };
const LS = {
  TASKS:  'ff-tasks',
  ACTIVE: 'ff-active-task',
  STATS:  'ff-stats',
};

let tasks  = JSON.parse(localStorage.getItem(LS.TASKS) || '[]');
let filter = 'all';
let stats  = JSON.parse(localStorage.getItem(LS.STATS) || '{"total":0,"done":0}');

const saveTasks = () => localStorage.setItem(LS.TASKS, JSON.stringify(tasks));
const saveStats = () => localStorage.setItem(LS.STATS, JSON.stringify(stats));

function initStats() {
  const real = { total: tasks.length, done: tasks.filter(t => t.done).length };
  if (real.total > stats.total) stats.total = real.total;
  if (real.done  > stats.done)  stats.done  = real.done;
  saveStats();
}

function addTask() {
  const input = document.getElementById('task-input');
  const text  = input.value.trim();
  if (!text) { input.focus(); return; }

  tasks.unshift({
    id:       Date.now(),
    text,
    priority: document.getElementById('priority-select').value,
    done:     false,
    created:  new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }),
  });
  stats.total++;
  saveTasks(); saveStats(); render();
  input.value = ''; input.focus();
}

function removeTask(id) {
  const el = document.getElementById('task-' + id);
  if (!el) return;
  el.classList.add('removing');
  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    if (localStorage.getItem(LS.ACTIVE) == id) localStorage.removeItem(LS.ACTIVE);
    saveTasks(); saveStats(); render();
  }, 200);
}

function completeTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const wasDone = task.done;
  task.done = !wasDone;
  wasDone ? stats.done = Math.max(0, stats.done - 1)  
           : stats.done++;
  if (task.done && localStorage.getItem(LS.ACTIVE) == id) localStorage.removeItem(LS.ACTIVE);
  saveTasks(); saveStats(); render();
}

function setActiveTask(id) {
  localStorage.getItem(LS.ACTIVE) == id
    ? localStorage.removeItem(LS.ACTIVE)
    : localStorage.setItem(LS.ACTIVE, id);
  render();
}

function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function getFiltered() {
  if (filter === 'active') return tasks.filter(t => !t.done);
  if (filter === 'done')   return tasks.filter(t =>  t.done);
  if (filter === 'high')   return tasks.filter(t => t.priority === 'high');
  return tasks;
}

function render() {
  document.getElementById('stat-total').textContent     = stats.total;
  document.getElementById('stat-done').textContent      = stats.done;
  document.getElementById('stat-remaining').textContent = tasks.filter(t => !t.done).length;

  const list     = document.getElementById('task-list');
  const filtered = getFiltered();
  const activeId = localStorage.getItem(LS.ACTIVE);

  if (!filtered.length) {
    list.innerHTML = `<li class="empty-state"><div class="empty-icon">📋</div><p>Няма задачи за показване.</p></li>`;
    return;
  }

  list.innerHTML = filtered.map(t => {
    const active = String(t.id) === String(activeId) && !t.done;
    return `
    <li class="task-item prio-${t.priority}${t.done ? ' done' : ''}${active ? ' is-active' : ''}" id="task-${t.id}">
      <div class="task-check${t.done ? ' checked' : ''}" onclick="completeTask(${t.id})"></div>
      <span class="task-text">${esc(t.text)}</span>
      <span class="active-dot">▶ фокус</span>
      <div class="task-meta">
        <span class="prio-badge prio-${t.priority}">${PRIO_LABEL[t.priority]}</span>
        <span class="task-time">${t.created}</span>
      </div>
      <div class="task-actions">
        ${!t.done ? `<button class="btn-action btn-focus${active ? ' active-focus' : ''}" onclick="setActiveTask(${t.id})">${active ? '▶ активна' : '▶ фокус'}</button>` : ''}
        <button class="btn-action btn-complete" onclick="completeTask(${t.id})">${t.done ? '↩ върни' : '✓ готово'}</button>
        <button class="btn-delete" onclick="removeTask(${t.id})" title="Изтрий">✕</button>
      </div>
    </li>`;
  }).join('');
}

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

initStats();
render();
document.getElementById('task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});
