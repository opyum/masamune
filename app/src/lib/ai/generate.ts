// Groq API for multi-step site generation (Llama 3.3 70B)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface SitePlan {
  pages: PageSpec[];
  design: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    heading_font: string;
    body_font: string;
    style_notes: string;
  };
  navigation: { label: string; href: string }[];
  seo: {
    site_title: string;
    site_description: string;
    keywords_per_page: Record<string, string[]>;
  };
  header_html: string;
  footer_html: string;
}

interface PageSpec {
  slug: string;
  title: string;
  sections: { type: string; title: string; content_brief: string }[];
}

async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number = 0.7
): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

// ---------------------------------------------------------------------------
// Step 1: Generate site plan
// ---------------------------------------------------------------------------

const PLAN_SYSTEM_PROMPT = `Tu es un architecte web expert specialise dans la creation de sites pour TPE/PME francaises.
Tu produis un plan JSON structure pour un site web statique professionnel.

Le plan doit inclure :
- La liste des pages avec leurs sections detaillees
- Le design (palette en codes HEX, polices adaptees au secteur)
- La navigation
- Les meta SEO par page
- Le header HTML et footer HTML complets en Tailwind CSS

REGLES CRITIQUES pour le header_html et footer_html :
- Utiliser UNIQUEMENT des classes Tailwind CSS standard (bg-white, text-gray-800, etc.) ou des couleurs arbitraires Tailwind avec crochets : bg-[#F7DEB5], text-[#964B00]
- JAMAIS de noms de variables comme bg-primary_color — toujours les VRAIS codes hex entre crochets
- Inclure la navigation avec liens vers toutes les pages
- Le header doit avoir un logo texte, nav desktop, et un bouton hamburger mobile avec JS inline (document.getElementById)
- Le footer doit avoir 3 colonnes : infos business, horaires, liens utiles
- Le HTML doit etre beau et professionnel

Regles de design :
- Polices Google Fonts adaptees au secteur (Restaurant -> Playfair Display + Inter, BTP -> Montserrat + Open Sans, Boulangerie -> Lora + Nunito)
- Palette de 3 couleurs HEX (primary, secondary, accent) derivee du secteur
- Le header doit avoir min-height, espacement genereux, ombres subtiles

Tu dois repondre UNIQUEMENT avec un objet JSON valide, sans markdown, sans backticks, sans texte avant ou apres.`;

export async function generateSitePlan(
  briefJson: Record<string, unknown>
): Promise<SitePlan> {
  const userPrompt = `Genere un plan JSON structure pour ce business :

${JSON.stringify(briefJson, null, 2)}

Le JSON doit avoir cette structure exacte :
{
  "pages": [
    {"slug": "index", "title": "Accueil", "sections": [{"type": "hero", "title": "...", "content_brief": "..."}, {"type": "services", "title": "...", "content_brief": "..."}]},
    {"slug": "services", "title": "Nos services", "sections": [...]},
    {"slug": "contact", "title": "Contact", "sections": [...]}
  ],
  "design": {
    "primary_color": "#...",
    "secondary_color": "#...",
    "accent_color": "#...",
    "heading_font": "...",
    "body_font": "...",
    "style_notes": "..."
  },
  "navigation": [{"label": "Accueil", "href": "index.html"}, ...],
  "seo": {
    "site_title": "...",
    "site_description": "...",
    "keywords_per_page": {"index": ["mot1", "mot2"], ...}
  },
  "header_html": "<header class=\\"...\\">...</header>",
  "footer_html": "<footer class=\\"...\\">...</footer>"
}

IMPORTANT: Reponds UNIQUEMENT avec le JSON, rien d'autre.`;

  const raw = await callGroq(PLAN_SYSTEM_PROMPT, userPrompt, 4000, 0.7);

  // Extract JSON from response (handle potential markdown wrapping)
  let jsonStr = raw.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  return JSON.parse(jsonStr) as SitePlan;
}

// ---------------------------------------------------------------------------
// Step 2: Generate a single page
// ---------------------------------------------------------------------------

const PAGE_SYSTEM_PROMPT = `Tu es un generateur de sites web professionnel. Tu produis UNE page HTML complete et autonome pour un site de TPE/PME francaise.

## Architecture technique OBLIGATOIRE
- HTML5 semantique complet (<!DOCTYPE html> jusqu'a </html>)
- Dans le <head>, TOUJOURS inclure ces 3 elements dans cet ordre :
  1. <script src="https://cdn.tailwindcss.com"></script>
  2. <script>tailwind.config = { theme: { extend: { colors: { primary: '{primary_color}', secondary: '{secondary_color}', accent: '{accent_color}' }}}}</script>
  3. <link href="https://fonts.googleapis.com/css2?family={heading_font}&family={body_font}&display=swap" rel="stylesheet">
- Utilise les classes Tailwind : bg-primary, text-secondary, bg-accent, etc. grace au config inline
- Utilise aussi les couleurs arbitraires Tailwind : bg-[#hex], text-[#hex] quand necessaire
- Mobile-first responsive (sm:, md:, lg:)
- JavaScript vanilla minimal (menu mobile, smooth scroll, validation formulaire)
- Images lazy loading (sauf hero), width/height explicites

## Design professionnel
- Sections bien espacees : py-16 md:py-24 minimum
- Container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Grilles adaptatives : grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- CTA visibles et contrastes avec hover transitions
- Cartes avec ombre douce : shadow-md hover:shadow-lg transition-shadow
- Icones SVG inline pour les services/features
- Temoignages dans des cartes stylisees avec guillemets decoratifs

## Images placeholder
Utilise https://placehold.co/ avec dimensions realistes et couleurs du theme.

## Contenu
- Textes en FRANCAIS, realistes et specifiques au business
- JAMAIS de Lorem Ipsum
- Integre les informations du brief : horaires, telephone, adresse, services
- CTA adaptes au secteur

## Format de sortie OBLIGATOIRE
FILE_START: {slug}.html
(contenu HTML complet)
FILE_END: {slug}.html`;

