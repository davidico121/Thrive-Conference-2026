'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, cardStyle, labelStyle, inputStyle, primaryButton } from './theme';

const RESULT_TEXT = {
  marked_present: ['✓ marked present', C.teal],
  already_present: ['was already marked present', C.soft],
  changed_to_present: ['✓ changed from absent to present', C.teal],
  marked_absent: ['✗ marked absent', C.red],
  already_absent: ['was already marked absent', C.soft],
  changed_to_absent: ['✗ changed from present to absent', C.red],
  not_in_class: ['isn’t a student in your class — check the Thrive Number', C.red],
};

const absentButton = {
  background: 'transparent', color: C.red, border: '1px solid #cc3333', borderRadius: 4,
  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.04em',
  textTransform: 'uppercase', padding: '12px 24px', cursor: 'pointer',
};

// `attendance` maps studentId -> { classNumber: 'present' | 'absent' }. A class with no
// entry for a student means attendance hasn't been taken for them yet.
export default function TutorAttendance({ students, attendance, totalSessions }) {
  const router = useRouter();
  const sessions = useMemo(() => Array.from({ length: totalSessions }, (_, i) => i + 1), [totalSessions]);

  // Start on the class after the latest one that has any attendance recorded.
  const latest = Math.max(0, ...Object.values(attendance).flatMap(byClass => Object.keys(byClass).map(Number)));
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

  const stateOf = (studentId, n) => (attendance[studentId] || {})[n];
  const presentTotal = (studentId) => Object.values(attendance[studentId] || {}).filter(s => s === 'present').length;

  const thisClass = students.map(s => stateOf(s.id, session));
  const presentNow = thisClass.filter(s => s === 'present').length;
  const absentNow = thisClass.filter(s => s === 'absent').length;
  const notMarked = students.length - presentNow - absentNow;
  const disabled = busy || !codes.trim();

  return (
    <>
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <span style={labelStyle}>Take attendance</span>
        <form onSubmit={(e) => { e.preventDefault(); submit('present'); }} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ minWidth: 130 }}>
            <label style={labelStyle}>Class</label>
            <select value={session} onChange={(e) => setSession(Number(e.target.value))} style={inputStyle}>
              {sessions.map(n => <option key={n} value={n}>Class {n}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 280px' }}>
            <label style={labelStyle}>Thrive Number(s) — separate several with commas</label>
            <input
              type="text" value={codes} onChange={(e) => setCodes(e.target.value)} autoFocus
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              placeholder="DO12   or   DO12, VA13, SO14" style={inputStyle}
            />
          </div>
          <button type="submit" disabled={disabled} style={{ ...primaryButton, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>Mark present</button>
          <button type="button" disabled={disabled} onClick={() => submit('absent')} style={{ ...absentButton, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}>Mark absent</button>
        </form>

        <p style={{ fontSize: 13, color: C.muted, marginTop: 14 }}>
          Class {session}: <span style={{ color: C.teal }}>{presentNow} present</span> · <span style={{ color: C.red }}>{absentNow} absent</span> · {notMarked} not marked yet.
          Marked someone by mistake? Just mark them again with the other button.
        </p>
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

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <span style={labelStyle}>Your students ({students.length})</span>
        {students.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 14 }}>No students have been assigned to your class yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: C.muted }}>
                  <th style={{ padding: '8px 10px' }}>Thrive No.</th>
                  <th style={{ padding: '8px 10px' }}>Name</th>
                  <th style={{ padding: '8px 10px' }}>Email</th>
                  {sessions.map(n => <th key={n} style={{ padding: '8px 4px', textAlign: 'center' }}>{n}</th>)}
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Present</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: C.yellow, letterSpacing: '0.04em' }}>{s.student_code}</td>
                    <td style={{ padding: '8px 10px' }}>{s.full_name}</td>
                    <td style={{ padding: '8px 10px', color: C.soft }}>{s.email}</td>
                    {sessions.map(n => {
                      const state = stateOf(s.id, n);
                      return (
                        <td key={n} style={{ padding: '8px 4px', textAlign: 'center', color: state === 'present' ? C.teal : state === 'absent' ? C.red : '#443a75' }}>
                          {state === 'present' ? '✓' : state === 'absent' ? '✗' : '·'}
                        </td>
                      );
                    })}
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{presentTotal(s.id)}/{totalSessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
