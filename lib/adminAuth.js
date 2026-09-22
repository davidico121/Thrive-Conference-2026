// Signed session cookie helpers for the admin review pages.
// Uses Web Crypto (available in both the Edge middleware runtime and Node)
// so the same code works in middleware.js and in server components/routes.

export const ADMIN_SESSION_COOKIE = 'thrive_admin_session';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

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
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signAdminSession(secret) {
  const payload = JSON.stringify({ admin: true, iat: Date.now() });
  const payloadB64 = base64url(new TextEncoder().encode(payload));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${base64url(sig)}`;
}

export async function verifyAdminSession(token, secret) {
  if (!token || !token.includes('.')) return false;
  const [payloadB64, sigB64] = token.split('.');
  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64urlDecode(sigB64),
    new TextEncoder().encode(payloadB64)
  );
  if (!valid) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
    if (!payload.admin) return false;
    if (Date.now() - payload.iat > MAX_AGE_MS) return false;
    return true;
  } catch {
    return false;
  }
}
