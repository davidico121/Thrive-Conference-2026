import { redirect } from 'next/navigation';
import { getPortalUser } from '../../lib/portalSession.js';
import { sql } from '../../lib/db.js';
import { TOTAL_SESSIONS } from '../../lib/portalConfig.js';
import StudentAssignments from '../../components/portal/StudentAssignments';
import PortalShell from '../../components/portal/PortalShell';
import { C, cardStyle, headingStyle, labelStyle } from '../../components/portal/theme';

export const dynamic = 'force-dynamic';

const TAG_LABELS = { class_rep: 'Class rep', assistant: 'Assistant' };

export default async function StudentHome() {
  const user = await getPortalUser();
  if (!user) redirect('/portal/login');
  if (user.role === 'tutor') redirect('/portal/tutor');
  if (user.must_change_password) redirect('/portal/change-password');

  const q = sql();
  const [tutors, classmates, attended, assignmentRows, mineRows] = await Promise.all([
    q`SELECT full_name, contact_info FROM tutors WHERE class_id = ${user.class_id} ORDER BY full_name`,
    q`SELECT full_name, role_tag FROM students WHERE class_id = ${user.class_id} ORDER BY full_name`,
    q`SELECT session_number, status FROM attendance WHERE student_id = ${user.id}`,
    q`SELECT id, title, instructions, resource_link, due_at FROM assignments WHERE class_id = ${user.class_id} ORDER BY created_at DESC`,
    q`SELECT assignment_id, answer_text, link, is_late FROM submissions WHERE student_id = ${user.id}`,
  ]);
  const mine = Object.fromEntries(mineRows.map(m => [m.assignment_id, { answer: m.answer_text, link: m.link, late: m.is_late }]));
  const assignments = assignmentRows.map(a => ({
    id: a.id, title: a.title, instructions: a.instructions, resourceLink: a.resource_link,
    dueAt: a.due_at ? new Date(a.due_at).toISOString() : null, mine: mine[a.id] || null,
  }));
  const statusBySession = Object.fromEntries(attended.map(r => [r.session_number, r.status]));
  const presentCount = attended.filter(r => r.status === 'present').length;
  const sessions = Array.from({ length: TOTAL_SESSIONS }, (_, i) => i + 1);

  return (
    <PortalShell who={`${user.full_name} · ${user.student_code}`} sub={user.class_name}>
      <h1 style={{ ...headingStyle, fontSize: 30, marginBottom: 24 }}>Welcome, {user.full_name.split(/\s+/)[0]}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <span style={labelStyle}>Your class</span>
          <p style={{ fontSize: 17, fontWeight: 600 }}>{user.class_name}</p>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Your Thrive Number</span>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 30, color: C.yellow, letterSpacing: '0.08em' }}>{user.student_code}</p>
          {user.role_tag && <p style={{ fontSize: 12, color: C.teal, marginTop: 4 }}>{TAG_LABELS[user.role_tag] || user.role_tag}</p>}
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>{tutors.length > 1 ? 'Your tutors' : 'Your tutor'}</span>
          {tutors.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>To be announced</p>}
          {tutors.map(t => (
            <div key={t.full_name} style={{ marginBottom: 6 }}>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{t.full_name}</p>
              {t.contact_info && <p style={{ fontSize: 13, color: C.soft }}>{t.contact_info}</p>}
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>Attendance</span>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 30 }}>{presentCount} <span style={{ fontSize: 15, color: C.muted, fontWeight: 600 }}>of {TOTAL_SESSIONS} classes</span></p>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <span style={labelStyle}>Your attendance record</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 10 }}>
          {sessions.map(n => {
            const state = statusBySession[n];
            const look = state === 'present'
              ? { bg: '#003d3d', border: '#009898', color: C.teal, label: '✓ Present' }
              : state === 'absent'
                ? { bg: '#3d0a0a', border: '#cc3333', color: C.red, label: '✗ Absent' }
                : { bg: 'transparent', border: C.border, color: C.muted, label: '—' };
            return (
              <div key={n} style={{
                textAlign: 'center', padding: '12px 6px', borderRadius: 4, fontSize: 13,
                background: look.bg, border: `1px solid ${look.border}`, color: look.color,
              }}>
                <div style={{ fontWeight: 700 }}>Class {n}</div>
                <div style={{ fontSize: 12, marginTop: 2 }}>{look.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <StudentAssignments assignments={assignments} />

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <span style={labelStyle}>Your classmates ({classmates.length})</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {classmates.map(m => (
            <span key={m.full_name} style={{ fontSize: 14, padding: '6px 12px', border: `1px solid ${C.border}`, borderRadius: 999, color: C.soft }}>
              {m.full_name}{m.role_tag ? ` · ${TAG_LABELS[m.role_tag] || m.role_tag}` : ''}
            </span>
          ))}
        </div>
      </div>

      <p style={{ color: C.muted, fontSize: 14 }}>Projects and class recordings will appear here soon.</p>
    </PortalShell>
  );
}
