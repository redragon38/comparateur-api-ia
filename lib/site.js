export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Comparateur API IA';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://comparateur-api-ia.vercel.app').replace(/\/$/, '');
export const DEFAULT_DESCRIPTION = 'Comparez 1 400 API IA : LLM, vision, audio, OCR, embeddings, RAG, agents et modèles. Prix, fonctionnalités, alternatives et comparatifs via les plateformes API officielles.';

// Image Open Graph / Twitter par défaut (1200×630 recommandé ; logo.png en repli).
export const DEFAULT_OG_IMAGE = '/logo.png';

// Mots-clés SEO de tête de site (utilisés dans les metadata globales).
export const SITE_KEYWORDS = [
  'comparateur API IA',
  'API intelligence artificielle',
  'meilleure API IA',
  'comparatif API IA',
  'alternatives API IA',
  'API LLM',
  'API vision',
  'API OCR',
  'API embeddings',
  'API speech to text',
  'API génération image',
  'API RAG',
  'agents IA API',
  'prix API IA',
];
