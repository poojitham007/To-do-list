# TaskFlow

A personal task and productivity manager: vanilla HTML/CSS/JS frontend, Express REST API backend, MySQL database, JWT auth.

## 1. Required software
- Node.js 18+
- MySQL 8+ (or MariaDB)
- A modern browser

## 2. Create the database
```bash
mysql -u root -p
```
Then, inside the MySQL prompt, run the schema file:
```sql
source database/schema.sql;
```
(or from the shell: `mysql -u root -p < database/schema.sql`)

This creates `taskflow_db` with the `users` and `tasks` tables.

## 3. Configure environment variables
```bash
cd backend
cp .env.example .env
```
Edit `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskflow_db
JWT_SECRET=some_long_random_string
PORT=5000
```

## 4. Install backend dependencies
```bash
cd backend
npm install
```

## 5. Start the backend
```bash
npm start
# or, for auto-reload during development:
npm run dev
```
Verify it's running:
```bash
curl http://localhost:5000/api/health
```

## 6. Open the frontend
The frontend is static — no build step. Options:
- Open `frontend/login.html` directly in a browser, or
- Serve it locally, e.g. `npx serve frontend` and visit the printed URL.

`frontend/js/api.js` points at `http://localhost:5000/api` — update `BASE_URL` there if your backend runs elsewhere.

## 7. Test the flow
1. Register a new account on `register.html`.
2. You're redirected to `dashboard.html` with a JWT stored in `localStorage`.
3. Add a task, mark it complete, edit it, delete it, and try the search/filter/sort controls.
4. Stats cards and the weekly chart pull from `GET /api/tasks/stats`.

## API endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create account, returns JWT |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Current user profile |
| GET | /api/tasks | Yes | List tasks (query: status, priority, category, search, due, sort) |
| POST | /api/tasks | Yes | Create task |
| GET | /api/tasks/:id | Yes | Get one task |
| PUT | /api/tasks/:id | Yes | Update task |
| DELETE | /api/tasks/:id | Yes | Delete task |
| PATCH | /api/tasks/:id/complete | Yes | Set status (COMPLETED/PENDING) |
| GET | /api/tasks/stats | Yes | Dashboard stats + weekly completion counts |

`due` query values: `today`, `upcoming`, `overdue`. `sort` values: `due_date`, `priority`, `created_at`.

## Architecture
```
Frontend (HTML/CSS/JS, fetch())
        ↓
REST API (Express, JWT-protected routes)
        ↓
Controllers → Models (parameterized SQL)
        ↓
MySQL (taskflow_db)
```
Every task query is scoped by `user_id`, so one user can never read or modify another user's tasks. Passwords are hashed with bcrypt; the frontend never talks to MySQL directly.

## Project structure
See the folder tree in the project root — `frontend/`, `backend/` (config, middleware, controllers, routes, models), `database/schema.sql`.
