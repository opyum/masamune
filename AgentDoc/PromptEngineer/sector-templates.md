# Templates par Secteur — Masamune

Templates de brief_json pre-remplis et guides de questions par secteur d'activite. Ces templates servent de reference au prompt Haiku pour adapter ses questions et au prompt Sonnet pour calibrer la generation.

---

## 1. Restaurant / Bar / Cafe

### Questions specifiques Haiku

1. "Quel type de cuisine proposez-vous ?" (exemples adaptes : francaise traditionnelle, italienne, asiatique, burger, bistronomique...)
2. "Avez-vous une carte ou un menu a partager ? Vous pouvez m'envoyer une photo ou un PDF."
3. "Proposez-vous la reservation en ligne, par telephone, ou les deux ?"
4. "Avez-vous une terrasse, un espace privatisable, ou d'autres atouts a mettre en avant ?"
5. "Quel est l'ambiance de votre etablissement ?" (exemples : convivial et familial, gastro et chic, decontracte et branche...)

### Pages recommandees

| Page | Sections |
|------|----------|
| Accueil | Hero avec photo du restaurant, presentation, specialites, horaires, CTA reservation |
| La Carte | Menu complet avec categories (entrees, plats, desserts, boissons), prix |
| A propos | Histoire, equipe, philosophie, producteurs locaux |
| Contact | Formulaire reservation, carte Google Maps, horaires, telephone |
| Galerie | Photos du restaurant, plats, ambiance |

### Features suggerees

- Menu/carte en ligne avec prix
- Bouton de reservation (telephone ou lien externe type LaFourchette/TheFork)
- Horaires d'ouverture avec jours feries
- Galerie photo (plats, salle, terrasse)
- Google Maps integre
- Avis clients

### Style recommande

| Element | Recommandation |
|---------|---------------|
| Palette | Tons chauds (bordeaux, creme, dore) pour bistrot ; noir/blanc/accent pour gastro ; couleurs vives pour fast-casual |
| Typographie | Serif elegant pour gastro (Playfair Display), sans-serif moderne pour casual (Inter, DM Sans) |
| Ton | Appetissant, accueillant, genereux |
| Images | Photos des plats en gros plan, ambiance salle, equipe en cuisine |

### Schema.org

```json
{
  "@type": "Restaurant",
  "servesCuisine": "Type de cuisine",
  "menu": "URL de la page carte",
  "acceptsReservations": "True",
  "priceRange": "€€"
}
```

### Mots-cles SEO types

- `restaurant [type cuisine] [ville]`
- `ou manger [ville]`
- `restaurant terrasse [ville]`
- `menu restaurant [nom] [ville]`
- `reservation restaurant [ville]`

---

## 2. Boulangerie / Patisserie

### Questions specifiques Haiku

1. "Quelles sont vos specialites ? (pain au levain, viennoiseries, patisseries, traiteur...)"
2. "Proposez-vous des commandes speciales ? (gateaux d'anniversaire, pieces montees, commandes en gros)"
3. "Avez-vous plusieurs boutiques ou un seul point de vente ?"
4. "Faites-vous de la livraison ou du click & collect ?"
5. "Qu'est-ce qui rend votre boulangerie speciale ? (fait maison, bio, recettes de famille...)"

### Pages recommandees

| Page | Sections |
|------|----------|
| Accueil | Hero avec vitrine/produits, presentation, specialites du jour, horaires, localisation |
| Nos Produits | Catalogue par categorie (pains, viennoiseries, patisseries, traiteur), photos, descriptions |
| Commandes | Gateaux sur commande, pieces montees, delais, formulaire |
| Contact | Adresse, horaires, telephone, Google Maps |

### Features suggerees

- Catalogue produits avec photos
- Formulaire de commande speciale
- Horaires (ouverture tot le matin)
- Click & collect si propose
- Galerie des realisations (gateaux, pieces montees)

### Style recommande

| Element | Recommandation |
|---------|---------------|
| Palette | Tons pain (beige, brun, creme, dore), accent chaleureux (terracotta) |
| Typographie | Serif chaleureux (Lora) + sans-serif lisible (Nunito) |
| Ton | Artisanal, authentique, gourmand |
| Images | Pains en gros plan, vitrine garnie, gestes du boulanger |

