'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { C, FONT_IMPORT, pageStyle, headingStyle, ghostButton } from './theme';

export default function PortalShell({ who, sub, children }) {
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/portal/logout', { method: 'POST' });
    router.push('/portal/login');
    router.refresh();
  };

  return (
    <div style={pageStyle}>
      <style>{FONT_IMPORT}</style>
      <div style={{
        background: C.bgDeep, borderBottom: `2px solid ${C.yellow}`, padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ ...headingStyle, fontSize: 19 }}>THRIVE <span style={{ color: C.yellow }}>SKILLS</span></div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: C.soft }}>{who}</span>
          <button type="button" onClick={logout} style={ghostButton}>Log out</button>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>{children}</div>
    </div>
  );
}
