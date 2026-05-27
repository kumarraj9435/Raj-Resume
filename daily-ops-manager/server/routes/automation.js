const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/rules', (req, res) => {
  res.json(db.prepare('SELECT * FROM automation_rules ORDER BY is_active DESC').all());
});

router.post('/rules', (req, res) => {
  const { rule_name, trigger_type, condition_json, action_type, action_json } = req.body;
  const result = db.prepare('INSERT INTO automation_rules (rule_name, trigger_type, condition_json, action_type, action_json) VALUES (?, ?, ?, ?, ?)').run(rule_name, trigger_type, JSON.stringify(condition_json), action_type, JSON.stringify(action_json));
  res.json({ id: result.lastInsertRowid, message: 'Rule created' });
});

router.patch('/rules/:id/toggle', (req, res) => {
  const rule = db.prepare('SELECT is_active FROM automation_rules WHERE id = ?').get(req.params.id);
  db.prepare('UPDATE automation_rules SET is_active = ? WHERE id = ?').run(rule.is_active ? 0 : 1, req.params.id);
  res.json({ message: 'Rule toggled' });
});

router.delete('/rules/:id', (req, res) => {
  db.prepare('DELETE FROM automation_rules WHERE id = ?').run(req.params.id);
  res.json({ message: 'Rule deleted' });
});

router.get('/notifications', (req, res) => {
  res.json(db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all());
});

router.patch('/notifications/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Marked as read' });
});

router.post('/notifications/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1').run();
  res.json({ message: 'All marked as read' });
});

router.get('/notifications/unread', (req, res) => {
  const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0').get();
  res.json({ unread: result.count });
});

module.exports = router;