### Schema.org

```json
{
  "@type": "Bakery",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Nos produits"
  }
}
```

### Mots-cles SEO types

- `boulangerie [ville]`
- `patisserie artisanale [ville]`
- `pain au levain [ville]`
- `gateau anniversaire [ville]`
- `boulangerie ouverte dimanche [ville]`

---

## 3. Plombier / Electricien / Artisan BTP

### Questions specifiques Haiku

1. "Quels types de travaux proposez-vous ?" (exemples selon le metier : depannage, installation, renovation, entretien...)
2. "Quelle est votre zone d'intervention ? (ville, departement, rayon en km)"
3. "Avez-vous des certifications ou labels ? (RGE, Qualibat, QualiPAC...)"
4. "Proposez-vous un service d'urgence / depannage rapide ?"
5. "Avez-vous des photos de chantiers ou de realisations a montrer ?"

### Pages recommandees

| Page | Sections |
|------|----------|
| Accueil | Hero avec photo chantier, services principaux, zone d'intervention, CTA devis, urgences |
| Services | Liste detaillee des prestations, descriptions, fourchettes tarifaires |
| Realisations | Galerie avant/apres, descriptions de chantiers |
| Devis | Formulaire de demande de devis (type de travaux, adresse, description, urgence) |
| Contact | Telephone (gros bouton cliquable), zone d'intervention carte, horaires |

### Features suggerees

- Formulaire de demande de devis detaille
- Numero de telephone cliquable (click-to-call)
- Zone d'intervention sur carte
- Galerie avant/apres
- Certifications et labels affiches
- Bandeau urgence / depannage 7j/7

### Style recommande

| Element | Recommandation |
|---------|---------------|
| Palette | Bleu confiance + orange/jaune energie, ou vert pour eco/RGE |
| Typographie | Sans-serif robuste (Montserrat, Work Sans) |
| Ton | Fiable, reactif, professionnel, de proximite |
| Images | Photos de chantiers, artisan au travail, avant/apres |

### Schema.org

```json
{
  "@type": "Plumber|Electrician|HomeAndConstructionBusiness",
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": { "@type": "GeoCoordinates", "latitude": "...", "longitude": "..." },
    "geoRadius": "30 km"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Nos services"
  }
}
```

### Mots-cles SEO types

- `plombier [ville]` / `electricien [ville]`
- `depannage plomberie [ville]`
- `devis [metier] [ville]`
- `[metier] urgence [ville]`
- `renovation [type] [ville]`
- `artisan RGE [ville]`

---

## 4. Coiffeur / Institut de beaute

### Questions specifiques Haiku

1. "Quelles prestations proposez-vous ?" (coupe, coloration, lissage, soins, ongles, massages...)
2. "Travaillez-vous avec des marques specifiques ? (L'Oreal Pro, Kerastase, Aveda...)"
3. "Proposez-vous la prise de rendez-vous en ligne ?"
4. "Avez-vous une carte de fidelite ou des offres speciales ?"
5. "Quelle est l'ambiance de votre salon ?" (cosy, luxe, tendance, naturel...)

### Pages recommandees

| Page | Sections |
|------|----------|
| Accueil | Hero avec photo du salon, presentation, prestations phares, CTA rendez-vous |
| Prestations & Tarifs | Catalogue complet avec prix (femme, homme, enfant), durees |
| Galerie | Avant/apres, ambiance salon, equipe |
| Rendez-vous | Lien vers plateforme de reservation ou formulaire |
| Contact | Adresse, horaires, telephone, Google Maps |

### Features suggerees

- Grille tarifaire complete (par categorie)
- Prise de rendez-vous (lien Planity, Treatwell, ou formulaire)
- Galerie avant/apres
- Presentation de l'equipe
- Marques et produits utilises
- Carte de fidelite / offres

### Style recommande

