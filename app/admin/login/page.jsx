'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Login failed.');
      router.push(searchParams.get('next') || '/admin/skills-training');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#170f30', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      <form onSubmit={handleSubmit} style={{
        width: '100%', maxWidth: 380, background: '#ffffff', border: '2px solid #fecb00',
        borderRadius: 6, padding: 40,
      }}>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22,
          color: '#17102e', marginBottom: 8,
        }}>
          Thrive Admin
        </h1>
        <p style={{ color: '#77767e', fontSize: 13, marginBottom: 24 }}>
          Enter the team passcode to review submissions.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passcode"
          autoFocus
          required
          style={{
            width: '100%', padding: '12px 16px', border: '1px solid #fecb00',
            borderRadius: 4, background: '#ffffff', color: '#1b1c1a', fontSize: 16,
            outline: 'none', marginBottom: 16, boxSizing: 'border-box',
          }}
        />
        {error && (
          <p style={{ color: '#cc0000', fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', padding: 14, background: '#fecb00', color: '#17102e',
            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
            letterSpacing: '0.04em', textTransform: 'uppercase', border: '1px solid #fecb00',
            borderRadius: 4, cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
