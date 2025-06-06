@echo off
echo 🍽️ Création de l'application "On mange où?" v2.0
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté

REM Créer le dossier du projet
if exist restaurant-picker (
    echo 📁 Le dossier restaurant-picker existe déjà
    set /p choice="Voulez-vous le supprimer et recommencer? (o/n): "
    if /i "%choice%"=="o" (
        rmdir /s /q restaurant-picker
        echo 🗑️ Dossier supprimé
    ) else (
        echo ⏭️ Utilisation du dossier existant
    )
)

if not exist restaurant-picker (
    mkdir restaurant-picker
    echo 📁 Dossier restaurant-picker créé
)

cd restaurant-picker

REM Créer la structure de base
mkdir public src\components src\services src\types src\utils scripts 2>nul

echo 📦 Création du package.json...
echo {> package.json
echo   "name": "on-mange-ou",>> package.json
echo   "private": true,>> package.json
echo   "version": "2.0.0",>> package.json
echo   "description": "Application web pour choisir un restaurant au hasard",>> package.json
echo   "type": "module",>> package.json
echo   "scripts": {>> package.json
echo     "dev": "vite",>> package.json
echo     "build": "tsc && vite build",>> package.json
echo     "preview": "vite preview">> package.json
echo   },>> package.json
echo   "dependencies": {>> package.json
echo     "react": "^18.2.0",>> package.json
echo     "react-dom": "^18.2.0",>> package.json
echo     "leaflet": "^1.9.4",>> package.json
echo     "react-leaflet": "^4.2.1",>> package.json
echo     "lucide-react": "^0.294.0">> package.json
echo   },>> package.json
echo   "devDependencies": {>> package.json
echo     "@types/react": "^18.2.43",>> package.json
echo     "@types/react-dom": "^18.2.17",>> package.json
echo     "@types/leaflet": "^1.9.8",>> package.json
echo     "@vitejs/plugin-react": "^4.2.1",>> package.json
echo     "autoprefixer": "^10.4.16",>> package.json
echo     "postcss": "^8.4.32",>> package.json
echo     "tailwindcss": "^3.3.6",>> package.json
echo     "typescript": "^5.2.2",>> package.json
echo     "vite": "^5.0.8",>> package.json
echo     "vite-plugin-pwa": "^0.17.4">> package.json
echo   }>> package.json
echo }>> package.json

echo 📦 Installation des dépendances...
npm install

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)

echo ✅ Dépendances installées avec succès

echo.
echo 🎉 Application créée avec succès !
echo.
echo 📋 Prochaines étapes :
echo 1. Copiez les fichiers source depuis le repository GitHub
echo 2. Ou utilisez la commande : npm run dev
echo.
echo 🌐 L'application sera accessible sur http://localhost:3000
echo.
pause
