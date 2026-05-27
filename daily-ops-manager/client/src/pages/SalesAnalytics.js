import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getSales, getSalesSummary, addSales, deleteSales } from '../utils/api';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

function SalesAnalytics() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ platform: 'Amazon', date: new Date().toISOString().split('T')[0], order_count: '', revenue: '', units_sold: '', top_asin: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const [s, sum] = await Promise.all([getSales({ days: 30 }), getSalesSummary()]); setSales(s.data); setSummary(sum.data); } catch (e) {} };
  const handleAdd = async (e) => { e.preventDefault(); await addSales(form); toast.success('Sales added!'); setShowForm(false); loadData(); };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Sales Analytics</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /> Add Sales</button>
      </div>
      {summary && (
        <div className="grid-4" style={{ marginBottom: '20px' }}>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Amazon Today</div><div className="stat-value" style={{ color: '#ff9900', fontSize: '1.4rem' }}>₹{summary.today.amazon.revenue.toLocaleString()}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{summary.today.amazon.orders} orders</div></div>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Blinkit Today</div><div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: '1.4rem' }}>₹{summary.today.blinkit.revenue.toLocaleString()}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{summary.today.blinkit.orders} orders</div></div>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Amazon 7-Day</div><div className="stat-value" style={{ color: '#ff9900', fontSize: '1.4rem' }}>₹{summary.weekly.amazon.revenue.toLocaleString()}</div></div>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Blinkit 7-Day</div><div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: '1.4rem' }}>₹{summary.weekly.blinkit.revenue.toLocaleString()}</div></div>
        </div>
      )}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div className="form-group"><label>Platform</label><select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}><option>Amazon</option><option>Blinkit</option></select></div>
            <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
            <div className="form-group"><label>Orders</label><input type="number" value={form.order_count} onChange={e => setForm({...form, order_count: e.target.value})} /></div>
            <div className="form-group"><label>Revenue</label><input type="number" value={form.revenue} onChange={e => setForm({...form, revenue: e.target.value})} /></div>
            <div className="form-group"><label>Units</label><input type="number" value={form.units_sold} onChange={e => setForm({...form, units_sold: e.target.value})} /></div>
            <div className="form-group"><label>Top ASIN</label><input value={form.top_asin} onChange={e => setForm({...form, top_asin: e.target.value})} /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn btn-success">Save</button></div>
          </form>
        </div>
      )}
      <div className="card"><div className="table-container"><table><thead><tr><th>Date</th><th>Platform</th><th>Orders</th><th>Revenue</th><th>Units</th><th>Top ASIN</th><th></th></tr></thead><tbody>
        {sales.map(s => (<tr key={s.id}><td>{s.date}</td><td style={{ color: s.platform === 'Amazon' ? '#ff9900' : 'var(--accent-green)' }}>{s.platform}</td><td>{s.order_count}</td><td style={{ fontWeight: 600 }}>₹{s.revenue?.toLocaleString()}</td><td>{s.units_sold}</td><td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.top_asin || '-'}</td><td><button className="btn btn-sm btn-danger" onClick={async () => { await deleteSales(s.id); loadData(); }}><FiTrash2 size={12}/></button></td></tr>))}
        {sales.length === 0 && <tr><td colSpan="7" style={{textAlign:'center', color:'var(--text-secondary)'}}>No data yet</td></tr>}
      </tbody></table></div></div>
    </div>
  );
}
export default SalesAnalytics;
