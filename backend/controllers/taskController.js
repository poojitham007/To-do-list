const TaskModel = require('../models/taskModel');

const VALID_PRIORITY = ['LOW', 'MEDIUM', 'HIGH'];
const VALID_STATUS = ['PENDING', 'COMPLETED'];

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, category, due_date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (priority && !VALID_PRIORITY.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority value' });
    }

    const id = await TaskModel.create(req.user.id, { title, description, priority, category, due_date });
    const task = await TaskModel.findByIdAndUser(id, req.user.id);
    res.status(201).json({ success: true, message: 'Task created', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error creating task' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { status, priority, category, search, due, sort } = req.query;
    const tasks = await TaskModel.findAllByUser(req.user.id, { status, priority, category, search, due, sort });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
};

exports.getTaskStats = async (req, res) => {
  try {
    const stats = await TaskModel.stats(req.user.id);
    const weekly = await TaskModel.weeklyCompletion(req.user.id);
    res.json({ success: true, stats, weekly });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await TaskModel.findByIdAndUser(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const existing = await TaskModel.findByIdAndUser(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Task not found' });

    if (req.body.priority && !VALID_PRIORITY.includes(req.body.priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority value' });
    }
    if (req.body.status && !VALID_STATUS.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    await TaskModel.update(req.params.id, req.user.id, req.body);
    const task = await TaskModel.findByIdAndUser(req.params.id, req.user.id);
    res.json({ success: true, message: 'Task updated', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error updating task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const deleted = await TaskModel.remove(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const status = req.body.status === 'PENDING' ? 'PENDING' : 'COMPLETED';
    const updated = await TaskModel.setStatus(req.params.id, req.user.id, status);
    if (!updated) return res.status(404).json({ success: false, message: 'Task not found' });
    const task = await TaskModel.findByIdAndUser(req.params.id, req.user.id);
    res.json({ success: true, message: `Task marked ${status.toLowerCase()}`, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error updating task status' });
  }
};
