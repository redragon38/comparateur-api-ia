/**
 * lib/content.js — Génération de contenu éditorial UNIQUE par page.
 *
 * OBJECTIF SEO : un site programmatique de ~7 700 pages risque le filtrage
 * « contenu pauvre / dupliqué » de Google (Crawlé, actuellement non indexé).
 * Ces helpers produisent, de façon déterministe à partir des données JSON, du
 * texte unique et substantiel (introductions, verdicts, FAQ) pour chaque page
 * comparatif et alternatives — ce qui favorise l'indexation ET les impressions
 * (réponses éligibles aux extraits enrichis / featured snippets).
 */

function lower(value = '') {
  return String(value).toLowerCase();
}

function safeList(arr = [], fallback = []) {
  return arr && arr.length ? arr : fallback;
}

/**
 * Résumé TL;DR auto-suffisant et citable d'une API — pensé pour être extrait
 * et cité tel quel par les assistants IA (Claude, ChatGPT, Gemini).
 * Une seule phrase factuelle contenant : ce que c'est, la catégorie, le prix,
 * les meilleurs usages et les principales alternatives.
 */
export function getToolSummary(tool, alternatives = []) {
  const uses = safeList(tool.useCases, ['l’intégration IA']);
  const altNames = alternatives.map((a) => a.name).filter(Boolean).slice(0, 3);
  const provider = tool.name.includes(' - ') ? tool.name.split(' - ')[0] : null;

  const sentence =
    `${tool.name} est une API ${lower(tool.category)}${tool.subCategory ? ` (${lower(tool.subCategory)})` : ''}` +
    `${provider ? ` proposée par ${provider}` : ''}. ` +
    `Tarification : ${tool.pricing}. Note éditoriale : ${tool.rating}/5. ` +
    `Idéale pour ${lower(uses.slice(0, 3).join(', '))}. ` +
    (altNames.length ? `Principales alternatives : ${altNames.join(', ')}.` : '');

  // Faits clés sous forme de paires (extraction structurée facile pour un LLM).
  const keyFacts = [
    ['Catégorie', `${tool.category}${tool.subCategory ? ` · ${tool.subCategory}` : ''}`],
    ['Tarification', tool.pricing],
    ['Note', `${tool.rating}/5`],
    ['Meilleurs usages', uses.slice(0, 3).join(', ')],
    altNames.length ? ['Alternatives', altNames.join(', ')] : null,
    tool.lastVerified ? ['Dernière vérification', tool.lastVerified] : null,
  ].filter(Boolean);

  return { sentence, keyFacts };
}

/**
 * Contenu unique pour une page de comparaison "X vs Y".
 */