| Element | Recommandation |
|---------|---------------|
| Palette | Rose poudre / nude / dore pour feminin ; noir/blanc/gris pour unisexe ; vert pour naturel/bio |
| Typographie | Elegant (Cormorant Garamond) + moderne (Poppins) |
| Ton | Soigne, tendance, bienveillant |
| Images | Photos du salon, avant/apres, produits, equipe souriante |

### Schema.org

```json
{
  "@type": "HairSalon|BeautySalon",
  "priceRange": "€€",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Nos prestations",
    "itemListElement": [
      { "@type": "Offer", "name": "Coupe femme", "price": "35", "priceCurrency": "EUR" }
    ]
  }
}
```

### Mots-cles SEO types

- `coiffeur [ville]` / `salon de coiffure [ville]`
- `coloration [ville]`
- `institut de beaute [ville]`
- `tarif coiffeur [ville]`
- `coiffeur sans rendez-vous [ville]`

---

## 5. Freelance / Consultant

### Questions specifiques Haiku

1. "Quelle est votre expertise ? (developpement web, marketing, comptabilite, coaching, design...)"
2. "Qui sont vos clients types ? (startups, PME, grands comptes, particuliers...)"
3. "Avez-vous des realisations ou des cas clients a montrer ?"
4. "Comment vos clients vous contactent-ils en general ? (email, appel decouverte, formulaire...)"
5. "Quel message souhaitez-vous faire passer en priorite ? (expertise technique, approche humaine, resultats chiffres...)"

### Pages recommandees

| Page | Sections |
|------|----------|
| Accueil | Hero avec proposition de valeur, services, chiffres cles, temoignages, CTA |
| Services | Detail des prestations, methodologie, fourchettes tarifaires |
| Portfolio / Realisations | Cas clients, avant/apres, resultats chiffres |
| A propos | Parcours, competences, valeurs, certifications |
| Contact | Formulaire, lien calendrier (Calendly), reseaux sociaux |

### Features suggerees

