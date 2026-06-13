import { SITE_URL } from '@/lib/site';

/**
 * robots.js — Autorise explicitement les crawlers IA (GEO).
 *
 * Pour être CITÉ dans les réponses de Claude, ChatGPT et Gemini, leurs robots
 * doivent pouvoir explorer et indexer le site. On les autorise donc nommément
 * (en plus de la règle générale), ce qui lève toute ambiguïté :
 *
 *  - ChatGPT / OpenAI : GPTBot (entraînement), OAI-SearchBot (recherche/citation),
 *    ChatGPT-User (navigation à la demande).
 *  - Claude / Anthropic : ClaudeBot, Claude-Web, Claude-SearchBot, anthropic-ai.
 *  - Gemini / Google : Google-Extended (autorise l'usage du contenu par Gemini
 *    et Vertex AI grounding) + Googlebot pour l'indexation classique.
 *  - Autres moteurs IA : PerplexityBot, Applebot-Extended, Amazonbot, CCBot,
 *    cohere-ai, YouBot, Meta-ExternalAgent, DuckAssistBot.
 */

const AI_AND_SEARCH_BOTS = [
  // OpenAI / ChatGPT
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic / Claude
  'ClaudeBot',
  'Claude-Web',
  'Claude-SearchBot',
  'anthropic-ai',
  // Google / Gemini
  'Googlebot',
  'Google-Extended',
  'GoogleOther',
  // Microsoft / Bing / Copilot
  'Bingbot',
  'BingPreview',
  // Apple Intelligence
  'Applebot',
  'Applebot-Extended',
  // Autres assistants / moteurs IA
  'PerplexityBot',
  'Perplexity-User',
  'Amazonbot',
  'CCBot',
  'cohere-ai',
  'YouBot',
  'Meta-ExternalAgent',
  'DuckAssistBot',
  'Bytespider',
];

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      // Accès plein et explicite pour les robots IA et moteurs de recherche.
      ...AI_AND_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
