/**
 * lib/validation.js — Validation et sanitisation centralisées
 *
 * POURQUOI CE FICHIER ?
 *  Les routes dynamiques ([slug], [comparison]) reçoivent des paramètres URL
 *  dont la valeur peut être manipulée par n'importe quel visiteur.
 *  Sans validation, on s'expose à :
 *    - Path traversal  : ../../../etc/passwd
 *    - Injection SEO   : <script>alert(1)</script> dans les metadata
 *    - SSRF            : si un slug est utilisé dans un fetch() externe
 *    - Open redirect   : si un slug alimente un href
 *
 *  Ce module centralise toutes les règles de validation afin qu'elles soient
 *  appliquées de manière cohérente dans TOUS les points d'entrée.
 */

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Longueur max d'un slug (caractères). Valeur conservatrice : les slugs
 *  du dataset avoisinent 60–80 caractères maximum. */
export const SLUG_MAX_LENGTH = 120;

/** Longueur max d'un slug de comparaison : deux slugs + "-vs-" */
export const COMPARISON_MAX_LENGTH = SLUG_MAX_LENGTH * 2 + 4;

/**
 * Regex des caractères AUTORISÉS dans un slug.
 *  - lettres minuscules a-z
 *  - chiffres 0-9
 *  - tirets (-)
 * Tout le reste est rejeté.
 */
const SLUG_ALLOWED_RE = /^[a-z0-9-]+$/;

/**
 * Regex des caractères AUTORISÉS dans un slug de comparaison.
 * Identique au slug mais autorise aussi ".vs." pour le séparateur -vs-.
 */
const COMPARISON_ALLOWED_RE = /^[a-z0-9-]+$/;

// Séquences dangereuses à détecter même après décodage URL
const PATH_TRAVERSAL_RE = /\.\.|\/|\\|%2e%2e|%2f|%5c/i;
const HTML_INJECT_RE = /[<>"'`]/;
// Séquences encodées courantes (double-encoding)
const ENCODED_TRAVERSAL_RE = /%(?:2e|2f|5c|3c|3e|22|27|60)/i;

// ─── Fonctions de validation ───────────────────────────────────────────────────

/**
 * Valide un slug de route dynamique ([slug]).
 *
 * @param {unknown} value — Valeur brute issue de params.slug
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateSlug(value) {
  if (typeof value !== 'string') {
    return { valid: false, reason: 'not_a_string' };
  }

  if (value.length === 0) {
    return { valid: false, reason: 'empty' };
  }

  if (value.length > SLUG_MAX_LENGTH) {
    return { valid: false, reason: 'too_long' };
  }

  // Vérification path traversal (avant et après décodage)
  if (PATH_TRAVERSAL_RE.test(value)) {
    return { valid: false, reason: 'path_traversal' };
  }

  if (ENCODED_TRAVERSAL_RE.test(value)) {
    return { valid: false, reason: 'encoded_traversal' };
  }

  // Vérification injection HTML/XSS
  if (HTML_INJECT_RE.test(value)) {
    return { valid: false, reason: 'html_injection' };
  }

  // Uniquement a-z, 0-9 et tirets
  if (!SLUG_ALLOWED_RE.test(value)) {
    return { valid: false, reason: 'invalid_chars' };
  }

  return { valid: true };
}

/**
 * Valide un slug de comparaison ([comparison]) au format "slug-a-vs-slug-b".
 *
 * @param {unknown} value — Valeur brute issue de params.comparison
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateComparisonSlug(value) {
  if (typeof value !== 'string') {
    return { valid: false, reason: 'not_a_string' };
  }

  if (value.length === 0) {
    return { valid: false, reason: 'empty' };
  }

  if (value.length > COMPARISON_MAX_LENGTH) {
    return { valid: false, reason: 'too_long' };
  }

  if (PATH_TRAVERSAL_RE.test(value)) {
    return { valid: false, reason: 'path_traversal' };
  }

  if (ENCODED_TRAVERSAL_RE.test(value)) {
    return { valid: false, reason: 'encoded_traversal' };
  }

  if (HTML_INJECT_RE.test(value)) {
    return { valid: false, reason: 'html_injection' };
  }

  // Le slug de comparaison contient exactement un séparateur "-vs-"
  const parts = value.split('-vs-');
  if (parts.length !== 2) {
    return { valid: false, reason: 'missing_vs_separator' };
  }

  for (const part of parts) {
    if (!COMPARISON_ALLOWED_RE.test(part) || part.length === 0) {
      return { valid: false, reason: 'invalid_slug_part' };
    }
  }

  return { valid: true };
}

/**
 * Assainit une chaîne destinée à être injectée dans du HTML ou des metadata.
 * Supprime les caractères potentiellement dangereux.
 *
 * Usage : metadata title/description uniquement.
 * Ne PAS utiliser pour construire des URLs — utiliser validateSlug à la place.
 *
 * @param {string} value
 * @param {number} [maxLength=200]
 * @returns {string}
 */
export function sanitizeText(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  return value
    .slice(0, maxLength)
    .replace(/[<>"'`]/g, '')          // supprime les caractères HTML dangereux
    .replace(/[\u0000-\u001F\u007F]/g, '') // supprime les caractères de contrôle
    .trim();
}

/**
 * Assainit une URL externe (docsUrl, website, sourceUrl).
 * N'autorise que les protocoles http: et https:.
 * Retourne '#' en cas d'URL invalide.
 *
 * @param {string} url
 * @returns {string}
 */
export function sanitizeExternalUrl(url) {
  if (typeof url !== 'string' || url.length === 0) return '#';
  if (url.length > 2048) return '#';

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '#'; // Bloque javascript:, data:, vbscript:, etc.
    }
    return parsed.href;
  } catch {
    return '#';
  }
}
