# Installation sur Windows - On mange où? 🍽️ v2.0

## 🔧 Prérequis

### 1. Installer Node.js
- Téléchargez Node.js depuis [nodejs.org](https://nodejs.org/)
- Choisissez la version LTS (recommandée)
- Suivez l'assistant d'installation
- Redémarrez votre terminal/PowerShell

### 2. Vérifier l'installation
```powershell
node --version
npm --version
```

## 🚀 Installation rapide (Méthode 1)

### Option A : Script automatique
1. Téléchargez le fichier `setup-restaurant-app.ps1`
2. Ouvrez PowerShell en tant qu'administrateur
3. Naviguez vers le dossier contenant le script
4. Exécutez :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-restaurant-app.ps1
```

### Option B : Script batch
1. Téléchargez le fichier `create-restaurant-app.bat`
2. Double-cliquez dessus ou exécutez dans l'invite de commande

## 📋 Installation manuelle (Méthode 2)

### Étape 1 : Créer l'application de base
```powershell
# Créer une nouvelle application React avec Vite
npm create vite@latest restaurant-picker -- --template react-ts

# Aller dans le dossier
cd restaurant-picker

# Installer les dépendances de base
npm install
```

### Étape 2 : Installer les dépendances spécifiques
```powershell
# Dépendances pour les cartes et l'interface
npm install leaflet react-leaflet lucide-react

# Dépendances de développement
npm install -D @types/leaflet tailwindcss autoprefixer postcss vite-plugin-pwa

# Initialiser Tailwind CSS
npx tailwindcss init -p
```

### Étape 3 : Configuration des fichiers

#### A. Remplacer le contenu de `package.json` :
```json
{
  "name": "on-mange-ou",
  "private": true,
  "version": "2.0.0",
  "description": "Application web pour choisir un restaurant au hasard",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/leaflet": "^1.9.8",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "vite-plugin-pwa": "^0.17.4"
  }
}
```

#### B. Configurer `tailwind.config.js` :
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdecd3',
          200: '#fbd5a5',
          300: '#f8b86d',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
```

#### C. Configurer `vite.config.ts` :
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: '.',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'On mange où?',
        short_name: 'OnMangeOu',
        description: 'Choisis un restaurant au hasard près de chez toi',
        theme_color: '#f59e0b',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
})
```

### Étape 4 : Créer la structure des dossiers
```powershell
# Créer les dossiers nécessaires
mkdir src\components, src\services, src\types, src\utils, scripts
```

### Étape 5 : Télécharger les fichiers source

Vous devez maintenant copier tous les fichiers source depuis le repository GitHub ou depuis l'environnement de développement.

## 📁 Structure finale attendue

```
restaurant-picker/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── LocationPicker.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── RestaurantCard.tsx
│   │   ├── MapView.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── HistoryPanel.tsx
│   │   ├── FavoritesPanel.tsx
│   │   ├── SettingsPanel.tsx
│   │   └── RouletteWheel.tsx
│   ├── services/
│   │   ├── geolocation.ts
│   │   ├── restaurantApi.ts
│   │   └── storageService.ts
│   ├── types/
│   │   └── restaurant.ts
│   ├── utils/
│   │   ├── randomPicker.ts
│   │   └── funnyMessages.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🚀 Lancement de l'application

```powershell
# Installer les dépendances (si pas déjà fait)
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000` ou `http://localhost:5173`

## 🔧 Résolution de problèmes

### Erreur "Cannot find module"
```powershell
# Supprimer node_modules et réinstaller
rmdir /s node_modules
del package-lock.json
npm install
```

### Erreur de permissions PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port déjà utilisé
- Changez le port dans `vite.config.ts`
- Ou fermez l'application qui utilise le port 3000

### Problème avec Tailwind CSS
```powershell
# Réinstaller Tailwind
npm uninstall tailwindcss
npm install -D tailwindcss autoprefixer postcss
npx tailwindcss init -p
```

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que Node.js est bien installé
2. Assurez-vous d'être dans le bon dossier
3. Vérifiez que tous les fichiers sont présents
4. Consultez les logs d'erreur pour plus de détails

## 🎉 Prochaines étapes

Une fois l'application lancée :
1. Testez la géolocalisation
2. Explorez les nouvelles fonctionnalités v2.0
3. Consultez le [GUIDE-RAPIDE.md](GUIDE-RAPIDE.md) pour l'utilisation
4. Lisez le [README.md](README.md) pour plus de détails
