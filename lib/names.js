// Registrants sometimes type an email address, ALL CAPS, or all lowercase into the name field.
export function displayFirstName(fullName) {
  const token = (fullName || '').trim().split(/\s+/)[0] || '';
  if (!token || token.includes('@')) return 'there';
  const isAllCaps = token.length > 1 && token === token.toUpperCase();
  const base = isAllCaps ? token.toLowerCase() : token;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
