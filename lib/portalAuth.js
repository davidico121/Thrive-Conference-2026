// Signed session cookie for student and tutor logins.
// Same HMAC scheme as lib/adminAuth.js and the same secret, but a different cookie
// name and a different claim ("role"), so an admin token is never valid here and a
// portal token is never valid for the admin pages. Uses Web Crypto so it also works
// in the Edge middleware.

export const PORTAL_COOKIE = 'thrive_portal_session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const ROLES = ['student', 'tutor'];

function base64url(bytes) {
  let str = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - (str.length % 4)) % 4, '=');
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

// v is the account's session_version at login. The server compares it with the
// database on every request, so bumping it there signs the person out everywhere.
export async function signPortalSession({ role, id, v }, secret) {
  const payload = JSON.stringify({ role, id, v, iat: Date.now() });
  const payloadB64 = base64url(new TextEncoder().encode(payload));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${base64url(sig)}`;
}

// Returns { role, id } for a valid, unexpired token, otherwise null.
export async function verifyPortalSession(token, secret) {
  if (!token || !token.includes('.') || !secret) return null;
  const [payloadB64, sigB64] = token.split('.');
  try {
    const valid = await crypto.subtle.verify('HMAC', await hmacKey(secret), base64urlDecode(sigB64), new TextEncoder().encode(payloadB64));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
    if (!ROLES.includes(payload.role) || !Number.isInteger(payload.id) || !Number.isInteger(payload.v)) return null;
    if (Date.now() - payload.iat > MAX_AGE_MS) return null;
    return { role: payload.role, id: payload.id, v: payload.v };
  } catch {
    return null;
  }
}
