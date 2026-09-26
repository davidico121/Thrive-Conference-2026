// Shared look for the student/tutor portal (matches the Thrive site: navy + yellow).
export const C = {
  bg: '#170f30',
  bgDeep: '#12092a',
  card: '#1e1543',
  border: '#3a2f66',
  text: '#fbf9f6',
  muted: '#9088b8',
  soft: '#c9c3e8',
  yellow: '#fecb00',
  teal: '#22dcdc',
  red: '#ff8080',
};

export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');`;

export const pageStyle = { minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter', -apple-system, sans-serif" };

export const cardStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 24 };

export const headingStyle = { fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: '-0.01em' };

export const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 };

export const inputStyle = {
  width: '100%', padding: '12px 16px', border: `1px solid ${C.yellow}`, borderRadius: 4,
  background: '#ffffff', color: '#1b1c1a', fontSize: 16, outline: 'none', boxSizing: 'border-box',
};

export const primaryButton = {
  background: C.yellow, color: '#17102e', border: `1px solid ${C.yellow}`, borderRadius: 4,
  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.04em',
  textTransform: 'uppercase', padding: '12px 24px', cursor: 'pointer',
};

export const ghostButton = {
  background: 'transparent', color: C.soft, border: `1px solid #443a75`, borderRadius: 4,
  fontSize: 13, padding: '8px 14px', cursor: 'pointer',
};
