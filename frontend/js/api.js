// Thin wrapper around fetch() that talks to the Express API.
// Change BASE_URL if the backend runs somewhere other than localhost:5000.
const API = (() => {
  const BASE_URL = 'http://localhost:5000/api';

  function getToken() {
    return localStorage.getItem('taskflow_token');
  }

  async function request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { success: false, message: 'Invalid server response' };
    }

    if (res.status === 401) {
      // Token missing/expired/invalid — force re-login.
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      if (!location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
      }
    }

    if (!res.ok) {
      const err = new Error(data.message || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  return {
    register: (name, email, password) => request('/auth/register', { method: 'POST', auth: false, body: { name, email, password } }),
    login: (email, password) => request('/auth/login', { method: 'POST', auth: false, body: { email, password } }),
    getTasks: (query = '') => request(`/tasks${query}`),
    getStats: () => request('/tasks/stats'),
    createTask: (task) => request('/tasks', { method: 'POST', body: task }),
    updateTask: (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: task }),
    deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
    setTaskStatus: (id, status) => request(`/tasks/${id}/complete`, { method: 'PATCH', body: { status } })
  };
})();
