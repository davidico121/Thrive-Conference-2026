'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// A password box with an eye button that shows or hides what was typed. Takes the same
// props as <input>; any marginBottom in `style` is applied to the wrapper so the eye
// stays centered on the box itself.
export default function PasswordInput({ style, ...props }) {
  const [visible, setVisible] = useState(false);
  const { marginBottom, ...inputStyle } = style || {};

  return (
    <div style={{ position: 'relative', marginBottom }}>
      <input {...props} type={visible ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: 48 }} />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        style={{
          position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 12, lineHeight: 0, color: '#77767e',
        }}
      >
        {visible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
