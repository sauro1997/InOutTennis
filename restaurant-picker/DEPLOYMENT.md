# Guide de déploiement - On mange où? 🍽️

## Options de déploiement

### 1. Netlify (Recommandé - Gratuit)

#### Déploiement automatique via Git
1. Connectez votre repository GitHub à Netlify
2. Configuration de build :
   ```
   Build command: npm run build
   Publish directory: dist
   ```
3. Variables d'environnement : Aucune requise
4. Le site sera automatiquement redéployé à chaque push

#### Déploiement manuel
```bash
# Build de production
npm run build

# Installer Netlify CLI
npm install -g netlify-cli

# Déployer
netlify deploy --prod --dir=dist
```

### 2. Vercel (Gratuit)

#### Via Vercel CLI
```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod
```

#### Configuration vercel.json (optionnelle)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 3. GitHub Pages

#### Configuration GitHub Actions
Créer `.github/workflows/deploy.yml` :
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm install
    - run: npm run build
    - uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 4. Firebase Hosting

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Initialiser Firebase
firebase init hosting

# Configuration firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# Déployer
npm run build
firebase deploy
```

### 5. Serveur personnel (VPS/Dédié)

#### Avec Nginx
```bash
# Build de production
npm run build

# Copier les fichiers vers le serveur
scp -r dist/* user@server:/var/www/html/

# Configuration Nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache pour les assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Configuration pour la production

### 1. Variables d'environnement

L'application n'utilise que des APIs gratuites, aucune clé requise :
- OpenStreetMap (Overpass API)
- Nominatim (géocodage)
- Leaflet (cartes)

### 2. Optimisations de performance

#### Compression
```bash
# Activer la compression gzip/brotli sur le serveur
# Nginx exemple :
gzip on;
gzip_types text/css application/javascript application/json;
```

#### Headers de cache
```nginx
# Cache des assets statiques
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Pas de cache pour index.html
location = /index.html {
    add_header Cache-Control "no-cache";
}
```

### 3. HTTPS et sécurité

#### Certificat SSL gratuit (Let's Encrypt)
```bash
# Avec Certbot
sudo certbot --nginx -d votre-domaine.com
```

#### Headers de sécurité
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

## PWA et installation mobile

### 1. Vérifications PWA
- ✅ Manifest.json configuré
- ✅ Service Worker généré automatiquement
- ✅ HTTPS requis en production
- ✅ Icônes PWA (à ajouter)

### 2. Test d'installation
1. Ouvrir l'app sur mobile (Chrome/Safari)
2. "Ajouter à l'écran d'accueil" devrait apparaître
3. L'app s'installe comme une app native

### 3. Icônes PWA à créer
Créer ces fichiers dans `/public/` :
- `pwa-192x192.png` (192x192px)
- `pwa-512x512.png` (512x512px)
- `favicon.ico`
- `apple-touch-icon.png` (180x180px)

## Monitoring et analytics

### 1. Google Analytics (optionnel)
```html
<!-- Dans index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Monitoring d'erreurs
```bash
# Sentry (optionnel)
npm install @sentry/react
```

## Domaine personnalisé

### 1. Configuration DNS
```
Type: CNAME
Name: www
Value: votre-site.netlify.app

Type: A
Name: @
Value: IP_du_serveur
```

### 2. Redirection www vers non-www
```nginx
server {
    server_name www.votre-domaine.com;
    return 301 https://votre-domaine.com$request_uri;
}
```

## Checklist de déploiement

- [ ] Build de production réussie (`npm run build`)
- [ ] Test local de la build (`npm run preview`)
- [ ] Configuration HTTPS
- [ ] Test PWA sur mobile
- [ ] Vérification des performances (Lighthouse)
- [ ] Test de géolocalisation en production
- [ ] Vérification des APIs externes
- [ ] Configuration des headers de cache
- [ ] Test sur différents navigateurs
- [ ] Monitoring des erreurs configuré

## Coûts estimés

### Gratuit
- **Netlify** : 100GB bande passante/mois
- **Vercel** : 100GB bande passante/mois  
- **GitHub Pages** : Illimité pour projets publics
- **Firebase** : 10GB stockage + 360MB/jour

### Payant (si nécessaire)
- **VPS** : 5-20€/mois
- **Domaine** : 10-15€/an
- **CDN** : Variable selon trafic

---

L'application est optimisée pour un déploiement simple et gratuit ! 🚀
