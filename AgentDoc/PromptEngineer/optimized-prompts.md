# Prompts Optimises — Masamune (Gemini 2.0 Flash)

Date : 2026-03-26
Modele cible : Gemini 2.0 Flash (qualifying + generation)

---

## Changements par rapport aux prompts initiaux

### A) Prompt Qualifying (`app/src/lib/ai/prompts.ts`)

#### Ameliorations apportees

1. **Detection de secteur structuree** : Ajout d'un tableau de mapping secteur -> vocabulaire + questions prioritaires. Gemini identifie le secteur des la premiere reponse et adapte immediatement son comportement.

2. **Brief JSON enrichi** : Le format de sortie est passe d'un JSON plat a un JSON structure avec :
   - `location` en objet (city, region, country) au lieu d'une string
   - `unique_selling_point` pour differencier le business
   - `hours` detaillees par jour
   - `pages` en objets avec slug, title et sections (pas juste des strings)
   - `style.personality` ajoute pour le ton general
   - `seo.locality_keywords` et `seo.primary_keyword` pour mieux cibler le SEO

3. **Questions sectorielles** : Ajout d'exemples de features specifiques par secteur directement dans le prompt (carte en ligne pour restaurant, zone intervention pour artisan, etc.)

4. **Regles comportementales** : Ajout de regles pour gerer les clients qui repondent a plusieurs questions d'un coup, le tutoiement adaptatif, et la generation automatique de mots-cles SEO.

5. **Ambiances sectorielles** : Au lieu de proposer des adjectifs generiques, le prompt liste des ambiances specifiques par secteur (gastronomique vs bistrot pour restaurant, fiable vs reactif pour artisan).

#### Impact attendu
- Briefs plus complets -> generation de meilleure qualite
- Moins de questions inutiles -> meilleure UX
- SEO automatique -> sites mieux references des le depart

---

### B) Prompt Generation (`app/src/lib/ai/generate.ts`)

#### Ameliorations apportees

1. **Tailwind config inline** : Le prompt demande maintenant d'utiliser `tailwind.config` inline dans le HTML pour definir une palette de couleurs custom (primary, secondary, accent) et les polices. Cela donne un design unique au lieu de classes Tailwind generiques.

2. **Typographie par secteur** : Table de mapping secteur -> paire de Google Fonts recommandee (Playfair Display + Inter pour gastro, Montserrat + Open Sans pour artisan, etc.).

3. **Composants visuels differenciants** :
   - Icones SVG inline pour les services
   - Cartes avec ombres et transitions hover
   - Hero section impactante (min-h-[70vh])
   - Temoignages avec guillemets decoratifs
   - Stats/chiffres cles en grand format
   - Separateurs decoratifs entre sections

4. **Images placeholder realistes** : Dimensions specifiques par usage (Hero 1920x800, Cards 600x400, Avatar 80x80, OG 1200x630) avec couleurs de fond adaptees au theme.

5. **Schema.org complet** : Instructions detaillees par type de business avec proprietes obligatoires, plus WebSite et BreadcrumbList schemas.

6. **Formulaire de contact fonctionnel** : Champs adaptes au secteur (type de travaux pour artisan, date pour reservation), validation HTML5, action Formspree ou mailto.

7. **llms.txt structure** : Format Markdown standardise pour decrire le site aux agents IA (informations, pages, services).

8. **maxOutputTokens double** : Passe de 16000 a 32000 pour permettre la generation de sites plus complets avec plus de pages et de contenu.

9. **User prompt enrichi** : Instructions numerotees claires avec extraction du business type pour le Schema.org.

#### Impact attendu
- Sites visuellement uniques (pas de "template Tailwind generique")
- SEO technique complet (Schema.org, OG tags, meta descriptions)
- Contenu francais realiste et adapte au secteur
- Formulaires fonctionnels
- Compatibilite avec le standard llms.txt

---

## Comparaison avant/apres

| Aspect | Avant | Apres |
|--------|-------|-------|
| Detection secteur | Implicite | Table de mapping explicite |
| Brief JSON | Plat, incomplet | Structure, sections par page |
| Palette couleurs | "Coherente avec le secteur" | tailwind.config inline, 3 couleurs nommees |
| Typographie | "Google Fonts adaptee" | Paire de polices par secteur |
| Images | "placehold.co avec descriptions" | Dimensions realistes par contexte + couleurs |
| Schema.org | "Adapte au type" | Instructions detaillees + WebSite + BreadcrumbList |
| Formulaire | "mailto: ou formspree" | Champs adaptes au secteur + validation HTML5 |
| llms.txt | Mentionne | Format complet documente |
| maxOutputTokens | 16000 | 32000 |
| Contenu | "Professionnel et engageant" | "Realiste et specifique, PAS de Lorem Ipsum" |

---

## Notes pour tester

### Test qualifying
Simuler un client avec :
```
"Je suis plombier a Lyon"
```
Verifier que :
- Le vocabulaire change immediatement (chantiers, zone, realisations)
- Les questions proposent depannage, certifications, zone d'intervention
- Le brief_json a un type "artisan_plombier" et des pages adaptees

### Test generation
Utiliser ce brief minimal :
```json
{
  "business": {
    "name": "Dupont Plomberie",
    "type": "artisan_plombier",
    "location": { "city": "Lyon", "region": "Rhone-Alpes", "country": "France" },
    "description": "Plombier depuis 15 ans a Lyon et alentours",
    "unique_selling_point": "Intervention en moins de 2h, devis gratuit",
    "phone": "+33 4 78 00 00 00",
    "email": "contact@dupont-plomberie.fr",
    "hours": {
      "monday": "08:00-19:00", "tuesday": "08:00-19:00",
      "wednesday": "08:00-19:00", "thursday": "08:00-19:00",
      "friday": "08:00-19:00", "saturday": "09:00-12:00", "sunday": "ferme"
    }
  },
  "pages": [
    { "slug": "index", "title": "Accueil", "sections": ["hero", "services_preview", "zone_intervention", "temoignages", "urgence_cta"] },
    { "slug": "services", "title": "Nos services", "sections": ["depannage", "installation", "renovation", "tarifs"] },
    { "slug": "devis", "title": "Demande de devis", "sections": ["formulaire_devis", "garanties", "certifications"] },
    { "slug": "contact", "title": "Contact", "sections": ["formulaire", "carte", "horaires", "urgence"] }
  ],
  "features": ["formulaire_devis", "click_to_call", "google_maps", "horaires", "urgence_7j7"],
  "style": {
    "tone": "professionnel",
    "colors_hint": "bleu confiance et orange energie",
    "personality": "fiable, reactif, de proximite"
  },
  "assets": [],
  "seo": {
    "target_keywords": ["plombier lyon", "depannage plomberie lyon", "plombier urgence lyon"],
    "locality_keywords": ["plombier lyon 69", "plombier rhone-alpes"],
    "primary_keyword": "plombier lyon"
  }
}
```

Verifier dans le HTML genere :
- [ ] tailwind.config inline avec couleurs primary (bleu) et accent (orange)
- [ ] Google Fonts Montserrat + Open Sans
- [ ] Schema.org @type: "Plumber" avec areaServed
- [ ] Hero section min-h-[70vh]
- [ ] Formulaire de devis avec champs specifiques (type travaux, urgence)
- [ ] llms.txt avec infos du business
- [ ] Contenu en francais, realiste, pas de Lorem Ipsum
- [ ] Images placehold.co avec dimensions correctes
- [ ] Navigation identique sur toutes les pages
