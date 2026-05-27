const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  res.json(db.prepare('SELECT * FROM tasks WHERE date = ? ORDER BY time_slot').all(date));
});

router.get('/summary', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const total = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE date = ?').get(date);
  const done = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE date = ? AND status = 'Done'").get(date);
  const pending = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE date = ? AND status = 'Pending'").get(date);
  const inProgress = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE date = ? AND status = 'In Progress'").get(date);
  res.json({ total: total.count, done: done.count, pending: pending.count, inProgress: inProgress.count, progress: total.count > 0 ? Math.round((done.count / total.count) * 100) : 0 });
});

router.post('/', (req, res) => {
  const { time_slot, task_name, description, priority, category, duration_min } = req.body;
  const result = db.prepare('INSERT INTO tasks (time_slot, task_name, description, priority, category, duration_min, date) VALUES (?, ?, ?, ?, ?, ?, date("now"))').run(time_slot, task_name, description, priority || 'Medium', category || 'Amazon', duration_min || 20);
  res.json({ id: result.lastInsertRowid, message: 'Task created' });
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const now = new Date().toISOString();
  if (status === 'In Progress') db.prepare('UPDATE tasks SET status = ?, started_at = ? WHERE id = ?').run(status, now, req.params.id);
  else if (status === 'Done') db.prepare('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?').run(status, now, req.params.id);
  else db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Status updated' });
});

router.put('/:id', (req, res) => {
  const { time_slot, task_name, description, priority, category, duration_min, notes } = req.body;
  db.prepare('UPDATE tasks SET time_slot=?, task_name=?, description=?, priority=?, category=?, duration_min=?, notes=? WHERE id=?').run(time_slot, task_name, description, priority, category, duration_min, notes, req.params.id);
  res.json({ message: 'Task updated' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted' });
});

router.post('/reset', (req, res) => {
  db.prepare("UPDATE tasks SET status = 'Pending', started_at = NULL, completed_at = NULL WHERE is_daily = 1 AND date = date('now')").run();
  res.json({ message: 'Tasks reset' });
});

module.exports = router;
