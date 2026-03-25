# Masamune — User Flows et Wireframes

**Version** : 1.0
**Date** : 2026-03-25

---

## 1. Landing Page (masamune.fr)

### Layout

- **Header** : fixe en haut, fond blanc/transparent, z-50
- **Contenu** : sections empilees verticalement, pleine largeur
- **Footer** : fond slate-800, texte clair

### Header

```
[Logo "Masamune"]                    [Fonctionnalites] [Tarifs] [FAQ]   [Connexion] [Creer mon site →]
```

- Logo a gauche, navigation centre-droit, CTA bouton primary a droite
- Mobile : hamburger menu, CTA reste visible
- Classes : `fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-slate-100 z-50`
- Au scroll : ombre `shadow-sm` apparait

### Section Hero

```
┌─────────────────────────────────────────────────┐
│                                                 │
│        Votre site professionnel                 │
│        en 5 minutes.                            │
│        Sans aucune competence technique.        │
│                                                 │
│   [Creer mon site gratuitement →]               │
│   Gratuit, sans carte bancaire                  │
│                                                 │
│        ┌──────────────────────┐                 │
│        │  Animation demo :    │                 │
│        │  chat → site genere  │                 │
│        └──────────────────────┘                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Titre : `text-5xl font-bold` (Display), texte slate-800
- Sous-titre : `text-xl text-slate-500`
- CTA : bouton primary large
- Animation : mockup interactif montrant le chat qui genere un site (video ou Lottie)
- Mobile : texte centre, animation en dessous

### Section Social Proof

```
┌─────────────────────────────────────────────────┐
│   +500 sites crees    98% satisfaits    30s     │
│                                                 │
│   [Logo1] [Logo2] [Logo3] [Logo4] [Logo5]       │
└─────────────────────────────────────────────────┘
```

- 3 metriques cles en gros chiffres (`text-4xl font-bold text-indigo-600`)
- Bandeau logos clients en dessous (grayscale, opacite 60%)

### Section "Comment ca marche" (3 etapes)

```
┌─────────────────────────────────────────────────┐
│              Comment ca marche                   │
│                                                 │
│   ┌──────┐      ┌──────┐      ┌──────┐         │
│   │  1   │      │  2   │      │  3   │         │
│   │ 💬   │      │ ⚡   │      │ 🌐   │         │
│   │Decri-│      │L'IA  │      │En    │         │
│   │vez   │      │cree  │      │ligne │         │
│   └──────┘      └──────┘      └──────┘         │
│                                                 │
│   "Repondez a"  "Votre site"  "Domaine,        │
│   "quelques"    "est genere"  "SEO, SSL :      │
│   "questions"   "en minutes"  "tout inclus"    │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Grid 3 colonnes (`grid grid-cols-1 md:grid-cols-3 gap-8`)
- Chaque etape : icone dans cercle indigo-50, numero, titre bold, description
- Trait connecteur entre les etapes (desktop uniquement)

### Section Exemples (galerie de sites)

```
┌─────────────────────────────────────────────────┐
│         Des sites qui impressionnent            │
│                                                 │
│  [Filtre: Tous] [Restaurant] [Artisan] [...]    │
│                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ Preview │  │ Preview │  │ Preview │         │
│  │ site 1  │  │ site 2  │  │ site 3  │         │
│  │ ─────── │  │ ─────── │  │ ─────── │         │
│  │ Boulan. │  │ Plombi. │  │ Coiffeu │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ Preview │  │ Preview │  │ Preview │         │
│  │ site 4  │  │ site 5  │  │ site 6  │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Filtres par secteur en tabs/pills
- Grid 2x3 de cards avec thumbnail, nom, secteur
- Hover : overlay avec bouton "Voir le site"
- Mobile : scroll horizontal ou grid 1 colonne

### Section Comparatif

```
┌─────────────────────────────────────────────────┐
│         Pourquoi Masamune ?                     │
│                                                 │
│              │ Agence │  CMS  │  IA   │Masamune │
│  ────────────┼────────┼───────┼───────┼─────────│
│  Prix        │ 2000+  │ 30+   │ 20+   │  0      │
│  Delai       │ 4 sem  │ 2 sem │ 1h    │  5 min  │
│  SEO inclus  │  ✓ $   │  ✗    │  ✗    │  ✓      │
│  Domaine     │  ✗     │  ✗    │  ✗    │  ✓      │
│  Maintenance │ manuelle│ vous  │ vous  │  auto   │
│  Mobile      │ option │ selon │ selon │  natif  │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Tableau comparatif, colonne Masamune mise en avant (fond indigo-50, bordure indigo)
- Check/cross icones avec couleurs semantiques
- Mobile : version cards empilees au lieu de tableau

