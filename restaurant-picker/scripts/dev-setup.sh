#\!/bin/bash

# Script de configuration pour le développement
# On mange où? 🍽️

echo "🍽️ Configuration de l'environnement de développement..."

# Vérification de Node.js
if \! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "✅ Dépendances installées avec succès"

# Vérification de la compilation
echo "🔨 Test de compilation..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la compilation"
    exit 1
fi

echo "✅ Compilation réussie"

echo ""
echo "🚀 Configuration terminée \! Commandes utiles :"
echo ""
echo "  npm run dev      - Lancer le serveur de développement"
echo "  npm run build    - Compiler pour la production"
echo "  npm run preview  - Prévisualiser la build de production"
echo ""
echo "🌐 L'application sera accessible sur http://localhost:3000"
echo ""
echo "Bon développement \! 🎉"
