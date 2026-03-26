# Rapport de Tests E2E - Masamune
**Date** : 2026-03-26
**URL** : https://app-amber-tau-72.vercel.app
**Methode** : WebFetch + curl (Chrome extension non connectee)

---

## Test 1 : Landing Page

**Resultat : PASS**

| Critere | Statut | Detail |
|---------|--------|--------|
| Chargement page | PASS | Page se charge correctement, HTML valide |
| Accents francais | PASS | Tous corrects : Decrivez, presence, Elegance, activite |
| Lien Fonctionnalites | PASS | Pointe vers `#comment-ca-marche` |
| Lien Tarifs | PASS | Pointe vers `#tarifs` |
| Lien FAQ | PASS | Pointe vers `#faq` |
| Lien Connexion | PASS | Pointe vers `/login` |
| Lien Creer mon site | PASS | Pointe vers `/signup` |
| Footer - Mentions legales | PASS | Pointe vers `/mentions-legales` |
| Footer - CGU | PASS | Pointe vers `/cgu` |
| Footer - Confidentialite | PASS | Pointe vers `/confidentialite` |
| Footer - Email contact | PASS | `mailto:contact@masamune.fr` |

**Sections presentes** :
1. Hero avec CTA "Creer mon site gratuitement"
2. Stats (500+ sites, 98% satisfaction, 5 min)
3. Comment ca marche (3 etapes)
4. Galerie de sites exemples (6 secteurs)
5. Tableau comparatif (vs agences, CMS, autres IA)
6. Tarifs (Free, Pro, Business, Enterprise)
7. FAQ (accordeons)
8. Footer

---

## Test 2 : Signup

**Resultat : PASS (structure) / NON TESTE (execution)**

| Critere | Statut | Detail |
|---------|--------|--------|
| Page /signup charge | PASS | Formulaire affiche correctement |
| Champ email | PASS | type=email, required |
| Champ password | PASS | type=password, required, minLength=8 |
| Bouton submit | PASS | "Creer mon compte gratuitement" |
| Lien vers login | PASS | "Deja un compte ? Se connecter" -> `/login` |
| Accents | PASS | Tous corrects |
| Gestion erreur email existant | PASS (code) | Redirect vers `/signup?error=Cette adresse email est deja utilisee.` |
| Gestion succes check_email | PASS (code) | Affiche message vert "Verifiez votre email !" |

**Note** : L'execution du signup (creation de compte) n'a pas pu etre testee via curl car l'auth passe par des Server Actions Next.js (pas des API REST). Necessite un navigateur.

---

## Test 3 : Login

**Resultat : PASS (structure) / NON TESTE (execution)**

| Critere | Statut | Detail |
|---------|--------|--------|
| Page /login charge | PASS | Formulaire affiche correctement |
| Champ email | PASS | type=email, required |
| Champ password | PASS | type=password, required |
| Bouton submit | PASS | "Se connecter" |
| Bouton Google OAuth | PASS | "Continuer avec Google" |
| Lien vers signup | PASS | "Pas encore de compte ? Creer un compte" -> `/signup` |
| Accents | PASS | Tous corrects |
| Affichage erreur via query param | PASS | Composant conditionnel affiche `params.error` en rouge |

---

## Test 4 : Creer un site (/dashboard/new -> POST /api/sites)

**Resultat : PASS (architecture) - Necessite auth pour test complet**

| Critere | Statut | Detail |
|---------|--------|--------|
| GET /api/sites sans auth | PASS | Retourne 401 `{"error":"Unauthorized"}` |
| POST /api/sites sans auth | PASS | Retourne 401 (protege) |
| Page /dashboard/new | PASS (code) | Auto-cree un site via fetch POST /api/sites |
| Redirection apres creation | PASS (code) | `router.push(/dashboard/sites/${site.id})` |
| Gestion erreur creation | PASS (code) | `alert(data.error)` si !response.ok |
| Limite par plan | PASS (code) | free=1, pro=1, business=3, enterprise=10 |

**Architecture** :
- `/dashboard/new` est un client component qui auto-execute `handleCreate()` au mount
- Envoie `businessName: "Nouveau site", businessType: "a-definir"` au POST /api/sites
- Le POST genere un slug unique, cree le site + une conversation initiale
- Redirige vers `/dashboard/sites/{id}` (page du chat)

---

## Test 5 : Chat Gemini

**Resultat : PASS (architecture) - Necessite auth pour test complet**

| Critere | Statut | Detail |
|---------|--------|--------|
| Endpoint chat | PASS (code) | `POST /api/chat/[siteId]/message` |
| Streaming | PASS (code) | ReadableStream avec TextEncoder, Transfer-Encoding: chunked |
| Envoi auto "Bonjour" | PASS (code) | ChatInterface envoie "Bonjour" si messages vides |
| Filtrage "Bonjour" dans UI | PASS (code) | Le message "Bonjour" de l'utilisateur est filtre de l'affichage |
| Detection brief_json | PASS (code) | Regex `brief_json` dans la reponse -> marque briefExtracted |
| Sauvegarde messages | PASS (code) | Messages user + assistant persistes en DB |
| Gestion erreur chat | PASS (code) | Message "Desolee, une erreur est survenue" en cas d'erreur |
| Fin de conversation | PASS (code) | Bandeau vert "Votre site est en cours de creation !" |
| Job generation | PASS (code) | `addJob("generate-site", { siteId, briefJson })` |

