'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, cardStyle, labelStyle, inputStyle, primaryButton } from './theme';
import { formatWat } from './dates';
import Chevron from './Chevron';
import { safeHref } from '../../lib/safeUrl';

function AssignmentCard({ a }) {
  const router = useRouter();
  const [answer, setAnswer] = useState(a.mine?.answer || '');
  const [link, setLink] = useState(a.mine?.link || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const marked = a.mine && a.mine.score !== null && a.mine.score !== undefined;
  const overdue = a.dueAt && new Date(a.dueAt) < new Date();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setNote('');
    try {
      const res = await fetch('/api/portal/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignmentId: a.id, answer, link }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setNote(data.late ? 'Submitted — marked as late.' : 'Submitted ✓');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const status = marked
    ? <span style={{ color: C.teal, fontSize: 13, fontWeight: 600 }}>{a.mine.score}/{a.maxScore}</span>
    : a.mine
      ? <span style={{ color: C.teal, fontSize: 13 }}>✓ Submitted{a.mine.late ? ' (late)' : ''}</span>
      : <span style={{ color: overdue ? C.red : C.yellow, fontSize: 13 }}>{overdue ? 'Overdue' : 'Not submitted'}</span>;

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6 }}>
      <button
        type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: 16, background: 'none', border: 'none', cursor: 'pointer', color: C.text, fontFamily: 'inherit', textAlign: 'left' }}
      >
        <span>
          <span style={{ display: 'block', fontSize: 17, fontWeight: 600 }}>{a.title}</span>
          <span style={{ display: 'block', fontSize: 12, color: C.muted, marginTop: 2 }}>{a.dueAt ? `Due ${formatWat(a.dueAt)}` : 'No due date'}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>{status}<Chevron open={open} /></span>
      </button>
      {open && (
      <div style={{ padding: '0 16px 16px' }}>
      {marked && (
        <div style={{ background: C.bgDeep, borderRadius: 4, padding: 12, marginBottom: 12 }}>
          <p style={{ fontSize: 14 }}><strong style={{ color: C.teal }}>Your mark: {a.mine.score} out of {a.maxScore}</strong></p>
          {a.mine.feedback && <p style={{ fontSize: 14, color: C.soft, whiteSpace: 'pre-wrap', marginTop: 6 }}>{a.mine.feedback}</p>}
        </div>
      )}
      {a.instructions && <p style={{ fontSize: 14, color: C.soft, whiteSpace: 'pre-wrap', margin: '0 0 12px' }}>{a.instructions}</p>}
      {a.resourceLink && <p style={{ marginBottom: 12 }}><a href={safeHref(a.resourceLink)} target="_blank" rel="noopener noreferrer" style={{ color: C.yellow, fontSize: 14 }}>Open helpful link ↗</a></p>}

      <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 8 }}>
        <div>
          <label style={labelStyle}>Your answer</label>
          <textarea rows={4} maxLength={10000} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here (optional if you add a link)" style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div>
          <label style={labelStyle}>Link to your work (Google Drive, YouTube, Figma…)</label>
          <input type="url" maxLength={500} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" style={inputStyle} />
          <p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>For files, upload to Google Drive and set sharing to “Anyone with the link” so your tutor can open it.</p>
        </div>
        {marked && <p style={{ fontSize: 12, color: C.muted }}>Updating your submission clears your mark so your tutor can mark the new version.</p>}
        {error && <p style={{ color: C.red, fontSize: 14 }}>{error}</p>}
        {note && <p style={{ color: C.teal, fontSize: 14 }}>{note}</p>}
        <div>
          <button type="submit" disabled={busy || (!answer.trim() && !link.trim())} style={{ ...primaryButton, opacity: busy || (!answer.trim() && !link.trim()) ? 0.5 : 1 }}>
            {a.mine ? 'Update submission' : 'Submit'}
          </button>
        </div>
      </form>
      </div>
      )}
    </div>
  );
}

export default function StudentAssignments({ assignments }) {
  return (
    <div style={{ ...cardStyle, marginBottom: 24 }}>
      <span style={labelStyle}>Assignments</span>
      {assignments.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>No assignments yet. Your tutor will post them here.</p>}
      <div style={{ display: 'grid', gap: 14 }}>
        {assignments.map(a => <AssignmentCard key={a.id} a={a} />)}
      </div>
    </div>
  );
}
