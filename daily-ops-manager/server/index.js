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

app.use('/api/tasks', taskRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/ppc', ppcRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/pnl', pnlRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/automation', automationRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));
}

cron.schedule('55 9 * * *', () => {
  db.prepare("UPDATE tasks SET status = 'Pending' WHERE is_daily = 1").run();
});

cron.schedule('*/30 10-18 * * *', () => {
  const pending = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'Pending' AND date = date('now')").get();
  console.log(`Reminder: ${pending.count} tasks still pending`);
});

app.listen(PORT, () => {
  console.log(`Daily Ops Manager running on port ${PORT}`);
});
