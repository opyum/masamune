# Prompts SEO — Masamune

Prompts dedies aux taches SEO automatisees dans le pipeline Masamune.

---

## 1. Generation de sitemap.xml

```
Genere un fichier sitemap.xml valide pour un site web statique.

## Input
- domain : {domain} (ex: "boulangerie-dupont.masamune.app" ou "boulangerie-dupont.fr")
- pages : {pages_list} (liste des pages avec leurs slugs)
- last_modified : {last_modified_date} (date de derniere modification au format YYYY-MM-DD)

## Regles
1. Format XML conforme au protocole Sitemaps 0.9 (https://www.sitemaps.org/protocol.html)
2. Chaque page du site a une entree <url>
3. La page d'accueil (index.html) est listee comme "/" (pas "/index.html")
4. Les autres pages sont listees sans l'extension .html (ex: "/services" pas "/services.html")
5. <lastmod> au format YYYY-MM-DD
6. <changefreq> : "monthly" pour toutes les pages sauf accueil ("weekly")
7. <priority> : 1.0 pour l'accueil, 0.8 pour les pages principales, 0.6 pour les pages secondaires
8. URL canonique avec https:// et sans trailing slash (sauf la racine)

## Output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://{domain}/</loc>
    <lastmod>{last_modified_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- une entree par page -->
</urlset>
```
```

---

## 2. Meta tags optimises par page

```
Tu es un expert SEO francais specialise dans le referencement local des TPE/PME. Genere les meta tags HTML optimises pour chaque page du site.

## Input
- brief_json : {brief_json}
- domain : {domain}
- pages : {pages_list}

## Pour chaque page, genere le bloc HTML complet a inserer dans le <head> :

### Title tag
- Max 60 caracteres (Google tronque au-dela)
- Format page accueil : "[Activite] a [Ville] - [Nom business]"
- Format autres pages : "[Contenu page] | [Nom business]"
- Le mot-cle principal dans les 3 premiers mots

### Meta description
- Exactement entre 150 et 160 caracteres
- Inclure : mot-cle principal + localite + benefice ou CTA
- Phrase naturelle qui donne envie de cliquer
- Unique par page (zero duplication)

### Canonical
- URL absolue canonique de la page

### Viewport et charset
- <meta charset="UTF-8">
- <meta name="viewport" content="width=device-width, initial-scale=1.0">

### Robots
- <meta name="robots" content="index, follow">

### Open Graph
- og:title : titre optimise pour le partage social (max 90 chars, peut differer du title)
- og:description : max 200 chars, descriptif et engageant
- og:url : URL canonique
- og:type : "website" pour accueil, "article" pour pages de contenu
- og:image : URL de l'image la plus representative (1200x630px recommande)
- og:locale : "fr_FR"
- og:site_name : nom du business

### Twitter Card
- twitter:card : "summary_large_image"
- twitter:title : identique a og:title
- twitter:description : identique a og:description
- twitter:image : identique a og:image

## Output par page

```html
<!-- SEO Meta Tags - Page: {page_name} -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title_tag}</title>
<meta name="description" content="{meta_description}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://{domain}/{slug}">

<!-- Open Graph -->
<meta property="og:title" content="{og_title}">
<meta property="og:description" content="{og_description}">
<meta property="og:url" content="https://{domain}/{slug}">
<meta property="og:type" content="{og_type}">
<meta property="og:image" content="{og_image_url}">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="{business_name}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{og_title}">
<meta name="twitter:description" content="{og_description}">
<meta name="twitter:image" content="{og_image_url}">
```

## Contraintes
- Pas de keyword stuffing
- Chaque title et description UNIQUE entre les pages
- Inclure la localite au minimum sur accueil et contact
- Phrases naturelles, pas de listes de mots-cles
```

---

## 3. Schema.org (JSON-LD)

```
Tu es un expert en donnees structurees Schema.org. Genere les blocs JSON-LD a inserer dans le <head> de chaque page du site.

## Input
- brief_json : {brief_json}
- domain : {domain}
- business_type : {business_type}
- pages : {pages_list}

## Schemas a generer

### Page d'accueil — Schema principal (LocalBusiness ou sous-type)