### Section Pricing

```
┌─────────────────────────────────────────────────┐
│              Tarifs simples                      │
│         [Mensuel] [Annuel -25%]                 │
│                                                 │
│  ┌─────────┐ ┌───────────┐ ┌─────────┐ ┌──────┐│
│  │ Gratuit │ │ Pro ★     │ │Business │ │Enter.││
│  │  0 EUR  │ │ 39 EUR/m  │ │ 79 EUR/m│ │149EUR││
│  │         │ │           │ │         │ │      ││
│  │ 1 site  │ │ + domaine │ │ 3 sites │ │10site││
│  │ 5 iter. │ │ + SEO     │ │ + monit.│ │+supp.││
│  │ SEO base│ │ + illim.  │ │ + canaux│ │+API  ││
│  │         │ │ + WhatsApp│ │ + notifs│ │      ││
│  │[Commenc.]│ │[Choisir →]│ │[Choisir]│ │[Cont]││
│  └─────────┘ └───────────┘ └─────────┘ └──────┘│
│                                                 │
└─────────────────────────────────────────────────┘
```

- Toggle mensuel/annuel (prix barre + nouveau prix)
- Plan Pro mis en avant : bordure indigo, badge "Populaire"
- Grid 4 colonnes desktop, 1 colonne mobile (Pro en premier mobile)
- CTA adapte par plan : "Commencer" (gratuit), "Choisir ce plan" (payant), "Nous contacter" (enterprise)

### Section FAQ

