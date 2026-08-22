// All raw SQL for the tasks table. Every method is scoped to a user_id
// so one user can never read or modify another user's tasks.

const pool = require('../config/database');

const TaskModel = {

  async create(userId, task) {
    const { title, description, priority, category, due_date } = task;

    const [result] = await pool.query(
      `INSERT INTO tasks
       (user_id, title, description, priority, category, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        description || null,
        priority || 'MEDIUM',
        category || null,
        due_date || null
      ]
    );

    return result.insertId;
  },

  async findAllByUser(userId, filters = {}) {
    let sql = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.search) {
      sql += ' AND title LIKE ?';
      params.push(`%${filters.search}%`);
    }

    if (filters.due === 'today') {
      sql += ' AND due_date = CURDATE()';
    }

    if (filters.due === 'upcoming') {
      sql += ' AND due_date > CURDATE() AND status != "COMPLETED"';
    }

    if (filters.due === 'overdue') {
      sql += ' AND due_date < CURDATE() AND status != "COMPLETED"';
    }

    const sortMap = {
      due_date: 'due_date ASC',
      priority: "FIELD(priority,'HIGH','MEDIUM','LOW')",
      created_at: 'created_at DESC'
    };

    sql += ` ORDER BY ${sortMap[filters.sort] || 'created_at DESC'}`;

    const [rows] = await pool.query(sql, params);

    return rows;
  },

  async findByIdAndUser(id, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return rows[0] || null;
  },

  async update(id, userId, fields) {
    const allowed = [
      'title',
      'description',
      'priority',
      'category',
      'due_date',
      'status'
    ];

    const sets = [];
    const params = [];

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }

    if (sets.length === 0) {
      return false;
    }

    params.push(id, userId);

    const [result] = await pool.query(
      `UPDATE tasks
       SET ${sets.join(', ')}
       WHERE id = ? AND user_id = ?`,
      params
    );

    return result.affectedRows > 0;
  },

  async setStatus(id, userId, status) {
    const [result] = await pool.query(
      'UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?',
      [status, id, userId]
    );

    return result.affectedRows > 0;
  },

  async remove(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return result.affectedRows > 0;
  },

  // Dashboard statistics
  async stats(userId) {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS total,

         SUM(
           CASE
             WHEN status = 'COMPLETED' THEN 1
             ELSE 0
           END
         ) AS completed,

         SUM(
           CASE
             WHEN status = 'PENDING' THEN 1
             ELSE 0
           END
         ) AS pending,

         SUM(
           CASE
             WHEN status != 'COMPLETED'
             AND due_date IS NOT NULL
             AND due_date < CURDATE()
             THEN 1
             ELSE 0
           END
         ) AS overdue,

         SUM(
           CASE
             WHEN priority = 'HIGH'
             AND status != 'COMPLETED'
             THEN 1
             ELSE 0
           END
         ) AS highPriority

       FROM tasks
       WHERE user_id = ?`,
      [userId]
    );

    return rows[0];
  },

  // Tasks completed during the last 7 days
  async weeklyCompletion(userId) {
    const [rows] = await pool.query(
      `SELECT
         DATE(updated_at) AS day,
         COUNT(*) AS completed

       FROM tasks

       WHERE user_id = ?
         AND status = 'COMPLETED'
         AND updated_at >= CURDATE() - INTERVAL 6 DAY

       GROUP BY DATE(updated_at)
       ORDER BY day`,
      [userId]
    );

    return rows;
  }

};

module.exports = TaskModel;