Mapping des types :
- restaurant, bar, cafe -> Restaurant
- boulangerie, patisserie -> Bakery
- plombier -> Plumber
- electricien -> Electrician
- artisan_btp -> HomeAndConstructionBusiness
- coiffeur -> HairSalon
- beaute, esthetique -> BeautySalon
- freelance, consultant -> ProfessionalService
- commerce, boutique, magasin -> Store
- medecin -> Physician
- dentiste -> Dentist
- kine, osteopathe, paramedical -> MedicalBusiness
- autre -> LocalBusiness

Proprietes :

```json
{
  "@context": "https://schema.org",
  "@type": "{SchemaType}",
  "@id": "https://{domain}/#organization",
  "name": "{business_name}",
  "description": "{business_description}",
  "url": "https://{domain}/",
  "telephone": "{phone}",
  "email": "{email}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{address}",
    "addressLocality": "{city}",
    "postalCode": "{postal_code}",
    "addressRegion": "{region}",
    "addressCountry": "FR"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Monday",
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "image": "{main_image_url}",
  "logo": "{logo_url}",
  "priceRange": "{price_range}",
  "sameAs": ["{social_url_1}", "{social_url_2}"]
}
```

### Page d'accueil — WebSite

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{business_name}",
  "url": "https://{domain}/"
}
```

### Toutes les pages sauf accueil — BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://{domain}/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "{page_title}",
      "item": "https://{domain}/{page_slug}"
    }
  ]
}
```

### Schemas specifiques par secteur (si donnees disponibles)

#### Restaurant avec menu
```json
{
  "@context": "https://schema.org",
  "@type": "Menu",
  "name": "La Carte",
  "hasMenuSection": [
    {
      "@type": "MenuSection",
      "name": "Entrees",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "{dish_name}",
          "description": "{dish_description}",
          "offers": {
            "@type": "Offer",
            "price": "{price}",
            "priceCurrency": "EUR"
          }
        }
      ]
    }
  ]
}
```

#### Services avec tarifs
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{service_name}",
  "description": "{service_description}",
  "provider": { "@id": "https://{domain}/#organization" },
  "areaServed": {
    "@type": "City",
    "name": "{city}"
  },
  "offers": {
    "@type": "Offer",
    "price": "{price}",
    "priceCurrency": "EUR"
  }
}
```

#### Medical
```json
{
  "@context": "https://schema.org",
  "@type": "Physician",
  "medicalSpecialty": "{specialty}",
  "isAcceptingNewPatients": true,
  "availableService": [
    {
      "@type": "MedicalProcedure",
      "name": "{procedure_name}"
    }
  ]
}
```

## Regles
1. JSON-LD valide et testable sur Google Rich Results Test
2. Ne jamais inventer de donnees absentes du brief
3. Si une propriete n'a pas de valeur, l'omettre (pas de valeur vide)
4. Utiliser le type Schema.org le plus specifique possible
5. Les URLs doivent utiliser le domaine reel du site
6. openingHoursSpecification : une entree par jour, omettre les jours fermes
7. Un seul @id par entite pour permettre les references croisees
```

---

## 4. Analyse concurrentielle et mots-cles

```
Tu es un expert SEO local specialise dans le marche francais des TPE/PME. Analyse la concurrence et identifie les opportunites de mots-cles pour un site web.

## Input
- business_type : {business_type}
- business_name : {business_name}
- city : {city}
- region : {region}
- services : {services_list}
- current_keywords : {target_keywords}

## Analyse demandee

### 1. Mots-cles principaux (5-10)
Pour chaque mot-cle :
- Le mot-cle exact
- L'intention de recherche (informationnelle, transactionnelle, navigationnelle)
- Volume estime (eleve, moyen, faible)
- Difficulte estimee (facile, moyen, difficile)
- Page cible recommandee sur le site

### 2. Mots-cles longue traine (10-15)
Mots-cles de 3+ mots, plus specifiques, plus faciles a positionner.
Exemples de patterns :
- "[service] [ville]"
- "[service] pas cher [ville]"
- "meilleur [service] [ville]"
- "[service] avis [ville]"
- "[service] ouvert [moment]"
- "[service] a proximite"

### 3. Mots-cles concurrents (5)
Mots-cles que les concurrents ciblent et que le site devrait aussi viser.

### 4. Opportunites locales
- Mots-cles specifiques au quartier / arrondissement si grande ville
- Mots-cles saisonniers (si applicable au secteur)
- Mots-cles lies aux evenements locaux

### 5. Recommandations de contenu
Pour chaque page du site, indiquer :
- Mot-cle principal a cibler
- Mots-cles secondaires a integrer naturellement
- Densite recommandee (nombre d'occurrences naturelles)
- Questions frequentes a adresser (People Also Ask)

## Output format

```json
{
  "primary_keywords": [
    {
      "keyword": "...",
      "intent": "transactional|informational|navigational",
      "volume": "high|medium|low",
      "difficulty": "easy|medium|hard",
      "target_page": "slug de la page"
    }
  ],
  "long_tail_keywords": ["..."],
  "competitor_keywords": ["..."],
  "local_opportunities": ["..."],
  "page_recommendations": {
    "index": {
      "primary_keyword": "...",
      "secondary_keywords": ["..."],
      "faq_questions": ["..."]
    }
  }
}
```

## Contraintes
- Tous les mots-cles en francais
- Privilegier les mots-cles avec intention transactionnelle (le client cherche un prestataire)
- Inclure systematiquement la localite dans les mots-cles
- Pas de mots-cles generiques sans localite (trop concurrentiels pour une TPE)
- Privilegier la pertinence a la quantite
```