**Note** : Le chat utilise `streamHaikuResponse` (mal nomme - c'est Gemini, pas Haiku) avec `HAIKU_QUALIFYING_SYSTEM_PROMPT`.

---

## Test 6 : Gestion des erreurs

| Critere | Statut | Detail |
|---------|--------|--------|
| Login mauvais password | PASS (code) | Redirect `/login?error=<message>`, message affiche en rouge |
| Signup email existant | PASS (code) | Detecte identities vides -> message "Cette adresse email est deja utilisee." |
| /dashboard sans auth | PASS | HTTP 307 redirect vers `/login` (verifie via curl) |
| /api/sites sans auth | PASS | HTTP 401 `{"error":"Unauthorized"}` |
| Page inexistante | PASS | HTTP 404 retourne (page 404 par defaut Next.js) |
| Erreur generique signup | PASS (code) | Catch-all -> "Une erreur est survenue. Reessayez." |
| Erreur generique login | PASS (code) | Catch-all -> "Une erreur est survenue. Reessayez." |

---

## Bugs trouves

### BUG-001 : URL de redirect Google OAuth hardcodee avec IP privee
**Severite** : HAUTE
**Fichier** : `app/src/app/login/actions.ts:35` et `app/src/app/signup/actions.ts:18`
**Description** : Le fallback pour `SITE_URL` est `http://72.62.181.156:3080` au lieu de l'URL Vercel de production.
**Impact** : Si `SITE_URL` n'est pas configure dans les variables d'environnement Vercel, le Google OAuth redirigera vers une IP inaccessible.
**Steps to reproduce** :
1. Aller sur /login
2. Cliquer "Continuer avec Google"
3. Si SITE_URL n'est pas defini -> redirect vers IP privee

### BUG-002 : Page 404 en anglais
**Severite** : BASSE
**Fichier** : Pas de fichier `not-found.tsx` custom
**Description** : La page 404 affiche "This page could not be found." en anglais au lieu de francais, bien que `<html lang="fr">` soit defini.
**Steps to reproduce** :
1. Naviguer vers https://app-amber-tau-72.vercel.app/nonexistent-page
2. Observer le message en anglais

### BUG-003 : Pas de lien "Mot de passe oublie" sur la page login
**Severite** : MOYENNE
**Fichier** : `app/src/app/login/page.tsx`
**Description** : Il n'y a pas de lien pour reinitialiser le mot de passe. Les utilisateurs qui oublient leur mot de passe n'ont aucun recours.
**Steps to reproduce** :
1. Aller sur /login
2. Constater l'absence de lien "Mot de passe oublie"

### BUG-004 : Nom de fonction trompeur "streamHaikuResponse"
**Severite** : BASSE (dette technique)
**Fichier** : `app/src/app/api/chat/[siteId]/message/route.ts:4`
**Description** : La fonction s'appelle `streamHaikuResponse` et le prompt s'appelle `HAIKU_QUALIFYING_SYSTEM_PROMPT`, mais le systeme utilise Gemini, pas Claude Haiku. Nommage confus.

### BUG-005 : Mentions legales incompletes
**Severite** : MOYENNE (legal)
**Fichier** : Page `/mentions-legales`
**Description** : La page contient des placeholders "[A completer]" pour les informations de la societe (SIRET, adresse, hebergeur, etc.). Non conforme pour une mise en production.

### BUG-006 : /dashboard/new envoie des valeurs hardcodees
**Severite** : MOYENNE
**Fichier** : `app/src/app/dashboard/new/page.tsx:17-18`
**Description** : La creation de site envoie `businessName: "Nouveau site"` et `businessType: "a-definir"` en dur. L'utilisateur n'a pas de formulaire pour saisir ces informations avant la creation. Le chat Gemini est cense les recueillir, mais le site est cree avec des valeurs placeholder avant meme que le chat commence.

### BUG-007 : useState utilise comme effet de bord pour auto-create
**Severite** : BASSE (dette technique)
**Fichier** : `app/src/app/dashboard/new/page.tsx:39-41`
**Description** : `useState(() => { handleCreate(); })` est un anti-pattern React. Devrait etre un `useEffect`.

---

## Suggestions d'amelioration

1. **Ajouter "Mot de passe oublie"** sur la page login avec `supabase.auth.resetPasswordForEmail()`
2. **Creer une page 404 custom en francais** (`app/not-found.tsx`)
3. **Verifier que `SITE_URL` est configure** dans les variables d'environnement Vercel pour le Google OAuth
4. **Ajouter la validation cote client** : feedback visuel sur le formulaire login/signup (loading state sur le bouton, validation en temps reel)
5. **Renommer les fonctions Haiku -> Gemini** pour la clarte du code
6. **Completer les mentions legales** avant mise en production
7. **Repenser le flow /dashboard/new** : soit demander businessName/businessType dans un formulaire, soit les rendre optionnels et les mettre a jour apres le chat qualifying
8. **Ajouter des tests automatises** (Playwright) pour couvrir les scenarios critiques : signup, login, creation site, chat

---

## Resume

| Test | Resultat |
|------|----------|
| 1. Landing page | PASS |
| 2. Signup (structure) | PASS |
| 3. Login (structure) | PASS |
| 4. Creation site (API) | PASS (auth protegee, code OK) |
| 5. Chat Gemini (code) | PASS (architecture OK) |
| 6. Gestion erreurs | PASS |

**Tests non executables sans navigateur** : Signup/login execution, creation de site authentifiee, chat Gemini streaming.
**Bugs critiques** : 1 (BUG-001 - OAuth URL)
**Bugs moyens** : 3 (BUG-003, BUG-005, BUG-006)
**Bugs bas** : 3 (BUG-002, BUG-004, BUG-007)