```
┌─────────────────────────────────────────────────┐
│           Questions frequentes                   │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ ▸ Ai-je besoin de competences ?         │    │
│  ├─────────────────────────────────────────┤    │
│  │ ▸ Combien de temps pour creer un site ? │    │
│  ├─────────────────────────────────────────┤    │
│  │ ▸ Puis-je modifier mon site apres ?     │    │
│  ├─────────────────────────────────────────┤    │
│  │ ▸ Comment fonctionne le domaine ?       │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Accordeon (disclosure), un seul ouvert a la fois
- 8-10 questions
- Animation smooth open/close

### Footer

```
┌─────────────────────────────────────────────────┐
│ bg-slate-800                                     │
│                                                 │
│  Masamune        Produit      Legal     Contact │
│  Votre site     Fonctions   Mentions   Email    │
│  en 5 min.      Tarifs      CGV        Twitter  │
│                  FAQ         Confid.    LinkedIn │
│                  Blog        Cookies             │
│                                                 │
│  ─────────────────────────────────────────────  │
│  (c) 2026 Masamune. Tous droits reserves.       │
└─────────────────────────────────────────────────┘
```

### Etats

- **Loading** : skeleton loader sur les sections (shimmer gris)
- **Scroll** : header passe de transparent a blanc avec ombre
- **Mobile** : menu hamburger, sections empilees, carousel pour exemples

---

## 2. Page Inscription / Connexion

### Layout

- Pleine page, deux colonnes desktop (illustration + formulaire)
- Mobile : formulaire seul sur fond blanc

### Wireframe

```
┌──────────────────────┬──────────────────────────┐
│                      │                          │
│   Illustration       │   Logo Masamune          │
│   ou gradient        │                          │
│   indigo avec        │   Creez votre site       │
│   mockup site        │   en quelques minutes    │
│                      │                          │
│                      │   [Google] [Email]        │
│   "Rejoignez +500    │                          │
│    professionnels"   │   ──── ou ────           │
│                      │                          │
│                      │   Email  [__________]    │
│                      │   MdP    [__________]    │
│                      │                          │
│                      │   [Creer mon compte →]   │
│                      │                          │
│                      │   Deja un compte ?        │
│                      │   Se connecter            │
│                      │                          │
└──────────────────────┴──────────────────────────┘
```

### Composants utilises

- Card formulaire centree (droite desktop)
- Inputs email + mot de passe
- Bouton primary "Creer mon compte"
- Bouton secondaire Google OAuth
- Lien ghost vers connexion/inscription (toggle)

### Interactions

- Toggle inscription ↔ connexion (meme page, transition smooth)
- Validation inline des champs (email format, mdp force)
- Loading state sur le bouton apres soumission
- Redirect vers dashboard apres auth

### Etats

- **Default** : formulaire inscription
- **Connexion** : meme layout, champs email + mdp uniquement
- **Loading** : bouton avec spinner, inputs desactives
- **Erreur** : message sous le champ fautif en rouge, toast si erreur serveur
- **Mot de passe oublie** : modal avec champ email + CTA "Reinitialiser"

---

## 3. Dashboard "Mes sites" (app.masamune.fr)

### Layout

```
┌──────────┬──────────────────────────────────────┐
│          │  Header : breadcrumb + user menu     │
│ Sidebar  ├──────────────────────────────────────┤
│          │                                      │
│ ● Sites  │  Mes sites              [+ Nouveau]  │
│ ○ Domain │                                      │
│ ○ Abonn. │  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│ ○ Param. │  │ Site 1  │ │ Site 2  │ │ + Cree │ │
│          │  │ preview │ │ preview │ │  un    │ │
│          │  │ ─────── │ │ ─────── │ │ site   │ │
│          │  │ Boulan. │ │ Plombr. │ │        │ │
│          │  │ En ligne│ │ Brouil. │ │        │ │
│          │  └─────────┘ └─────────┘ └────────┘ │
│          │                                      │
│          │                                      │
│ ──────── │                                      │
│ User     │                                      │
│ avatar   │                                      │
└──────────┴──────────────────────────────────────┘
```

### Composants

- Sidebar navigation (voir design-system section 5.9)
- Header : titre page + bouton "Nouveau site" (primary)
- Grid de cards sites (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`)
- Chaque card : thumbnail, nom, sous-domaine, badge statut, menu actions (...)
- Card "Creer un nouveau site" : bordure dashed, icone Plus, texte incitateur

### Interactions

- Clic sur card site → page "Mon site" (detail)
- Clic sur "Nouveau site" → page "Creer un site" (chat)
- Menu "..." sur card → Modifier, Voir le site, Parametres, Supprimer
- Supprimer → modal confirmation avec input du nom du site

### Etats

- **Empty state** : illustration + "Vous n'avez pas encore de site" + CTA "Creer mon premier site"
- **Loading** : skeleton cards (3 cards gris shimmer)
- **1+ sites** : grid de cards + card "nouveau"
- **Limite atteinte** (gratuit, 1 site) : card "nouveau" avec badge "Pro requis" + CTA upgrade
- **Generation en cours** : card avec barre de progression au lieu du thumbnail

---

## 4. Page "Creer un site" (Chat IA)

### Layout

