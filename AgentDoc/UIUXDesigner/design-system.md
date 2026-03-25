# Masamune — Design System

**Version** : 1.0
**Date** : 2026-03-25
**Stack** : Next.js + Tailwind CSS

---

## 1. Philosophie de design

Inspire du katana Masamune : **precision, elegance, puissance maitrisee**. L'interface est epuree, tranchante, sans superflu. Chaque element sert un but. L'experience doit rassurer les utilisateurs non-techniques tout en projetant une image professionnelle et moderne.

**Principes** :
- **Simplicite radicale** : zero jargon, zero friction
- **Confiance** : couleurs stables, feedback constant, etats clairs
- **Efficacite** : actions en minimum de clics, guidage par l'IA

---

## 2. Palette de couleurs

### Couleurs principales

| Role | Nom | Hex | Tailwind | Usage |
|------|-----|-----|----------|-------|
| Primaire | Indigo Masamune | `#4F46E5` | `indigo-600` | CTA principaux, liens, elements actifs |
| Primaire hover | Indigo profond | `#4338CA` | `indigo-700` | Hover sur CTA |
| Primaire light | Indigo pale | `#EEF2FF` | `indigo-50` | Fonds surlignage, badges |
| Secondaire | Slate acier | `#334155` | `slate-700` | Texte principal, headers |
| Accent | Amber lame | `#F59E0B` | `amber-500` | Highlights, badges premium, notifications |
| Accent hover | Amber sombre | `#D97706` | `amber-600` | Hover accent |

### Neutres

| Role | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Texte principal | `#1E293B` | `slate-800` | Titres, texte body |
| Texte secondaire | `#64748B` | `slate-500` | Descriptions, labels |
| Texte desactive | `#94A3B8` | `slate-400` | Placeholders, etats desactives |
| Bordure | `#E2E8F0` | `slate-200` | Bordures cards, inputs, separateurs |
| Fond page | `#F8FAFC` | `slate-50` | Background principal dashboard |
| Fond card | `#FFFFFF` | `white` | Cards, modals, panels |
| Fond sidebar | `#F1F5F9` | `slate-100` | Sidebar, sections secondaires |

### Etats semantiques

| Role | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Succes | `#10B981` | `emerald-500` | Site en ligne, paiement OK, validation |
| Succes fond | `#ECFDF5` | `emerald-50` | Badge succes, toast fond |
| Erreur | `#EF4444` | `red-500` | Erreurs, suppressions, alertes |
| Erreur fond | `#FEF2F2` | `red-50` | Badge erreur, toast fond |
| Warning | `#F59E0B` | `amber-500` | Avertissements, limites approchees |
| Warning fond | `#FFFBEB` | `amber-50` | Badge warning, toast fond |
| Info | `#3B82F6` | `blue-500` | Informations, tips |
| Info fond | `#EFF6FF` | `blue-50` | Badge info, toast fond |

### Mode sombre (V2)

Le mode sombre sera implemente en V2. Prevoir les classes `dark:` dans Tailwind des le depart pour faciliter la migration.

---

## 3. Typographie

### Polices Google Fonts

| Role | Police | Poids | Fallback |
|------|--------|-------|----------|
| Headings | **Inter** | 600 (semibold), 700 (bold) | `system-ui, sans-serif` |
| Body | **Inter** | 400 (regular), 500 (medium) | `system-ui, sans-serif` |
| Code/Monospace | **JetBrains Mono** | 400 | `monospace` |

Inter est choisie pour sa lisibilite excellente en petite taille, son support multilingue, et son caractere moderne mais neutre.

### Echelle typographique

| Nom | Taille | Line Height | Poids | Tailwind |
|-----|--------|-------------|-------|----------|
| Display | 48px / 3rem | 1.1 | 700 | `text-5xl font-bold leading-tight` |
| H1 | 36px / 2.25rem | 1.2 | 700 | `text-4xl font-bold leading-snug` |
| H2 | 30px / 1.875rem | 1.25 | 600 | `text-3xl font-semibold` |
| H3 | 24px / 1.5rem | 1.3 | 600 | `text-2xl font-semibold` |
| H4 | 20px / 1.25rem | 1.4 | 600 | `text-xl font-semibold` |
| Body Large | 18px / 1.125rem | 1.6 | 400 | `text-lg` |
| Body | 16px / 1rem | 1.6 | 400 | `text-base` |
| Body Small | 14px / 0.875rem | 1.5 | 400 | `text-sm` |
| Caption | 12px / 0.75rem | 1.4 | 500 | `text-xs font-medium` |

