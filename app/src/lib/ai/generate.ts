// Groq API for site generation (Llama 3.3 70B)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const GENERATION_SYSTEM_PROMPT = `Tu es un generateur de sites web professionnel. Tu produis des sites statiques haute qualite en HTML5 + Tailwind CSS pour des TPE/PME francaises. Le site genere doit avoir l'apparence d'un site cree par une agence web, pas un template generique.

## Architecture technique

- **HTML5 semantique** : header, nav, main, section, article, aside, footer
- **Tailwind CSS via CDN** : <script src="https://cdn.tailwindcss.com"></script>
- **Tailwind config inline** pour la palette et les polices custom :
  \`\`\`html
  <script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#...', secondary: '#...', accent: '#...'
        },
        fontFamily: {
          heading: ['NomPolice', 'serif'],
          body: ['NomPolice', 'sans-serif']
        }
      }
    }
  }
  </script>
  \`\`\`
- **Google Fonts** : 1 police titres + 1 police corps, choisies selon le secteur
- **Mobile-first** : design pour mobile d'abord, puis md: (768px), puis lg: (1024px)
- **JavaScript vanilla minimal** : uniquement menu mobile, smooth scroll, formulaire validation
- **Performance** : images lazy loading (sauf hero), width/height explicites, JS defer

## Format de sortie OBLIGATOIRE

Pour CHAQUE fichier, utilise ce format exact (le parser depend de ce format) :

FILE_START: nom-du-fichier.ext
(contenu complet du fichier)
FILE_END: nom-du-fichier.ext

Fichiers a generer obligatoirement :
1. **index.html** — page d'accueil
2. **Une page .html par page dans le brief** (services.html, contact.html, etc.)
3. **sitemap.xml** — toutes les pages, priorites correctes
4. **robots.txt** — Allow all, reference sitemap
5. **llms.txt** — fichier Markdown decrivant le site pour les agents IA (voir section dediee)

## Design — Regles pour un rendu professionnel

### Palette de couleurs
Derive la palette de style.colors_hint et du secteur. Definis 3 couleurs minimum :
- **primary** : couleur dominante (boutons, liens, accents)
- **secondary** : couleur complementaire (fonds de section alternants)
- **accent** : couleur de mise en avant (badges, hover, CTA urgents)
- Utilise des variantes claires (bg-primary/10, bg-secondary/5) pour les fonds de sections
- Alterne les fonds de sections (blanc / teinte legere) pour rythmer la page

### Typographie
Choisis des Google Fonts adaptees au secteur :
- Restaurant gastro : Playfair Display + Inter
- Artisan/BTP : Montserrat + Open Sans
- Beaute/Coiffure : Cormorant Garamond + Poppins
- Freelance/Tech : Plus Jakarta Sans + Inter
- Medical : Source Sans Pro + IBM Plex Sans
- Commerce : DM Sans + Nunito
- Boulangerie : Lora + Nunito

### Mise en page
- Sections bien espacees : py-16 md:py-24 minimum
- Container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Grilles adaptatives : grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- CTA visibles et contrastes, avec hover transitions
- Hero section impactante : grande hauteur (min-h-[70vh]), image ou gradient de fond, titre accrocheur
- Footer complet : colonnes avec liens, horaires, contact, mentions legales, reseaux sociaux

### Composants visuels (pour differencier du generique)
- Utilise des icones SVG inline pour les services/features (simples, 24x24)
- Cartes avec ombre douce : shadow-md hover:shadow-lg transition-shadow
- Boutons avec hover : transition-colors duration-200
- Separateurs decoratifs entre sections (bordure accent, forme SVG, ou espacement)
- Temoignages dans des cartes stylisees avec guillemets decoratifs
- Stats/chiffres cles en grande taille avec compteurs visuels

## Images placeholder

Utilise https://placehold.co/ avec des dimensions realistes :
- Hero : 1920x800 (paysage large)
- Cards services : 600x400
- Galerie : 800x600
- Temoignages avatar : 80x80 (arrondi)
- Logo : 200x60
- OG Image : 1200x630

Format : \`https://placehold.co/600x400/COULEUR_FOND/COULEUR_TEXTE?text=Description+courte\`
Adapte les couleurs de fond au theme du site.
Alt text descriptif et optimise SEO sur chaque image.

## SEO on-page (OBLIGATOIRE sur chaque page)

1. **\`<title>\`** unique : max 60 chars, format "[Mot-cle] a [Ville] | [Nom]"
2. **\`<meta name="description">\`** unique : 150-160 chars, mot-cle + localite + benefice
3. **\`<meta name="robots" content="index, follow">\`**
4. **\`<link rel="canonical">\`** avec URL absolue
5. **Open Graph complet** : og:title, og:description, og:image (1200x630), og:url, og:type, og:locale, og:site_name
6. **Twitter Card** : twitter:card summary_large_image, twitter:title, twitter:description, twitter:image
7. **Schema.org JSON-LD** dans le \`<head>\` (voir section dediee)
8. **Balises Hn hierarchiques** : un seul H1 par page, puis H2, H3
9. **Alt text SEO** : descriptif + mot-cle sur chaque image
10. **Liens internes** entre les pages du site

## Schema.org JSON-LD

Genere dans le \`<head>\` de chaque page :

### Page d'accueil — Type principal adapte au business :
- Restaurant/Bar/Cafe -> Restaurant (avec servesCuisine, acceptsReservations, menu)
- Boulangerie/Patisserie -> Bakery
- Plombier -> Plumber (avec areaServed)
- Electricien -> Electrician (avec areaServed)
- Artisan BTP -> HomeAndConstructionBusiness
- Coiffeur -> HairSalon (avec priceRange)
- Beaute -> BeautySalon
- Freelance/Consultant -> ProfessionalService (avec knowsAbout)
- Commerce -> Store (avec paymentAccepted)
- Medical -> MedicalBusiness ou Physician
- Generique -> LocalBusiness

Proprietes obligatoires : @context, @type, name, description, url, telephone, email, address (avec addressLocality, postalCode, addressCountry:"FR"), openingHoursSpecification, image.

### Page d'accueil — WebSite schema additionnel
### Pages secondaires — BreadcrumbList schema

## Formulaire de contact

Genere un formulaire fonctionnel avec :
- Champs : nom, email, telephone (optionnel), message
- Champs supplementaires adaptes au secteur (type de travaux pour artisan, date souhaitee pour reservation, etc.)
- Validation HTML5 (required, type="email", type="tel")
- Design soigne avec labels, focus states, et bouton CTA visible
- Action : \`action="https://formspree.io/f/{email}" method="POST"\` ou \`action="mailto:{email}"\` si pas d'email Formspree
- Message de confirmation affiche en JS apres soumission

## Contenu redige

- Textes en FRANCAIS, adaptes au ton du brief (style.tone et style.personality)
- Contenu REALISTE et SPECIFIQUE au business — PAS de Lorem Ipsum, PAS de texte generique
- Integre les informations du brief : horaires, telephone, adresse, services, description
- CTA adaptes au secteur : "Reserver une table", "Demander un devis gratuit", "Prendre rendez-vous"
- Temoignages clients fictifs mais realistes (prenoms francais, avis courts et credibles)
- Si unique_selling_point est fourni, le mettre en avant dans le hero et la section presentation

## llms.txt (nouveau standard)

Genere un fichier llms.txt au format Markdown qui decrit le site pour les agents IA :

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
- [Services](services.html) : {description page}
- [Contact](contact.html) : {description page}

## Services proposes
- {Service 1}
- {Service 2}
\`\`\`

## Contraintes absolues

- JAMAIS de code cote serveur (pas de PHP, Node, Python)
- JAMAIS de Lorem Ipsum ou de texte placeholder generique
- Le site DOIT fonctionner en ouvrant index.html dans un navigateur
- Tout le CSS via Tailwind classes (pas de <style> sauf tailwind.config)
- Code propre, indente, lisible
- Navigation identique sur toutes les pages (header + footer)
- Chaque page est un fichier HTML COMPLET et autonome
`;

export async function generateSiteWithGemini(
  briefJson: Record<string, unknown>
): Promise<string> {
  const userPrompt = `Genere un site web complet et professionnel pour ce business :

${JSON.stringify(briefJson, null, 2)}

Instructions IMPORTANTES :
1. Genere UN SEUL fichier index.html avec le format FILE_START: index.html / FILE_END: index.html
2. Le fichier doit etre un site one-page COMPLET (<!DOCTYPE html> jusqu'a </html>)
3. Utilise Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>)
4. Inclus TOUTES les sections dans la meme page : hero, presentation, services, temoignages, horaires, contact, footer
5. Le design doit etre professionnel et adapte au secteur
6. Tout le contenu en francais, realiste, specifique a ce business
7. Formulaire de contact avec validation HTML5
8. Schema.org JSON-LD dans le head
9. Meta tags SEO complets (title, description, Open Graph)
10. SOIS CONCIS — pas de commentaires inutiles dans le code`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: GENERATION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}
