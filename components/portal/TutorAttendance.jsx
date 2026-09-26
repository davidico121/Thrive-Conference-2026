'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, cardStyle, labelStyle, inputStyle, primaryButton, ghostButton } from './theme';

const RESULT_TEXT = {
  marked: ['✓ marked present', C.teal],
  already_marked: ['was already marked', C.soft],
  not_in_class: ['isn’t a student in your class — check the code', C.red],
  unmarked: ['attendance removed', C.soft],
  was_not_marked: ['wasn’t marked for this class', C.soft],
};

export default function TutorAttendance({ students, attendance, totalSessions }) {
  const router = useRouter();
  const sessions = useMemo(() => Array.from({ length: totalSessions }, (_, i) => i + 1), [totalSessions]);

  // Start on the class after the latest one that has any attendance.
  const latest = Math.max(0, ...Object.values(attendance).flat());
  const [session, setSession] = useState(Math.min(totalSessions, latest + 1));
  const [codes, setCodes] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (action) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/tutor/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, codes, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setResults(data.results);
      setCodes('');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const presentCount = (studentId) => (attendance[studentId] || []).length;
  const markedThisSession = students.filter(s => (attendance[s.id] || []).includes(session)).length;

  return (
    <>
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <span style={labelStyle}>Take attendance</span>
        <form onSubmit={(e) => { e.preventDefault(); submit('mark'); }} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ minWidth: 130 }}>
            <label style={labelStyle}>Class</label>
            <select value={session} onChange={(e) => setSession(Number(e.target.value))} style={inputStyle}>
              {sessions.map(n => <option key={n} value={n}>Class {n}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 280px' }}>
            <label style={labelStyle}>Student code(s) — separate several with commas</label>
            <input
              type="text" value={codes} onChange={(e) => setCodes(e.target.value)} autoFocus
              placeholder="AI07   or   AI07, AI08, AI11" style={inputStyle}
            />
          </div>
          <button type="submit" disabled={busy || !codes.trim()} style={{ ...primaryButton, opacity: busy || !codes.trim() ? 0.5 : 1 }}>Mark present</button>
          <button type="button" disabled={busy || !codes.trim()} onClick={() => submit('unmark')} style={{ ...ghostButton, opacity: busy || !codes.trim() ? 0.5 : 1 }}>Undo</button>
        </form>

        <p style={{ fontSize: 13, color: C.muted, marginTop: 14 }}>Class {session}: {markedThisSession} of {students.length} present so far.</p>
        {error && <p style={{ color: C.red, fontSize: 14, marginTop: 10 }}>{error}</p>}
        {results.length > 0 && (
          <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'grid', gap: 6 }}>
            {results.map(r => {
              const [text, color] = RESULT_TEXT[r.status] || [r.status, C.soft];
              return (
                <li key={r.code} style={{ fontSize: 14, color }}>
                  <strong style={{ letterSpacing: '0.04em' }}>{r.code}</strong>{r.name ? ` · ${r.name}` : ''} — {text}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div style={cardStyle}>
        <span style={labelStyle}>Your students ({students.length})</span>
        {students.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 14 }}>No students have been assigned to your class yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: C.muted }}>
                  <th style={{ padding: '8px 10px' }}>Code</th>
                  <th style={{ padding: '8px 10px' }}>Name</th>
                  <th style={{ padding: '8px 10px' }}>Email</th>
                  {sessions.map(n => <th key={n} style={{ padding: '8px 4px', textAlign: 'center' }}>{n}</th>)}
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const here = attendance[s.id] || [];
                  return (
                    <tr key={s.id} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: C.yellow, letterSpacing: '0.04em' }}>{s.student_code}</td>
                      <td style={{ padding: '8px 10px' }}>{s.full_name}</td>
                      <td style={{ padding: '8px 10px', color: C.soft }}>{s.email}</td>
                      {sessions.map(n => (
                        <td key={n} style={{ padding: '8px 4px', textAlign: 'center', color: here.includes(n) ? C.teal : '#443a75' }}>{here.includes(n) ? '✓' : '·'}</td>
                      ))}
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{presentCount(s.id)}/{totalSessions}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
