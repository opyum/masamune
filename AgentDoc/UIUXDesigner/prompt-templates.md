# Masamune — Prompt Templates pour la generation de design

**Version** : 1.0
**Date** : 2026-03-25

Ce document definit les techniques et templates que Claude Sonnet utilise pour generer des sites web avec un design adapte au secteur du client.

---

## 1. Principes de generation de design

### 1.1 Regles fondamentales injectees dans chaque prompt Sonnet

Ces regles sont TOUJOURS incluses dans le system prompt de generation :

```
REGLES DE DESIGN OBLIGATOIRES :
1. Mobile-first : concevoir pour mobile d'abord, adapter vers desktop
2. Performance : HTML semantique, Tailwind CSS uniquement, zero JS framework cote client
3. Accessibilite : contraste WCAG AA, alt text sur images, navigation clavier, aria-labels
4. SEO : balises semantiques (header, main, nav, section, footer), hierarchie h1>h2>h3
5. Typographie : maximum 2 polices Google Fonts, hierarchie visuelle claire
6. Couleurs : palette 5 couleurs max (primaire, secondaire, accent, texte, fond), coherente avec le secteur
7. Espacement : regulier et genereux, utiliser le systeme Tailwind (p-4, p-6, p-8...)
8. Images : lazy loading, dimensions explicites, format moderne (WebP), object-fit
9. CTA : visible, contrastant, texte oriente action ("Prendre RDV" pas "Cliquer ici")
10. Responsive : 3 breakpoints (mobile, tablette, desktop), pas de scroll horizontal
11. Vitesse : PageSpeed 95+ cible, pas de bibliotheques externes lourdes
12. Confiance : coordonnees visibles, horaires, avis clients, certifications/labels
```

### 1.2 Comment decrire un style visuel a l'IA

Le brief_json contient un champ `style` avec deux sous-champs :
- `tone` : l'ambiance generale (chaleureux, professionnel, moderne, rustique, luxe, fun...)
- `colors_hint` : indication couleur (naturel, ocean, terre, vif, pastel, sombre...)

Le prompt Sonnet transforme ces indices en choix concrets via les templates sectoriels ci-dessous.

### 1.3 Structure du prompt de generation

```
[System] Regles de design obligatoires (section 1.1)
[System] Template sectoriel (section 2.x)
[User] Brief JSON complet
[User] Assets disponibles (liste des images/videos avec descriptions)
[User] Instructions specifiques du client (couleurs, style, references)
```

---

## 2. Templates par secteur

### 2.1 Restaurant / Brasserie / Bar

**Ambiance cible** : chaud, accueillant, appetissant

```
DIRECTIVES DESIGN — RESTAURANT :

Palette couleurs :
- Primaire : tons chauds (bordeaux #7C2D12, terracotta #C2410C, ou vert olive #4D7C0F selon la cuisine)
- Secondaire : creme ou beige (#FDF6E3 ou #F5F0E8)
- Accent : or/dore (#B8860B) pour les touches premium
- Texte : brun fonce (#3E2723) — eviter le noir pur
- Fond : blanc casse ou creme clair

Typographie :
- Headings : police serif elegante (Playfair Display, Cormorant Garamond, ou Libre Baskerville)
- Body : police sans-serif lisible (Inter, Source Sans 3)
- Style : tailles genereuses pour les noms de plats

Mise en page :
- Hero : photo plein ecran du restaurant ou du plat signature, overlay sombre, nom + tagline en blanc
- Section menu : disposition en cards ou grille, categories claires, prix alignes a droite
- Si carte interactive : menu en accordeon par categorie
- Photos : grandes, appetissantes, format paysage, coins arrondis
- Section horaires + adresse : bien visible, icones, lien Google Maps
- CTA principal : "Reserver une table" ou "Commander en ligne" — couleur accent, grande taille

Atmosphere :
- Background textures legeres (papier, lin) si appropriees
- Espacement genereux entre les sections
- Effet parallaxe subtil sur le hero (optionnel)
- Eviter : photos stock generiques, polices trop fantaisistes, animations excessives
```

### 2.2 Artisan / Plombier / Electricien / BTP

**Ambiance cible** : fiable, robuste, professionnel

