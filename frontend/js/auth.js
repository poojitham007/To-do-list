// Handles the login and register forms. Only runs its listeners if the
// relevant form exists on the current page.
function showError(message) {
  const el = document.getElementById('errorMsg');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    try {
      const data = await API.login(email, password);
      localStorage.setItem('taskflow_token', data.token);
      localStorage.setItem('taskflow_user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } catch (err) {
      showError(err.message);
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    try {
      const data = await API.register(name, email, password);
      localStorage.setItem('taskflow_token', data.token);
      localStorage.setItem('taskflow_user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } catch (err) {
      showError(err.message);
    }
  });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    window.location.href = 'login.html';
  });
}

// Guard: dashboard.html requires a token.
if (document.body.classList.contains('dashboard-body') && !localStorage.getItem('taskflow_token')) {
  window.location.href = 'login.html';
}
