import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPPC, getPPCSummary, addPPC, updatePPCStatus, deletePPC } from '../utils/api';
import { FiPlus, FiTrash2, FiPause, FiPlay } from 'react-icons/fi';

function PPCMonitor() {
  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ campaign_name: '', campaign_type: 'Sponsored Products', date: new Date().toISOString().split('T')[0], impressions: '', clicks: '', spend: '', sales: '', orders: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const [c, s] = await Promise.all([getPPC({ days: 7 }), getPPCSummary()]); setCampaigns(c.data); setSummary(s.data); } catch (e) {} };
  const handleAdd = async (e) => { e.preventDefault(); await addPPC(form); toast.success('Added!'); setShowForm(false); loadData(); };
  const toggle = async (id, cur) => { await updatePPCStatus(id, cur === 'Active' ? 'Paused' : 'Active'); loadData(); };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">PPC Ads Monitor</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /> Add Data</button>
      </div>
      {summary && (
        <div className="grid-4" style={{ marginBottom: '20px' }}>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Today Spend</div><div className="stat-value" style={{ color: 'var(--accent-red)', fontSize: '1.4rem' }}>₹{summary.today.total_spend?.toLocaleString()}</div></div>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Today Sales</div><div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: '1.4rem' }}>₹{summary.today.total_sales?.toLocaleString()}</div></div>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">ACOS</div><div className="stat-value" style={{ color: parseFloat(summary.today.acos) > 30 ? 'var(--accent-red)' : 'var(--accent-green)', fontSize: '1.4rem' }}>{summary.today.acos}%</div></div>
          <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Weekly Spend</div><div className="stat-value" style={{ color: 'var(--accent-purple)', fontSize: '1.4rem' }}>₹{summary.weekly.total_spend?.toLocaleString()}</div></div>
        </div>
      )}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div className="form-group"><label>Campaign</label><input value={form.campaign_name} onChange={e => setForm({...form, campaign_name: e.target.value})} required /></div>
            <div className="form-group"><label>Type</label><select value={form.campaign_type} onChange={e => setForm({...form, campaign_type: e.target.value})}><option>Sponsored Products</option><option>Sponsored Brands</option><option>Sponsored Display</option></select></div>
            <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
            <div className="form-group"><label>Impressions</label><input type="number" value={form.impressions} onChange={e => setForm({...form, impressions: e.target.value})} /></div>
            <div className="form-group"><label>Clicks</label><input type="number" value={form.clicks} onChange={e => setForm({...form, clicks: e.target.value})} /></div>
            <div className="form-group"><label>Spend</label><input type="number" step="0.01" value={form.spend} onChange={e => setForm({...form, spend: e.target.value})} /></div>
            <div className="form-group"><label>Sales</label><input type="number" step="0.01" value={form.sales} onChange={e => setForm({...form, sales: e.target.value})} /></div>
            <div className="form-group"><label>Orders</label><input type="number" value={form.orders} onChange={e => setForm({...form, orders: e.target.value})} /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn btn-success">Save</button></div>
          </form>
        </div>
      )}
      <div className="card"><div className="table-container"><table><thead><tr><th>Campaign</th><th>Date</th><th>Impressions</th><th>Clicks</th><th>Spend</th><th>Sales</th><th>ACOS</th><th>Status</th><th></th></tr></thead><tbody>
        {campaigns.map(c => (<tr key={c.id}><td style={{ fontWeight: 500 }}>{c.campaign_name}</td><td>{c.date}</td><td>{c.impressions?.toLocaleString()}</td><td>{c.clicks}</td><td>₹{c.spend?.toLocaleString()}</td><td style={{ color: 'var(--accent-green)' }}>₹{c.sales?.toLocaleString()}</td><td style={{ color: c.acos > 30 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>{c.acos}%</td><td style={{ color: c.status === 'Active' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{c.status}</td><td style={{ display: 'flex', gap: '4px' }}><button className="btn btn-sm" style={{ background: 'var(--bg-secondary)' }} onClick={() => toggle(c.id, c.status)}>{c.status === 'Active' ? <FiPause size={12}/> : <FiPlay size={12}/>}</button><button className="btn btn-sm btn-danger" onClick={async () => { await deletePPC(c.id); loadData(); }}><FiTrash2 size={12}/></button></td></tr>))}
        {campaigns.length === 0 && <tr><td colSpan="9" style={{textAlign:'center', color:'var(--text-secondary)'}}>No data yet</td></tr>}
      </tbody></table></div></div>
    </div>
  );
}
export default PPCMonitor;
