// Wires up dashboard.html: fetches data from the API and TasksUI renders it.
// Only runs on the dashboard page (taskList only exists there).
const taskListEl = document.getElementById('taskList');
if (taskListEl) {
  const state = { tab: 'all', search: '', category: '', priority: '', due: '', sort: 'created_at' };

  const statEls = {
    statTotal: document.getElementById('statTotal'),
    statDone: document.getElementById('statDone'),
    statPending: document.getElementById('statPending'),
    statOverdue: document.getElementById('statOverdue')
  };
  const remainingCountEl = document.getElementById('remainingCount');
  const weeklyChartEl = document.getElementById('weeklyChart');
  const filterCategory = document.getElementById('filterCategory');
  const modalOverlay = document.getElementById('taskModalOverlay');
  const taskForm = document.getElementById('taskForm');
  const modalTitle = document.getElementById('modalTitle');

  function buildQuery() {
    const params = new URLSearchParams();
    if (state.tab === 'active') params.set('status', 'PENDING');
    if (state.tab === 'completed') params.set('status', 'COMPLETED');
    if (state.search) params.set('search', state.search);
    if (state.category) params.set('category', state.category);
    if (state.priority) params.set('priority', state.priority);
    if (state.due) params.set('due', state.due);
    if (state.sort) params.set('sort', state.sort);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  async function loadTasks() {
    try {
      const { tasks } = await API.getTasks(buildQuery());
      TasksUI.renderList(taskListEl, tasks);
      populateCategories(tasks);
      const remaining = tasks.filter(t => t.status !== 'COMPLETED').length;
      remainingCountEl.textContent = `${remaining} remaining`;
    } catch (err) {
      console.error(err);
    }
  }

  async function loadStats() {
    try {
      const { stats, weekly } = await API.getStats();
      TasksUI.renderStats(statEls, stats);
      TasksUI.renderWeeklyChart(weeklyChartEl, weekly);
    } catch (err) {
      console.error(err);
    }
  }

  function populateCategories(tasks) {
    const current = filterCategory.value;
    const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
    filterCategory.innerHTML = '<option value="">All categories</option>' +
      categories.map(c => `<option value="${c}">${c}</option>`).join('');
    filterCategory.value = current;
  }

  function refresh() {
    loadTasks();
    loadStats();
  }

  // Tabs
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.tab = btn.dataset.tab;
      loadTasks();
    });
  });

  // Search (debounced)
  let searchTimer;
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      loadTasks();
    }, 300);
  });

  // Filters + sort
  document.getElementById('filterCategory').addEventListener('change', (e) => { state.category = e.target.value; loadTasks(); });
  document.getElementById('filterPriority').addEventListener('change', (e) => { state.priority = e.target.value; loadTasks(); });
  document.getElementById('filterDue').addEventListener('change', (e) => { state.due = e.target.value; loadTasks(); });
  document.getElementById('sortSelect').addEventListener('change', (e) => { state.sort = e.target.value; loadTasks(); });

  // Clear completed
  document.getElementById('clearCompletedBtn').addEventListener('click', async () => {
    const { tasks } = await API.getTasks('?status=COMPLETED');
    await Promise.all(tasks.map(t => API.deleteTask(t.id)));
    refresh();
  });

  // Task list clicks (toggle / edit / delete)
  taskListEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === 'toggle') {
      const completed = btn.classList.contains('checked');
      await API.setTaskStatus(id, completed ? 'PENDING' : 'COMPLETED');
      refresh();
    } else if (action === 'delete') {
      if (confirm('Delete this task?')) {
        await API.deleteTask(id);
        refresh();
      }
    } else if (action === 'edit') {
      const { tasks } = await API.getTasks();
      const task = tasks.find(t => String(t.id) === id);
      if (task) openModal(task);
    }
  });

  // Modal open/close
  function openModal(task = null) {
    modalTitle.textContent = task ? 'Edit Task' : 'Add Task';
    document.getElementById('taskId').value = task ? task.id : '';
    document.getElementById('taskTitle').value = task ? task.title : '';
    document.getElementById('taskDescription').value = task ? (task.description || '') : '';
    document.getElementById('taskPriority').value = task ? task.priority : 'MEDIUM';
    document.getElementById('taskCategory').value = task ? (task.category || '') : '';
    document.getElementById('taskDueDate').value = task && task.due_date ? task.due_date.slice(0, 10) : '';
    modalOverlay.classList.add('show');
  }
  function closeModal() {
    modalOverlay.classList.remove('show');
    taskForm.reset();
  }

  document.getElementById('addTaskBtn').addEventListener('click', () => openModal());
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('taskId').value;
    const payload = {
      title: document.getElementById('taskTitle').value.trim(),
      description: document.getElementById('taskDescription').value.trim(),
      priority: document.getElementById('taskPriority').value,
      category: document.getElementById('taskCategory').value.trim(),
      due_date: document.getElementById('taskDueDate').value || null
    };
    try {
      if (id) {
        await API.updateTask(id, payload);
      } else {
        await API.createTask(payload);
      }
      closeModal();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  });

  refresh();
}
