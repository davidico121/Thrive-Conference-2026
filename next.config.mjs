const common = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

// Signed-in areas: never framed, never cached.
const privateAreas = [
  ...common,
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" },
  { key: 'Cache-Control', value: 'no-store' },
];

const publicPages = [
  ...common,
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path((?!admin|portal|tutor|api/admin|api/portal|api/tutor).*)', headers: publicPages },
      { source: '/admin/:path*', headers: privateAreas },
      { source: '/portal/:path*', headers: privateAreas },
      { source: '/api/admin/:path*', headers: privateAreas },
      { source: '/api/portal/:path*', headers: privateAreas },
      { source: '/api/tutor/:path*', headers: privateAreas },
    ];
  },
};

export default nextConfig;
