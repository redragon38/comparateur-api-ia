# Sécurité premier déploiement

## Déjà configuré

- `poweredByHeader: false` pour masquer l’en-tête `X-Powered-By`.
- `Strict-Transport-Security` pour forcer HTTPS côté navigateur après première visite HTTPS.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY` et `frame-ancestors 'none'` dans la CSP.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` restrictive : caméra, micro, géolocalisation, paiement, USB, Bluetooth, série, accéléromètre et gyroscope désactivés.
- `Content-Security-Policy` conservatrice compatible avec Next.js et les JSON-LD Schema.org.
- `form-action 'self'`.
- Formulaire de contact bloqué côté client tant qu’aucun backend n’est branché.
- Liens externes avec `rel="nofollow noopener noreferrer"` ou équivalent.
- `postcss` forcé en `8.5.10` via `overrides` pour corriger l’audit npm.

## À faire avant production réelle

1. Remplacer `NEXT_PUBLIC_SITE_URL` par le vrai domaine.
2. Brancher un vrai backend de contact avec anti-spam, rate limit et validation serveur.
3. Ajouter un système de mise à jour/vérification des sources API.
4. Mettre en place monitoring, analytics respectueux du RGPD et page cookies si nécessaire.
5. Tester la CSP en production après ajout éventuel d’analytics, scripts marketing ou pixels.