### Configuration Tailwind

```js
// tailwind.config.js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

---

## 4. Spacing et Grid

### Systeme de spacing (base 4px)

| Token | Valeur | Tailwind | Usage typique |
|-------|--------|----------|---------------|
| xs | 4px | `p-1` / `gap-1` | Espaces internes minimaux |
| sm | 8px | `p-2` / `gap-2` | Entre icone et label |
| md | 12px | `p-3` / `gap-3` | Padding interne boutons |
| base | 16px | `p-4` / `gap-4` | Padding cards, espacement sections |
| lg | 24px | `p-6` / `gap-6` | Espacement entre composants |
| xl | 32px | `p-8` / `gap-8` | Sections majeures |
| 2xl | 48px | `p-12` / `gap-12` | Sections landing page |
| 3xl | 64px | `p-16` / `gap-16` | Hero sections, grands espacements |

### Grid 12 colonnes

```html
<!-- Container principal -->
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <div class="grid grid-cols-12 gap-6">
    <!-- Sidebar : 3 colonnes -->
    <aside class="col-span-3">...</aside>
    <!-- Contenu : 9 colonnes -->
    <main class="col-span-9">...</main>
  </div>
</div>
```

### Breakpoints responsifs

| Breakpoint | Largeur min | Tailwind | Usage |
|------------|-------------|----------|-------|
| Mobile | 0px | (defaut) | Smartphones portrait |
| SM | 640px | `sm:` | Smartphones paysage |
| MD | 768px | `md:` | Tablettes |
| LG | 1024px | `lg:` | Desktop |
| XL | 1280px | `xl:` | Grand desktop |

**Approche mobile-first** : toujours coder pour mobile en premier, puis ajouter les breakpoints.

### Largeurs max de contenu

| Contexte | Largeur max | Tailwind |
|----------|-------------|----------|
| Landing page | 1280px | `max-w-7xl` |
| Dashboard | 100% (avec sidebar) | `w-full` |
| Contenu texte | 768px | `max-w-3xl` |
| Modals petits | 448px | `max-w-md` |
| Modals moyens | 640px | `max-w-xl` |
| Chat panel | 640px | `max-w-xl` |

---

## 5. Composants

### 5.1 Boutons

#### Primary

```html
<button class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
  Creer mon site
</button>
```

#### Secondary

```html
<button class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
  Annuler
</button>
```

#### Ghost

```html
<button class="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
  En savoir plus
</button>
```

#### Danger

```html
<button class="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
  Supprimer
</button>
```

#### Tailles

| Taille | Classes additionnelles |
|--------|----------------------|
| Small | `px-3 py-1.5 text-xs` |
| Default | `px-4 py-2.5 text-sm` |
| Large | `px-6 py-3 text-base` |

### 5.2 Inputs

#### Text Input

```html
<div>
  <label class="mb-1.5 block text-sm font-medium text-slate-700">
    Nom de votre entreprise
  </label>
  <input
    type="text"
    placeholder="Ex: Boulangerie du Vieux Lyon"
    class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400"
  />
  <!-- Etat erreur : ajouter border-red-500 focus:border-red-500 focus:ring-red-500/20 -->
  <p class="mt-1.5 text-xs text-red-500">Ce champ est requis</p>
</div>
```

#### Textarea

```html
<textarea
  rows="4"
  placeholder="Decrivez votre activite..."
  class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
></textarea>
```

#### Select

```html
<select class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
  <option value="">Choisissez votre secteur</option>
  <option>Restaurant</option>
  <option>Artisan</option>
</select>
```

### 5.3 Cards

#### Card standard

```html
<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
  <h3 class="text-lg font-semibold text-slate-800">Titre</h3>
  <p class="mt-2 text-sm text-slate-500">Description du contenu.</p>
