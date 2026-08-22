// Rendering + formatting helpers for tasks. Exposed on window.TasksUI
// so dashboard.js can call them after fetching data from the API.
const TasksUI = (() => {
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function isOverdue(task) {
    if (!task.due_date || task.status === 'COMPLETED') return false;
    return new Date(task.due_date) < new Date(new Date().toDateString());
  }

  function taskItemHTML(task) {
    const overdue = isOverdue(task);
    const completed = task.status === 'COMPLETED';
    return `
      <div class="task-item ${completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}" data-id="${task.id}">
        <button class="checkbox ${completed ? 'checked' : ''}" data-action="toggle" data-id="${task.id}">${completed ? '✓' : ''}</button>
        <div class="task-body">
          <div class="task-title">${escapeHTML(task.title)}</div>
          ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
          <div class="task-meta">
            ${task.due_date ? `<span class="${overdue ? 'overdue-tag' : ''}">📅 ${formatDate(task.due_date)}${overdue ? ' OVERDUE' : ''}</span>` : ''}
            ${task.category ? `<span>🏷 ${escapeHTML(task.category)}</span>` : ''}
          </div>
        </div>
        <div class="task-right">
          <span class="badge ${task.priority}">${task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}</span>
          <div class="task-actions">
            <button data-action="edit" data-id="${task.id}" title="Edit">✏️</button>
            <button data-action="delete" data-id="${task.id}" title="Delete">🗑️</button>
          </div>
        </div>
      </div>`;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderList(container, tasks) {
    if (!tasks.length) {
      container.innerHTML = '<div class="empty-state">No tasks here. Add one to get started 🌱</div>';
      return;
    }
    container.innerHTML = tasks.map(taskItemHTML).join('');
  }

  function renderStats(el, stats) {
    el.statTotal.textContent = stats.total || 0;
    el.statDone.textContent = stats.completed || 0;
    el.statPending.textContent = stats.pending || 0;
    el.statOverdue.textContent = stats.overdue || 0;
  }

  function renderWeeklyChart(container, weekly) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    const map = {};
    weekly.forEach(w => { map[w.day.slice(0, 10)] = w.completed; });
    const max = Math.max(1, ...days.map(d => map[d] || 0));

    container.innerHTML = days.map(d => {
      const count = map[d] || 0;
      const height = Math.max(4, Math.round((count / max) * 80));
      const label = new Date(d).toLocaleDateString('en-US', { weekday: 'short' })[0];
      return `<div class="bar-col"><div class="bar" style="height:${height}px" title="${count} completed"></div><div class="bar-day">${label}</div></div>`;
    }).join('');
  }

  return { renderList, renderStats, renderWeeklyChart, formatDate, isOverdue };
})();
