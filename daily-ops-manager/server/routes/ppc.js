const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const { status, days } = req.query;
  let query = 'SELECT * FROM ppc_campaigns WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (days) { query += ` AND date >= date('now', '-${parseInt(days)} days')`; }
  query += ' ORDER BY date DESC, spend DESC';
  res.json(db.prepare(query).all(...params));
});

router.get('/summary', (req, res) => {
  const today = db.prepare("SELECT COALESCE(SUM(spend),0) as total_spend, COALESCE(SUM(sales),0) as total_sales, COALESCE(SUM(clicks),0) as total_clicks, COALESCE(SUM(orders),0) as total_orders FROM ppc_campaigns WHERE date=date('now')").get();
  const week = db.prepare("SELECT COALESCE(SUM(spend),0) as total_spend, COALESCE(SUM(sales),0) as total_sales, COALESCE(SUM(clicks),0) as total_clicks FROM ppc_campaigns WHERE date>=date('now','-7 days')").get();
  const avgAcos = today.total_sales > 0 ? ((today.total_spend / today.total_sales) * 100).toFixed(2) : 0;
  res.json({ today: { ...today, acos: avgAcos }, weekly: { ...week, acos: week.total_sales > 0 ? ((week.total_spend / week.total_sales) * 100).toFixed(2) : 0 } });
});

router.post('/', (req, res) => {
  const { campaign_name, campaign_type, date, impressions, clicks, spend, sales, orders, status } = req.body;
  const acos = sales > 0 ? ((spend / sales) * 100).toFixed(2) : 0;
  const result = db.prepare('INSERT INTO ppc_campaigns (campaign_name, campaign_type, date, impressions, clicks, spend, sales, acos, orders, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(campaign_name, campaign_type || 'Sponsored Products', date || new Date().toISOString().split('T')[0], impressions, clicks, spend, sales, acos, orders, status || 'Active');
  res.json({ id: result.lastInsertRowid, message: 'Campaign data added' });
});

router.patch('/:id/status', (req, res) => {
  db.prepare('UPDATE ppc_campaigns SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  res.json({ message: `Campaign ${req.body.status}` });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM ppc_campaigns WHERE id = ?').run(req.params.id);
  res.json({ message: 'Campaign deleted' });
});

module.exports = router;