```
DIRECTIVES DESIGN — ARTISAN :

Palette couleurs :
- Primaire : bleu confiance (#1E40AF), orange travaux (#EA580C), ou vert (#15803D) selon le metier
- Secondaire : gris clair (#F3F4F6)
- Accent : jaune securite (#EAB308) ou orange (#F97316)
- Texte : gris fonce (#1F2937)
- Fond : blanc (#FFFFFF) ou gris tres clair

Typographie :
- Headings : sans-serif bold et impactante (Inter bold, Montserrat bold, Outfit)
- Body : sans-serif claire (Inter, Source Sans 3)
- Style : titres directs et concis, pas de fioritures

Mise en page :
- Hero : photo de l'artisan au travail (ou camionnette/atelier), nom, zone d'intervention, telephone
- Numero de telephone TRES visible (header + hero + footer) — cliquable sur mobile (tel:)
- Section services : icones + descriptions courtes, grille 2x3
- Section "Zone d'intervention" : liste villes/departements, carte si possible
- Section "Pourquoi nous choisir" : badges (assurance, garantie, certif, rapidite)
- Temoignages clients : cards avec etoiles, prenom, ville
- CTA principal : "Demander un devis gratuit" ou "Appeler maintenant"
- Formulaire devis : simple (nom, telephone, description besoin, ville)

Atmosphere :
- Design clean et direct, pas d'effets superflus
- Photos reelles (pas de stock) si disponibles
- Badges de confiance prominents (RGE, Qualibat, assurance decennale...)
- Eviter : design trop "corporate", animations, couleurs vives non justifiees
```

### 2.3 Commerce / Boutique locale

**Ambiance cible** : accueillant, vivant, local

```
DIRECTIVES DESIGN — COMMERCE :

Palette couleurs :
- Primaire : selon le type (vert pour bio/nature, rose pour fleuriste, bleu pour high-tech...)
- Secondaire : beige ou gris clair
- Accent : couleur complementaire vive
- Texte : gris fonce ou brun
- Fond : blanc ou creme

Typographie :
- Headings : sans-serif arrondie et amicale (Nunito, Poppins, Quicksand)
- Body : sans-serif lisible (Inter, Nunito Sans)
- Style : tons accueillants, titres engageants

Mise en page :
- Hero : photo devanture ou interieur boutique, nom, accroche
- Section produits/services : grille de cards avec photos, noms, prix si pertinent
- Horaires d'ouverture : tres visibles, format jour par jour, indiquer jours feries
- Localisation : adresse, plan d'acces, Google Maps embed
- Actualites/evenements : section optionnelle (nouveautes, promotions)
- CTA : "Nous rendre visite" ou "Nous contacter" — selon qu'il y a vente en ligne ou non

Atmosphere :
- Chaleureux et personnel
- Photos de la boutique reelle, des produits, de l'equipe
- Eviter : look trop "e-commerce", design froid/corporate
```

### 2.4 Freelance / Consultant / Coach

**Ambiance cible** : expert, moderne, personnel

```
DIRECTIVES DESIGN — FREELANCE :

Palette couleurs :
- Primaire : bleu nuit (#1E3A5F), violet (#6D28D9), ou vert fonce (#065F46)
- Secondaire : blanc ou gris perle (#F9FAFB)
- Accent : couleur vive contrastante (corail #F97316, turquoise #0D9488)
- Texte : quasi-noir (#111827)
- Fond : blanc pur ou gris ultra-clair

Typographie :
- Headings : sans-serif moderne et nette (Inter semibold, DM Sans, Plus Jakarta Sans)
- Body : meme famille, poids regular
- Style : propre, aere, professionnel sans etre froid

Mise en page :
- Hero : photo professionnelle du freelance, nom, titre, accroche, CTA
- Section "A propos" : parcours, valeurs, approche — ton personnel
- Section services/offres : 3-4 cards avec icones, descriptions, tarifs si souhaite
- Portfolio/realisations : grille de projets avec thumbnails, descriptions au survol
- Temoignages clients : carousel ou grille
- Section contact / reservation RDV : formulaire ou lien Calendly/Cal.com
- CTA principal : "Prendre rendez-vous" ou "Discutons de votre projet"

Atmosphere :
- Personal branding fort : les couleurs et le ton reflètent la personnalite
- Beaucoup d'espace blanc
- Design minimaliste mais chaleureux
- Eviter : design generique, photos stock, trop de texte
```

### 2.5 Salon de coiffure / Beaute / Bien-etre

**Ambiance cible** : elegant, apaisant, soigne

```
DIRECTIVES DESIGN — BEAUTE/BIEN-ETRE :

Palette couleurs :
- Primaire : rose poudre (#E11D48 clair), mauve (#8B5CF6 clair), ou vert sauge (#6B8E6B)
- Secondaire : blanc casse (#FFFBF0) ou rose tres pale (#FFF1F2)
- Accent : dore (#C9A961) ou cuivre (#B87333)
- Texte : gris charbon (#374151)
- Fond : blanc doux ou creme

Typographie :
- Headings : serif elegante (Cormorant Garamond, Libre Baskerville) ou sans-serif fine (Outfit light)
- Body : sans-serif douce (Inter, Nunito Sans)
- Style : lettrage espace (tracking-wide) sur les sous-titres

Mise en page :
- Hero : photo ambiance (salon, soin, produits), nom du salon, accroche, CTA reservation
- Section prestations : liste elegante avec prix, durees, descriptions courtes
- Galerie photos : masonry ou carousel, photos du salon et realisations
- Equipe : photos + prenoms + specialites
- Avis Google/clients : etoiles + verbatims
- CTA principal : "Prendre rendez-vous" — bouton elegant, couleur accent dore

Atmosphere :
- Raffinement et douceur
- Beaucoup d'espace, images grandes, sections bien separees
- Touches de dore ou metallise pour le premium
- Eviter : couleurs criardes, design charge, polices fantaisistes
```

