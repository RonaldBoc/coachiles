# Guide SEO Coachiles

## ✅ Implémentations réalisées

### 1. Meta Tags Dynamiques (@unhead/vue)

- Titres uniques par page
- Descriptions optimisées avec mots-clés
- Open Graph pour le partage social
- Twitter Cards

### 2. Données Structurées Schema.org

- `Organization` pour Coachiles
- `WebSite` avec SearchAction
- `Person` + `Service` pour chaque coach
- `FAQPage` pour la page FAQ
- `BreadcrumbList` pour la navigation

### 3. Pages optimisées

- [x] HomePage
- [x] CoachBrowser (annuaire)
- [x] CoachPublicProfile (profils dynamiques)
- [x] FAQPage

---

## 🚨 Actions manuelles requises

### 1. Google Search Console (OBLIGATOIRE)

1. Aller sur https://search.google.com/search-console
2. Ajouter la propriété `coachiles.com`
3. Vérifier via DNS ou fichier HTML
4. Soumettre le sitemap : `https://coachiles.com/sitemap.xml`

### 2. Créer une image Open Graph

Créez une image 1200x630px nommée `og-image.jpg` dans `/public/images/`

- Logo Coachiles
- Texte accrocheur
- Couleurs de la marque

### 3. Google My Business (si applicable)

Si vous avez une adresse physique, créez une fiche Google My Business.

---

## 🎯 Solution au problème du rendu JavaScript

### Option A : Prerender.io (Recommandé - 50$/mois)

Service qui pré-rend vos pages pour les bots Google.

1. S'inscrire sur https://prerender.io
2. Obtenir votre token
3. Configurer dans Vercel :

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": ".*(?:googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator).*"
        }
      ],
      "destination": "https://service.prerender.io/https://coachiles.com/$1"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Option B : Migration vers Nuxt.js (Long terme)

Pour un SEO parfait, migrer vers Nuxt.js avec SSR natif.

### Option C : Static Site Generation partielle

Générer les pages clés en HTML statique au build.

---

## 📊 Mots-clés cibles

### Mots-clés principaux (Volume élevé)

- "coach sportif"
- "coach de vie"
- "coach professionnel"
- "trouver un coach"
- "coaching personnel"

### Mots-clés longue traîne (Conversion élevée)

- "coach sportif [ville]"
- "coach fitness à domicile"
- "coach musculation en ligne"
- "coach nutrition sportive"
- "préparateur mental sport"

### Mots-clés locaux

- "coach sportif Martinique"
- "coach sportif Guadeloupe"
- "coach sportif Fort-de-France"

---

## 📝 Contenu à créer (Blog)

### Articles recommandés

1. "Comment choisir son coach sportif : le guide complet"
2. "Les bienfaits du coaching personnel"
3. "Coach en ligne vs coach à domicile : que choisir ?"
4. "5 exercices à faire avec un coach fitness"
5. "Préparation mentale : pourquoi c'est essentiel"

### Pages de catégories à créer

- `/coaches/sportif` - Coach sportif
- `/coaches/vie` - Coach de vie
- `/coaches/nutrition` - Nutritionniste
- `/coaches/yoga` - Professeur de yoga
- `/coaches/musculation` - Coach musculation

---

## 🔧 Sitemap dynamique

Remplacez le sitemap statique par un sitemap dynamique qui inclut tous les profils de coachs.

### Script à exécuter périodiquement

```javascript
// scripts/generate-sitemap.js
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

async function generateSitemap() {
  const { data: coaches } = await supabase
    .from('coaches')
    .select('id, updated_at')
    .eq('is_active', true)

  const staticUrls = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/coaches', priority: 0.9, changefreq: 'daily' },
    { url: '/faq', priority: 0.6, changefreq: 'monthly' },
    { url: '/contact', priority: 0.6, changefreq: 'monthly' },
    { url: '/a-propos', priority: 0.6, changefreq: 'monthly' },
  ]

  const coachUrls = coaches.map((coach) => ({
    url: `/coach/${coach.id}`,
    priority: 0.8,
    changefreq: 'weekly',
    lastmod: new Date(coach.updated_at).toISOString().split('T')[0],
  }))

  const allUrls = [...staticUrls, ...coachUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>https://coachiles.com${item.url}</loc>
    <lastmod>${item.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`

  fs.writeFileSync('public/sitemap.xml', sitemap)
  console.log(`✅ Sitemap generated with ${allUrls.length} URLs`)
}

generateSitemap()
```

---

## 📈 Suivi et mesure

### Outils à configurer

1. **Google Search Console** - Suivi du référencement
2. **Google Analytics 4** - Trafic et conversions
3. **Bing Webmaster Tools** - Référencement Bing

### Métriques à suivre

- Position moyenne des mots-clés
- Clics organiques par semaine
- Impressions
- Taux de clics (CTR)
- Pages indexées

---

## 🚀 Priorités d'action

| Priorité | Action                | Délai      | Impact     |
| -------- | --------------------- | ---------- | ---------- |
| 🔴       | Google Search Console | Immédiat   | ⭐⭐⭐⭐⭐ |
| 🔴       | Image Open Graph      | 1 jour     | ⭐⭐⭐⭐   |
| 🟠       | Prerender.io          | 1 semaine  | ⭐⭐⭐⭐⭐ |
| 🟠       | Sitemap dynamique     | 1 semaine  | ⭐⭐⭐⭐   |
| 🟡       | Pages catégories      | 2 semaines | ⭐⭐⭐⭐   |
| 🟡       | Articles blog         | Ongoing    | ⭐⭐⭐     |
