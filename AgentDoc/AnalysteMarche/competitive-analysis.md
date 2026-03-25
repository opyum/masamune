# Analyse Concurrentielle Masamune

> Date: 25 mars 2026
> Objectif: Identifier les forces, faiblesses, frustrations utilisateurs et opportunites pour Masamune face aux concurrents directs et indirects.

---

## 1. Lovable.dev (Concurrent direct - IA)

### Presentation
Outil IA de creation d'applications web. L'utilisateur decrit ce qu'il veut, l'IA genere le code (React/Supabase). Valorise a 6.6 milliards de dollars (2026).

### Pricing
| Plan | Prix/mois | Credits |
|------|-----------|---------|
| Free | 0$ | 5/jour (~30/mois) |
| Pro | 25$ | 100 credits |
| Business | 50$ | Credits supplementaires + SSO |
| Enterprise | Sur devis | Illimite |

Credits: chaque prompt coute 0.5 a 1.2 credits selon la complexite. Hebergement cloud inclus (25$/mois gratuit temporairement).

### Frustrations utilisateurs (sources: Trustpilot 64% 5 etoiles / 17% 1 etoile, Reddit, Product Hunt)

1. **Boucles de debug infinies** - L'IA tente de corriger un bug, en cree un autre, et consomme des credits a chaque tentative. Frustration n.1 de la communaute.
2. **Credits brules pour les erreurs de l'IA** - Les utilisateurs paient pour les erreurs de l'IA, pas seulement pour leurs propres demandes. "250+ credits en quelques jours pour un changement simple."
3. **Hallucinations de l'IA** - L'IA affirme avoir corrige un bug alors que le build echoue. Fausse confiance qui fait perdre temps et argent.
4. **Limites de complexite** - Excellent pour les prototypes, s'effondre des qu'on ajoute de la complexite (auth, multi-users, backend avance).
5. **Support client insuffisant** - Quand l'IA ne peut pas resoudre un probleme, le support humain est quasi inexistant.
6. **Facturation opaque** - Certains utilisateurs signalent des charges mensuelles non autorisees, avec un support qui refuse d'aider.
7. **Pas production-ready** - Consensus: excellent pour les prototypes/MVP, pas pour des sites de production.

### Ce que les utilisateurs aiment
- Generation initiale tres rapide et impressionnante
- Interface simple et accessible aux non-developpeurs
- Export GitHub du code
- Integration Supabase pour le backend
- Ideal pour valider un concept rapidement

### Limitations techniques
- Code genere souvent de mauvaise qualite (difficilement maintenable)
- Pas de vrai controle sur l'architecture
- Dependance a Supabase pour le backend
- Pas de generation de sites statiques purs (toujours une app React)
- SEO limite par la nature SPA de React

