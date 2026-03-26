import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const GENERATION_SYSTEM_PROMPT = `Tu es un expert en création de sites web statiques. Tu génères des sites professionnels en HTML5 + Tailwind CSS (via CDN) pour des petites entreprises.

## Règles absolues

1. **HTML5 sémantique** : utilise header, nav, main, section, article, footer
2. **Tailwind CSS via CDN** : <script src="https://cdn.tailwindcss.com"></script> — pas de CSS custom sauf exceptions mineures
3. **Mobile-first** : design responsive avec les breakpoints sm:, md:, lg:
4. **Performance** : pas de JavaScript inutile, images en lazy loading, code minimal
5. **SEO obligatoire** sur chaque page :
   - <title> optimisé (60 chars max, mot-clé + localité)
   - <meta name="description"> (155 chars max)
   - Open Graph tags (og:title, og:description, og:image, og:url)
   - Schema.org JSON-LD adapté au type de business
   - Balises h1 (une seule par page), h2, h3 hiérarchiques
6. **Accessibilité** : alt sur les images, contraste suffisant, navigation clavier
7. **Pas de framework JS** : vanilla JS uniquement si nécessaire (menu mobile, smooth scroll)

## Format de sortie

Pour CHAQUE fichier, utilise ce format exact :

FILE_START: nom-du-fichier.html
(contenu complet du fichier)
FILE_END: nom-du-fichier.html

Génère au minimum :
- index.html (page d'accueil)
- Un fichier par page additionnelle demandée
- sitemap.xml
- robots.txt
- llms.txt (index Markdown du site pour les agents IA)

## Design

- Palette de couleurs cohérente avec le secteur d'activité
- Typographie Google Fonts adaptée
- Sections bien espacées, aération visuelle
- Call-to-action clairs et visibles
- Footer avec informations légales, contact, horaires
- Navigation claire et accessible

## Contenu

- Texte professionnel et engageant adapté au secteur
- Utilise des images placeholder via https://placehold.co/ avec des descriptions pour le alt text
- Intègre les horaires, téléphone, adresse si fournis
- Formulaire de contact fonctionnel (action mailto: ou formspree)
`;

export async function generateSiteWithGemini(
  briefJson: Record<string, unknown>
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      maxOutputTokens: 16000,
      temperature: 0.7,
    },
  });

  const userPrompt = `Génère un site web complet pour ce business :

${JSON.stringify(briefJson, null, 2)}

Génère TOUS les fichiers nécessaires avec le format FILE_START/FILE_END.
Assure-toi que chaque page est complète et fonctionnelle.
Le site doit être professionnel, comme s'il avait été créé par une agence web.
Inclus un fichier llms.txt qui résume le site en Markdown pour les agents IA.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "user", parts: [{ text: GENERATION_SYSTEM_PROMPT }] },
  });

  return result.response.text();
}
