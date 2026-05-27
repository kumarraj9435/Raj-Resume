import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTaskSummary, getSalesSummary, getInventoryAlerts, getPPCSummary, getTodayPerformance, getUnreadCount } from '../utils/api';
import { FiCheckSquare, FiTrendingUp, FiPackage, FiDollarSign, FiActivity, FiBell, FiAlertTriangle } from 'react-icons/fi';

function Dashboard() {
  const [taskSummary, setTaskSummary] = useState({ total: 0, done: 0, pending: 0, progress: 0 });
  const [salesSummary, setSalesSummary] = useState(null);
  const [inventoryAlerts, setInventoryAlerts] = useState({ totalAlerts: 0, lowStock: [], stranded: [] });
  const [ppcSummary, setPpcSummary] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [t, s, i, p, perf] = await Promise.all([getTaskSummary(), getSalesSummary(), getInventoryAlerts(), getPPCSummary(), getTodayPerformance()]);
      setTaskSummary(t.data); setSalesSummary(s.data); setInventoryAlerts(i.data); setPpcSummary(p.data); setPerformance(perf.data);
    } catch (err) { console.log('Loading...'); }
  };

  const getGreeting = () => { const h = currentTime.getHours(); return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'; };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>{getGreeting()}, Raj!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {currentTime.toLocaleTimeString('en-IN')}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #1a2847, #16213e)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1rem' }}>Today's Progress</h3>
          <span className="stat-value" style={{ color: taskSummary.progress >= 75 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{taskSummary.progress}%</span>
        </div>
        <div className="progress-bar" style={{ height: '12px' }}>
          <div className="progress-bar-fill" style={{ width: `${taskSummary.progress}%`, background: taskSummary.progress >= 75 ? 'linear-gradient(90deg, #66bb6a, #43a047)' : 'linear-gradient(90deg, #ffa726, #f57c00)' }}></div>
        </div>
        <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--accent-green)' }}>Done: {taskSummary.done}</span>
          <span style={{ color: 'var(--accent-yellow)' }}>Pending: {taskSummary.pending}</span>
          <span style={{ color: 'var(--accent-blue)' }}>In Progress: {taskSummary.inProgress || 0}</span>
          <span style={{ color: 'var(--text-secondary)' }}>Total: {taskSummary.total}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <Link to="/tasks" className="card" style={{ textAlign: 'center' }}>
          <FiCheckSquare size={24} color="var(--accent-blue)" />
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{taskSummary.done}/{taskSummary.total}</div>
          <div className="stat-label">Tasks Done</div>
        </Link>
        <Link to="/sales" className="card" style={{ textAlign: 'center' }}>
          <FiTrendingUp size={24} color="var(--accent-green)" />
          <div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: '1.4rem' }}>₹{salesSummary?.today?.amazon?.revenue?.toLocaleString() || 0}</div>
          <div className="stat-label">Amazon Revenue</div>
        </Link>
        <Link to="/inventory" className="card" style={{ textAlign: 'center' }}>
          <FiPackage size={24} color="var(--accent-orange)" />
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{inventoryAlerts.totalAlerts}</div>
          <div className="stat-label">Inventory Alerts</div>
        </Link>
        <Link to="/ppc" className="card" style={{ textAlign: 'center' }}>
          <FiDollarSign size={24} color="var(--accent-purple)" />
          <div className="stat-value" style={{ color: 'var(--accent-purple)', fontSize: '1.4rem' }}>{ppcSummary?.today?.acos || 0}%</div>
          <div className="stat-label">Today's ACOS</div>
        </Link>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}><FiActivity style={{marginRight:'8px'}} color="var(--accent-blue)"/>Performance</h3>
          {performance && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><div className="stat-label">Completion</div><div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-green)' }}>{performance.completion_percent}%</div></div>
              <div><div className="stat-label">High Priority</div><div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-orange)' }}>{performance.high_priority_done}/{performance.high_priority_total || 0}</div></div>
              <div><div className="stat-label">Time Spent</div><div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{Math.floor((performance.total_time_min||0)/60)}h {(performance.total_time_min||0)%60}m</div></div>
              <div><div className="stat-label">Categories</div><div style={{ fontSize: '0.75rem' }}>A:{performance.tasks_by_category?.Amazon||0} B:{performance.tasks_by_category?.Blinkit||0}</div></div>
            </div>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}><FiAlertTriangle style={{marginRight:'8px'}} color="var(--accent-orange)"/>Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {inventoryAlerts.lowStock?.length > 0 && <div style={{ padding: '8px 12px', background: 'rgba(255,167,38,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>{inventoryAlerts.lowStock.length} items low stock</div>}
            {inventoryAlerts.stranded?.length > 0 && <div style={{ padding: '8px 12px', background: 'rgba(239,83,80,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>{inventoryAlerts.stranded.length} stranded items</div>}
            {taskSummary.pending > 10 && <div style={{ padding: '8px 12px', background: 'rgba(255,238,88,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>{taskSummary.pending} tasks pending!</div>}
            {inventoryAlerts.totalAlerts === 0 && taskSummary.pending <= 10 && <div style={{ padding: '8px 12px', background: 'rgba(102,187,106,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>All good! No critical alerts.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