```
┌──────────┬──────────────────────────────────────┐
│          │  ← Retour | Creer un nouveau site    │
│ Sidebar  ├──────────────────────────────────────┤
│          │                                      │
│          │  ┌────────────────────────────────┐  │
│          │  │                                │  │
│          │  │  [M] Bonjour ! Je suis votre   │  │
│          │  │      assistant Masamune.        │  │
│          │  │      Quel est votre secteur     │  │
│          │  │      d'activite ?               │  │
│          │  │                                │  │
│          │  │              Je suis boulanger  │  │
│          │  │              a Lyon. [user]     │  │
│          │  │                                │  │
│          │  │  [M] Super ! Comment s'appelle  │  │
│          │  │      votre boulangerie ?        │  │
│          │  │                                │  │
│          │  │  ...                            │  │
│          │  │                                │  │
│          │  └────────────────────────────────┘  │
│          │                                      │
│          │  ┌────────────────────────────────┐  │
│          │  │ [📎] Ecrivez votre message...  │  │
│          │  │                         [Envoyer]│ │
│          │  └────────────────────────────────┘  │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Composants

- Zone de chat scrollable (bulles assistant/utilisateur, voir design-system 5.7)
- Barre d'input en bas : textarea auto-resize + bouton upload + bouton envoyer
- Indicateur de frappe IA (trois points rebondissants)
- Barre de progression du brief (etapes franchies)

### Interactions

- Envoi message : Enter ou clic bouton
- Upload fichier : clic icone clip → file picker (images/videos)
- Images uploadees : miniatures dans la bulle utilisateur, cliquable pour agrandir
- Quand le brief est complet : message IA "Parfait ! Je lance la generation de votre site."
- Transition vers la page "Mon site" avec barre de progression generation

### Etats

- **Debut** : message de bienvenue IA, input vide
- **En conversation** : historique messages, suggestions rapides parfois (chips cliquables)
- **Upload en cours** : miniature avec overlay spinner
- **Brief complet** : recap du brief dans une card speciale, bouton "Lancer la generation"
- **Generation lancee** : barre de progression avec etapes (analyse, generation code, integration images, deploiement)
- **Erreur IA** : message IA "Desole, pouvez-vous reformuler ?" avec suggestion

### Detail barre de progression brief

```
┌────────────────────────────────────────────┐
│  Progression : ████████░░░░░ 60%          │
│  ✓ Secteur  ✓ Nom  ○ Pages  ○ Style  ○ Photos │
└────────────────────────────────────────────┘
```

Affichee en haut du chat, mise a jour au fur et a mesure des reponses.

---

## 5. Page "Mon site" (detail + iterations)

### Layout — Split screen

```
┌──────────┬──────────────────┬───────────────────┐
│          │  Mon site        │                   │
│ Sidebar  │  Tabs: [Preview] [Chat] [Analytics]  │
│          ├──────────────────┴───────────────────┤
│          │                                      │
│          │  ┌────────────────────────────────┐  │
│          │  │                                │  │
│          │  │       iframe preview            │  │
│          │  │       du site client            │  │
│          │  │                                │  │
│          │  │                                │  │
│          │  └────────────────────────────────┘  │
│          │                                      │
│          │  [Desktop] [Tablette] [Mobile]        │
│          │  [Ouvrir dans un nouvel onglet →]     │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Tab Preview

