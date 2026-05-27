import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTodayPerformance, savePerformance, getPerformanceTrend } from '../utils/api';
import { FiSave, FiAward, FiTarget, FiClock } from 'react-icons/fi';

function Performance() {
  const [today, setToday] = useState(null);
  const [trend, setTrend] = useState([]);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const [t, tr] = await Promise.all([getTodayPerformance(), getPerformanceTrend()]); setToday(t.data); setTrend(tr.data); } catch (e) {} };
  const handleSave = async () => { await savePerformance(); toast.success('Saved!'); loadData(); };
  const getGrade = (p) => { if (p >= 90) return { g: 'A+', c: 'var(--accent-green)' }; if (p >= 75) return { g: 'A', c: 'var(--accent-green)' }; if (p >= 60) return { g: 'B', c: 'var(--accent-blue)' }; if (p >= 40) return { g: 'C', c: 'var(--accent-orange)' }; return { g: 'D', c: 'var(--accent-red)' }; };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Performance Score</h1>
        <button className="btn btn-success" onClick={handleSave}><FiSave /> Save EOD</button>
      </div>
      {today && (<>
        <div className="card" style={{ textAlign: 'center', marginBottom: '20px', padding: '30px' }}>
          <div style={{ fontSize: '4rem', fontWeight: 800, color: getGrade(today.completion_percent).c }}>{today.completion_percent}%</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Grade: {getGrade(today.completion_percent).g}</div>
          <div className="progress-bar" style={{ height: '14px', marginTop: '16px', maxWidth: '400px', margin: '16px auto 0' }}>
            <div className="progress-bar-fill" style={{ width: `${today.completion_percent}%`, background: `linear-gradient(90deg, ${getGrade(today.completion_percent).c}, var(--accent-blue))` }}></div>
          </div>
        </div>
        <div className="grid-4" style={{ marginBottom: '20px' }}>
          <div className="card" style={{ textAlign: 'center' }}><FiTarget size={24} color="var(--accent-blue)" /><div className="stat-value" style={{ fontSize: '1.4rem' }}>{today.completed_tasks}/{today.total_tasks}</div><div className="stat-label">Tasks Done</div></div>
          <div className="card" style={{ textAlign: 'center' }}><FiAward size={24} color="var(--accent-orange)" /><div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--accent-orange)' }}>{today.high_priority_done}/{today.high_priority_total}</div><div className="stat-label">High Priority</div></div>
          <div className="card" style={{ textAlign: 'center' }}><FiClock size={24} color="var(--accent-purple)" /><div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--accent-purple)' }}>{Math.floor(today.total_time_min/60)}h {today.total_time_min%60}m</div><div className="stat-label">Time Spent</div></div>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-value" style={{ fontSize: '1rem' }}><span style={{ color: '#ff9900' }}>A:{today.tasks_by_category?.Amazon||0}</span> <span style={{ color: 'var(--accent-green)' }}>B:{today.tasks_by_category?.Blinkit||0}</span></div><div className="stat-label">By Category</div></div>
        </div>
      </>)}
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>30-Day Trend</h3>
        {trend.length > 0 ? (
          <div className="table-container"><table><thead><tr><th>Date</th><th>Tasks</th><th>Done</th><th>Score</th><th>High Priority</th><th>Time</th></tr></thead><tbody>
            {trend.map(t => (<tr key={t.id}><td>{t.date}</td><td>{t.total_tasks}</td><td>{t.completed_tasks}</td><td style={{ color: getGrade(t.completion_percent).c, fontWeight: 700 }}>{t.completion_percent}% ({getGrade(t.completion_percent).g})</td><td>{t.high_priority_done}</td><td>{Math.floor(t.total_time_min/60)}h {t.total_time_min%60}m</td></tr>))}
          </tbody></table></div>
        ) : <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No data yet. Click "Save EOD" to start tracking!</p>}
      </div>
    </div>
  );
}
export default Performance;
