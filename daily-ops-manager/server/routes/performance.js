const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const { days } = req.query;
  let query = 'SELECT * FROM performance WHERE 1=1';
  if (days) query += ` AND date >= date('now', '-${parseInt(days)} days')`;
  query += ' ORDER BY date DESC';
  res.json(db.prepare(query).all());
});

router.get('/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const tasks = db.prepare('SELECT * FROM tasks WHERE date = ?').all(today);
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Done').length;
  const highTotal = tasks.filter(t => t.priority === 'High').length;
  const highDone = tasks.filter(t => t.priority === 'High' && t.status === 'Done').length;
  const timeSpent = tasks.filter(t => t.status === 'Done').reduce((s, t) => s + (t.duration_min || 0), 0);
  res.json({
    date: today, total_tasks: total, completed_tasks: done,
    completion_percent: total > 0 ? Math.round((done / total) * 100) : 0,
    high_priority_done: highDone, high_priority_total: highTotal, total_time_min: timeSpent,
    tasks_by_category: {
      Amazon: tasks.filter(t => t.category === 'Amazon').length,
      Blinkit: tasks.filter(t => t.category === 'Blinkit').length,
      Operations: tasks.filter(t => t.category === 'Operations').length,
      Finance: tasks.filter(t => t.category === 'Finance').length
    }
  });
});

router.post('/save', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const tasks = db.prepare('SELECT * FROM tasks WHERE date = ?').all(today);
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Done').length;
  const highDone = tasks.filter(t => t.priority === 'High' && t.status === 'Done').length;
  const totalTime = tasks.filter(t => t.status === 'Done').reduce((s, t) => s + (t.duration_min || 0), 0);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  db.prepare('INSERT OR REPLACE INTO performance (date, total_tasks, completed_tasks, completion_percent, high_priority_done, total_time_min) VALUES (?, ?, ?, ?, ?, ?)').run(today, total, done, percent, highDone, totalTime);
  res.json({ message: 'Performance saved', completion_percent: percent });
});

router.get('/trend', (req, res) => {
  res.json(db.prepare("SELECT * FROM performance WHERE date >= date('now', '-30 days') ORDER BY date ASC").all());
});

module.exports = router;
