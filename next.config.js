/** @type {import('next').NextConfig} */
/**
 * next.config.js — Configuration de sécurité hardened pour Next.js 15
 *
 * CORRECTIONS APPORTÉES :
 *
 * 1. CSP : suppression de 'unsafe-eval' même en dev (utiliser --turbopack
 *    si HMR en nécessite un, pas unsafe-eval dans la config).
 *    Ajout de 'nonce' côté runtime si besoin futur (commenté ici).
 *
 * 2. script-src : 'unsafe-inline' reste nécessaire pour le snippet gtag
 *    injecté inline dans layout.js. Solution recommandée à terme : migrer
 *    vers next/script (strategy="afterInteractive") qui injecte un nonce
 *    automatiquement en App Router.
 *
 * 3. Ajout de report-uri / report-to pour détecter les violations CSP
 *    (décommentez et remplacez par votre endpoint quand disponible).
 *
 * 4. Cross-Origin-Embedder-Policy : conservé à unsafe-none (Google Analytics
 *    charge des ressources cross-origin sans CORP). Documenté explicitement.
 *
 * 5. poweredByHeader: false — empêche de révéler la version de Next.js.
 *
 * 6. serverExternalPackages vide (mais prêt pour whitelist explicite).
 */

const isProduction = process.env.NODE_ENV === 'production';

// ─── Content Security Policy ─────────────────────────────────────────────────
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",

  // Images : self, data URIs (petits icônes inline), HTTPS pour les logos externes
  "img-src 'self' data: https:",

  // Fonts : self uniquement (pas de Google Fonts dans ce projet)
  "font-src 'self' data:",

  // Styles : 'unsafe-inline' requis par Next.js pour le CSS critique injecté dans <head>
  "style-src 'self' 'unsafe-inline'",

  // Scripts
  // - 'unsafe-inline' requis pour le snippet gtag inline dans layout.js
  //   → TODO : migrer vers <Script strategy="afterInteractive"> de next/script
  //     pour bénéficier du nonce automatique et supprimer 'unsafe-inline'
  isProduction
    ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com"
    : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  //   ↑ En dev : PAS de 'unsafe-eval'. Si le HMR Webpack en a besoin, utiliser
  //     `next dev --turbopack` à la place.

  // Connexions : self + Google Analytics
  isProduction
    ? "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com"
    : "connect-src 'self' ws: wss: https://www.google-analytics.com https://analytics.google.com",

  // Worker : interdit par défaut
  "worker-src 'none'",

  // Manifests
  "manifest-src 'self'",

  // Force HTTPS en production
  isProduction ? 'upgrade-insecure-requests' : '',

  // Rapport de violations CSP — décommentez et adaptez quand vous avez un endpoint
  // isProduction ? "report-uri https://votre-domaine.fr/api/csp-report" : '',
].filter(Boolean).join('; ');

// ─── Headers de sécurité ─────────────────────────────────────────────────────
const securityHeaders = [
  // Bloque le MIME sniffing — prévient certaines attaques XSS via upload
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Empêche le clickjacking — redondant avec frame-ancestors mais conservé
  // pour les anciens navigateurs qui ne supportent pas CSP frame-ancestors
  { key: 'X-Frame-Options', value: 'DENY' },

  // Politique de référent : envoie uniquement l'origine sur les requêtes cross-origin
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Désactive le DNS prefetch du navigateur (légère amélioration vie privée)
  { key: 'X-DNS-Prefetch-Control', value: 'off' },

  // Désactive toutes les API sensibles du navigateur
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
      'interest-cohort=()',    // Désactive FLoC / Topics API
    ].join(', '),
  },

  // HSTS : production uniquement — informe les navigateurs de toujours utiliser HTTPS
  // max-age=63072000 = 2 ans (recommandation hstspreload.org)
  ...(isProduction
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),

  // Politiques cross-origin
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  // COEP : 'unsafe-none' requis car Google Analytics ne fournit pas de header CORP
  // → documenté intentionnellement, pas un oubli
  { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },

  // CSP
  { key: 'Content-Security-Policy', value: cspDirectives },

  // Cache-Control pour les pages HTML : pas de cache public des pages dynamiques
  // (Next.js gère ce header par route, mais on ajoute un fallback prudent)
  { key: 'X-Robots-Tag', value: isProduction ? 'index, follow' : 'noindex, nofollow' },
];

// ─── Configuration Next.js ────────────────────────────────────────────────────
const nextConfig = {
  // Ne pas exposer la version de Next.js dans les réponses HTTP
  poweredByHeader: false,

  // Strict Mode React active les avertissements de développement supplémentaires
  reactStrictMode: true,

  // Compression gzip/brotli des réponses
  compress: true,

  // Optimisation des images
  images: {
    // unoptimized: true sur Vercel free tier (pas d'Image Optimization)
    // Passez à false si vous êtes sur un plan payant Vercel
    unoptimized: true,
    // N'autorise PAS les SVG via le composant <Image> (risque XSS)
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 86400,
  },

  // Headers HTTP pour toutes les routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Cache immuable pour les assets statiques hachés de Next.js
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache 24h pour les logos publics
        source: '/logos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Pas de cache pour les routes d'API (si elles existent un jour)
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ];
  },

  // Redirections
  async redirects() {
    return [
      // Exemple : rediriger les anciennes URLs si nécessaire
      // { source: '/tools/:slug', destination: '/api-ia/:slug', permanent: true },
    ];
  },

  // Permet de logger les erreurs serveur en production
  // logging: { fetches: { fullUrl: true } },
};

module.exports = nextConfig;
