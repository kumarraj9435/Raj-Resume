const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const { is_negative, is_flagged } = req.query;
  let query = 'SELECT * FROM reviews WHERE 1=1';
  if (is_negative) query += ' AND is_negative = 1';
  if (is_flagged) query += ' AND is_flagged = 1';
  query += ' ORDER BY date DESC';
  res.json(db.prepare(query).all());
});

router.get('/summary', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM reviews').get();
  const negative = db.prepare('SELECT COUNT(*) as count FROM reviews WHERE is_negative = 1').get();
  const flagged = db.prepare('SELECT COUNT(*) as count FROM reviews WHERE is_flagged = 1').get();
  const avgRating = db.prepare('SELECT AVG(rating) as avg FROM reviews').get();
  res.json({ total: total.count, negative: negative.count, flagged: flagged.count, averageRating: avgRating.avg ? avgRating.avg.toFixed(1) : 'N/A' });
});

router.post('/', (req, res) => {
  const { asin, product_name, rating, review_text, reviewer_name, date } = req.body;
  const is_negative = rating <= 2 ? 1 : 0;
  const result = db.prepare('INSERT INTO reviews (asin, product_name, rating, review_text, reviewer_name, date, is_negative) VALUES (?, ?, ?, ?, ?, ?, ?)').run(asin, product_name, rating, review_text, reviewer_name, date || new Date().toISOString().split('T')[0], is_negative);
  if (is_negative) {
    db.prepare("INSERT INTO notifications (title, message, type) VALUES (?, ?, 'alert')").run('Negative Review Alert', `${rating} star review for ${product_name || asin}`);
  }
  res.json({ id: result.lastInsertRowid, message: 'Review added' });
});

router.patch('/:id/flag', (req, res) => {
  const { is_flagged, action_taken } = req.body;
  db.prepare('UPDATE reviews SET is_flagged = ?, action_taken = ? WHERE id = ?').run(is_flagged ? 1 : 0, action_taken, req.params.id);
  res.json({ message: 'Review flag updated' });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ message: 'Review deleted' });
});

module.exports = router;
