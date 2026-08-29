'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Clock, X, AlertTriangle, Target, CheckCircle2, Bell } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Toast, { ToastType } from '@/components/Toast';
import ClockTimePicker from '@/components/ClockTimePicker';

export default function PrioritiesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  // New Priority Form State
  const [name, setName] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('Important');
  const [dueDate, setDueDate] = useState('');
  const [notificationTime, setNotificationTime] = useState('17:18');

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };

  useEffect(() => {
    fetchPriorities();
  }, []);

  const fetchPriorities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        const expenseList = Array.isArray(data) ? data : (data.expenses || []);
        setItems(expenseList.filter((e: any) => e.priority === 'High' || e.priority === 'Important' || e.priority === 'High Priority'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name) {
      showToast('Please enter a task name.', 'warning');
      return;
    }

    try {
      // Safe Date & Time formatting logic
      let formattedDate: string;
      const timePart = notificationTime && notificationTime.includes(':') ? notificationTime : '09:00';

      if (dueDate) {
        const d = new Date(`${dueDate}T${timePart}:00`);
        formattedDate = !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
      } else {
        const todayYMD = new Date().toISOString().split('T')[0];
        const d = new Date(`${todayYMD}T${timePart}:00`);
        formattedDate = !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
      }

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          amount: 0,
          priority: priorityLevel,
          date: formattedDate,
          paymentMethod: 'Pending'
        })
      });

      if (res.ok) {
        showToast(`Added priority task "${name}"!`, 'success');
        setShowModal(false);
        setName('');
        setDueDate('');
        setNotificationTime('17:18');
        fetchPriorities();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Failed to save priority task.', 'error');
      }
    } catch (err: any) {
      console.error('Error saving priority:', err);
      showToast(err?.message || 'Error connecting to server.', 'error');
    }
  };

  const handleComplete = async (id: string, itemName: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'Completed', date: new Date().toISOString() })
      });
      if (res.ok) {
        showToast(`Completed priority item "${itemName}"!`, 'success');
        fetchPriorities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      showToast('Dismissed priority item.', 'info');
      fetchPriorities();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = items.filter(i => {
    if (filter === 'All') return true;
    if (filter === 'High Priority') return i.priority === 'High' || i.priority === 'High Priority';
    if (filter === 'Important') return i.priority === 'Important';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px', maxWidth: '1150px', margin: '0 auto' }}>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />

      {/* Header Banner */}
      <div className="hero-banner flex-between-center" style={{ flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="badge badge-primary" style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
            <Target size={13} /> Urgent Household Tracker
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px', margin: 0 }}>
            Household Priorities
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Track urgent household tasks, set reminder times with radial clock, and receive priority notifications.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary hover-lift flex-row-gap"
          style={{ borderRadius: '14px', fontSize: '13px', fontWeight: '700', padding: '12px 20px' }}
        >
          <Plus size={18} />
          <span>Add Priority Task</span>
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="glass-card flex-between-center" style={{ padding: '14px 20px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="flex-row-gap" style={{ gap: '8px' }}>
          {['All', 'High Priority', 'Important'].map(t => (
            <button 
              key={t}
              onClick={() => setFilter(t)}
              className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '12px', fontSize: '12px', fontWeight: '700', padding: '6px 14px' }}
            >
              {t}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
          {filtered.length} priority item{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Priority Items Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '18px' }}></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>No Pending Priority Tasks</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                All high-priority household tasks and reminders have been completed!
              </p>
            </div>
          </div>
        ) : (
          filtered.map(item => {
            const isOverdue = item.date && new Date(item.date) < new Date();
            const isHigh = item.priority === 'High' || item.priority === 'High Priority';
            const itemTime = item.date ? new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '17:18';

            return (
              <div 
                key={item.id} 
                className="glass-card hover-lift"
                style={{ padding: '20px', borderRadius: '18px', borderLeft: isHigh ? '4px solid #EF4444' : '4px solid #F59E0B', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 200ms ease' }}
              >
                <div className="flex-between-center" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div className="flex-row-gap" style={{ gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>{item.name}</h3>
                      <span className={`badge ${isHigh ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                        {item.priority}
                      </span>
                    </div>
                  </div>

                  {/* Notification Reminder Tag */}
                  <div className="badge badge-primary flex-row-gap" style={{ fontSize: '11px', padding: '6px 12px', fontWeight: '700' }}>
                    <Bell size={12} /> Reminder: {itemTime}
                  </div>
                </div>

                <div className="flex-between-center" style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex-row-gap" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', gap: '6px' }}>
                    <Clock size={14} color="var(--color-primary)" />
                    <span>Due: {formatDate(item.date)}</span>
                    {isOverdue && (
                      <span className="badge badge-danger" style={{ fontSize: '10px', marginLeft: '4px' }}>Overdue</span>
                    )}
                  </div>

                  <div className="flex-row-gap" style={{ gap: '8px' }}>
                    <button 
                      onClick={() => handleDismiss(item.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}
                    >
                      <X size={14} /> Dismiss
                    </button>
                    <button 
                      onClick={() => handleComplete(item.id, item.name)}
                      className="btn btn-primary btn-sm"
                      style={{ borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}
                    >
                      <Check size={14} /> Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Priority Task Modal with Radial Clock Time Picker */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '480px', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text)', margin: 0 }}>Add Household Priority</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 20px 0' }}>Set task name, due date, and radial clock notification time.</p>

            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Task Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="form-input" 
                  placeholder="e.g., Pay Electricity Bill, Water Filter Service"
                  required 
                />
              </div>

              <div className="grid-2-cols">
                <div>
                  <label className="form-label">Priority Level</label>
                  <select 
                    value={priorityLevel} 
                    onChange={e => setPriorityLevel(e.target.value)} 
                    className="form-select"
                  >
                    <option value="Important">🟠 Important</option>
                    <option value="High Priority">🔴 High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                    className="form-input" 
                  />
                </div>
              </div>

              {/* Radial Clock Time Picker */}
              <div>
                <label className="form-label">Set Time for Notification 🔔</label>
                <ClockTimePicker 
                  value={notificationTime} 
                  onChange={setNotificationTime} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn btn-secondary"
                  style={{ flex: 1, borderRadius: '12px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1, borderRadius: '12px' }}
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
