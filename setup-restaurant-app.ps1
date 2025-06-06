# Script PowerShell pour créer l'application "On mange où?" v2.0
Write-Host "🍽️ Création de l'application 'On mange où?' v2.0" -ForegroundColor Yellow
Write-Host ""

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm détecté: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm n'est pas disponible" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host ""

# Créer l'application avec Vite
Write-Host "📦 Création de l'application React avec Vite..." -ForegroundColor Cyan

if (Test-Path "restaurant-picker") {
    $choice = Read-Host "Le dossier 'restaurant-picker' existe déjà. Voulez-vous le supprimer? (o/n)"
    if ($choice -eq "o" -or $choice -eq "O") {
        Remove-Item -Recurse -Force "restaurant-picker"
        Write-Host "🗑️ Dossier supprimé" -ForegroundColor Yellow
    } else {
        Write-Host "⏭️ Utilisation du dossier existant" -ForegroundColor Yellow
        Set-Location "restaurant-picker"
    }
}

if (-not (Test-Path "restaurant-picker")) {
    # Créer l'app avec Vite
    npm create vite@latest restaurant-picker -- --template react-ts
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de la création de l'application" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour quitter"
        exit 1
    }
    
    Set-Location "restaurant-picker"
}

Write-Host "📦 Installation des dépendances de base..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances de base" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host "📦 Installation des dépendances spécifiques..." -ForegroundColor Cyan

# Installer les dépendances spécifiques à notre app
npm install leaflet react-leaflet lucide-react

# Installer les dépendances de développement
npm install -D @types/leaflet tailwindcss autoprefixer postcss vite-plugin-pwa

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances spécifiques" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host "⚙️ Configuration de Tailwind CSS..." -ForegroundColor Cyan
npx tailwindcss init -p

Write-Host ""
Write-Host "🎉 Application créée avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "1. Copiez les fichiers source depuis le repository" -ForegroundColor White
Write-Host "2. Ou téléchargez les fichiers depuis GitHub" -ForegroundColor White
Write-Host "3. Lancez 'npm run dev' pour démarrer le serveur" -ForegroundColor White
Write-Host ""
Write-Host "🌐 L'application sera accessible sur http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

# Proposer de lancer le serveur de développement
$startDev = Read-Host "Voulez-vous lancer le serveur de développement maintenant? (o/n)"
if ($startDev -eq "o" -or $startDev -eq "O") {
    Write-Host "🚀 Lancement du serveur de développement..." -ForegroundColor Green
    npm run dev
}

Read-Host "Appuyez sur Entrée pour quitter"