</div>
```

#### Card site (dashboard)

```html
<div class="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-slate-300">
  <!-- Thumbnail -->
  <div class="aspect-video bg-slate-100 overflow-hidden">
    <img src="..." alt="Preview" class="h-full w-full object-cover transition-transform group-hover:scale-105" />
  </div>
  <!-- Body -->
  <div class="p-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-800 truncate">Mon site</h3>
      <span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
        En ligne
      </span>
    </div>
    <p class="mt-1 text-xs text-slate-400">monsite.masamune.app</p>
  </div>
</div>
```

### 5.4 Badges

```html
<!-- Succes -->
<span class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">En ligne</span>

<!-- Warning -->
<span class="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">En generation</span>

<!-- Erreur -->
<span class="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">Erreur</span>

<!-- Info -->
<span class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">Brouillon</span>

<!-- Premium -->
<span class="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">Pro</span>
```

### 5.5 Modal

```html
<!-- Backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <!-- Modal -->
  <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
    <h2 class="text-lg font-semibold text-slate-800">Titre du modal</h2>
    <p class="mt-2 text-sm text-slate-500">Contenu du modal.</p>
    <div class="mt-6 flex justify-end gap-3">
      <button class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Annuler</button>
      <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Confirmer</button>
    </div>
  </div>
</div>
```

### 5.6 Toast notifications

```html
<!-- Toast conteneur (coin haut droit) -->
<div class="fixed right-4 top-4 z-50 flex flex-col gap-3">
  <!-- Toast succes -->
  <div class="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg">
    <div class="h-5 w-5 text-emerald-500"><!-- CheckCircle icon --></div>
    <p class="text-sm font-medium text-emerald-800">Site mis en ligne avec succes</p>
    <button class="ml-auto text-emerald-400 hover:text-emerald-600">&times;</button>
  </div>

  <!-- Toast erreur -->
  <div class="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-lg">
    <div class="h-5 w-5 text-red-500"><!-- XCircle icon --></div>
    <p class="text-sm font-medium text-red-800">Erreur lors de la generation</p>
    <button class="ml-auto text-red-400 hover:text-red-600">&times;</button>
  </div>
</div>
```

### 5.7 Chat bulle (onboarding + iterations)

```html
<!-- Message assistant -->
<div class="flex gap-3">
  <div class="h-8 w-8 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
    <span class="text-sm font-bold text-indigo-600">M</span>
  </div>
  <div class="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-800">
    Bonjour ! Quel type d'activite avez-vous ?
  </div>
</div>

<!-- Message utilisateur -->
<div class="flex justify-end gap-3">
  <div class="max-w-[80%] rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm text-white">
    Je suis boulanger dans le Vieux Lyon.
  </div>
</div>

<!-- Indicateur de frappe IA -->
<div class="flex gap-3">
  <div class="h-8 w-8 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
    <span class="text-sm font-bold text-indigo-600">M</span>
  </div>
  <div class="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
    <span class="h-2 w-2 animate-bounce rounded-full bg-slate-400" style="animation-delay: 0ms"></span>
    <span class="h-2 w-2 animate-bounce rounded-full bg-slate-400" style="animation-delay: 150ms"></span>
    <span class="h-2 w-2 animate-bounce rounded-full bg-slate-400" style="animation-delay: 300ms"></span>
  </div>
</div>
```

### 5.8 Barre de progression (generation de site)

```html
<div class="rounded-xl border border-slate-200 bg-white p-6">
  <div class="flex items-center justify-between mb-3">
    <h3 class="text-sm font-semibold text-slate-800">Generation en cours...</h3>
    <span class="text-xs text-slate-500">3/5 etapes</span>
  </div>
  <div class="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
    <div class="h-full rounded-full bg-indigo-600 transition-all duration-500" style="width: 60%"></div>
  </div>
  <p class="mt-3 text-xs text-slate-500">Integration des images et optimisation...</p>
