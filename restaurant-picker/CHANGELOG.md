# Changelog - On mange où? 🍽️

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [2.0.0] - 2024-06-06 🎉

### 🆕 Nouvelles fonctionnalités majeures

#### 📚 Système d'historique
- **Sauvegarde automatique** des restaurants sélectionnés
- **Affichage chronologique** avec dates relatives
- **Gestion des doublons** (évite les répétitions récentes)
- **Suppression sélective** ou complète de l'historique
- **Intégration favoris** directement depuis l'historique

#### ⭐ Système de favoris
- **Ajout/suppression** de restaurants favoris
- **Sélection aléatoire** parmi les favoris uniquement
- **Actions rapides** (appel, site web, itinéraire) depuis les favoris
- **Synchronisation** avec l'historique et les notes

#### 🎰 Mode roulette animé
- **Animation visuelle** de roulette avec ralentissement progressif
- **Suspense** avec rotation et sélection finale
- **Affichage** de 8 restaurants maximum sur la roue
- **Désactivation** possible via les paramètres
- **Messages** humoristiques pendant l'animation

#### 🌙 Mode sombre complet
- **Thème sombre** pour toute l'interface
- **Transition fluide** entre les modes
- **Sauvegarde** de la préférence utilisateur
- **Adaptation** de tous les composants
- **Contraste optimisé** pour la lisibilité

#### 🔔 Système de notifications
- **Notifications push** pour les sélections de restaurants
- **Alertes** pour les ajouts aux favoris
- **Demande de permission** automatique
- **Gestion** des préférences de notification
- **Messages personnalisés** selon l'action

#### 📝 Notes et évaluations
- **Système de notation** 1-5 étoiles
- **Notes textuelles** personnelles
- **Sauvegarde locale** des évaluations
- **Affichage** des notes dans les cartes restaurant
- **Modal intuitive** pour la saisie

#### 🔗 Partage social
- **Partage natif** via l'API Web Share
- **Fallback** copie dans le presse-papier
- **Messages personnalisés** pour chaque restaurant
- **Génération d'URLs** de partage
- **Feedback visuel** de confirmation

#### ⚙️ Paramètres avancés
- **Panneau de configuration** complet
- **Gestion des préférences** utilisateur
- **Export/import** des données personnelles
- **Réinitialisation** sélective ou complète
- **Paramètres par défaut** intelligents

### 🔄 Améliorations existantes

#### 🎨 Interface utilisateur
- **Menu mobile** avec navigation optimisée
- **Panneaux déroulants** pour historique, favoris, paramètres
- **Animations fluides** avec possibilité de désactivation
- **Responsive design** amélioré pour tous les écrans
- **Accessibilité** renforcée (navigation clavier, lecteurs d'écran)

#### 🍽️ Carte restaurant enrichie
- **Bouton favori** intégré avec animation
- **Actions secondaires** (noter, partager)
- **Modal de notation** avec étoiles interactives
- **Affichage des notes** utilisateur existantes
- **Design amélioré** avec meilleure hiérarchie

#### 🛠️ Filtres intelligents
- **Exclusion automatique** des restaurants récemment visités
- **Option favoris uniquement** pour filtrer
- **Sauvegarde** des préférences de filtrage
- **Rayon par défaut** configurable
- **Interface** adaptée au mode sombre

#### 🗺️ Carte interactive
- **Marqueurs différenciés** (utilisateur, restaurant sélectionné)
- **Popups enrichies** avec toutes les informations
- **Centrage automatique** sur le restaurant sélectionné
- **Actions directes** depuis les popups
- **Performance** optimisée

### 🔧 Améliorations techniques

#### 💾 Gestion des données
- **Services de stockage** modulaires et typés
- **Gestion d'erreurs** robuste pour localStorage
- **Sérialisation/désérialisation** sécurisée
- **Migration** automatique des données
- **Nettoyage** automatique des anciennes données

#### 🏗️ Architecture
- **Composants modulaires** réutilisables
- **Services séparés** par responsabilité
- **Types TypeScript** étendus et précis
- **Hooks personnalisés** pour la logique métier
- **Gestion d'état** optimisée

#### ⚡ Performance
- **Lazy loading** des composants lourds
- **Optimisation** des re-rendus React
- **Cache intelligent** des données API
- **Debouncing** des actions utilisateur
- **Bundle splitting** automatique

#### 🔒 Sécurité et confidentialité
- **Données locales** uniquement (pas de serveur)
- **Gestion des permissions** (géolocalisation, notifications)
- **Validation** des données utilisateur
- **Échappement** des contenus dynamiques
- **CSP** (Content Security Policy) configuré

### 🎯 Expérience utilisateur

#### 📱 Mobile-first
- **Navigation tactile** optimisée
- **Menu hamburger** avec actions rapides
- **Gestes** intuitifs (swipe, tap)
- **Tailles de boutons** adaptées au tactile
- **Performance** optimisée sur mobile

#### 🎭 Animations et feedback
- **Transitions fluides** entre les états
- **Feedback visuel** pour toutes les actions
- **Messages de confirmation** contextuels
- **Indicateurs de chargement** informatifs
- **Animations** désactivables pour l'accessibilité

#### 🧠 Intelligence
- **Apprentissage** des préférences utilisateur
- **Suggestions** basées sur l'historique
- **Évitement** des répétitions récentes
- **Adaptation** aux habitudes d'utilisation
- **Messages** contextuels et personnalisés

### 📊 Statistiques et métriques

#### 📈 Nouvelles métriques
- **Nombre de restaurants** dans l'historique
- **Favoris** comptabilisés
- **Taux d'utilisation** des fonctionnalités
- **Préférences** de filtrage populaires
- **Performance** de l'application

#### 🔍 Debugging amélioré
- **Logs structurés** pour le développement
- **Gestion d'erreurs** avec contexte
- **Monitoring** des performances
- **Métriques** d'utilisation anonymes
- **Outils de développement** intégrés

### 🐛 Corrections de bugs

- **Géolocalisation** plus robuste avec gestion d'erreurs
- **Filtrage** des restaurants sans données complètes
- **Gestion** des APIs externes indisponibles
- **Responsive** sur très petits écrans
- **Performance** sur appareils moins puissants
- **Compatibilité** navigateurs étendues

### 🔄 Migrations et compatibilité

- **Migration automatique** des données v1.0 vers v2.0
- **Rétrocompatibilité** des URLs et paramètres
- **Fallbacks** pour les fonctionnalités non supportées
- **Progressive enhancement** pour les nouvelles APIs
- **Graceful degradation** sur anciens navigateurs

---

## [1.0.0] - 2024-06-05

### 🎉 Version initiale

#### ✨ Fonctionnalités de base
- Géolocalisation automatique et manuelle
- Sélection aléatoire de restaurants
- Filtres par rayon, cuisine, prix, horaires
- Carte interactive avec OpenStreetMap
- Informations détaillées des restaurants
- Messages humoristiques
- Interface responsive
- PWA avec service worker

#### 🛠️ Technologies
- React 18 + TypeScript
- Tailwind CSS
- Leaflet pour les cartes
- Vite pour le build
- API Overpass (OpenStreetMap)

---

## Prochaines versions

Consultez [ROADMAP.md](ROADMAP.md) pour les fonctionnalités prévues dans les versions futures.

## Contribution

Pour contribuer au projet, consultez les guidelines dans le README principal.
