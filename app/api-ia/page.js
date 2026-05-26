import ToolBrowser from '@/components/ToolBrowser';
import { getPublicTools, getToolsByType } from '@/lib/tools';

export const metadata = {
  title: 'API IA : comparatif, prix, documentation et alternatives',
  description: 'Comparez uniquement des API IA réelles pour texte, image, voix, embeddings, agents, OCR, vision, recherche vectorielle et automatisation.',
  alternates: { canonical: '/api-ia' }
};

export default function ApiPage() {
  const tools = getPublicTools(getToolsByType('api'));

  return (
    <div className="container page-shell">
      <p className="eyebrow">Catalogue API IA</p>
      <h1>API IA</h1>
      <p className="lead">Trouvez une API IA réelle et sourcée pour vos projets : LLM, génération, analyse, vision, speech, embeddings, RAG, agents et automatisation.</p>
      <ToolBrowser tools={tools} title="Liste des API IA" />
    </div>
  );
}