export async function generatePage(
  briefJson: Record<string, unknown>,
  plan: SitePlan,
  pageSpec: PageSpec
): Promise<string> {
  const pageKeywords = plan.seo.keywords_per_page[pageSpec.slug] || [];

  const userPrompt = `Genere la page "${pageSpec.title}" (${pageSpec.slug}.html) pour ce site.

## Brief client
${JSON.stringify(briefJson, null, 2)}

## Design du site
- Couleur principale : ${plan.design.primary_color}
- Couleur secondaire : ${plan.design.secondary_color}
- Couleur accent : ${plan.design.accent_color}
- Police titres : ${plan.design.heading_font}
- Police corps : ${plan.design.body_font}
- Notes de style : ${plan.design.style_notes}

## Navigation du site
${JSON.stringify(plan.navigation)}

## Header HTML (a copier EXACTEMENT)
${plan.header_html}

## Footer HTML (a copier EXACTEMENT)
${plan.footer_html}

## Page a generer
- Slug : ${pageSpec.slug}
- Titre : ${pageSpec.title}
- Sections :
${pageSpec.sections.map((s) => `  - ${s.type}: ${s.title} — ${s.content_brief}`).join("\n")}

## SEO de cette page
- Titre du site : ${plan.seo.site_title}
- Mots-cles : ${pageKeywords.join(", ")}
- Meta description du site : ${plan.seo.site_description}

## Instructions CRITIQUES
1. La page DOIT commencer par <!DOCTYPE html> et finir par </html>
2. Dans le <head>, inclure OBLIGATOIREMENT :
   - <script src="https://cdn.tailwindcss.com"></script>
   - <script>tailwind.config = { theme: { extend: { colors: { primary: '${plan.design.primary_color}', secondary: '${plan.design.secondary_color}', accent: '${plan.design.accent_color}' }, fontFamily: { heading: ['${plan.design.heading_font}', 'serif'], body: ['${plan.design.body_font}', 'sans-serif'] }}}}</script>
   - <link href="https://fonts.googleapis.com/css2?family=${plan.design.heading_font.replace(/ /g, "+")}&family=${plan.design.body_font.replace(/ /g, "+")}&display=swap" rel="stylesheet">
3. Le BODY doit utiliser class="font-body" et les titres class="font-heading"
4. Copier le header_html et footer_html EXACTEMENT comme fournis
5. Meta tags SEO complets dans le head (title, description, Open Graph)
6. Schema.org JSON-LD adapte au business dans le head
7. Le design doit etre PROFESSIONNEL — sections espacees, couleurs coherentes, hero impactant
8. Images via placehold.co avec les couleurs du theme
9. Contenu en FRANCAIS realiste et specifique au business

Format : FILE_START: ${pageSpec.slug}.html ... FILE_END: ${pageSpec.slug}.html`;

  return await callGroq(PAGE_SYSTEM_PROMPT, userPrompt, 8000, 0.7);
}

// ---------------------------------------------------------------------------
// Step 3: Generate SEO files
// ---------------------------------------------------------------------------

const SEO_SYSTEM_PROMPT = `Tu generes les fichiers SEO techniques pour un site web statique.
Tu dois produire exactement 3 fichiers : sitemap.xml, robots.txt, et llms.txt.

Format de sortie OBLIGATOIRE pour CHAQUE fichier :
FILE_START: nom-du-fichier.ext
(contenu complet)
FILE_END: nom-du-fichier.ext`;

export async function generateSEOFiles(
  briefJson: Record<string, unknown>,
  plan: SitePlan,
  pageNames: string[]
): Promise<string> {
  const userPrompt = `Genere les fichiers SEO pour ce site :

## Business
${JSON.stringify(briefJson, null, 2)}

## Pages du site
${pageNames.map((p) => `- ${p}`).join("\n")}

## SEO info
- Titre : ${plan.seo.site_title}
- Description : ${plan.seo.site_description}

## Fichiers a generer

### 1. sitemap.xml
- Toutes les pages avec priorites correctes (index = 1.0, autres = 0.8)
- URL de base : https://example.com/ (sera remplacee plus tard)
- lastmod : date d'aujourd'hui
- changefreq : monthly

### 2. robots.txt
- Allow all
- Reference le sitemap.xml

### 3. llms.txt (format Markdown pour les agents IA)
\`\`\`markdown
# {Nom du business}

> {Description courte}

## Informations
- Activite : {type}
- Localisation : {ville}
- Contact : {telephone} / {email}
- Horaires : {horaires resumes}

## Pages du site
- [Accueil](index.html) : {description page}
- etc.

## Services proposes
- {Service 1}
- {Service 2}
\`\`\`

Reponds UNIQUEMENT avec les 3 fichiers au format FILE_START/FILE_END.`;

  return await callGroq(SEO_SYSTEM_PROMPT, userPrompt, 2000, 0.7);
}

// Backward-compatible one-shot generation for the existing /api/generate/[siteId] route
export async function generateSiteWithGemini(
  briefJson: Record<string, unknown>
): Promise<string> {
  // Generate plan first, then generate index page as a minimal fallback
  const plan = await generateSitePlan(briefJson);
  const indexPage = plan.pages.find((p) => p.slug === "index") || plan.pages[0];
  return await generatePage(briefJson, plan, indexPage);
}
