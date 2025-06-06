# Démonstration de l'application "On mange où?" 🍽️

## Comment tester l'application

### 1. Lancement en développement
```bash
cd restaurant-picker
npm install
npm run dev
```
L'application sera accessible sur `http://localhost:3000`

### 2. Fonctionnalités à tester

#### 📍 Géolocalisation
1. **Autoriser la géolocalisation** : Cliquez sur "Utiliser ma position actuelle"
2. **Recherche manuelle** : Entrez une adresse dans le champ de recherche
   - Exemples : "Paris, France", "Lyon", "Marseille", "Toulouse"

#### 🎲 Sélection aléatoire
1. Une fois la position définie, cliquez sur **"Choisis pour moi !"**
2. Profitez de l'animation et du message humoristique
3. Découvrez le restaurant sélectionné avec toutes ses informations

#### 🛠️ Filtres
1. Cliquez sur **"Filtres"** pour les ouvrir
2. Ajustez le **rayon de recherche** (1-20 km)
3. Filtrez par **type de cuisine** (si disponible)
4. Sélectionnez le **niveau de prix** (€ à €€€€)
5. Activez **"Ouvert maintenant"** pour ne voir que les restaurants ouverts

#### 🗺️ Carte interactive
1. Cliquez sur **"Voir sur la carte"** sur un restaurant
2. Explorez la carte avec les marqueurs
3. Cliquez sur les marqueurs pour voir les détails
4. Le restaurant sélectionné apparaît en rouge

#### 📞 Actions sur le restaurant
- **Itinéraire** : Ouvre Google Maps avec les directions
- **Appeler** : Lance l'appel téléphonique (si numéro disponible)
- **Site web** : Ouvre le site du restaurant (si disponible)

#### 🔁 Nouvelle sélection
- Cliquez sur **"Choisis-en un autre"** pour relancer la sélection

### 3. Test sur mobile

#### Installation PWA
1. Ouvrez l'application dans Chrome/Safari mobile
2. Ajoutez à l'écran d'accueil pour une expérience native
3. L'application fonctionne hors ligne pour les données déjà chargées

#### Géolocalisation mobile
- La géolocalisation est plus précise sur mobile
- Testez en vous déplaçant dans différents quartiers

### 4. Zones de test recommandées

#### Zones avec beaucoup de restaurants
- **Paris** : Centre-ville, Marais, Montmartre
- **Lyon** : Vieux Lyon, Presqu'île
- **Marseille** : Vieux-Port, Cours Julien
- **Toulouse** : Centre historique, Capitole

#### Test des filtres
- **Grandes villes** : Plus de choix de cuisines
- **Zones touristiques** : Restaurants avec horaires étendus
- **Centres commerciaux** : Restaurants avec informations complètes

### 5. Fonctionnalités techniques à vérifier

#### Performance
- Temps de chargement des restaurants (< 5 secondes)
- Fluidité des animations
- Réactivité de la carte

#### Robustesse
- Gestion des erreurs de géolocalisation
- Comportement sans connexion internet
- Gestion des zones sans restaurants

#### Responsive
- Test sur différentes tailles d'écran
- Orientation portrait/paysage
- Navigation tactile

### 6. Messages d'erreur à tester

#### Géolocalisation refusée
1. Refusez la géolocalisation
2. Vérifiez que l'option manuelle fonctionne

#### Zone sans restaurants
1. Testez dans une zone rurale isolée
2. Vérifiez le message d'erreur approprié

#### Filtres trop restrictifs
1. Activez tous les filtres avec des critères stricts
2. Vérifiez le message "Aucun restaurant disponible"

### 7. Données utilisées

L'application utilise **OpenStreetMap** via l'API Overpass :
- Données gratuites et ouvertes
- Qualité variable selon les régions
- Mises à jour communautaires

#### Limitations connues
- Certains restaurants peuvent manquer d'informations (horaires, téléphone)
- La précision dépend de la contribution OSM locale
- Les horaires peuvent ne pas être à jour

### 8. Améliorations futures testables

Si vous implémentez les bonus :
- **Historique** : Vérifiez la sauvegarde locale
- **Partage** : Testez les liens générés
- **Mode roulette** : Profitez de l'animation avancée

---

## Retours et suggestions

N'hésitez pas à tester l'application dans différents contextes et à noter :
- Les bugs rencontrés
- Les améliorations possibles
- L'expérience utilisateur générale
- Les performances sur différents appareils

L'application est conçue pour être **simple, amusante et efficace** ! 🎯
