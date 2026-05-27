import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPnL, getPnLSummary, addPnL, deletePnL } from '../utils/api';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

function PnLDashboard() {
  const [pnl, setPnl] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ month: new Date().toISOString().slice(0, 7), platform: 'Amazon', revenue: '', cogs: '', amazon_fees: '', ad_spend: '', shipping_cost: '', other_expenses: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const [p, s] = await Promise.all([getPnL({ months: 12 }), getPnLSummary()]); setPnl(p.data); setSummary(s.data); } catch (e) {} };
  const handleAdd = async (e) => { e.preventDefault(); await addPnL(form); toast.success('P&L saved!'); setShowForm(false); loadData(); };
  const totalExp = (e) => (e.cogs||0) + (e.amazon_fees||0) + (e.ad_spend||0) + (e.shipping_cost||0) + (e.other_expenses||0);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Profit & Loss</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /> Add Entry</button>
      </div>
      {summary && (
        <div className="grid-4" style={{ marginBottom: '20px' }}>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Revenue</div><div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: '1.3rem' }}>₹{(summary.revenue||0).toLocaleString()}</div></div>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Expenses</div><div className="stat-value" style={{ color: 'var(--accent-red)', fontSize: '1.3rem' }}>₹{totalExp(summary).toLocaleString()}</div></div>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Profit</div><div className="stat-value" style={{ color: (summary.profit||0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '1.3rem' }}>₹{(summary.profit||0).toLocaleString()}</div></div>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Margin</div><div className="stat-value" style={{ color: (summary.margin_percent||0) >= 20 ? 'var(--accent-green)' : 'var(--accent-orange)', fontSize: '1.3rem' }}>{summary.margin_percent||0}%</div></div>
        </div>
      )}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div className="form-group"><label>Month</label><input type="month" value={form.month} onChange={e => setForm({...form, month: e.target.value})} /></div>
            <div className="form-group"><label>Platform</label><select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}><option>Amazon</option><option>Blinkit</option></select></div>
            <div className="form-group"><label>Revenue</label><input type="number" value={form.revenue} onChange={e => setForm({...form, revenue: +e.target.value})} /></div>
            <div className="form-group"><label>COGS</label><input type="number" value={form.cogs} onChange={e => setForm({...form, cogs: +e.target.value})} /></div>
            <div className="form-group"><label>Amazon Fees</label><input type="number" value={form.amazon_fees} onChange={e => setForm({...form, amazon_fees: +e.target.value})} /></div>
            <div className="form-group"><label>Ad Spend</label><input type="number" value={form.ad_spend} onChange={e => setForm({...form, ad_spend: +e.target.value})} /></div>
            <div className="form-group"><label>Shipping</label><input type="number" value={form.shipping_cost} onChange={e => setForm({...form, shipping_cost: +e.target.value})} /></div>
            <div className="form-group"><label>Other</label><input type="number" value={form.other_expenses} onChange={e => setForm({...form, other_expenses: +e.target.value})} /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn btn-success">Save</button></div>
          </form>
        </div>
      )}
      <div className="card"><div className="table-container"><table><thead><tr><th>Month</th><th>Platform</th><th>Revenue</th><th>COGS</th><th>Fees</th><th>Ads</th><th>Profit</th><th>Margin</th><th></th></tr></thead><tbody>
        {pnl.map(p => (<tr key={p.id}><td style={{ fontWeight: 600 }}>{p.month}</td><td>{p.platform}</td><td style={{ color: 'var(--accent-green)' }}>₹{p.revenue?.toLocaleString()}</td><td>₹{p.cogs?.toLocaleString()}</td><td>₹{p.amazon_fees?.toLocaleString()}</td><td>₹{p.ad_spend?.toLocaleString()}</td><td style={{ color: p.profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>₹{p.profit?.toLocaleString()}</td><td style={{ color: p.margin_percent >= 20 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{p.margin_percent}%</td><td><button className="btn btn-sm btn-danger" onClick={async () => { await deletePnL(p.id); loadData(); }}><FiTrash2 size={12}/></button></td></tr>))}
        {pnl.length === 0 && <tr><td colSpan="9" style={{textAlign:'center', color:'var(--text-secondary)'}}>No data yet</td></tr>}
      </tbody></table></div></div>
    </div>
  );
}
export default PnLDashboard;
