/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';

// ─── Content Security Policy ─────────────────────────────────────────────────
// Allows Google Analytics (gtag) + self-hosted everything else.
// 'unsafe-inline' for styles is required by Next.js (inline critical CSS).
// 'unsafe-inline' for scripts is required for the gtag snippet injected in layout.js.
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // Images: allow self, data URIs, and external logos served via HTTPS
  "img-src 'self' data: https:",
  // Fonts: self only
  "font-src 'self' data:",
  // Styles: Next.js requires unsafe-inline for critical CSS injection
  "style-src 'self' 'unsafe-inline'",
  // Scripts: self + Google Analytics CDN
  isProduction
    ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
  // Connections: self + GA endpoints
  isProduction
    ? "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com"
    : "connect-src 'self' http: https: ws: wss:",
  // Force HTTPS in production
  isProduction ? 'upgrade-insecure-requests' : '',
].filter(Boolean).join('; ');

// ─── Security headers ─────────────────────────────────────────────────────────
const securityHeaders = [
  // Prevent MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Referrer: send origin only on cross-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser DNS prefetch (minor privacy improvement)
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  // Permissions policy: disable all sensitive APIs
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'serial=()',
      'accelerometer=()',
      'gyroscope=()',
      'magnetometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'fullscreen=(self)',
      'picture-in-picture=()',
    ].join(', '),
  },
  // HSTS: production only (tells browsers to always use HTTPS, 2 years)
  ...(isProduction
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
  // Cross-Origin policies
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' }, // 'require-corp' breaks GA; keep unsafe-none
  // CSP
  { key: 'Content-Security-Policy', value: cspDirectives },
];

// ─── Next.js config ───────────────────────────────────────────────────────────
const nextConfig = {
  poweredByHeader: false,   // Don't expose Next.js version
  reactStrictMode: true,
  compress: true,

  images: {
    unoptimized: true,       // Vercel free tier; set to false if you use paid plan
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 86400,  // Cache optimized images for 24h
  },

  // Cache static assets aggressively; API routes should set their own
  async headers() {
    return [
      {
        // Apply security headers to every route
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Long-cache for static assets (Next.js already hashes these)
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache public images for 24h
        source: '/logos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },

  // Redirect www → non-www and HTTP → HTTPS handled by Vercel; add custom redirects here if needed
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
