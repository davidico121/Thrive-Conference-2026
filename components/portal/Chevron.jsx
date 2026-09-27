import React from 'react';
import { C } from './theme';

// Points down when closed, flips up when open.
export default function Chevron({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}>
      <path d="M5 8l5 5 5-5" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