- Portfolio / cas clients
- Temoignages avec noms et entreprises
- Lien vers prise de RDV (Calendly, Cal.com)
- Chiffres cles (X clients, Y ans d'experience, Z projets)
- Liens reseaux sociaux (LinkedIn)
- Blog / articles (optionnel V2)

### Style recommande

| Element | Recommandation |
|---------|---------------|
| Palette | Bleu marine + blanc (confiance) ; noir + accent colore (design/creatif) ; vert (eco/coaching) |
| Typographie | Moderne et pro (Inter, Plus Jakarta Sans) |
| Ton | Expert mais accessible, oriente resultats |
| Images | Portrait professionnel, illustrations ou icones, screenshots de projets |

### Schema.org

```json
{
  "@type": "ProfessionalService",
  "knowsAbout": ["Expertise 1", "Expertise 2"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Mes services"
  }
}
```

### Mots-cles SEO types

- `consultant [domaine] [ville]`
- `freelance [domaine] [ville]`
- `expert [domaine]`
- `prestataire [domaine] [ville]`
- `[domaine] pour [type de client]`

---

## 6. Commerce de proximite

### Questions specifiques Haiku

1. "Quel type de commerce tenez-vous ? (epicerie, fleuriste, librairie, boutique vetements...)"
2. "Vendez-vous aussi en ligne ou uniquement en boutique ?"
3. "Quels sont vos produits phares ou vos categories principales ?"
4. "Proposez-vous des services specifiques ? (livraison, click & collect, emballage cadeau...)"
5. "Qu'est-ce qui fait venir les clients chez vous plutot qu'ailleurs ?"

### Pages recommandees

| Page | Sections |
|------|----------|
| Accueil | Hero avec photo boutique, produits phares, horaires, localisation, promotions |
| Nos Produits | Catalogue par categorie, photos, descriptions |
| Notre Boutique | Histoire, equipe, valeurs, photos du lieu |
| Contact | Adresse, horaires, telephone, Google Maps, acces (parking, transport) |

### Features suggerees

- Catalogue produits avec categories
- Horaires detailles (jours feries inclus)
- Google Maps avec itineraire
- Promotions / nouveautes
- Click & collect si propose
- Lien vers reseaux sociaux (Instagram pour les visuels)

### Style recommande

| Element | Recommandation |
|---------|---------------|
| Palette | Adapte au type de commerce : vert pour bio/nature, couleurs vives pour mode, pastel pour deco |
| Typographie | Friendly et lisible (DM Sans, Quicksand) |
| Ton | Chaleureux, de quartier, accueillant |
| Images | Vitrine, produits mis en scene, equipe |

### Schema.org

```json
{
  "@type": "Store",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Nos produits"
  },
  "paymentAccepted": "Cash, Credit Card",
  "currenciesAccepted": "EUR"
}
```

### Mots-cles SEO types

- `[type commerce] [ville]`
- `[type commerce] [quartier]`
- `acheter [produit] [ville]`
- `[type] ouvert dimanche [ville]`
- `[type commerce] livraison [ville]`

---

## 7. Cabinet medical / Paramedical

### Questions specifiques Haiku

1. "Quelle est votre specialite ? (medecin generaliste, kine, osteopathe, dentiste, sage-femme...)"
2. "Exercez-vous en cabinet individuel ou en groupe ?"
3. "Prenez-vous des nouveaux patients ?"
4. "Proposez-vous la prise de rendez-vous en ligne ? (Doctolib, lien direct...)"
5. "Y a-t-il des informations pratiques specifiques ? (acces PMR, parking, teleconsultation...)"

### Pages recommandees

| Page | Sections |
|------|----------|
| Accueil | Hero sobre, presentation du praticien/cabinet, specialites, CTA rendez-vous, horaires |
| Le Cabinet / L'equipe | Parcours, diplomes, specialisations, photo(s), valeurs |
| Soins / Specialites | Detail des actes et prises en charge, informations patients |
| Informations pratiques | Tarifs et remboursements, documents a apporter, acces, parking |
| Contact | Telephone, lien Doctolib, adresse, Google Maps, horaires |

### Features suggerees

- Lien Doctolib / prise de rendez-vous en ligne
- Informations remboursement et tarifs (secteur 1/2, tiers payant)
- Acces et informations pratiques
- Presentation diplomes et specialisations
- Informations urgences

### Style recommande

| Element | Recommandation |
|---------|---------------|
| Palette | Bleu medical + blanc + gris clair ; vert apaisant pour paramedical |
| Typographie | Claire et sobre (Source Sans Pro, IBM Plex Sans) |
| Ton | Rassurant, professionnel, accessible |
| Images | Photo du praticien (portrait pro), photo du cabinet, icones medicales sobres |

### Schema.org

```json
{
  "@type": "MedicalBusiness|Physician|Dentist",
  "medicalSpecialty": "Specialite",
  "isAcceptingNewPatients": true,
  "availableService": {
    "@type": "MedicalProcedure",
    "name": "Nom du soin"
  }
}
```

### Mots-cles SEO types

- `[specialite] [ville]`
- `cabinet [specialite] [ville]`
- `rdv [specialite] [ville]`
- `[specialite] prise en charge`
- `[specialite] tarif [ville]`
- `[specialite] teleconsultation`

---

## Template brief_json generique

Structure de reference utilisee pour tous les secteurs :

```json
{
  "business": {
    "name": "",
    "type": "restaurant|boulangerie|artisan_plombier|artisan_electricien|artisan_btp|coiffeur|beaute|freelance|consultant|commerce|medical|paramedical",
    "location": {
      "city": "",
      "region": "",
      "postal_code": "",
      "address": "",
      "country": "France"
    },
    "description": "",
    "unique_selling_point": "",
    "phone": "",
    "email": "",
    "hours": {
      "monday": "",
      "tuesday": "",
      "wednesday": "",
      "thursday": "",
      "friday": "",
      "saturday": "",
      "sunday": ""
    },
    "social_media": {
      "instagram": "",
      "facebook": "",
      "linkedin": ""
    }
  },
  "pages": [
    {
      "slug": "index",
      "title": "",
      "sections": []
    }
  ],
  "features": [],
  "style": {
    "tone": "",
    "colors_hint": "",
    "personality": ""
  },
  "assets": [],
  "seo": {
    "target_keywords": [],
    "locality_keywords": [],
    "competitors_hint": "",
    "primary_keyword": ""
  }
}
```
