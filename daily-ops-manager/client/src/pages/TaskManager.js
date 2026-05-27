import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getTasks, getTaskSummary, createTask, updateTaskStatus, deleteTask } from '../utils/api';
import { FiPlay, FiCheck, FiTrash2, FiPlus, FiClock, FiSkipForward } from 'react-icons/fi';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, done: 0, pending: 0, progress: 0 });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newTask, setNewTask] = useState({ time_slot: '', task_name: '', description: '', priority: 'Medium', category: 'Amazon', duration_min: 20 });

  const loadTasks = useCallback(async () => {
    try { const [t, s] = await Promise.all([getTasks(), getTaskSummary()]); setTasks(t.data); setSummary(s.data); } catch (e) {}
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleStatus = async (id, status) => { await updateTaskStatus(id, status); toast.success(`Task ${status}!`); loadTasks(); };
  const handleAdd = async (e) => { e.preventDefault(); await createTask(newTask); toast.success('Task added!'); setShowForm(false); setNewTask({ time_slot: '', task_name: '', description: '', priority: 'Medium', category: 'Amazon', duration_min: 20 }); loadTasks(); };
  const handleDelete = async (id) => { if (window.confirm('Delete?')) { await deleteTask(id); loadTasks(); } };

  const filtered = tasks.filter(t => { if (filter === 'all') return true; if (filter === 'pending') return t.status === 'Pending'; if (filter === 'done') return t.status === 'Done'; if (filter === 'high') return t.priority === 'High'; return t.category === filter; });
  const getCatColor = (c) => ({ Amazon: '#ff9900', Blinkit: '#66bb6a', Operations: '#4fc3f7', Finance: '#ab47bc', Buffer: '#78909c' }[c] || '#78909c');

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="page-title">Task Manager</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><FiPlus /> Add Task</button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Done: {summary.done}/{summary.total}</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: summary.progress >= 75 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{summary.progress}%</span>
        </div>
        <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${summary.progress}%`, background: summary.progress >= 75 ? 'linear-gradient(90deg, #66bb6a, #43a047)' : 'linear-gradient(90deg, #ffa726, #f57c00)' }}></div></div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'done', 'high', 'Amazon', 'Blinkit', 'Operations'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="btn btn-sm" style={{ background: filter === f ? 'var(--accent-blue)' : 'var(--bg-card)', color: filter === f ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div className="form-group"><label>Time Slot</label><input placeholder="10:00-10:20" value={newTask.time_slot} onChange={e => setNewTask({...newTask, time_slot: e.target.value})} required /></div>
            <div className="form-group"><label>Task Name</label><input placeholder="Task name" value={newTask.task_name} onChange={e => setNewTask({...newTask, task_name: e.target.value})} required /></div>
            <div className="form-group"><label>Description</label><input placeholder="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} /></div>
            <div className="form-group"><label>Priority</label><select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select></div>
            <div className="form-group"><label>Category</label><select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})}><option>Amazon</option><option>Blinkit</option><option>Operations</option><option>Finance</option><option>Buffer</option></select></div>
            <div className="form-group"><label>Duration (min)</label><input type="number" value={newTask.duration_min} onChange={e => setNewTask({...newTask, duration_min: +e.target.value})} /></div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="submit" className="btn btn-success">Save</button></div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(task => (
          <div key={task.id} className="card" style={{ padding: '14px 18px', borderLeft: `4px solid ${getCatColor(task.category)}`, opacity: task.status === 'Done' ? 0.7 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}><FiClock size={12} /> {task.time_slot}</span>
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                  <span className={`badge badge-${task.status === 'Done' ? 'done' : task.status === 'In Progress' ? 'progress' : 'pending'}`}>{task.status}</span>
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, textDecoration: task.status === 'Done' ? 'line-through' : 'none' }}>{task.task_name}</h4>
                {task.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {task.status === 'Pending' && <button className="btn btn-sm btn-primary" onClick={() => handleStatus(task.id, 'In Progress')}><FiPlay size={12}/></button>}
                {(task.status === 'Pending' || task.status === 'In Progress') && <button className="btn btn-sm btn-success" onClick={() => handleStatus(task.id, 'Done')}><FiCheck size={12}/></button>}
                {task.status === 'Pending' && <button className="btn btn-sm btn-warning" onClick={() => handleStatus(task.id, 'Skipped')}><FiSkipForward size={12}/></button>}
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(task.id)}><FiTrash2 size={12}/></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No tasks found.</div>}
      </div>
    </div>
  );
}

export default TaskManager;
