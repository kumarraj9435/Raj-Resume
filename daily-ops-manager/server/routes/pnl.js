const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const { platform, months } = req.query;
  let query = 'SELECT * FROM pnl WHERE 1=1';
  const params = [];
  if (platform) { query += ' AND platform = ?'; params.push(platform); }
  if (months) { query += ` AND month >= strftime('%Y-%m', date('now', '-${parseInt(months)} months'))`; }
  query += ' ORDER BY month DESC';
  res.json(db.prepare(query).all(...params));
});

router.get('/summary', (req, res) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const data = db.prepare("SELECT * FROM pnl WHERE month = ?").get(currentMonth);
  res.json(data || { month: currentMonth, revenue: 0, cogs: 0, amazon_fees: 0, ad_spend: 0, shipping_cost: 0, other_expenses: 0, profit: 0, margin_percent: 0 });
});

router.post('/', (req, res) => {
  const { month, revenue, cogs, amazon_fees, ad_spend, shipping_cost, other_expenses, platform } = req.body;
  const totalExp = (cogs || 0) + (amazon_fees || 0) + (ad_spend || 0) + (shipping_cost || 0) + (other_expenses || 0);
  const profit = (revenue || 0) - totalExp;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;
  const existing = db.prepare('SELECT id FROM pnl WHERE month = ? AND platform = ?').get(month, platform || 'Amazon');
  if (existing) {
    db.prepare('UPDATE pnl SET revenue=?, cogs=?, amazon_fees=?, ad_spend=?, shipping_cost=?, other_expenses=?, profit=?, margin_percent=? WHERE id=?').run(revenue, cogs, amazon_fees, ad_spend, shipping_cost, other_expenses, profit, margin, existing.id);
    res.json({ id: existing.id, message: 'P&L updated', profit, margin });
  } else {
    const result = db.prepare('INSERT INTO pnl (month, revenue, cogs, amazon_fees, ad_spend, shipping_cost, other_expenses, profit, margin_percent, platform) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(month, revenue, cogs, amazon_fees, ad_spend, shipping_cost, other_expenses, profit, margin, platform || 'Amazon');
    res.json({ id: result.lastInsertRowid, message: 'P&L added', profit, margin });
  }
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM pnl WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
