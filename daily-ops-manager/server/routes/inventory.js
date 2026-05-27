const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const { status, platform } = req.query;
  let query = 'SELECT * FROM inventory WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (platform) { query += ' AND platform = ?'; params.push(platform); }
  query += ' ORDER BY status DESC, current_stock ASC';
  res.json(db.prepare(query).all(...params));
});

router.get('/alerts', (req, res) => {
  const lowStock = db.prepare("SELECT * FROM inventory WHERE current_stock <= reorder_level AND status != 'Stranded'").all();
  const aged = db.prepare("SELECT * FROM inventory WHERE aged_days > 90").all();
  const stranded = db.prepare("SELECT * FROM inventory WHERE status = 'Stranded'").all();
  res.json({ lowStock, aged, stranded, totalAlerts: lowStock.length + aged.length + stranded.length });
});

router.post('/', (req, res) => {
  const { sku, product_name, platform, current_stock, fba_stock, warehouse_stock, reorder_level } = req.body;
  const result = db.prepare('INSERT INTO inventory (sku, product_name, platform, current_stock, fba_stock, warehouse_stock, reorder_level) VALUES (?, ?, ?, ?, ?, ?, ?)').run(sku, product_name, platform || 'Amazon', current_stock || 0, fba_stock || 0, warehouse_stock || 0, reorder_level || 10);
  res.json({ id: result.lastInsertRowid, message: 'Item added' });
});

router.patch('/:id/stock', (req, res) => {
  const { current_stock, fba_stock, warehouse_stock } = req.body;
  const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);
  let status = 'Healthy';
  const stock = current_stock ?? item.current_stock;
  if (stock <= 0) status = 'Critical';
  else if (stock <= (item.reorder_level || 10)) status = 'Low';
  db.prepare('UPDATE inventory SET current_stock=COALESCE(?,current_stock), fba_stock=COALESCE(?,fba_stock), warehouse_stock=COALESCE(?,warehouse_stock), status=?, last_updated=datetime("now") WHERE id=?').run(current_stock, fba_stock, warehouse_stock, status, req.params.id);
  res.json({ message: 'Stock updated', status });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM inventory WHERE id = ?').run(req.params.id);
  res.json({ message: 'Item deleted' });
});

module.exports = router;