---

## 5. Open Graph tags

```
Tu es un expert en optimisation du partage social. Genere les Open Graph tags pour maximiser l'impact visuel et les clics quand le site est partage sur Facebook, LinkedIn, WhatsApp ou Twitter.

## Input
- brief_json : {brief_json}
- domain : {domain}
- pages : {pages_list}
- assets : {assets_list}

## Pour chaque page, genere :

### og:title
- Max 90 caracteres
- Plus accrocheur que le title SEO (on cherche le clic social, pas le positionnement)
- Inclure un benefice ou une emotion
- Exemples :
  - SEO title : "Plombier a Lyon - Dupont Plomberie"
  - OG title : "Depannage plomberie a Lyon en 1h - Dupont Plomberie"

### og:description
- Max 200 caracteres
- Descriptif et engageant (l'utilisateur voit ca dans l'apercu du lien)
- Inclure un CTA implicite

### og:image
- Si le client a un asset adapte (min 1200x630px), l'utiliser
- Sinon, recommander une image a generer ou un placeholder avec le logo + couleurs de marque
- Format recommande : 1200x630px, ratio 1.91:1
- Eviter le texte sur l'image (reduit la portee sur Facebook)

### og:type
- "website" pour la page d'accueil
- "article" pour les pages de contenu (services, a propos)
- "place" pour la page contact (avec localisation)

### og:locale
- "fr_FR"

### og:url
- URL canonique absolue de la page

### og:site_name
- Nom du business

## Output par page

```html
<!-- Open Graph - {page_name} -->
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="https://{domain}/images/{image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{alt_text}">
<meta property="og:url" content="https://{domain}/{slug}">
<meta property="og:type" content="{type}">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="{business_name}">
```

## Contraintes
- Chaque page a des OG tags uniques
- L'image OG doit exister (pas d'URL fictive sans asset correspondant)
- Le title OG peut differer du title SEO (objectifs differents)
- Tester la validite avec Facebook Sharing Debugger et Twitter Card Validator
```

---

## Notes d'integration backend

### Ordre d'execution des prompts SEO dans le pipeline

1. **A la generation (Worker, synchrone avec la generation du site)**
   - Le prompt Sonnet Generation inclut deja les meta tags, Schema.org et sitemap
   - Les prompts SEO ci-dessus servent de reference et de validation

2. **Post-generation (Worker, async)**
   - Prompt analyse concurrentielle -> stocke les resultats dans `sites.seo_config`
   - Soumission sitemap a Google Search Console et Bing Webmaster

3. **A chaque iteration**
   - Le prompt Sonnet Iteration verifie et met a jour les meta tags si necessaire
   - Regeneration du sitemap.xml si ajout/suppression de page

4. **Monitoring periodique (Pro/Business, cron hebdomadaire)**
   - Prompt analyse concurrentielle relance pour suivre l'evolution
   - Resultats compares aux precedents, alertes si regression

### Stockage des donnees SEO

Les resultats SEO sont stockes dans `sites.seo_config` (JSONB) :

```json
{
  "meta_tags": { "index": { "title": "...", "description": "..." } },
  "schema_org": { "main": { ... }, "breadcrumbs": { ... } },
  "keywords": { "primary": [...], "long_tail": [...] },
  "competitors": { "analyzed_at": "2026-03-25", "results": [...] },
  "sitemap_url": "https://domain/sitemap.xml",
  "search_console_verified": false,
  "bing_webmaster_verified": false
}
```
