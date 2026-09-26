// A student's Thrive Number is their initials plus a running number: David Owoeye -> DO12,
// Victoria Adeola -> VA13. The running number is shared by everyone (it never restarts per
// class), so two people with the same initials can never end up with the same Thrive Number.
// People type these by hand, so accept sloppy input ("do-12", " DO 12 ").

export function normalizeCode(input) {
  return String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Splits "DO12, va-13  SO14;AB15" into unique normalized Thrive Numbers, preserving order.
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

// First letter of the first and last word of the name. A single word gives its first two
// letters. Accents are dropped, and an email typed into the name field falls back to the
// part before the @.
export function initialsFor(fullName) {
  const cleaned = String(fullName || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
  const local = cleaned.includes('@') ? cleaned.split('@')[0] : cleaned;
  const words = local.split(/[^A-Za-z]+/).filter(Boolean);
  let initials = '';
  if (words.length >= 2) initials = words[0][0] + words[words.length - 1][0];
  else if (words.length === 1) initials = words[0].slice(0, 2);
  return initials.toUpperCase().padEnd(2, 'X');
}

export function makeThriveNumber(fullName, number) {
  return `${initialsFor(fullName)}${String(number).padStart(2, '0')}`;
}
