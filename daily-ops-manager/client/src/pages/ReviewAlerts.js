import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getReviews, getReviewSummary, addReview, flagReview, deleteReview } from '../utils/api';
import { FiPlus, FiTrash2, FiFlag } from 'react-icons/fi';

function ReviewAlerts() {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ total: 0, negative: 0, flagged: 0, averageRating: 'N/A' });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ asin: '', product_name: '', rating: 5, review_text: '', reviewer_name: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { try { const [r, s] = await Promise.all([getReviews({}), getReviewSummary()]); setReviews(r.data); setSummary(s.data); } catch (e) {} };
  const handleAdd = async (e) => { e.preventDefault(); await addReview(form); toast.success('Review added!'); setShowForm(false); loadData(); };
  const handleFlag = async (id) => { await flagReview(id, { is_flagged: 1, action_taken: 'Flagged' }); toast.info('Flagged!'); loadData(); };
  const filtered = reviews.filter(r => filter === 'negative' ? r.is_negative : filter === 'flagged' ? r.is_flagged : true);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Reviews & Ratings</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /> Add</button>
      </div>
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Total</div><div className="stat-value" style={{ fontSize: '1.4rem' }}>{summary.total}</div></div>
        <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Avg Rating</div><div className="stat-value" style={{ color: 'var(--accent-yellow)', fontSize: '1.4rem' }}>{summary.averageRating}</div></div>
        <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Negative</div><div className="stat-value" style={{ color: 'var(--accent-red)', fontSize: '1.4rem' }}>{summary.negative}</div></div>
        <div className="card" style={{ textAlign: 'center' }}><div className="stat-label">Flagged</div><div className="stat-value" style={{ color: 'var(--accent-orange)', fontSize: '1.4rem' }}>{summary.flagged}</div></div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['all', 'negative', 'flagged'].map(f => (<button key={f} onClick={() => setFilter(f)} className="btn btn-sm" style={{ background: filter === f ? 'var(--accent-blue)' : 'var(--bg-card)', color: filter === f ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>))}
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div className="form-group"><label>ASIN</label><input value={form.asin} onChange={e => setForm({...form, asin: e.target.value})} required /></div>
            <div className="form-group"><label>Product</label><input value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} /></div>
            <div className="form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: +e.target.value})} /></div>
            <div className="form-group"><label>Reviewer</label><input value={form.reviewer_name} onChange={e => setForm({...form, reviewer_name: e.target.value})} /></div>
            <div className="form-group"><label>Review</label><input value={form.review_text} onChange={e => setForm({...form, review_text: e.target.value})} /></div>
            <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn btn-success">Save</button></div>
          </form>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(r => (
          <div key={r.id} className="card" style={{ padding: '14px', borderLeft: `4px solid ${r.is_negative ? 'var(--accent-red)' : 'var(--accent-green)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ marginBottom: '4px' }}>{'⭐'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <h4 style={{ fontSize: '0.9rem' }}>{r.product_name || r.asin}</h4>
                {r.review_text && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>"{r.review_text}"</p>}
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>By {r.reviewer_name || 'Anon'} • {r.date}</p>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {!r.is_flagged && r.is_negative && <button className="btn btn-sm btn-warning" onClick={() => handleFlag(r.id)}><FiFlag size={12}/></button>}
                {r.is_flagged && <span className="badge badge-high">Flagged</span>}
                <button className="btn btn-sm btn-danger" onClick={async () => { await deleteReview(r.id); loadData(); }}><FiTrash2 size={12}/></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No reviews</div>}
      </div>
    </div>
  );
}
export default ReviewAlerts;
