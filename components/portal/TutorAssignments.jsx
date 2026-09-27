'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, cardStyle, labelStyle, inputStyle, primaryButton, ghostButton } from './theme';
import { formatWat, toWatInput } from './dates';
import { safeHref } from '../../lib/safeUrl';

const empty = { title: '', instructions: '', resourceLink: '', dueAt: '' };

// assignments: [{ id, title, instructions, resourceLink, dueAt, submissions: [{ studentId, answer, link, late, submittedAt }] }]
// students: [{ id, student_code, full_name }]
export default function TutorAssignments({ assignments, students }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const call = async (payload) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/tutor/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const ok = await call(editingId ? { action: 'update', id: editingId, ...form } : { action: 'create', ...form });
    if (ok) { setForm(empty); setEditingId(null); setFormOpen(false); router.refresh(); }
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setFormOpen(true);
    setForm({ title: a.title, instructions: a.instructions, resourceLink: a.resourceLink || '', dueAt: toWatInput(a.dueAt) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (a) => {
    if (!window.confirm(`Delete “${a.title}”? Every student’s submission for it will be deleted too.`)) return;
    if (await call({ action: 'delete', id: a.id })) router.refresh();
  };

  const field = (key) => ({ value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  return (
    <>
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <button
          type="button" onClick={() => setFormOpen(!formOpen)} aria-expanded={formOpen}
          style={{ ...labelStyle, display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', margin: 0, padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <span>{editingId ? 'Edit assignment' : 'Set a new assignment'}</span>
          <span style={{ fontSize: 16, color: C.yellow }}>{formOpen ? '−' : '+'}</span>
        </button>
        {formOpen && <form onSubmit={save} style={{ display: 'grid', gap: 14, marginTop: 16 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input type="text" maxLength={150} required {...field('title')} placeholder="e.g. Edit a 30-second product ad" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Instructions</label>
            <textarea rows={5} maxLength={5000} {...field('instructions')} placeholder="What should students do?" style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={labelStyle}>Helpful link (optional)</label>
              <input type="url" maxLength={500} {...field('resourceLink')} placeholder="https://…" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Due (West African Time, optional)</label>
              <input type="datetime-local" {...field('dueAt')} style={inputStyle} />
            </div>
          </div>
          {error && <p style={{ color: C.red, fontSize: 14 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={busy} style={{ ...primaryButton, opacity: busy ? 0.5 : 1 }}>{editingId ? 'Save changes' : 'Post assignment'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty); setError(''); setFormOpen(false); }} style={ghostButton}>Cancel</button>}
          </div>
        </form>}
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <span style={labelStyle}>Assignments ({assignments.length})</span>
        {assignments.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>No assignments yet.</p>}
        <div style={{ display: 'grid', gap: 12 }}>
          {assignments.map(a => {
            const byStudent = Object.fromEntries(a.submissions.map(s => [s.studentId, s]));
            const missing = students.filter(s => !byStudent[s.id]);
            const isOpen = openId === a.id;
            return (
              <div key={a.id} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>{a.title}</p>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{a.dueAt ? `Due ${formatWat(a.dueAt)}` : 'No due date'} · <span style={{ color: C.teal }}>{a.submissions.length} of {students.length} submitted</span></p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <button type="button" onClick={() => setOpenId(isOpen ? null : a.id)} style={ghostButton}>{isOpen ? 'Hide' : 'View submissions'}</button>
                    <button type="button" onClick={() => startEdit(a)} style={ghostButton}>Edit</button>
                    <button type="button" onClick={() => remove(a)} disabled={busy} style={{ ...ghostButton, color: C.red }}>Delete</button>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                    {a.instructions && <p style={{ fontSize: 13, color: C.soft, whiteSpace: 'pre-wrap' }}>{a.instructions}</p>}
                    {a.submissions.map(s => {
                      const st = students.find(x => x.id === s.studentId);
                      return (
                        <div key={s.studentId} style={{ background: C.bgDeep, borderRadius: 4, padding: 12 }}>
                          <p style={{ fontSize: 14 }}>
                            <strong style={{ color: C.yellow, letterSpacing: '0.04em' }}>{st?.student_code}</strong> · {st?.full_name}
                            <span style={{ color: C.muted, fontSize: 12 }}> · {formatWat(s.submittedAt)}</span>
                            {s.late && <span style={{ color: C.red, fontSize: 12 }}> · late</span>}
                          </p>
                          {s.answer && <p style={{ fontSize: 14, color: C.soft, whiteSpace: 'pre-wrap', marginTop: 6 }}>{s.answer}</p>}
                          {s.link && <p style={{ marginTop: 6 }}><a href={safeHref(s.link)} target="_blank" rel="noopener noreferrer" style={{ color: C.yellow, fontSize: 13, wordBreak: 'break-all' }}>{s.link}</a></p>}
                        </div>
                      );
                    })}
                    {missing.length > 0 && (
                      <p style={{ fontSize: 13, color: C.muted }}>
                        Not yet submitted: {missing.map(s => `${s.full_name} (${s.student_code})`).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
