const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const { platform, days } = req.query;
  let query = 'SELECT * FROM sales WHERE 1=1';
  const params = [];
  if (platform) { query += ' AND platform = ?'; params.push(platform); }
  if (days) { query += ` AND date >= date('now', '-${parseInt(days)} days')`; }
  query += ' ORDER BY date DESC';
  res.json(db.prepare(query).all(...params));
});

router.get('/summary', (req, res) => {
  const todayAmazon = db.prepare("SELECT COALESCE(SUM(revenue),0) as revenue, COALESCE(SUM(order_count),0) as orders, COALESCE(SUM(units_sold),0) as units FROM sales WHERE platform='Amazon' AND date=date('now')").get();
  const todayBlinkit = db.prepare("SELECT COALESCE(SUM(revenue),0) as revenue, COALESCE(SUM(order_count),0) as orders, COALESCE(SUM(units_sold),0) as units FROM sales WHERE platform='Blinkit' AND date=date('now')").get();
  const weekAmazon = db.prepare("SELECT COALESCE(SUM(revenue),0) as revenue, COALESCE(SUM(order_count),0) as orders FROM sales WHERE platform='Amazon' AND date>=date('now','-7 days')").get();
  const weekBlinkit = db.prepare("SELECT COALESCE(SUM(revenue),0) as revenue, COALESCE(SUM(order_count),0) as orders FROM sales WHERE platform='Blinkit' AND date>=date('now','-7 days')").get();
  res.json({ today: { amazon: todayAmazon, blinkit: todayBlinkit }, weekly: { amazon: weekAmazon, blinkit: weekBlinkit } });
});

router.post('/', (req, res) => {
  const { platform, date, order_count, revenue, units_sold, top_asin, notes } = req.body;
  const result = db.prepare('INSERT INTO sales (platform, date, order_count, revenue, units_sold, top_asin, notes) VALUES (?, ?, ?, ?, ?, ?, ?)').run(platform, date || new Date().toISOString().split('T')[0], order_count, revenue, units_sold, top_asin, notes);
  res.json({ id: result.lastInsertRowid, message: 'Sales data added' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM sales WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
