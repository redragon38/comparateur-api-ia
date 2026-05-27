/**
 * JsonLd — Composant sécurisé pour les scripts JSON-LD (Rich Snippets / Schema.org)
 *
 * SÉCURITÉ :
 *  - JSON.stringify() échappe nativement les caractères dangereux (<, >, &, ")
 *    quand ils se trouvent dans des valeurs JSON (les clés ne sont pas encodées,
 *    mais elles proviennent toujours de nos constantes internes — pas de données
 *    utilisateur).
 *  - Le remplacement manuel /</g → \u003c bloque en plus l'injection de la
 *    séquence </script> qui fermerait prématurément la balise.
 *  - La fonction sanitizeJsonLd valide la structure avant sérialisation :
 *    les valeurs de type string sont limitées en longueur et les caractères
 *    de contrôle sont supprimés pour éviter toute injection Unicode.
 *  - dangerouslySetInnerHTML est inévitable pour les balises <script> côté
 *    serveur dans Next.js, mais le risque est maîtrisé par les deux couches
 *    ci-dessus + la CSP `script-src 'self'` du next.config.js.
 *
 * IMPACT SEO : aucun — les rich snippets Google continuent de fonctionner.
 */

const MAX_STRING_LENGTH = 2000;
// Caractères de contrôle U+0000–U+001F sauf tab/newline/retour chariot
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Parcourt récursivement un objet JSON et assainit toutes les valeurs string.
 * - Tronque à MAX_STRING_LENGTH (évite les payloads excessifs)
 * - Supprime les caractères de contrôle (évite certaines injections Unicode)
 */
function sanitizeJsonLd(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    return value
      .slice(0, MAX_STRING_LENGTH)
      .replace(CONTROL_CHARS_RE, '');
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeJsonLd);
  }

  if (typeof value === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = sanitizeJsonLd(val);
    }
    return result;
  }

  // number, boolean — safe as-is
  return value;
}

/**
 * Sérialise un objet JSON-LD en chaîne sûre pour dangerouslySetInnerHTML.
 *
 * Étapes de sécurité :
 *  1. sanitizeJsonLd() — nettoyage récursif des strings
 *  2. JSON.stringify() — sérialisation stricte (échappe les guillemets, etc.)
 *  3. Remplacement de < → \u003c — empêche la fermeture de </script>
 *  4. Remplacement de > → \u003e — défense en profondeur
 *  5. Remplacement de & → \u0026 — évite les entités HTML parasites
 */
function serializeJsonLd(data) {
  const clean = sanitizeJsonLd(data);
  return JSON.stringify(clean)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export default function JsonLd({ data }) {
  if (!data || typeof data !== 'object') return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