**Sources**: [Trustpilot Lovable](https://www.trustpilot.com/review/lovable.dev), [Product Hunt Reviews](https://www.producthunt.com/products/lovable/reviews), [Superblocks Review](https://www.superblocks.com/blog/lovable-dev-review), [Trickle Review](https://trickle.so/blog/lovable-ai-review)

---

## 2. Bolt.new (Concurrent direct - IA)

### Presentation
Outil IA de creation d'applications web dans le navigateur. Utilise un systeme de tokens plutot que de credits. Oriente developpeurs mais vise aussi les non-developpeurs.

### Pricing
| Plan | Prix/mois | Tokens |
|------|-----------|--------|
| Free | 0$ | 1M tokens/mois |
| Pro | 25$ | 10M tokens |
| Teams | 30$/membre | 10M tokens/membre |
| Enterprise | Sur devis | Custom |

Tokens: un prompt simple = 50K-150K tokens, moyen = 150K-500K, complexe = 500K-1M+. Sur le plan free, ~10-20 interactions significatives/mois.

### Frustrations utilisateurs (sources: Trustpilot, Reddit, G2, Product Hunt)

1. **Consommation de tokens excessive** - "500K-1M tokens pour un changement simple." Le systeme synchronise tout le codebase a chaque interaction, gonflant les couts.
2. **Support client uniquement par IA** - Aucun humain disponible pour les problemes de facturation ou techniques. Users decrits comme "abandonnes".
3. **Regeneration complete au lieu de corrections ciblees** - L'IA regenere des composants entiers plutot que de faire des corrections ciblees, introduisant de nouveaux bugs.
4. **Problemes de facturation graves** - Tokens disparus du compte, abonnements charges sans autorisation (540$ charges sur une carte "de garantie").
5. **Perte de travail** - L'agent IA supprime parfois le travail existant, forcant a racheter des tokens pour tout recreer.
6. **Erreurs de projet persistantes** - Erreurs de taille de projet, edits corrompus, rollbacks echoues avec des projets de taille moyenne.
7. **Inaccessible aux non-developpeurs** - La plateforme fonctionne bien pour les developpeurs qui peuvent corriger le 20% restant, mais submerge les non-developpeurs.

### Ce que les utilisateurs aiment
- Environnement de dev complet dans le navigateur
- Bon pour le prototypage rapide de frontend
- Token rollover (depuis juillet 2025)
- Domaines custom inclus sur les plans payes
- Interface plus technique = plus de controle

### Limitations techniques
- Pas optimise pour les sites statiques simples
- Necessite des connaissances techniques pour aller au-dela du prototype
- Pas de workflow adapte aux non-developpeurs
- Problemes de stabilite avec les projets de taille moyenne+
- Pas de gestion SEO native

**Sources**: [Trustpilot Bolt](https://www.trustpilot.com/review/bolt.new), [Product Hunt Reviews](https://www.producthunt.com/products/bolt-new/reviews), [G2 Reviews](https://www.g2.com/products/bolt-new/reviews), [Shipper Review](https://shipper.now/bolt-review/)

---

## 3. Wix (Concurrent indirect - CMS)

### Presentation
Constructeur de sites web grand public, leader du marche des PME. Interface drag-and-drop, large marketplace d'apps. Transition vers "Wix Harmony" avec IA integree.

### Pricing
| Plan | Prix/mois | Inclus |
|------|-----------|--------|
| Free | 0$ | Pubs Wix, sous-domaine |
| Light | 17$ | Domaine custom, 2 Go stockage |
| Core | 29$ | 50 Go, e-commerce basique |
| Business | 39$ | 100 Go, e-commerce complet |
| Business Elite | 159$ | Stockage illimite, support VIP |
| Enterprise | Sur devis | Dedie |

### Frustrations utilisateurs (sources: Trustpilot, ComplaintsBoard, Capterra, Sitejabber, Reddit)

1. **Lenteur des sites** - Score de 13.9 secondes en test Seobility. Code inutile, scripts charges sur toutes les pages. "Presque une minute pour charger une nouvelle page dans l'editeur."
2. **SEO problematique** - Code gonfle, scripts sitewide, pas de controle sur les parametres serveur. "Ne peut pas etre recommande pour le SEO" selon des experts.
3. **Vendor lock-in total** - Impossible d'exporter son site. Quitter Wix = reconstruire de zero. Systeme concu pour empecher le depart.
4. **Auto-renouvellement abusif** - Augmentations de prix sur les abonnements 2 ans sans communication, pas de rappels de renouvellement.
5. **Pannes critiques en haute saison** - Pannes en septembre et decembre 2025 envoyant du trafic vers des pages produit cassees pendant la saison de vente.
6. **Support client frustrant** - Temps d'attente longs, pas d'aide en temps reel, resolution lente des problemes.
7. **Scalabilite limitee** - Fonctionne pour les sites simples, devient problematique pour les applications business serieuses.
8. **Blog lent** - Les pages de blog sont particulierement lentes, meme avec un contenu minimal.

### Ce que les utilisateurs aiment
- Interface drag-and-drop intuitive
- Grande variete de templates
- Marketplace d'apps riche
- ADI (Artificial Design Intelligence) pour la creation rapide
- Adapte aux debutants absolus
- Fonctionnalites e-commerce integrees

### Limitations techniques
- Pas de code propre exportable
- Performance mediocre (Core Web Vitals)
- SEO limite par la structure technique
- Pas d'acces au serveur ou a la base de donnees
- Templates non interchangeables apres creation

**Sources**: [Trustpilot Wix](https://www.trustpilot.com/review/www.wix.com), [One Smart Sheep - 17 Reasons](https://onesmartsheep.com/post/10-huge-reasons-not-to-use-wix-for-business-websites), [RSA Creative Studio](https://www.rsacreativestudio.com/blog/is-wix-worth-it-in-2026-13-real-pros-and-cons), [Capterra Reviews](https://www.capterra.com/p/169007/Wix/reviews/)

---

## 4. WordPress (Concurrent indirect - CMS)

### Presentation
CMS open-source dominant (~40% du web). Existe en version hebergee (WordPress.com) et auto-hebergee (WordPress.org). Ecosysteme massif de plugins et themes.

### Pricing (WordPress.com)
| Plan | Prix/mois | Inclus |
|------|-----------|--------|
| Personal | 4$ | Domaine gratuit 1 an, themes premium |
| Premium | 8$ | + themes premium, paiements |
| Business | 25$ | + plugins, outils SEO avances |
| eCommerce | 45$ | + tous les outils e-commerce |

**Cout reel WordPress.org auto-heberge**: Hebergement 25-100$/mois, plugins 50-300$/an, themes 100+$/an, developpeur si probleme. Total: facilement 2000+$/an.

### Frustrations utilisateurs (sources: Reddit, forums, blogs specialises)

1. **Complexite ecrasante pour les non-developpeurs** - Acheter un hebergement, installer WordPress, configurer plugins et themes, mettre en place sauvegardes et securite. "Overwhelming" pour un proprietaire de PME.
2. **Enfer des plugins** - 15-25 plugins moyens par site, chacun de developpeurs differents, mises a jour asynchrones, conflits frequents. "Les plugins ne jouent pas toujours bien ensemble."
3. **Securite catastrophique** - 11,334 nouvelles vulnerabilites en 2025 (+42% vs 2024). 96-97% dans les plugins. 36 nouvelles vulnerabilites par jour. 52% des developpeurs de plugins ne patchent pas avant la divulgation publique.
4. **Maintenance constante** - "Des dizaines d'avertissements, mises a jour, notes, erreurs chaque jour dans le back-end." Plus de temps a maintenir qu'a modifier le contenu.
5. **Performance lente par defaut** - "Monstre tout-en-un gonfle" qui produit un site lourd et lent sans expertise technique specifique.
6. **Cout cache eleve** - Les plans gratuits/bon marche sont trompeurs. Le cout reel avec hebergement, plugins premium, securite, et maintenance depasse rapidement 2000$/an.
7. **Obsolescence croissante** - 61% des entreprises utilisent plusieurs CMS en 2026. La moitie essaient de quitter les systemes legacy comme WordPress.

### Ce que les utilisateurs aiment
- Flexibilite et personnalisation illimitees (pour les developpeurs)
- Ecosysteme massif de plugins
- Communaute large et active
- Open source, pas de vendor lock-in
- SEO puissant (avec les bons plugins)
- Controle total sur le code et l'hebergement

### Limitations techniques
- Necessite des competences techniques pour la securite et la maintenance
- Performance dependante de la configuration serveur
- Pas de solution "cles en main" pour les non-developpeurs
- Mises a jour frequentes qui peuvent casser le site
- Architecture monolithique vieillissante

**Sources**: [Thrive Design Co](https://www.thrivedesignco.com/post/wordpress-small-business-issues-2025), [Represent.no](https://www.represent.no/articles/do-not-use-wordpress-for-your-small-business-website), [Patchstack Security Report 2026](https://patchstack.com/whitepaper/state-of-wordpress-security-in-2026/), [Site Smart Marketing](https://www.sitesmartmarketing.com/is-wordpress-still-a-good-platform-in-2026-an-honest-answer/)

---

## 5. Webflow (Concurrent indirect - No-code)

### Presentation
Plateforme de design web "no-code" orientee designers et agences. Interface visuelle puissante mais complexe. CMS integre, hosting inclus.

### Pricing (Site Plans)
| Plan | Prix/mois | Inclus |
|------|-----------|--------|
| Free | 0$ | 2 pages, sous-domaine Webflow |
| Basic | 14$ | Site statique simple |
| CMS | 23$ | 2000 items CMS, pages dynamiques |
| Business | 39-1049$ | 10K-20K items CMS, 2.5 To bande passante |
| Enterprise | Sur devis | SSO, SLA custom |

Workspace Plans: Core 19$/mois, Agency 35$/mois. Localization: 9-29$/mois par langue.

### Frustrations utilisateurs (sources: Webflow Forum, Trustpilot, Reddit, Capterra)

1. **Courbe d'apprentissage extreme** - "Il faut comprendre la hierarchie des styles, le box model, le positionnement absolu/relatif." Inaccessible aux non-developpeurs.
2. **Pannes et instabilite** - Panne majeure du 29 juillet 2025. "Publishing is broken, Designer won't load." La page de statut indiquait "Operational" alors que rien ne fonctionnait.
3. **Interface complexe pour les taches simples** - "100 etapes supplementaires juste pour cacher une section" (Desktop, Tablet, Mobile Vertical ET Mobile Horizontal).
4. **Support client lent et inefficace** - "Apres 1 semaine, toujours aucune reponse, aucun email." Certains utilisateurs attendent des semaines.
5. **CMS bugge et editeur lent** - Meme en temps normal, "le Designer est laggy, le CMS bugge, et la publication peu fiable."
6. **Cout cumule eleve** - Site plan + Workspace plan + Localization + E-commerce = addition rapide. Un site business multi-langue peut facilement depasser 100$/mois.
7. **Variables et fonctionnalites incompletes** - "Pas d'acces script ou API, scope limite, fonctionnalites basiques comme l'edition en masse manquantes."

### Ce que les utilisateurs aiment
- Controle visuel exceptionnel sur le design
- Code propre genere (HTML/CSS)
- Export de code possible (plan Core+)
- Animations et interactions avancees
- CMS flexible et puissant
- Communaute et ressources educatives riches

### Limitations techniques
- Pas adapte aux non-developpeurs
- E-commerce limite compare aux solutions dediees
- Pas de backend custom (necessite des outils tiers)
- Nombre de pages CMS limite selon le plan
- Localisation couteuse (facturation par langue)

**Sources**: [Webflow Forum - Frustrations](https://discourse.webflow.com/t/2-weeks-of-webflow-my-initial-frustrations/112747), [UltimateWB - Breaking Point](https://www.ultimatewb.com/blog/7182/webflows-breaking-point-downtime-bugs-and-a-community-fed-up/), [Trustpilot Webflow](https://www.trustpilot.com/review/webflow.com), [Chillybin - Limitations](https://www.chillybin.co/webflow-limitations-costs-learning-curve/)

---

## 6. Squarespace (Concurrent indirect - CMS)

### Presentation
Constructeur de sites elegant, oriente design et portfolios. Interface simple, templates soignes. Depuis 2026, nouvelles gammes de plans avec e-commerce integre sur tous les niveaux.

### Pricing
| Plan | Prix/mois | Inclus |
|------|-----------|--------|
| Basic | 16$ | Site simple, blog, portfolio |
| Core | 23$ | + Analytics avances |
| Plus | 39$ | + E-commerce (2.7% + 0.30$) |
| Advanced | 99$ | + E-commerce avance (2.5% + 0.30$) |

Pas de plan gratuit. Essai gratuit de 14 jours. Domaine gratuit la premiere annee sur plans annuels.

### Frustrations utilisateurs (sources: Trustpilot 1.2/5 sur 1500+ avis, BBB, forums)

1. **Support client deplorable** - Note Trustpilot de 1.2/5. Temps d'attente de 40+ minutes pour le chat. Remboursements promis puis refuses.
2. **Limitations SEO rigides** - Schema local business par defaut non modifiable, pas de meta descriptions sur les pages de categories, pas d'attributs nofollow/sponsored sans code.
3. **Personnalisation limitee** - Format de titre global non modifiable par page, pas d'acces au robots.txt, templates contraignants.
4. **Performance mediocre** - Core Web Vitals inferieurs a WordPress et Webflow. Sites lents par defaut.
5. **Pas d'autosave** - Perte de travail si deconnexion internet ou probleme de laptop pendant l'edition.
6. **Vendor lock-in** - Impossible de transferer un site Squarespace vers un autre hebergement.
7. **Features "beta" en production** - Squarespace lance des fonctionnalites en beta, transformant les utilisateurs en testeurs QA.
8. **Frais caches et facturation opaque** - Charges supplementaires non explicites, politique de remboursement opaque.

### Ce que les utilisateurs aiment
- Templates au design elegant et professionnel
- Interface relativement simple pour les sites basiques
- Bonne qualite visuelle out-of-the-box
- Domaine + hebergement + SSL inclus
- Nouvel outil SEO IA (mars 2025) pour titres et meta descriptions
- Solution tout-en-un sans configuration technique

### Limitations techniques
- Pas de code exportable
- Personnalisation CSS/JS limitee
- E-commerce avec frais de transaction sur tous les plans sauf Advanced
- Pas d'API publique robuste
- Integrabilite limitee avec des outils tiers

**Sources**: [Trustpilot Squarespace](https://www.trustpilot.com/review/www.squarespace.com), [BBB Complaints](https://www.bbb.org/us/ny/new-york/profile/internet-service/squarespace-inc-0121-103868/complaints), [Hook Agency - SEO](https://hookagency.com/blog/squarespace-bad-seo/), [Cybernews Review](https://cybernews.com/best-website-builders/squarespace-review/)

---

## Tableau comparatif synthetique

| Critere | Lovable | Bolt.new | Wix | WordPress | Webflow | Squarespace | **Masamune (cible)** |
|---------|---------|----------|-----|-----------|---------|-------------|---------------------|
| **Cible** | Devs/founders | Devs | Grand public | Tous | Designers/agences | Creatifs/PME | **TPE/PME non-tech** |
| **Prix entree** | 0$ (25$ pro) | 0$ (25$ pro) | 0$ (17$ premium) | 0$ (4$ premium) | 0$ (14$ premium) | 16$ | **A definir** |
| **Facilite non-dev** | Moyenne | Faible | Haute | Faible | Tres faible | Haute | **Tres haute** |
| **SEO** | Faible (SPA) | Faible | Moyen-faible | Fort (avec plugins) | Fort | Moyen | **Fort (statique)** |
| **Performance** | Moyenne | Moyenne | Faible | Variable | Bonne | Moyenne | **Excellente (statique)** |
| **Vendor lock-in** | Moyen (GitHub) | Faible | Total | Aucun (self-hosted) | Moyen (export code) | Total | **Aucun (statique)** |
| **Maintenance** | Faible | Faible | Faible | Tres elevee | Faible | Faible | **Zero** |
| **Securite** | Bonne | Bonne | Bonne | Catastrophique | Bonne | Bonne | **Excellente (statique)** |
| **Support** | Faible | Tres faible | Moyen | Communaute | Faible | Tres faible | **A definir** |
