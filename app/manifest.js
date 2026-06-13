import { SITE_NAME, DEFAULT_DESCRIPTION } from '@/lib/site';

/**
 * app/manifest.js — Web App Manifest (signal PWA, meilleure présence mobile).
 * Servi automatiquement à /manifest.webmanifest par Next.js.
 */
export default function manifest() {
  return {
    name: `${SITE_NAME} — comparateur d'API IA`,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c3aed',
    lang: 'fr-FR',
    categories: ['technology', 'productivity', 'developer'],
    icons: [
      { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
