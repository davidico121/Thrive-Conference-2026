'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, FONT_IMPORT, pageStyle, headingStyle, labelStyle, inputStyle, primaryButton } from '../../../components/portal/theme';

export default function PortalLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Until the page's scripts have loaded, a submit would be handled by the browser
  // itself and could put the password in the address bar. Keep the button off until then.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      router.push(data.mustChangePassword ? '/portal/change-password' : (data.role === 'tutor' ? '/portal/tutor' : '/portal'));
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{FONT_IMPORT}</style>
      <form method="post" onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, background: '#ffffff', border: `2px solid ${C.yellow}`, borderRadius: 6, padding: 36 }}>
        <h1 style={{ ...headingStyle, fontSize: 24, color: '#17102e', marginBottom: 6 }}>Thrive Skills Portal</h1>
        <p style={{ color: '#77767e', fontSize: 14, marginBottom: 24 }}>Log in with your student code (like AI07) or your tutor username.</p>

        <label style={{ ...labelStyle, color: '#77767e' }}>Username</label>
        <input
          type="text" value={username} onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="characters" autoComplete="username" autoFocus required
          placeholder="e.g. AI07" style={{ ...inputStyle, marginBottom: 18 }}
        />

        <label style={{ ...labelStyle, color: '#77767e' }}>Password</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password" required style={{ ...inputStyle, marginBottom: 18 }}
        />

        {error && <p style={{ color: '#cc0000', fontSize: 14, marginBottom: 16 }}>{error}</p>}

        <button type="submit" disabled={!ready || submitting} style={{ ...primaryButton, width: '100%', padding: 14, opacity: (!ready || submitting) ? 0.6 : 1, cursor: (!ready || submitting) ? 'not-allowed' : 'pointer' }}>
          {submitting ? 'Checking…' : 'Log in'}
        </button>
        <p style={{ color: '#77767e', fontSize: 12, marginTop: 16, textAlign: 'center' }}>
          Forgot your password? Ask your tutor or the Thrive team to reset it.
        </p>
      </form>
    </div>
  );
}
