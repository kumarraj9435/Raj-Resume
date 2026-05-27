import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAutomationRules, createAutomationRule, toggleRule, deleteRule, getNotifications, markAllRead } from '../utils/api';
import { FiPlus, FiTrash2, FiZap, FiBell, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

function Automation() {
  const [rules, setRules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rule_name: '', trigger_type: 'time', action_type: 'notification', condition_json: {}, action_json: {} });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const [r, n] = await Promise.all([getAutomationRules(), getNotifications()]); setRules(r.data); setNotifications(n.data); } catch (e) {} };
  const handleAdd = async (e) => { e.preventDefault(); await createAutomationRule(form); toast.success('Rule created!'); setShowForm(false); loadData(); };
  const handleToggle = async (id) => { await toggleRule(id); loadData(); };
  const handleMarkAll = async () => { await markAllRead(); toast.info('All read'); loadData(); };
  const typeIcon = (t) => ({ info: '💡', warning: '⚠️', alert: '🚨', success: '✅' }[t] || '📢');

  return (
    <div className="container">
      <h1 className="page-title">Automation & Alerts</h1>
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3><FiZap color="var(--accent-yellow)" /> Rules ({rules.length})</h3>
            <button className="btn btn-sm btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /></button>
          </div>
          {showForm && (
            <form onSubmit={handleAdd} style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
              <div className="form-group"><label>Rule Name</label><input value={form.rule_name} onChange={e => setForm({...form, rule_name: e.target.value})} required placeholder="e.g., Low stock alert" /></div>
              <div className="form-group"><label>Trigger</label><select value={form.trigger_type} onChange={e => setForm({...form, trigger_type: e.target.value})}><option value="time">Time-based</option><option value="stock_low">Stock Low</option><option value="review_negative">Negative Review</option><option value="acos_high">High ACOS</option><option value="task_overdue">Task Overdue</option></select></div>
              <div className="form-group"><label>Action</label><select value={form.action_type} onChange={e => setForm({...form, action_type: e.target.value})}><option value="notification">Notification</option><option value="pause_campaign">Pause Campaign</option><option value="flag_review">Flag Review</option><option value="reorder_alert">Reorder Alert</option></select></div>
              <button type="submit" className="btn btn-success btn-sm">Create</button>
            </form>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rules.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                <div><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{r.rule_name}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{r.trigger_type} → {r.action_type}</div></div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleToggle(r.id)} style={{ background: 'none', color: r.is_active ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{r.is_active ? <FiToggleRight size={20}/> : <FiToggleLeft size={20}/>}</button>
                  <button className="btn btn-sm btn-danger" onClick={async () => { await deleteRule(r.id); loadData(); }}><FiTrash2 size={12}/></button>
                </div>
              </div>
            ))}
            {rules.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No rules yet</p>}
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3><FiBell color="var(--accent-blue)" /> Notifications</h3>
            {notifications.length > 0 && <button className="btn btn-sm" style={{ background: 'var(--bg-primary)' }} onClick={handleMarkAll}>Mark all read</button>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.map(n => (
              <div key={n.id} style={{ padding: '10px', background: n.is_read ? 'var(--bg-primary)' : 'rgba(79,195,247,0.05)', borderRadius: '8px', borderLeft: `3px solid ${n.is_read ? 'var(--border-color)' : 'var(--accent-blue)'}` }}>
                <div style={{ display: 'flex', gap: '8px' }}><span>{typeIcon(n.type)}</span><div><div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{n.title}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.message}</div></div></div>
              </div>
            ))}
            {notifications.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No notifications</p>}
          </div>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>Built-in Automations (Always Active)</h3>
        <div className="grid-3">
          <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px' }}><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Daily Task Reset</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tasks reset at 9:55 AM</div></div>
          <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px' }}><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Work Reminders</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Every 30 min (10AM-6PM)</div></div>
          <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px' }}><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Review Alerts</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Auto-alert on 1-2 star reviews</div></div>
        </div>
      </div>
    </div>
  );
}
export default Automation;
