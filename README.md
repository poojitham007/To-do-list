# TaskFlow

A simple full-stack **Task and Productivity Manager** built with HTML, CSS, JavaScript, Express.js, and MySQL.

## ✨ Features

* User registration and login
* JWT authentication
* Create, edit, and delete tasks
* Mark tasks as completed/pending
* Search, filter, and sort tasks
* Task priorities and categories
* Dashboard statistics
* Weekly completion chart
* Secure user-specific tasks

## 🛠️ Technologies

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Authentication:** JWT
* **Password Security:** bcrypt

## 📁 Project Structure

```text
TaskFlow/
├── frontend/
├── backend/
├── database/
└── README.md
```

## 🚀 Setup

### 1. Requirements

* Node.js 18+
* MySQL 8+ or MariaDB
* Modern web browser

### 2. Database

Create the database using:

```bash
mysql -u root -p < database/schema.sql
```

### 3. Configure Backend

Go to the backend folder:

```bash
cd backend
```

Create a `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=taskflow_db
JWT_SECRET=your_secret_key
PORT=5000
```

### 4. Install and Start

```bash
npm install
npm start
```

The backend will run at:

```text
http://localhost:5000
```

### 5. Run Frontend

Open:

```text
frontend/login.html
```

in your browser.

The frontend communicates with the backend through:

```text
http://localhost:5000/api
```

## 🔒 Security

* Passwords are hashed using bcrypt.
* JWT is used for authentication.
* Each user's tasks are protected and isolated.
* MySQL credentials are stored in `.env`.

> **Never upload your `.env` file to GitHub.**


