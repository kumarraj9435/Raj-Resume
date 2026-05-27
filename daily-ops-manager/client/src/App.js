import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import TaskManager from './pages/TaskManager';
import SalesAnalytics from './pages/SalesAnalytics';
import InventoryTracker from './pages/InventoryTracker';
import PPCMonitor from './pages/PPCMonitor';
import ReviewAlerts from './pages/ReviewAlerts';
import PnLDashboard from './pages/PnLDashboard';
import Performance from './pages/Performance';
import Automation from './pages/Automation';
import { FiHome, FiCheckSquare, FiTrendingUp, FiPackage, FiDollarSign, FiStar, FiPieChart, FiActivity, FiZap, FiMenu, FiX } from 'react-icons/fi';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = [
    { path: '/', icon: <FiHome />, label: 'Dashboard' },
    { path: '/tasks', icon: <FiCheckSquare />, label: 'Tasks' },
    { path: '/sales', icon: <FiTrendingUp />, label: 'Sales' },
    { path: '/inventory', icon: <FiPackage />, label: 'Inventory' },
    { path: '/ppc', icon: <FiDollarSign />, label: 'PPC Ads' },
    { path: '/reviews', icon: <FiStar />, label: 'Reviews' },
    { path: '/pnl', icon: <FiPieChart />, label: 'P&L' },
    { path: '/performance', icon: <FiActivity />, label: 'Performance' },
    { path: '/automation', icon: <FiZap />, label: 'Automation' },
  ];

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: 'fixed', top: 12, left: 12, zIndex: 1001, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px', borderRadius: '8px', display: 'none' }} className="mobile-menu-btn">
          {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <aside style={{ width: '240px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '20px 0', position: 'fixed', height: '100vh', overflowY: 'auto', zIndex: 1000 }}>
          <div style={{ padding: '0 20px', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg, #4fc3f7, #ab47bc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Daily Ops Manager</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Amazon & Blinkit</p>
          </div>
          <nav>
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', fontSize: '0.85rem', fontWeight: 500, color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)', background: isActive ? 'rgba(79, 195, 247, 0.1)' : 'transparent', borderLeft: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent', transition: 'all 0.2s' })}>
                {item.icon}{item.label}
              </NavLink>
            ))}
          </nav>
          <div style={{ padding: '20px', marginTop: '40px', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>v1.0 - Free Forever<br/>Built by Raj Kumar</p>
          </div>
        </aside>
        <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskManager />} />
            <Route path="/sales" element={<SalesAnalytics />} />
            <Route path="/inventory" element={<InventoryTracker />} />
            <Route path="/ppc" element={<PPCMonitor />} />
            <Route path="/reviews" element={<ReviewAlerts />} />
            <Route path="/pnl" element={<PnLDashboard />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/automation" element={<Automation />} />
          </Routes>
        </main>
      </div>
      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
      <style>{`@media (max-width: 768px) { .mobile-menu-btn { display: block !important; } aside { transform: translateX(-100%); } main { margin-left: 0 !important; } }`}</style>
    </Router>
  );
}

export default App;
