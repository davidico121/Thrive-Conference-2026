// Student codes look like AI07: a two-letter track prefix plus a number.
// Tutors and students type them by hand, so accept sloppy input ("ai-07", " AI 07 ").

export function normalizeCode(input) {
  return String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Splits "AI07, ai-08  VE03;UX01" into unique normalized codes, preserving order.
export function parseCodeList(text) {
  const seen = new Set();
  const codes = [];
  for (const piece of String(text || '').split(/[,;\s]+/)) {
    const code = normalizeCode(piece);
    if (code && !seen.has(code)) {
      seen.add(code);
      codes.push(code);
    }
  }
  return codes;
}

export function formatCode(prefix, number) {
  return `${prefix}${String(number).padStart(2, '0')}`;
}
