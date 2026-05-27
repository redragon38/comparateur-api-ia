/**
 * middleware.ts — Middleware de sécurité Next.js 15
 *
 * RÔLE :
 *  Ce middleware s'exécute sur Vercel Edge avant chaque requête entrante.
 *  Il constitue la première ligne de défense :
 *
 *  1. Validation de la longueur des URLs (anti DoS / path traversal)
 *  2. Détection des patterns dangereux dans les paramètres d'URL
 *  3. Ajout de headers de sécurité supplémentaires au niveau Edge
 *  4. Squelette de rate limiting (à compléter avec un KV store Vercel/Upstash)
 *  5. Blocage des bots malveillants connus (User-Agent)
 *
 * NOTE : Les headers CSP définis ici S'AJOUTENT à ceux de next.config.js.
 *  En cas de conflit, Vercel fusionne (le dernier gagne). Pour éviter la
 *  duplication, les headers CSP sont gérés exclusivement dans next.config.js.
 *  Ce middleware ne redéfinit PAS la CSP.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Longueur maximale d'une URL complète */
const MAX_URL_LENGTH = 2048;

/** Patterns de chemin dangereux (path traversal, injections) */
const DANGEROUS_PATH_RE =
  /(\.\.|\/\/|\\\\|%2e%2e|%2f%2f|%5c%5c|<script|javascript:|data:text\/html)/i;

/**
 * User-Agents de scanners de vulnérabilités et outils d'attaque connus.
 * Liste non exhaustive — à enrichir selon les logs de production.
 */
const BLOCKED_UA_RE =
  /(?:sqlmap|nikto|nmap|masscan|zgrab|dirbuster|gobuster|ffuf|nuclei|hydra|burpsuite|w3af|acunetix|nessus|openvas)/i;

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname, search, href } = request.nextUrl;

  // 1. Longueur maximale de l'URL
  if (href.length > MAX_URL_LENGTH) {
    return new NextResponse('URL trop longue', { status: 414 });
  }

  // 2. Détection de patterns dangereux dans le chemin et les paramètres
  const fullPath = pathname + search;
  if (DANGEROUS_PATH_RE.test(fullPath)) {
    return new NextResponse('Requête invalide', { status: 400 });
  }

  // 3. Blocage des scanners connus
  const userAgent = request.headers.get('user-agent') ?? '';
  if (BLOCKED_UA_RE.test(userAgent)) {
    return new NextResponse('Accès refusé', { status: 403 });
  }

  // 4. Rate limiting (squelette — activer avec Vercel KV ou Upstash Redis)
  //
  //    Exemple avec Upstash :
  //
  //    import { Ratelimit } from '@upstash/ratelimit';
  //    import { Redis } from '@upstash/redis';
  //
  //    const ratelimit = new Ratelimit({
  //      redis: Redis.fromEnv(),
  //      limiter: Ratelimit.slidingWindow(100, '1 m'),
  //      analytics: true,
  //    });
  //
  //    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  //    const { success } = await ratelimit.limit(ip);
  //    if (!success) {
  //      return new NextResponse('Trop de requêtes', { status: 429 });
  //    }

  // 5. Pas de modification — laisser passer
  const response = NextResponse.next();

  // Headers additionnels au niveau Edge (renforce next.config.js)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');

  return response;
}

// ─── Matcher ─────────────────────────────────────────────────────────────────
// Appliquer le middleware à toutes les routes SAUF les assets statiques
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logos/|public/|sitemap.xml|robots.txt).*)',
  ],
};