### 2.6 Cabinet medical / Professionnel de sante

**Ambiance cible** : serein, professionnel, rassurant

```
DIRECTIVES DESIGN — SANTE :

Palette couleurs :
- Primaire : bleu sante (#2563EB) ou vert calme (#059669)
- Secondaire : blanc (#FFFFFF)
- Accent : bleu clair (#93C5FD) ou vert menthe (#A7F3D0)
- Texte : gris fonce (#1F2937)
- Fond : blanc pur ou bleu tres pale (#F0F9FF)

Typographie :
- Headings : sans-serif propre et lisible (Inter, Nunito, Open Sans)
- Body : sans-serif identique
- Style : sobre, lisibilite maximale, tailles genereuses

Mise en page :
- Hero : photo du cabinet ou du praticien, nom, specialite, CTA prise de RDV
- Section specialites/actes : icones medicales + descriptions accessibles (pas de jargon)
- Infos pratiques : adresse, telephone, horaires, acces (parking, transport)
- Prise de RDV : lien Doctolib ou formulaire integre
- Section equipe : photos pro + titres + specialites
- Mentions obligatoires : numero RPPS, ordre professionnel

Atmosphere :
- Proprete visuelle absolue
- Bleu et blanc dominants, tres peu de couleurs vives
- Design qui inspire confiance et serenite
- Eviter : design fantaisiste, animations, trop de couleurs
```

---

## 3. Template generique (secteur non-specifique)

Quand le secteur ne correspond a aucun template ci-dessus :

```
DIRECTIVES DESIGN — GENERIQUE :

Palette couleurs :
- Determiner les couleurs en fonction de :
  1. Le ton indique dans le brief (chaleureux → chaud, professionnel → bleu/gris, nature → vert)
  2. L'indication couleur du brief (colors_hint)
  3. En absence d'indication : bleu-gris professionnel (#334155 primaire, #3B82F6 accent)
- Toujours generer une palette de 5 couleurs harmonieuse

Typographie :
- Par defaut : Inter pour headings et body
- Si brief mentionne "elegant/luxe" : Playfair Display headings
- Si brief mentionne "fun/jeune" : Poppins ou Nunito
- Si brief mentionne "tech/moderne" : DM Sans ou Plus Jakarta Sans

Mise en page :
- Hero avec photo/image representative + nom + accroche + CTA
- Sections organisees par importance decroissante
- Coordonnees toujours visibles (header ou premiere section)
- CTA adapte au metier (RDV, devis, contact, commander)
- Footer avec toutes les infos legales et de contact

Atmosphere :
- Privilegier la clarte et la lisibilite
- Design professionnel par defaut, ajuster selon le tone du brief
```

---

## 4. Regles d'injection des assets

Les images et videos uploadees par le client doivent etre integrees intelligemment :

```
REGLES D'INTEGRATION DES ASSETS :

1. LOGO : placer dans le header (coin superieur gauche) + footer. Taille adaptee, max-h-12
2. PHOTOS PRODUITS/SERVICES : integrer dans les sections correspondantes, pas toutes dans une galerie
3. PHOTOS EQUIPE : section "Notre equipe" ou "A propos"
4. PHOTOS LIEU : hero background ou section dediee "Notre espace"
5. PHOTO DEVANTURE : hero ou section localisation
6. Si PAS D'IMAGES du client : utiliser des arriere-plans CSS (gradients, patterns) — NE PAS utiliser d'images stock
7. Alt text : generer un alt text descriptif et SEO-friendly pour chaque image
8. Format : toutes les images en WebP, lazy loading, dimensions responsive (srcset si possible)
9. Placement : ne jamais etirer/deformer, utiliser object-cover ou object-contain selon le contexte
```

---

## 5. Regles SEO injectees dans les prompts

