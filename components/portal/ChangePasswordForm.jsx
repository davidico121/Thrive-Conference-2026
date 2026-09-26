'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordInput from './PasswordInput';
import { C, FONT_IMPORT, pageStyle, headingStyle, labelStyle, inputStyle, primaryButton } from './theme';

export default function ChangePasswordForm({ forced, home }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Keep the button off until scripts have loaded so passwords can never end up in the address bar.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) {
      setError('The two new passwords don’t match.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/portal/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not change your password.');
      router.push(home);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{FONT_IMPORT}</style>
      <form method="post" onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420, background: '#ffffff', border: `2px solid ${C.yellow}`, borderRadius: 6, padding: 36 }}>
        <h1 style={{ ...headingStyle, fontSize: 22, color: '#17102e', marginBottom: 6 }}>Choose your own password</h1>
        <p style={{ color: '#77767e', fontSize: 14, marginBottom: 22 }}>
          {forced ? 'Before you continue, replace the temporary password from your email with one only you know.' : 'Enter your current password and pick a new one.'}
        </p>

        <label style={{ ...labelStyle, color: '#77767e' }}>{forced ? 'Temporary password (from your email)' : 'Current password'}</label>
        <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required style={{ ...inputStyle, marginBottom: 18 }} />

        <label style={{ ...labelStyle, color: '#77767e' }}>New password (at least 8 characters)</label>
        <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required style={{ ...inputStyle, marginBottom: 18 }} />

        <label style={{ ...labelStyle, color: '#77767e' }}>Type the new password again</label>
        <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={8} required style={{ ...inputStyle, marginBottom: 18 }} />

        {error && <p style={{ color: '#cc0000', fontSize: 14, marginBottom: 16 }}>{error}</p>}

        <button type="submit" disabled={!ready || submitting} style={{ ...primaryButton, width: '100%', padding: 14, opacity: (!ready || submitting) ? 0.6 : 1 }}>
          {submitting ? 'Saving…' : 'Save my new password'}
        </button>
      </form>
    </div>
  );
}
