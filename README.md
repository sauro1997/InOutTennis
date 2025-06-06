# Repository Multi-Projets 🚀

Ce repository contient deux projets distincts :

## 1. Tennis Hawk-Eye System v2.0 🎾

Un système avancé de détection "in/out" pour le tennis, inspiré du célèbre système Hawk-Eye utilisé dans les tournois professionnels. Cette application utilise l'intelligence artificielle et la vision par ordinateur pour analyser les vidéos de tennis et déterminer automatiquement si une balle est "in" ou "out".

## 2. On mange où? 🍽️ (NOUVEAU)

Une application web responsive qui aide les utilisateurs à décider dans quel restaurant aller ce soir, en choisissant un restaurant au hasard à proximité.

### Accès rapide
- **Application Restaurant** : `cd restaurant-picker && npm install && npm run dev`
- **Documentation** : [README Restaurant](restaurant-picker/README.md)
- **Guide de test** : [DEMO](restaurant-picker/DEMO.md)
- **Déploiement** : [DEPLOYMENT](restaurant-picker/DEPLOYMENT.md)

---

# Tennis Hawk-Eye System v2.0 🎾 (Projet original)

## 🚀 Fonctionnalités principales

### ✨ Détection intelligente
- **Détection IA avancée** : Utilise Roboflow pour une détection précise des balles
- **Détecteur de secours** : Système OpenCV classique en cas d'échec de l'IA
- **Suivi temporel** : Trajectoire lissée avec filtrage des fausses détections

### 🎯 Analyse précise
- **Géométrie du terrain** : Configuration précise des zones du court
- **Détection de rebond** : Analyse physique des changements de trajectoire
- **Calibration interactive** : Interface intuitive pour définir les zones

### 📊 Visualisation avancée
- **Affichage temps réel** : Visualisation des détections et trajectoires
- **Statistiques complètes** : Compteurs de balles IN/OUT et rebonds
- **Interface moderne** : Configuration guidée étape par étape

## 🛠️ Installation

### Prérequis
- Python 3.8 ou supérieur
- Webcam ou fichiers vidéo de tennis
- Clé API Roboflow (gratuite)

### Installation rapide
```bash
# Cloner le repository
git clone https://github.com/sauro1997/InOutTennis.git
cd InOutTennis

# Installer les dépendances
pip install -r requirements.txt

# Configurer votre clé API Roboflow dans config.json
```

## 🎮 Utilisation

### 1. Configuration initiale
```bash
python main_hawkeye.py
```

### 2. Étapes de configuration
1. **Image de référence** : Fournir une capture d'écran du terrain
2. **Définition des zones** : Cliquer sur les coins du terrain
3. **Traitement vidéo** : Analyser votre vidéo de tennis

### 3. Configuration du terrain
L'interface vous guidera pour définir :
- **Limites du terrain** : Les 4 coins du court complet
- **Zone de service** : Les limites de la zone de service
- **Ligne de fond** : La ligne de fond de court

## 📁 Structure du projet

```
InOutTennis/
├── main_hawkeye.py          # Application principale
├── tennis_hawkeye.py        # Classes de base et configuration
├── ball_detector.py         # Détection des balles (IA + OpenCV)
├── court_setup.py          # Configuration interactive du terrain
├── config.json             # Configuration système
├── requirements.txt        # Dépendances Python
└── README.md              # Documentation
```

## ⚙️ Configuration avancée

### Fichier config.json
```json
{
    "roboflow": {
        "api_key": "VOTRE_CLE_API",
        "confidence": 0.3,
        "overlap": 0.6
    },
    "detection": {
        "min_ball_confidence": 0.3,
        "max_tracking_distance": 50,
        "bounce_detection_threshold": 0.8
    },
    "visualization": {
        "show_trajectory": true,
        "show_court_lines": true,
        "colors": {
            "ball_in": [0, 255, 0],
            "ball_out": [0, 0, 255]
        }
    }
}
```

## 🔧 API Roboflow

1. Créer un compte gratuit sur [Roboflow](https://roboflow.com)
2. Obtenir votre clé API
3. Modifier `config.json` avec votre clé

## 📈 Améliorations v2.0

### Par rapport à la version originale :
- ✅ **Architecture modulaire** : Code organisé en classes réutilisables
- ✅ **Détection hybride** : IA + OpenCV pour plus de robustesse
- ✅ **Suivi temporel** : Trajectoire lissée et détection de rebonds
- ✅ **Interface améliorée** : Configuration guidée et intuitive
- ✅ **Géométrie précise** : Polygones au lieu de rectangles simples
- ✅ **Statistiques complètes** : Analyse détaillée des performances
- ✅ **Configuration flexible** : Paramètres ajustables via JSON

## 🐛 Dépannage

### Problèmes courants
- **Erreur API Roboflow** : Vérifiez votre clé API dans config.json
- **Vidéo non détectée** : Vérifiez le format (MP4 recommandé)
- **Performance lente** : Réduisez la durée d'analyse ou la résolution

### Logs
Les logs sont sauvegardés dans `tennis_hawkeye.log` pour le débogage.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Email : simonxcv@hotmail.com

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

**Tennis Hawk-Eye System v2.0** - Transformez votre analyse de tennis avec l'IA ! 🎾🤖