export function getComparisonContent(first, second) {
  const fUse = safeList(first.useCases, ['l’intégration IA']);
  const sUse = safeList(second.useCases, ['l’automatisation']);
  const fFeat = safeList(first.features, ['ses fonctionnalités']);
  const sFeat = safeList(second.features, ['ses fonctionnalités']);

  const samePrice = lower(first.pricing) === lower(second.pricing);
  const ratingGap = Number(first.rating || 0) - Number(second.rating || 0);
  const sameCategory = first.category === second.category;

  const ratingSentence =
    Math.abs(ratingGap) < 0.15
      ? `Les deux API affichent des notes très proches (${first.rating}/5 contre ${second.rating}/5), le choix se joue donc sur les fonctionnalités et le prix.`
      : ratingGap > 0
        ? `${first.name} obtient une note légèrement supérieure (${first.rating}/5 contre ${second.rating}/5), un signal de maturité à confirmer selon votre cas d’usage.`
        : `${second.name} obtient une note légèrement supérieure (${second.rating}/5 contre ${first.rating}/5), à pondérer avec vos besoins réels.`;

  const priceSentence = samePrice
    ? `Côté tarification, les deux solutions suivent un modèle « ${first.pricing} » : comparez surtout les quotas, limites de débit et coûts au volume.`
    : `Côté tarification, ${first.name} fonctionne en « ${first.pricing} » tandis que ${second.name} propose un modèle « ${second.pricing} » : un critère décisif selon votre budget et votre volumétrie.`;

  const categorySentence = sameCategory
    ? `${first.name} et ${second.name} appartiennent à la même catégorie (${first.category}), ce sont donc des alternatives directes que beaucoup d’équipes hésitent à départager.`
    : `${first.name} relève de « ${first.category} » alors que ${second.name} se classe en « ${second.category} » : le comparatif est pertinent quand vos besoins recoupent ces deux domaines.`;

  const intro = `Vous hésitez entre ${first.name} et ${second.name} pour votre projet IA ? Ce comparatif détaillé met face à face leurs prix, fonctionnalités, cas d’usage, avantages et limites pour vous aider à décider rapidement. ${categorySentence} ${ratingSentence} ${priceSentence}`;

  const whenFirst = `Choisissez ${first.name} si votre priorité est ${lower(fUse.slice(0, 2).join(' et '))}. Cette API se distingue notamment par ${lower(fFeat.slice(0, 2).join(' et '))}, et convient aux équipes qui veulent ${lower(fUse[0] || 'intégrer l’IA rapidement')}.`;

  const whenSecond = `Préférez ${second.name} si vous recherchez plutôt ${lower(sUse.slice(0, 2).join(' et '))}. Ses points forts incluent ${lower(sFeat.slice(0, 2).join(' et '))}, ce qui en fait un bon choix pour ${lower(sUse[0] || 'des workflows automatisés')}.`;

  const faq = [
    {
      question: `${first.name} ou ${second.name} : lequel choisir ?`,
      answer: `${first.name} est recommandé pour ${lower(fUse.slice(0, 2).join(' et '))}, tandis que ${second.name} convient mieux à ${lower(sUse.slice(0, 2).join(' et '))}. ${ratingSentence}`,
    },
    {
      question: `Quelle est la différence de prix entre ${first.name} et ${second.name} ?`,
      answer: `${priceSentence} Vérifiez toujours les tarifs officiels, car ils évoluent selon les modèles et le volume d’appels.`,
    },
    {
      question: `${first.name} et ${second.name} sont-ils de vraies alternatives ?`,
      answer: sameCategory
        ? `Oui : tous deux appartiennent à la catégorie ${first.category} et répondent à des besoins similaires, ce qui en fait des alternatives directes.`
        : `Ils se recoupent partiellement : ${first.name} couvre ${lower(first.category)} et ${second.name} ${lower(second.category)}. Comparez-les si votre projet touche aux deux usages.`,
    },
  ];

  return { intro, whenFirst, whenSecond, faq };
}

/**
 * Contenu unique pour une page "Alternatives à X".
 */
export function getAlternativesContent(tool, alternatives = []) {
  const topNames = alternatives.slice(0, 3).map((a) => a.name);
  const uses = safeList(tool.useCases, ['l’intégration IA']);

  const intro = `Vous cherchez une alternative à ${tool.name} ? Que ce soit pour des raisons de prix, de fonctionnalités, de couverture géographique ou de cas d’usage, plusieurs API IA peuvent remplacer ${tool.name} dans la catégorie « ${tool.category} ». ${topNames.length ? `Les alternatives les plus pertinentes incluent ${topNames.join(', ')}.` : ''} Ci-dessous, comparez chaque solution selon sa note, son modèle tarifaire et ses fonctionnalités, puis ouvrez un comparatif direct pour trancher.`;

  const criteria = [
    `Couvre des cas d’usage proches : ${lower(uses.slice(0, 2).join(' et '))}.`,
    `Modèle de prix comparable ou plus avantageux que « ${tool.pricing} ».`,
    `Note et maturité au moins équivalentes à ${tool.name} (${tool.rating}/5).`,
    `Documentation officielle et intégration développeur disponibles.`,
  ];

  const faq = [
    {
      question: `Quelle est la meilleure alternative à ${tool.name} ?`,
      answer: topNames.length
        ? `Parmi les alternatives à ${tool.name}, ${topNames[0]} figure souvent en tête grâce à des cas d’usage proches (${lower(uses.slice(0, 2).join(' et '))}). La « meilleure » dépend toutefois de votre budget, de votre volumétrie et de vos contraintes techniques.`
        : `La meilleure alternative à ${tool.name} dépend de votre cas d’usage (${lower(uses.slice(0, 2).join(' et '))}), de votre budget et de vos contraintes d’intégration.`,
    },
    {
      question: `Existe-t-il une alternative gratuite à ${tool.name} ?`,
      answer: `Certaines API de la catégorie ${tool.category} proposent un palier gratuit ou un essai. Comparez les modèles tarifaires ci-dessus et vérifiez les quotas du palier gratuit sur la documentation officielle de chaque solution.`,
    },
    {
      question: `Comment migrer depuis ${tool.name} vers une alternative ?`,
      answer: `Identifiez les endpoints équivalents, testez l’alternative sur un petit volume, comparez le format des réponses, puis basculez progressivement en surveillant coûts, latence et qualité des sorties.`,
    },
  ];

  return { intro, criteria, faq };
}
