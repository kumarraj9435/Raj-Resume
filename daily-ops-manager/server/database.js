const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/ops.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time_slot TEXT NOT NULL,
    task_name TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium' CHECK(priority IN ('High', 'Medium', 'Low')),
    category TEXT DEFAULT 'Amazon' CHECK(category IN ('Amazon', 'Blinkit', 'Operations', 'Finance', 'Buffer')),
    duration_min INTEGER DEFAULT 20,
    status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Done', 'Skipped')),
    is_daily INTEGER DEFAULT 1,
    date TEXT DEFAULT (date('now')),
    started_at TEXT,
    completed_at TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL CHECK(platform IN ('Amazon', 'Blinkit')),
    date TEXT NOT NULL,
    order_count INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0,
    units_sold INTEGER DEFAULT 0,
    top_asin TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    platform TEXT DEFAULT 'Amazon',
    current_stock INTEGER DEFAULT 0,
    fba_stock INTEGER DEFAULT 0,
    warehouse_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    aged_days INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Healthy' CHECK(status IN ('Healthy', 'Low', 'Critical', 'Aged', 'Stranded')),
    last_updated TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ppc_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT DEFAULT 'Sponsored Products',
    date TEXT NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    spend REAL DEFAULT 0,
    sales REAL DEFAULT 0,
    acos REAL DEFAULT 0,
    orders INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Paused', 'Archived')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asin TEXT NOT NULL,
    product_name TEXT,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    review_text TEXT,
    reviewer_name TEXT,
    date TEXT NOT NULL,
    is_negative INTEGER DEFAULT 0,
    is_flagged INTEGER DEFAULT 0,
    action_taken TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pnl (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    revenue REAL DEFAULT 0,
    cogs REAL DEFAULT 0,
    amazon_fees REAL DEFAULT 0,
    ad_spend REAL DEFAULT 0,
    shipping_cost REAL DEFAULT 0,
    other_expenses REAL DEFAULT 0,
    profit REAL DEFAULT 0,
    margin_percent REAL DEFAULT 0,
    platform TEXT DEFAULT 'Amazon',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    completion_percent REAL DEFAULT 0,
    high_priority_done INTEGER DEFAULT 0,
    total_time_min INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS automation_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    condition_json TEXT,
    action_type TEXT NOT NULL,
    action_json TEXT,
    is_active INTEGER DEFAULT 1,
    last_triggered TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK(type IN ('info', 'warning', 'alert', 'success')),
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
if (taskCount.count === 0) {
  const insertTask = db.prepare('INSERT INTO tasks (time_slot, task_name, description, priority, category, duration_min, is_daily) VALUES (?, ?, ?, ?, ?, ?, 1)');
  const defaultTasks = [
    ['10:00-10:20', 'PRN Sheet Update', 'Update PRN register - check stock levels', 'High', 'Operations', 20],
    ['10:20-10:40', 'GRN Update', 'Record new goods received, verify quantities', 'High', 'Operations', 20],
    ['10:40-11:00', 'Listing Optimization', 'Titles, bullets, backend keywords', 'High', 'Amazon', 20],
    ['11:00-11:15', 'Amazon Sales Check', 'Check orders, top ASINs, dips - 15 min', 'High', 'Amazon', 15],
    ['11:15-11:35', 'FBA Stock Update', 'Update FBA inventory, stranded, reorder', 'High', 'Amazon', 20],
    ['11:35-11:55', 'Competitor Analysis', 'Top competitor listings, attributes, pricing', 'Medium', 'Amazon', 20],
    ['11:55-12:15', 'Sponsored Ads (PPC) Check', 'ACOS, spend, pause non-performers', 'High', 'Amazon', 20],
    ['12:15-12:35', 'Sales Tracker Review', 'Check sales trends, growth ASINs', 'High', 'Amazon', 20],
    ['12:35-12:55', 'Pricing & Buy Box Monitor', 'Competitive pricing, Buy Box %', 'High', 'Amazon', 20],
    ['12:55-13:15', 'Review & Rating Monitoring', 'Flag negative reviews, escalate', 'Medium', 'Amazon', 20],
    ['13:15-13:30', 'Category & Cataloguing Tasks', 'Stranded/suppressed fix, new listings', 'Medium', 'Amazon', 15],
    ['13:30-13:45', 'Buffer / Pending Tasks', 'Clear anything spilling over', 'Low', 'Buffer', 15],
    ['15:30-15:45', 'Blinkit Sales Check', 'Orders, top SKUs, issues - 15 min', 'High', 'Blinkit', 15],
    ['15:45-16:15', 'Brand Analytics & Keywords', 'Extract high-searched keywords', 'High', 'Amazon', 30],
    ['16:15-16:35', 'Referral Fee Audit', 'Verify correct fees on each ASIN', 'High', 'Amazon', 20],
    ['16:35-16:55', 'Inventory Health Check (FBA)', 'Reorder planning, aged inventory', 'High', 'Amazon', 20],
    ['16:55-17:15', 'Image & A+ Content Review', 'Product images, A+ quality check', 'Low', 'Amazon', 20],
    ['17:15-17:40', 'Backend Keywords Update', 'Update search terms with latest data', 'Medium', 'Amazon', 25],
    ['17:40-18:05', 'Monthly P&L Prep / Misc Tasks', 'Revenue, COGS, Amazon fees, ad spend', 'High', 'Finance', 25],
    ['18:05-18:25', 'EOD Wrap - Update Log & PRN', 'Mark statuses, update PRN if needed', 'High', 'Operations', 20],
  ];
  const insertMany = db.transaction((tasks) => { for (const t of tasks) insertTask.run(...t); });
  insertMany(defaultTasks);
}

module.exports = db;