- iframe du site en sous-domaine (monsite.masamune.app)
- Boutons responsive : desktop / tablette / mobile (resize l'iframe)
- Barre d'infos : URL du site, badge statut, bouton "Ouvrir"
- Si domaine custom : afficher les deux URLs

### Tab Chat (iterations)

```
┌──────────────────┬───────────────────┐
│                  │                   │
│  Chat iterations │  iframe preview   │
│                  │  (temps reel)     │
│  [M] Voici votre │                   │
│      site !       │                   │
│                  │                   │
│  "Change la      │                   │
│   couleur du     │                   │
│   header en      │                   │
│   bleu"  [user]  │                   │
│                  │                   │
│  [M] C'est fait! │                   │
│                  │                   │
│  ┌──────────┐    │                   │
│  │ Input    │    │                   │
│  └──────────┘    │                   │
└──────────────────┴───────────────────┘
```

- Split screen : chat a gauche (40%), preview a droite (60%)
- Preview se rafraichit apres chaque modification
- Compteur d'iterations restantes (plan gratuit) : "3/5 modifications ce mois"
- Historique des versions : dropdown "Version 3 (actuelle)" avec rollback

### Tab Analytics

```
┌──────────────────────────────────────────────┐
│  Periode : [7j] [30j] [90j]                 │
│                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    │
│  │ 234  │  │ 89%  │  │ 1:23 │  │ 45%  │    │
│  │ Vues │  │Mobil.│  │Duree │  │Rebond│    │
│  └──────┘  └──────┘  └──────┘  └──────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  Graphique courbe visites/jour       │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Sources          │  Pages populaires        │
│  Google 45%       │  / (accueil) 60%         │
│  Direct 30%       │  /services 25%           │
│  Facebook 15%     │  /contact 15%            │
│                                              │
└──────────────────────────────────────────────┘
```

- Donnees Umami embedees ou fetched via API
- Plan gratuit : badge "Disponible avec le plan Business" sur cette tab
- KPI cards en haut, graphique courbe, tables sources + pages

### Etats

- **Generation en cours** : barre de progression a la place de l'iframe, etapes animees
- **Site en ligne** : iframe + toutes les fonctionnalites
- **Erreur generation** : message d'erreur + bouton "Relancer la generation"
- **Site partiel** : iframe avec pages OK, alerte pour pages manquantes
- **Limite iterations** : input chat desactive, message "Passez a Pro pour des modifications illimitees" + CTA

---

## 6. Page "Domaines"

### Layout

```
┌──────────┬──────────────────────────────────────┐
│          │  Domaines                             │
│ Sidebar  ├──────────────────────────────────────┤
│          │                                      │
│ ○ Sites  │  Rechercher un domaine               │
│ ● Domain │  ┌──────────────────────┐            │
│ ○ Abonn. │  │ boulangerie-lyon     │ [.fr ▾]   │
│          │  └──────────────────────┘ [Chercher] │
│          │                                      │
│          │  Resultats :                          │
│          │  ┌──────────────────────────────────┐ │
│          │  │ boulangerie-lyon.fr    12EUR/an  │ │
│          │  │ ✓ Disponible          [Acheter]  │ │
│          │  ├──────────────────────────────────┤ │
│          │  │ boulangerie-lyon.com   15EUR/an  │ │
│          │  │ ✗ Indisponible                   │ │
│          │  ├──────────────────────────────────┤ │
│          │  │ boulangerie-lyon.shop  8EUR/an   │ │
│          │  │ ✓ Disponible          [Acheter]  │ │
│          │  └──────────────────────────────────┘ │
│          │                                      │
│          │  ── Mes domaines ──                  │
│          │  ┌──────────────────────────────────┐ │
│          │  │ ma-boulangerie.fr                │ │
│          │  │ DNS ✓  SSL ✓  Expire: 2027-03    │ │
│          │  │ Lie a : Boulangerie du Vieux Lyon │ │
│          │  └──────────────────────────────────┘ │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Composants

- Input recherche domaine + select TLD + bouton "Chercher"
- Liste resultats : cards avec nom, prix/an, badge dispo/indisponible, bouton acheter
- Section "Mes domaines" : cards avec statut DNS, SSL, expiration, site associe

### Interactions

- Recherche : debounce 500ms, loader pendant la requete OVH
- Acheter : modal confirmation avec prix + recapitulatif → Stripe Checkout
- Apres achat : progression DNS/SSL en temps reel (etapes avec spinners)
- Domaines existants : bouton "Associer a un site" si pas encore lie

### Etats

- **Vide** : pas de recherche, section "Mes domaines" vide ou avec domaines
- **Recherche en cours** : skeleton sur la zone resultats
- **Resultats** : liste triee par pertinence SEO puis prix
- **Achat en cours** : modal Stripe, puis barre de progression DNS/SSL
- **DNS en configuration** : badge orange "Configuration en cours" avec spinner
- **Tout OK** : badges verts DNS + SSL + site associe
- **Erreur** : badge rouge + message + bouton "Reessayer"
- **Plan gratuit** : message "Disponible avec le plan Pro" + CTA upgrade

---

## 7. Page "Abonnement"

### Layout

```
┌──────────┬──────────────────────────────────────┐
│          │  Mon abonnement                       │
│ Sidebar  ├──────────────────────────────────────┤
│          │                                      │
│ ○ Sites  │  Plan actuel : Gratuit               │
│ ○ Domain │  ┌──────────────────────────────────┐ │
│ ● Abonn. │  │ Vous utilisez 1/1 site           │ │
│          │  │ 3/5 iterations ce mois            │ │
│          │  │ Prochain renouvellement : -        │ │
│          │  └──────────────────────────────────┘ │
│          │                                      │
│          │  Changer de plan                      │
│          │  [Mensuel] [Annuel -25%]              │
│          │                                      │
│          │  ┌────────┐ ┌──────────┐ ┌─────────┐ │
│          │  │ Pro    │ │ Business │ │ Enterpr.│ │
│          │  │ 39EUR  │ │ 79EUR    │ │ 149EUR  │ │
│          │  │        │ │          │ │         │ │
│          │  │ [Choi.]│ │ [Choisir]│ │[Contact]│ │
│          │  └────────┘ └──────────┘ └─────────┘ │
│          │                                      │
│          │  ── Historique de facturation ──      │
│          │  ┌──────────────────────────────────┐ │
│          │  │ 2026-02-25  Pro  39EUR  Payee    │ │
│          │  │ 2026-01-25  Pro  39EUR  Payee    │ │
│          │  └──────────────────────────────────┘ │
│          │                                      │
│          │  [Gerer le paiement via Stripe →]     │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Composants

- Card plan actuel : plan, usage (sites, iterations), prochaine echeance
- Barres de progression pour les limites (ex: 3/5 iterations = 60%)
- Cards plans disponibles (similaires a la landing page pricing)
- Plan actuel grise avec badge "Plan actuel"
- Table historique facturation : date, plan, montant, statut, lien PDF
- Lien vers portail Stripe pour gestion carte/annulation

### Interactions

- Upgrade : clic "Choisir" → modal recapitulatif → Stripe Checkout
- Downgrade : clic "Changer" → modal avertissement (perte fonctionnalites) → confirmation
- Toggle mensuel/annuel : prix se met a jour avec animation
- Telecharger facture : lien direct vers PDF Stripe

### Etats

- **Plan gratuit** : cards upgrade mises en avant, pas d'historique
- **Plan payant** : card plan actuel + historique + bouton "Gerer"
- **Paiement echoue** : banniere rouge en haut "Votre paiement a echoue" + CTA mettre a jour la carte
- **Annulation en cours** : badge "Actif jusqu'au JJ/MM/AAAA" + option re-activer
- **Loading** : skeleton sur la card plan actuel + table

---

## 8. Responsive : regles generales

### Mobile (< 768px)

- Sidebar → bottom navigation (5 icones max) ou hamburger menu
- Grids passent en 1 colonne
- Split screen chat/preview → tabs alternant entre les deux
- Tables → cards empilees
- Modals → full screen mobile (bottom sheet)

### Tablette (768px - 1024px)

- Sidebar collapse en icones (expandable au clic)
- Grids en 2 colonnes
- Split screen chat/preview maintenu (50/50)

### Desktop (> 1024px)

- Layout complet sidebar + contenu
- Grids en 3 colonnes
- Split screen chat/preview (40/60)

---

## 9. Patterns transversaux

### Loading

- **Skeleton** : `bg-slate-200 animate-pulse rounded` sur chaque element de contenu
- **Spinner bouton** : icone `Loader2` avec `animate-spin` a la place du texte
- **Barre de progression** : pour operations longues (generation, DNS)
- **Optimistic UI** : messages chat apparaissent immediatement cote utilisateur

### Empty states

- Illustration SVG legere + titre + description + CTA
- Exemples : "Pas encore de site", "Aucun domaine", "Pas de donnees analytiques"

### Erreurs

- **Inline** : texte rouge sous l'input concerne
- **Toast** : erreurs serveur, en haut a droite, auto-dismiss 5s
- **Banniere** : erreurs critiques (paiement echoue), en haut de page, persistante
- **Page erreur** : 404 et 500 avec illustration + bouton retour

### Notifications temps reel

- Toast pour : site pret, modification appliquee, domaine configure
- Badge numerique sur l'icone sites dans la sidebar quand action terminee
- Son optionnel (desactivable dans parametres)
