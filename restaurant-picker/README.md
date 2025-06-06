# On mange où? 🍽️ v2.0

Une application web complète et conviviale qui aide les utilisateurs à décider dans quel restaurant aller, en choisissant un restaurant au hasard à proximité avec de nombreuses fonctionnalités avancées.

## ✨ Fonctionnalités

### 🎯 Fonctionnalités principales
- **📍 Géolocalisation** : Automatique ou choix manuel d'un lieu
- **🎲 Sélection aléatoire** : Bouton "Choisis pour moi" avec messages humoristiques
- **🎰 Mode roulette** : Animation de roulette visuelle pour plus de fun
- **🛠️ Filtres avancés** : Type de cuisine, prix, horaires d'ouverture, rayon
- **🗺️ Carte interactive** : Affichage des restaurants avec Leaflet/OpenStreetMap
- **📞 Informations complètes** : Nom, adresse, téléphone, site web, itinéraire
- **🔁 Nouvelle sélection** : Bouton "Choisis-en un autre"
- **🧠 Messages humoristiques** : "C'est le destin qui l'a voulu!", etc.

### 🆕 Nouvelles fonctionnalités v2.0
- **📚 Historique** : Sauvegarde automatique des restaurants visités
- **⭐ Favoris** : Système de favoris avec sélection aléatoire
- **🌙 Mode sombre** : Interface adaptée jour/nuit
- **🔔 Notifications** : Alertes pour les sélections et favoris
- **📝 Notes personnelles** : Système de notation et commentaires
- **🔗 Partage** : Partage de restaurants via liens ou réseaux sociaux
- **⚙️ Paramètres** : Personnalisation complète de l'expérience
- **💾 Sauvegarde** : Export/import des données personnelles
- **🚫 Exclusion** : Option pour éviter les restaurants récemment visités

### 🎨 Interface améliorée
- **📱 Mobile-first** : Design responsive optimisé pour mobile
- **⚡ PWA** : Installation possible comme app native
- **🎭 Animations** : Transitions fluides et roulette animée
- **🎨 Design moderne** : Interface claire avec mode sombre
- **🍔 Menu mobile** : Navigation optimisée pour petits écrans
- **♿ Accessibilité** : Support des lecteurs d'écran et navigation clavier

## 🛠️ Technologies utilisées

- **Frontend** : React 18 + TypeScript
- **Styling** : Tailwind CSS
- **Cartes** : Leaflet + React-Leaflet (OpenStreetMap)
- **API Restaurants** : Overpass API (OpenStreetMap)
- **Géolocalisation** : API Geolocation + Nominatim
- **Build** : Vite
- **PWA** : Vite PWA Plugin
- **Icons** : Lucide React

## 🚀 Installation et lancement

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Aller dans le dossier de l'application
cd restaurant-picker

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser la build de production
npm run preview
```

L'application sera accessible sur `http://localhost:3000`

## 📱 Utilisation

### Première utilisation
1. **Localisation** : Autorisez la géolocalisation ou entrez une adresse manuellement
2. **Paramètres** : Configurez vos préférences (mode sombre, notifications, etc.)
3. **Filtres** (optionnel) : Ajustez le rayon, type de cuisine, prix, horaires

### Sélection de restaurant
4. **Sélection classique** : Cliquez sur "Choisis pour moi !"
5. **Mode roulette** : Utilisez "Mode roulette" pour une animation fun
6. **Découverte** : Consultez les infos, ajoutez aux favoris, notez le restaurant
7. **Actions** : Voir sur la carte, appeler, obtenir l'itinéraire, partager

### Fonctionnalités avancées
8. **Historique** : Consultez vos restaurants précédents
9. **Favoris** : Gérez vos restaurants préférés et sélection aléatoire
10. **Paramètres** : Personnalisez l'expérience selon vos goûts

## 🗺️ Sources de données

- **Restaurants** : OpenStreetMap via Overpass API (gratuit)
- **Cartes** : OpenStreetMap (gratuit)
- **Géocodage** : Nominatim (gratuit)

## 🎯 Fonctionnalités v2.0 implémentées

### ✅ Fonctionnalités de base
- **Messages humoristiques** lors de la sélection
- **Interface responsive** mobile-first optimisée
- **PWA** installable sur mobile avec service worker
- **Filtres avancés** multiples et intelligents
- **Carte interactive** avec marqueurs personnalisés

### ✅ Nouvelles fonctionnalités v2.0
- **Historique complet** avec sauvegarde locale
- **Système de favoris** avec gestion avancée
- **Mode roulette animé** avec suspense
- **Mode sombre** complet avec transition fluide
- **Notifications push** pour les événements importants
- **Notes et évaluations** personnelles des restaurants
- **Partage social** via liens et réseaux sociaux
- **Paramètres avancés** avec export/import des données
- **Exclusion intelligente** des restaurants récemment visités
- **Menu mobile** avec navigation optimisée

## 🔮 Améliorations futures (v3.0)

- 🤖 **IA recommandations** basées sur l'historique
- 👥 **Mode groupe** pour décisions collectives
- 🏆 **Gamification** avec badges et défis
- 📱 **App mobile native** React Native
- 🔌 **API publique** pour intégrations tierces
- 🌐 **Mode hors-ligne** complet avec synchronisation

## 🏗️ Architecture du projet

```
restaurant-picker/
├── public/                 # Fichiers statiques et PWA
│   ├── index.html
│   ├── manifest.json
│   └── icons/             # Icônes PWA
├── src/
│   ├── components/        # Composants React
│   │   ├── LocationPicker.tsx      # Sélection de localisation
│   │   ├── FilterPanel.tsx         # Filtres avancés
│   │   ├── RestaurantCard.tsx      # Carte restaurant améliorée
│   │   ├── MapView.tsx            # Carte interactive
│   │   ├── LoadingSpinner.tsx     # Indicateur de chargement
│   │   ├── HistoryPanel.tsx       # 🆕 Historique des visites
│   │   ├── FavoritesPanel.tsx     # 🆕 Gestion des favoris
│   │   ├── SettingsPanel.tsx      # 🆕 Paramètres utilisateur
│   │   └── RouletteWheel.tsx      # 🆕 Roulette animée
│   ├── services/          # Services et APIs
│   │   ├── geolocation.ts         # Géolocalisation
│   │   ├── restaurantApi.ts       # API restaurants
│   │   └── storageService.ts      # 🆕 Gestion localStorage
│   ├── types/             # Types TypeScript étendus
│   │   └── restaurant.ts          # Types avec nouvelles propriétés
│   ├── utils/             # Utilitaires
│   │   ├── randomPicker.ts        # Sélection aléatoire
│   │   └── funnyMessages.ts       # Messages humoristiques
│   ├── App.tsx           # 🔄 Composant principal amélioré
│   ├── main.tsx          # Point d'entrée
│   └── index.css         # 🔄 Styles avec mode sombre
├── scripts/              # 🆕 Scripts de développement
│   └── dev-setup.sh      # Configuration automatique
├── package.json          # Dépendances mises à jour
├── vite.config.ts        # Configuration PWA
├── tailwind.config.js    # Support mode sombre
├── tsconfig.json
├── README.md             # Documentation complète
├── DEMO.md              # Guide de démonstration
├── DEPLOYMENT.md        # Guide de déploiement
└── ROADMAP.md           # Feuille de route
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Ajouter de nouveaux messages humoristiques
- Améliorer l'interface utilisateur

## 📄 Licence

Ce projet est sous licence MIT.

---

**On mange où?** - Parce que choisir un restaurant, c'est parfois plus compliqué que prévu ! 🎲🍽️
