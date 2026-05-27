import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getInventory, getInventoryAlerts, addInventory, deleteInventory } from '../utils/api';
import { FiPlus, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

function InventoryTracker() {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: [], aged: [], stranded: [], totalAlerts: 0 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: '', product_name: '', platform: 'Amazon', current_stock: 0, fba_stock: 0, warehouse_stock: 0, reorder_level: 10 });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const [i, a] = await Promise.all([getInventory({}), getInventoryAlerts()]); setInventory(i.data); setAlerts(a.data); } catch (e) {} };
  const handleAdd = async (e) => { e.preventDefault(); await addInventory(form); toast.success('Item added!'); setShowForm(false); loadData(); };
  const getStatusColor = (s) => ({ Healthy: 'var(--accent-green)', Low: 'var(--accent-orange)', Critical: 'var(--accent-red)', Aged: '#ab47bc', Stranded: '#78909c' }[s]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Inventory Tracker</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /> Add Item</button>
      </div>
      {alerts.totalAlerts > 0 && (
        <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--accent-red)' }}>
          <h3 style={{ marginBottom: '8px' }}><FiAlertTriangle color="var(--accent-red)" /> Alerts ({alerts.totalAlerts})</h3>
          <div className="grid-3">
            {alerts.lowStock.length > 0 && <div style={{ padding: '8px', background: 'rgba(255,167,38,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>Low Stock: {alerts.lowStock.length}</div>}
            {alerts.stranded.length > 0 && <div style={{ padding: '8px', background: 'rgba(239,83,80,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>Stranded: {alerts.stranded.length}</div>}
            {alerts.aged.length > 0 && <div style={{ padding: '8px', background: 'rgba(171,71,188,0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>Aged: {alerts.aged.length}</div>}
          </div>
        </div>
      )}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div className="form-group"><label>SKU</label><input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required /></div>
            <div className="form-group"><label>Product</label><input value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} required /></div>
            <div className="form-group"><label>Platform</label><select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}><option>Amazon</option><option>Blinkit</option></select></div>
            <div className="form-group"><label>Stock</label><input type="number" value={form.current_stock} onChange={e => setForm({...form, current_stock: +e.target.value})} /></div>
            <div className="form-group"><label>FBA</label><input type="number" value={form.fba_stock} onChange={e => setForm({...form, fba_stock: +e.target.value})} /></div>
            <div className="form-group"><label>Warehouse</label><input type="number" value={form.warehouse_stock} onChange={e => setForm({...form, warehouse_stock: +e.target.value})} /></div>
            <div className="form-group"><label>Reorder Level</label><input type="number" value={form.reorder_level} onChange={e => setForm({...form, reorder_level: +e.target.value})} /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn btn-success">Save</button></div>
          </form>
        </div>
      )}
      <div className="card"><div className="table-container"><table><thead><tr><th>SKU</th><th>Product</th><th>Platform</th><th>Stock</th><th>FBA</th><th>Warehouse</th><th>Status</th><th></th></tr></thead><tbody>
        {inventory.map(i => (<tr key={i.id}><td style={{ fontFamily: 'monospace' }}>{i.sku}</td><td>{i.product_name}</td><td>{i.platform}</td><td style={{ fontWeight: 600 }}>{i.current_stock}</td><td>{i.fba_stock}</td><td>{i.warehouse_stock}</td><td style={{ color: getStatusColor(i.status), fontWeight: 600 }}>{i.status}</td><td><button className="btn btn-sm btn-danger" onClick={async () => { await deleteInventory(i.id); loadData(); }}><FiTrash2 size={12}/></button></td></tr>))}
        {inventory.length === 0 && <tr><td colSpan="8" style={{textAlign:'center', color:'var(--text-secondary)'}}>No items yet</td></tr>}
      </tbody></table></div></div>
    </div>
  );
}
export default InventoryTracker;
