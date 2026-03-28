// Claude Sonnet for one-shot landing page generation
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `Tu es un expert en creation de landing pages professionnelles pour TPE/PME francaises.
Tu generes UN SEUL fichier index.html complet, autonome, one-page, avec un design WoW unique et professionnel.

## Architecture technique OBLIGATOIRE

Le fichier DOIT commencer par <!DOCTYPE html> et contenir dans le <head> :
1. <meta charset="UTF-8">
2. <meta name="viewport" content="width=device-width, initial-scale=1.0">
3. <script src="https://cdn.tailwindcss.com"></script>
4. Un bloc <script> configurant tailwind.config avec les couleurs du theme (primary, secondary, accent) et les polices (heading, body) — choisis des couleurs et polices adaptees au secteur d'activite
5. Un <link> Google Fonts important les 2 polices choisies
6. Les meta tags SEO complets : title, description, Open Graph (og:title, og:description, og:type, og:image), Twitter Cards (twitter:card, twitter:title, twitter:description)
7. Un bloc <script type="application/ld+json"> avec Schema.org JSON-LD (LocalBusiness adapte au secteur)

## Sections OBLIGATOIRES (dans cet ordre)

1. **Header/Navigation** : logo texte + menu desktop avec liens ancres + bouton hamburger mobile avec JS inline (toggle menu). Design avec fond semi-transparent ou solide, position sticky.

2. **Hero section** : PLEINE PAGE (min-h-screen) avec gradient de fond spectaculaire ou overlay colore sur image placeholder. Titre accrocheur en tres grand (text-5xl md:text-7xl), sous-titre persuasif, CTA principal bien visible avec hover effect. Le hero doit etre IMPRESSIONNANT.

3. **Section presentation/storytelling** : histoire du business, valeurs, ce qui les rend uniques. Mise en page avec texte + image cote a cote.

4. **Section services/produits** : grille de cartes (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) avec icones SVG inline pertinentes, titres, descriptions. Chaque carte avec shadow-md hover:shadow-xl transition-all.

5. **Section chiffres cles/statistiques** : 3-4 chiffres impressionnants en tres grand (text-4xl md:text-6xl font-bold) avec labels. Fond contraste.

6. **Section temoignages** : 2-3 temoignages dans des cartes stylisees avec guillemets decoratifs SVG, texte du temoignage en italique, nom + role, etoiles (★).

7. **Section formulaire de contact** : formulaire avec validation HTML5 (required, type=email, type=tel). Champs : nom, email, telephone, message. Bouton submit stylise. A cote du formulaire : adresse, telephone, email, horaires du business.

8. **Footer complet** : 3 colonnes (infos business + description courte, horaires detailles, liens rapides + reseaux sociaux avec icones SVG). Copyright en bas.

## Design et animations OBLIGATOIRES

- Responsive mobile-first (sm:, md:, lg:)
- Animations CSS au scroll avec Intersection Observer : les sections apparaissent en fade-in et slide-up quand elles entrent dans le viewport. Inclure le JS et le CSS necessaires.
- Smooth scroll entre sections (scroll-behavior: smooth sur html, ou JS)
- Menu mobile hamburger fonctionnel avec JS inline
- Transitions hover sur tous les elements interactifs (boutons, cartes, liens)
- Espacement genereux entre sections : py-16 md:py-24
- Container : max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

## Images

- Utilise https://placehold.co/ avec dimensions realistes
- Integre les couleurs du theme dans les URLs placehold.co (ex: https://placehold.co/800x600/primary_hex/white)
- N'utilise PAS de slash dans les couleurs hex, juste le code sans #

## Contenu

- TOUT le contenu en FRANCAIS, realiste et specifique au business decrit dans le brief
- JAMAIS de Lorem Ipsum, JAMAIS de texte placeholder generique
- Integre toutes les informations du brief : nom, adresse, telephone, email, horaires, services, etc.
- Les temoignages doivent etre realistes avec des prenoms francais
- Les statistiques doivent etre credibles pour le secteur

## Format de sortie

Reponds UNIQUEMENT avec le code HTML complet entre des balises \`\`\`html et \`\`\`. Rien d'autre avant ou apres.`;

export async function generateLandingPage(
  briefJson: Record<string, unknown>
): Promise<string> {
  const userPrompt = `Genere une landing page one-page complete et professionnelle pour ce business :

${JSON.stringify(briefJson, null, 2)}

RAPPEL IMPORTANT :
- Le HTML doit etre entre \`\`\`html et \`\`\`
- Design WoW unique, pas un template generique
- TOUTES les sections obligatoires (hero pleine page, presentation, services en grille, chiffres cles, temoignages, formulaire contact, footer 3 colonnes)
- Animations au scroll (Intersection Observer)
- Menu hamburger mobile fonctionnel
- Smooth scroll
- SEO complet (meta tags + Schema.org JSON-LD)
- Contenu 100% en francais, specifique a ce business
- Tailwind CSS via CDN avec config inline des couleurs et polices`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 16000,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
}
