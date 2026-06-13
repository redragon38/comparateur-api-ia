/**
 * app/opengraph-image.js — Image Open Graph / Twitter de marque (1200×630).
 *
 * Générée à la volée par next/og (ImageResponse). Next l'applique
 * automatiquement comme og:image ET twitter:image sur toutes les pages qui ne
 * définissent pas la leur → carte sociale propre et cohérente (bien meilleur
 * CTR qu'un logo de 32px). Aucune police externe : next/og fournit la sienne.
 */

import { ImageResponse } from 'next/og';

export const alt = 'Comparateur API IA — comparez 1 400 API IA réelles';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 45%, #db2777 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 2, opacity: 0.9 }}>
          COMPARATEUR API IA
        </div>
        <div style={{ display: 'flex', fontSize: 78, fontWeight: 800, lineHeight: 1.05, marginTop: 24 }}>
          Comparez 1 400 API IA réelles
        </div>
        <div style={{ display: 'flex', fontSize: 36, marginTop: 28, opacity: 0.95 }}>
          LLM · Vision · Audio · OCR · Embeddings · RAG · Agents
        </div>
        <div style={{ display: 'flex', fontSize: 28, marginTop: 40, opacity: 0.85 }}>
          Prix · Fonctionnalités · Alternatives · Comparatifs
        </div>
      </div>
    ),
    { ...size }
  );
}
