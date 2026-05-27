const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const db = require('./database');
const taskRoutes = require('./routes/tasks');
const salesRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const ppcRoutes = require('./routes/ppc');
const reviewRoutes = require('./routes/reviews');
const pnlRoutes = require('./routes/pnl');
const performanceRoutes = require('./routes/performance');
const automationRoutes = require('./routes/automation');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/ppc', ppcRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/pnl', pnlRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/automation', automationRoutes);

// Health check for deployment
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React frontend in production
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Cron: Reset daily tasks at 9:55 AM IST
cron.schedule('55 9 * * *', () => {
  db.prepare("UPDATE tasks SET status = 'Pending' WHERE is_daily = 1").run();
  console.log('Daily tasks reset');
}, { timezone: 'Asia/Kolkata' });

// Cron: Reminder every 30 min during work hours IST
cron.schedule('*/30 10-18 * * *', () => {
  const pending = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'Pending' AND date = date('now')").get();
  console.log(`Reminder: ${pending.count} tasks still pending`);
}, { timezone: 'Asia/Kolkata' });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Daily Ops Manager running on port ${PORT}`);
});
