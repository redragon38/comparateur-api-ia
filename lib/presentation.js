const TONE_COUNT = 14;

const categoryCodes = {
  'Modèles de langage': 'LLM',
  'Image générative': 'IMG',
  'Audio et voix': 'AUD',
  'Vision IA': 'VIS',
  'Embeddings et RAG': 'RAG',
  'Agents IA': 'AGT',
  'OCR et documents': 'OCR',
  'Recherche IA': 'SRH',
  'Vidéo IA': 'VID',
  'Modération IA': 'MOD',
  'Cloud AI': 'CLD',
  'Données et vector search': 'VDB',
  'Code IA': 'DEV',
  'Automatisation IA': 'AUT'
};

function fingerprint(value = '') {
  return String(value).split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

export function getToneIndex(tool, modulo = TONE_COUNT) {
  const source = `${tool?.slug || ''}:${tool?.category || ''}:${tool?.id || 0}`;
  return Math.abs(fingerprint(source) + Number(tool?.id || 0)) % modulo;
}

export function getCategoryCode(category = 'API') {
  return categoryCodes[category] || category.split(/\s+/).map((word) => word[0]).join('').slice(0, 3).toUpperCase();
}

export function getApiProfile(tool) {
  const tone = getToneIndex(tool);
  const layout = getToneIndex(tool, 4);
  const score = Math.round(Math.min(99, Math.max(62, Number(tool.rating || 4) * 18 + (Number(tool.id || 0) % 9))));
  const docScore = tool.docsUrl || tool.sourceUrl ? 96 : 72;
  const deployScore = Math.min(98, Math.round(score + (tool.verified ? 5 : -2)));
  const integrationScore = Math.min(98, Math.max(66, Math.round(72 + ((tool.features || []).length * 4) + (Number(tool.id || 0) % 11))));
  const complexityMap = ['Simple', 'Intermédiaire', 'Avancée', 'Enterprise'];
  const complexity = complexityMap[(Number(tool.id || 0) + (tool.category || '').length) % complexityMap.length];
  const sourceLabel = tool.verificationStatus === 'verified_direct_official_source' ? 'Source officielle' : 'Plateforme API';
  const categoryCode = getCategoryCode(tool.category);
  const primaryUseCase = tool.useCases?.[0] || 'Intégration IA';
  const secondaryUseCase = tool.useCases?.[1] || tool.subCategory || 'Automatisation';
  const bestUse = `${primaryUseCase} · ${secondaryUseCase}`;
  const docsLabel = tool.docsUrl ? 'Docs API' : 'Source';
  const modelSignal = tool.dataSourceType === 'platform_model_api' ? 'Modèle via plateforme' : 'API directe';

  return {
    tone,
    layout,
    score,
    docScore,
    deployScore,
    integrationScore,
    complexity,
    sourceLabel,
    categoryCode,
    bestUse,
    docsLabel,
    modelSignal,
    cardClass: `card-tone-${tone} card-layout-${layout}`,
    detailClass: `detail-tone-${tone} detail-layout-${layout}`,
    metrics: [
      { label: 'Docs', value: docScore },
      { label: 'Prod', value: deployScore },
      { label: 'Intégr.', value: integrationScore }
    ]
  };
}

export function getDetailSections(tool) {
  const profile = getApiProfile(tool);
  const isDirect = tool.verificationStatus === 'verified_direct_official_source';
  const category = tool.category || 'API IA';
  const useCases = tool.useCases || [];
  const features = tool.features || [];
  const pros = tool.pros || [];
  const cons = tool.cons || [];
  const primaryUseCase = useCases[0] || 'un workflow IA';
  const primaryFeature = features[0] || 'une intégration IA';

  return {
    profile,
    verdictTitle: `${tool.name} est surtout pertinent pour ${primaryUseCase.toLowerCase()}`,
    verdictText: `${tool.name} se positionne comme une ${category.toLowerCase()} orientée ${tool.subCategory?.toLowerCase() || 'intégration IA'}. La fiche met en avant ${primaryFeature.toLowerCase()}, les contraintes de coût, la documentation et les alternatives à comparer avant intégration.`,
    bestFor: [
      `Développeurs qui veulent intégrer ${primaryFeature.toLowerCase()}`,
      `Équipes produit avec un besoin ${category.toLowerCase()}`,
      `Projets où ${primaryUseCase.toLowerCase()} est prioritaire`
    ],
    notFor: [
      cons[0] || 'Projets sans budget de test API',
      cons[1] || 'Cas nécessitant une garantie contractuelle non vérifiée',
      'Déploiements sans contrôle qualité des sorties IA'
    ],
    integrationSteps: [
      'Vérifier la documentation officielle, les quotas et les limites de débit.',
      'Créer une clé API avec permissions minimales et variables d’environnement.',
      'Tester les endpoints critiques avec petits volumes avant production.',
      'Mettre en place logs, retries, timeouts et suivi des coûts.'
    ],
    trustItems: [
      isDirect ? 'Documentation officielle identifiée' : 'API rattachée à une plateforme IA réelle',
      tool.docsUrl ? 'Lien documentation disponible' : 'Source publique disponible',
      tool.lastVerified ? `Vérifiée le ${tool.lastVerified}` : 'Date de vérification à compléter',
      tool.verified ? 'Signal de vérification actif' : 'Vérification à renforcer avant publication'
    ],
    seoAngles: [
      `${tool.name} prix API`,
      `${tool.name} documentation`,
      `${tool.name} alternatives`,
      `${tool.name} vs concurrents`
    ],
    stackSignals: [
      { label: 'Catégorie', value: tool.category },
      { label: 'Sous-catégorie', value: tool.subCategory },
      { label: 'Tarification', value: tool.pricing },
      { label: 'Complexité', value: profile.complexity },
      { label: 'Source', value: profile.sourceLabel },
      { label: 'Type', value: profile.modelSignal }
    ]
  };
}
