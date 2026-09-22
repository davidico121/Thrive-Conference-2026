'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const TRACKS = [
  'AI & AI Automation',
  'Video Editing & AI Video Content',
  'Copywriting & Content Writing',
  'Graphic Designing',
  'UI/UX Designing',
  'Social Media Management',
];

const STATUS_COLORS = {
  Pending: { bg: '#3a2f66', fg: '#c9c3e8' },
  Approved: { bg: '#003d3d', fg: '#22dcdc' },
  Rejected: { bg: '#3d0a0a', fg: '#ff8080' },
};

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function ParticipantCard({ p, onSetStatus }) {
  const [updating, setUpdating] = useState(false);
  const statusColor = STATUS_COLORS[p.reviewStatus] || STATUS_COLORS.Pending;

  const handleStatus = async (status) => {
    setUpdating(true);
    await onSetStatus(p.email, status);
    setUpdating(false);
  };

  return (
    <div style={{
      background: '#1e1543', border: '1px solid #3a2f66', borderRadius: 6,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
        {p.hostedVideoUrl ? (
          <video
            controls
            preload="metadata"
            src={`/api/admin/video?pathname=${encodeURIComponent(p.hostedVideoUrl)}`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, textAlign: 'center',
          }}>
            <p style={{ color: '#8b84b5', fontSize: 13, fontWeight: 600 }}>
              {p.ingestStatus ? `Video unavailable — ${p.ingestStatus}` : 'Not yet ingested'}
            </p>
            {p.ingestNote && (
              <p style={{ color: '#5c5580', fontSize: 11, maxWidth: 260 }}>{p.ingestNote}</p>
            )}
            {p.videoLink && (
              <a href={p.videoLink} target="_blank" rel="noopener noreferrer" style={{ color: '#fecb00', fontSize: 12, textDecoration: 'underline' }}>
                Open original link
              </a>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: '#fbf9f6' }}>{p.name}</h3>
          <span style={{
            flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '4px 8px', borderRadius: 2, background: statusColor.bg, color: statusColor.fg,
          }}>
            {p.reviewStatus}
          </span>
        </div>

        <span style={{
          display: 'inline-block', width: 'fit-content', fontSize: 11, fontWeight: 600,
          color: '#fecb00', border: '1px solid #443a75', borderRadius: 2, padding: '3px 8px',
        }}>
          {p.track}
        </span>

        <div style={{ fontSize: 12, color: '#9088b8', lineHeight: 1.7 }}>
          <div>{p.email}</div>
          <div>{p.phone}</div>
          <div>Experience: {p.experience}</div>
          <div>Submitted: {formatDate(p.timestamp)}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <button
            type="button"
            disabled={updating}
            onClick={() => handleStatus('Approved')}
            style={{
              flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.04em', borderRadius: 4, cursor: updating ? 'not-allowed' : 'pointer',
              border: '1px solid #009898',
              background: p.reviewStatus === 'Approved' ? '#009898' : 'transparent',
              color: p.reviewStatus === 'Approved' ? '#fbf9f6' : '#22dcdc',
              opacity: updating ? 0.6 : 1,
            }}
          >
            Approve
          </button>
          <button
            type="button"
            disabled={updating}
            onClick={() => handleStatus('Rejected')}
            style={{
              flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.04em', borderRadius: 4, cursor: updating ? 'not-allowed' : 'pointer',
              border: '1px solid #cc3333',
              background: p.reviewStatus === 'Rejected' ? '#cc3333' : 'transparent',
              color: p.reviewStatus === 'Rejected' ? '#fbf9f6' : '#ff8080',
              opacity: updating ? 0.6 : 1,
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SkillsTrainingAdminGrid({ initialParticipants }) {
  const router = useRouter();
  const [participants, setParticipants] = useState(initialParticipants);
  const [trackFilter, setTrackFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return participants.filter(p => {
      if (trackFilter !== 'All' && p.track !== trackFilter) return false;
      if (statusFilter !== 'All' && p.reviewStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [participants, trackFilter, statusFilter, search]);

  const handleSetStatus = async (email, status) => {
    setParticipants(prev => prev.map(p => p.email === email ? { ...p, reviewStatus: status } : p));
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status }),
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch {
      setParticipants(prev => prev.map(p => p.email === email ? { ...p, reviewStatus: p.reviewStatus } : p));
      alert('Could not save that status change. Please try again.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const selectStyle = {
    background: '#1e1543', color: '#fbf9f6', border: '1px solid #3a2f66',
    borderRadius: 4, padding: '8px 12px', fontSize: 13, fontFamily: "'Inter', sans-serif",
  };

  return (
    <div style={{ minHeight: '100vh', background: '#170f30', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');`}</style>

      <div style={{
        position: 'sticky', top: 0, zIndex: 10, background: '#12092a', borderBottom: '2px solid #fecb00',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#fbf9f6' }}>
            Skills Training — Submission Review
          </h1>
          <p style={{ color: '#8b84b5', fontSize: 12, marginTop: 2 }}>{filtered.length} of {participants.length} shown</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...selectStyle, minWidth: 200 }}
          />
          <select value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)} style={selectStyle}>
            <option value="All">All tracks</option>
            {TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'transparent', border: '1px solid #443a75', color: '#c9c3e8',
              borderRadius: 4, padding: '8px 14px', fontSize: 12, cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={{
        maxWidth: 1400, margin: '0 auto', padding: '32px 24px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20,
      }}>
        {filtered.map(p => (
          <ParticipantCard key={p.email} p={p} onSetStatus={handleSetStatus} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: '#5c5580', padding: '48px 24px' }}>No submissions match these filters.</p>
      )}
    </div>
  );
}
