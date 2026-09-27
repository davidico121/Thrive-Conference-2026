// Only http(s) links may become clickable; anything else (javascript:, data:, ...) becomes '#'.
export function safeHref(value) {
  try {
    const u = new URL(String(value || '').trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '#';
  } catch {
    return '#';
  }
}