</div>
```

### 5.9 Navigation sidebar (dashboard)

```html
<nav class="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-50">
  <!-- Logo -->
  <div class="flex h-16 items-center px-6 border-b border-slate-200">
    <span class="text-xl font-bold text-slate-800">Masamune</span>
  </div>
  <!-- Links -->
  <div class="flex-1 overflow-y-auto px-3 py-4">
    <!-- Active -->
    <a class="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600">
      <!-- Icon --> Mes sites
    </a>
    <!-- Inactive -->
    <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
      <!-- Icon --> Domaines
    </a>
    <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
      <!-- Icon --> Abonnement
    </a>
    <a class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
      <!-- Icon --> Parametres
    </a>
  </div>
  <!-- User -->
  <div class="border-t border-slate-200 px-3 py-4">
    <div class="flex items-center gap-3 rounded-lg px-3 py-2">
      <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
        <span class="text-xs font-bold text-indigo-600">JD</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-slate-800 truncate">Jean Dupont</p>
        <p class="text-xs text-slate-400 truncate">jean@email.com</p>
      </div>
    </div>
  </div>
</nav>
```

---

## 6. Icones

Utiliser **Lucide React** (`lucide-react`) pour la coherence. Taille par defaut : `h-5 w-5`. Couleur heritee du parent via `text-current`.

Icones courantes :
- Navigation : `Home`, `Globe`, `CreditCard`, `Settings`, `HelpCircle`
- Actions : `Plus`, `Pencil`, `Trash2`, `ExternalLink`, `Upload`, `Download`
- Status : `CheckCircle`, `XCircle`, `AlertTriangle`, `Clock`, `Loader2`
- Chat : `Send`, `Paperclip`, `Image`

---

## 7. Ombres et arrondis

| Element | Arrondi | Ombre |
|---------|---------|-------|
| Boutons | `rounded-lg` (8px) | `shadow-sm` |
| Cards | `rounded-xl` (12px) | `shadow-sm`, `hover:shadow-md` |
| Modals | `rounded-2xl` (16px) | `shadow-xl` |
| Inputs | `rounded-lg` (8px) | aucune |
| Badges | `rounded-full` | aucune |
| Toasts | `rounded-lg` (8px) | `shadow-lg` |
| Avatars | `rounded-full` | aucune |
| Bulles chat | `rounded-2xl` (16px) | aucune |

---

## 8. Animations et micro-interactions

### Transitions globales

Toutes les interactions ont une transition par defaut :

```css
/* Tailwind : transition-all duration-200 */
transition: all 0.2s ease;
```

### Micro-interactions specifiques

| Element | Interaction | Classes Tailwind |
|---------|------------|-----------------|
| Bouton clic | Scale down subtil | `active:scale-[0.98]` |
| Card hover | Ombre accrue + legere montee | `hover:shadow-md hover:-translate-y-0.5 transition-all` |
| Thumbnail hover | Zoom image | `group-hover:scale-105 transition-transform duration-300` |
| Lien sidebar | Fond apparait | `hover:bg-slate-100 transition-colors` |
| Input focus | Ring indigo | `focus:ring-2 focus:ring-indigo-500/20 transition-colors` |
| Toast entree | Slide depuis la droite | `animate-slide-in-right` (custom) |
| Toast sortie | Fade out | `animate-fade-out` (custom) |

### Animations custom (tailwind.config.js)

```js
extend: {
  keyframes: {
    'slide-in-right': {
      '0%': { transform: 'translateX(100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    'fade-out': {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    'pulse-soft': {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.7' },
    },
  },
  animation: {
    'slide-in-right': 'slide-in-right 0.3s ease-out',
    'fade-out': 'fade-out 0.2s ease-in forwards',
    'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  },
}
```

### Animations generation de site

| Etape | Animation |
|-------|-----------|
| Barre de progression | Largeur animate avec `transition-all duration-500` |
| Etape en cours | Icone avec `animate-spin` (Loader2) |
| Etape terminee | Icone CheckCircle avec scale-in |
| Apercu site | Iframe qui apparait avec `animate-fade-in` |
| Message chat IA | Bulles apparaissent en fade-up sequentiel |

### Indicateur de frappe IA

Trois points rebondissants avec delais decales (voir section 5.7 Chat bulle).

---

## 9. Regles d'accessibilite

- Contraste minimum WCAG AA (4.5:1 pour texte, 3:1 pour grands textes)
- `focus-visible` sur tous les elements interactifs
- `aria-label` sur les boutons icone-seuls
- `alt` sur toutes les images
- Navigation clavier complete (tab, enter, escape)
- Messages d'erreur associes aux inputs via `aria-describedby`
- `role="alert"` sur les toasts
- Hierarchie de headings respectee (h1 > h2 > h3)