```
REGLES SEO OBLIGATOIRES :

1. <title> : "[Nom business] - [Service principal] a [Ville]" (max 60 caracteres)
2. <meta description> : accroche engageante avec mots-cles (max 160 caracteres)
3. Open Graph : og:title, og:description, og:image, og:url, og:type
4. Twitter Cards : twitter:card, twitter:title, twitter:description, twitter:image
5. Schema.org : type adapte (LocalBusiness, Restaurant, ProfessionalService, Store...)
   Inclure : name, address, telephone, openingHours, geo, image, aggregateRating si avis
6. H1 unique par page, contenant le mot-cle principal
7. Structure H1 > H2 > H3 respectee
8. URLs propres : /services, /contact, /a-propos (pas /page-2)
9. Images : alt text avec mots-cles naturels
10. Liens internes entre les pages (navigation + texte)
11. robots.txt : Allow all
12. sitemap.xml : generer avec toutes les pages
13. Canonical URL sur chaque page
14. lang="fr" sur <html>
15. Viewport meta tag pour responsive
```

---

## 6. Regles de qualite du code genere

```
REGLES DE QUALITE CODE :

1. HTML semantique : <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>
2. Tailwind CSS uniquement — pas de CSS custom inline sauf cas exceptionnel
3. Responsive : tester visuellement mobile (375px), tablette (768px), desktop (1280px)
4. Performance : pas de JS sauf strictement necessaire (menu mobile toggle, accordeon)
5. Pas de frameworks JS cote client (pas de React, Vue, Alpine dans le site genere)
6. Pas de CDN externes (sauf Google Fonts)
7. Formulaire contact : action vers un endpoint Masamune qui relaye par email
8. Google Maps : embed iframe statique (pas JS API)
9. Liens telephone : <a href="tel:+33..."> pour le clic-to-call mobile
10. Liens email : <a href="mailto:...">
11. Favicon : generer un favicon simple basé sur les initiales ou le logo
12. Charset UTF-8, viewport meta
13. Minifier le HTML en production
```

---

## 7. Adaptation du ton de copywriting

Le prompt Sonnet recoit aussi des directives de copywriting selon le secteur :

```
REGLES COPYWRITING PAR SECTEUR :

Restaurant :
- Ton : gourmand, invitant, sensoriel ("Savourez", "Decouvrez nos creations", "Une cuisine qui a du caractere")
- Eviter : "bienvenue sur notre site", descriptions plates

Artisan :
- Ton : direct, rassurant, concret ("Intervention rapide", "Devis gratuit sous 24h", "15 ans d'experience")
- Eviter : superlatifs vides, jargon technique incomprehensible

Commerce :
- Ton : chaleureux, local, personnel ("Depuis 1987 au coeur de Lyon", "Venez nous decouvrir")
- Eviter : formulations trop commerciales, anglicismes

Freelance :
- Ton : expert mais accessible, personnel ("Je vous accompagne", "Mon approche")
- Eviter : ego-trip, CV detaille, langage corporate

Beaute :
- Ton : elegant, doux, aspirationnel ("Prenez soin de vous", "Une parenthese de bien-etre")
- Eviter : promesses irrealistes, vocabulaire medical non autorise

Sante :
- Ton : clair, professionnel, rassurant ("Consultations sur rendez-vous", "A votre ecoute")
- Eviter : promesses de guerison, termes anxiogenes, vocabulaire non reglementaire

Generique :
- Ton : professionnel et humain, adapte au brief
- Eviter : "Bienvenue sur notre site internet", "N'hesitez pas a nous contacter"
```

---

## 8. Prompt template complet (assemble)

Voici la structure finale du prompt envoye a Sonnet pour la generation :

```
SYSTEM:
Tu es un expert en developpement web front-end. Tu generes des sites web vitrine
en HTML statique avec Tailwind CSS. Le site doit etre professionnel, performant,
accessible et optimise pour le SEO.

{REGLES DE DESIGN OBLIGATOIRES — section 1.1}
{TEMPLATE SECTORIEL — section 2.x correspondant au business_type}
{REGLES SEO — section 5}
{REGLES QUALITE CODE — section 6}
{REGLES COPYWRITING — section 7 correspondant au secteur}
{REGLES ASSETS — section 4}

USER:
Voici le brief du site a generer :

```json
{brief_json}
```

Assets disponibles :
{liste des assets avec id, type, description, URL}

Instructions specifiques du client :
{messages additionnels du client concernant le style ou le contenu}

Genere le code HTML complet pour la page "{page_name}".
Le code doit etre autonome (HTML complet avec head et body).
Utilise Tailwind CSS via CDN pour cette generation.
```

### Pour les iterations (modifications)

```
SYSTEM:
Tu es un expert en developpement web front-end. Tu modifies un site existant
en appliquant des changements precis demandes par le client.

{REGLES DE DESIGN OBLIGATOIRES}
{REGLES QUALITE CODE}

USER:
Voici le code actuel de la page :
```html
{code_page_actuelle}
```

Modification demandee par le client :
"{message_client}"

Applique la modification demandee. Retourne UNIQUEMENT le code HTML modifie complet.
Ne change que ce qui est necessaire pour satisfaire la demande.
Conserve le style, la structure et le SEO existants.
```
