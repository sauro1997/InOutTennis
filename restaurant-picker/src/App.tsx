import { useState, useEffect } from 'react';
import { Dice6, RefreshCw, MapPin, Utensils, Menu, X, Sparkles } from 'lucide-react';
import { Restaurant, Location, Filters, UserPreferences } from './types/restaurant';
import { searchRestaurants, getAvailableCuisines } from './services/restaurantApi';
import { filterRestaurants, pickRandomRestaurant } from './utils/randomPicker';
import { funnyMessages, loadingMessages, getRandomMessage } from './utils/funnyMessages';
import { HistoryService, PreferencesService, NotificationService } from './services/storageService';
import LocationPicker from './components/LocationPicker';
import FilterPanel from './components/FilterPanel';
import RestaurantCard from './components/RestaurantCard';
import MapView from './components/MapView';
import LoadingSpinner from './components/LoadingSpinner';
import HistoryPanel from './components/HistoryPanel';
import FavoritesPanel from './components/FavoritesPanel';
import SettingsPanel from './components/SettingsPanel';
import RouletteWheel from './components/RouletteWheel';

function App() {
  // États principaux
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [filters, setFilters] = useState<Filters>({ radius: 5 });
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);

  // États de chargement et erreurs
  const [isSearching, setIsSearching] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [funnyMessage, setFunnyMessage] = useState<string>('');

  // États d'interface
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);

  // Préférences utilisateur
  const [preferences, setPreferences] = useState<UserPreferences>(PreferencesService.getPreferences());
  const [darkMode, setDarkMode] = useState(preferences.darkMode);

  // Initialisation et gestion du thème
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    const prefs = PreferencesService.getPreferences();
    setFilters(prev => ({ ...prev, radius: prefs.defaultRadius }));

    // Demander les permissions de notification
    if (prefs.notifications) {
      NotificationService.requestPermission();
    }
  }, [darkMode]);

  // Recherche des restaurants quand la localisation ou les filtres changent
  useEffect(() => {
    if (userLocation) {
      handleSearchRestaurants();
    }
  }, [userLocation, filters.radius]);

  // Filtrage des restaurants quand les filtres changent
  useEffect(() => {
    if (allRestaurants.length > 0) {
      let filtered = filterRestaurants(allRestaurants, filters);

      // Exclure les restaurants récemment visités si l'option est activée
      if (filters.excludeVisited || preferences.excludeVisitedByDefault) {
        const recentIds = HistoryService.getRecentRestaurantIds(24);
        filtered = filtered.filter(r => !recentIds.includes(r.id));
      }

      setFilteredRestaurants(filtered);
    }
  }, [allRestaurants, filters, preferences.excludeVisitedByDefault]);

  // Mise à jour des cuisines disponibles
  useEffect(() => {
    if (allRestaurants.length > 0) {
      const cuisines = getAvailableCuisines(allRestaurants);
      setAvailableCuisines(cuisines);
    }
  }, [allRestaurants]);

  const handleLocationSelected = (location: Location) => {
    setUserLocation(location);
    setSelectedRestaurant(null);
    setError(null);
  };

  const handleSearchRestaurants = async () => {
    if (!userLocation) return;

    setIsSearching(true);
    setError(null);

    try {
      const restaurants = await searchRestaurants(userLocation, { radius: filters.radius });
      setAllRestaurants(restaurants);
      
      if (restaurants.length === 0) {
        setError('Aucun restaurant trouvé dans cette zone. Essayez d\'augmenter le rayon de recherche.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      setAllRestaurants([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePickRandomRestaurant = async () => {
    if (filteredRestaurants.length === 0) {
      setError('Aucun restaurant disponible avec ces filtres. Modifiez vos critères de recherche.');
      return;
    }

    setIsPicking(true);
    setError(null);
    setFunnyMessage(getRandomMessage(loadingMessages));

    // Afficher la roulette si les animations sont activées
    if (preferences.animationsEnabled) {
      setShowRoulette(true);
    }

    // Animation de suspense
    const delay = preferences.animationsEnabled ? 4000 : 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    const randomRestaurant = pickRandomRestaurant(filteredRestaurants);

    if (randomRestaurant) {
      setSelectedRestaurant(randomRestaurant);
      setFunnyMessage(getRandomMessage(funnyMessages));
      setShowMap(true);
      setShowRoulette(false);

      // Ajouter à l'historique
      if (userLocation) {
        HistoryService.addToHistory(randomRestaurant, userLocation);
      }

      // Notification
      if (preferences.notifications) {
        NotificationService.notifyRestaurantSelected(randomRestaurant.name);
      }
    } else {
      setError('Impossible de sélectionner un restaurant. Réessayez.');
      setShowRoulette(false);
    }

    setIsPicking(false);
  };

  const handlePickAnother = () => {
    setSelectedRestaurant(null);
    setFunnyMessage('');
    setShowRoulette(false);
    handlePickRandomRestaurant();
  };

  const handleShowOnMap = () => {
    setShowMap(true);
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setFunnyMessage(getRandomMessage(funnyMessages));
    setShowMobileMenu(false);
  };

  const handleThemeChange = (isDark: boolean) => {
    setDarkMode(isDark);
    setPreferences(prev => ({ ...prev, darkMode: isDark }));
  };

  const handleRouletteResult = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setFunnyMessage(getRandomMessage(funnyMessages));
    setShowMap(true);
    setShowRoulette(false);

    // Ajouter à l'historique
    if (userLocation) {
      HistoryService.addToHistory(restaurant, userLocation);
    }

    // Notification
    if (preferences.notifications) {
      NotificationService.notifyRestaurantSelected(restaurant.name);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* En-tête */}
      <header className={`gradient-bg text-white py-6 shadow-lg relative ${
        darkMode ? 'from-gray-800 to-gray-700' : ''
      }`}>
        <div className="container mx-auto container-responsive">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center">
                <Utensils className="w-8 h-8 mr-3" />
                On mange où ? 🍽️
              </h1>
              <p className="text-primary-100 text-responsive">
                Laisse le hasard choisir ton prochain restaurant !
              </p>
            </div>

            {/* Menu mobile */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Menu mobile déroulant */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 bg-white/10 rounded-lg p-4 space-y-2">
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors"
              >
                📚 Historique
              </button>
              <button
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors"
              >
                ❤️ Favoris
              </button>
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors"
              >
                ⚙️ Paramètres
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto container-responsive py-8">
        {/* Sélection de localisation */}
        <LocationPicker
          onLocationSelected={handleLocationSelected}
          currentLocation={userLocation || undefined}
        />

        {/* Messages d'erreur */}
        {error && (
          <div className={`error-message mb-6 fade-in ${
            darkMode ? 'bg-red-900/20 border-red-800 text-red-300' : ''
          }`}>
            {error}
          </div>
        )}

        {/* Chargement de la recherche */}
        {isSearching && (
          <LoadingSpinner message="Recherche des restaurants..." />
        )}

        {/* Panneaux de navigation (desktop) */}
        <div className="hidden md:flex gap-4 mb-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              showHistory
                ? 'bg-primary-500 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📚 Historique
          </button>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              showFavorites
                ? 'bg-red-500 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ❤️ Favoris
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              showSettings
                ? 'bg-gray-500 text-white'
                : darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⚙️ Paramètres
          </button>
        </div>

        {/* Panneaux déroulants */}
        <HistoryPanel
          isOpen={showHistory}
          onToggle={() => setShowHistory(!showHistory)}
          onRestaurantSelect={handleRestaurantSelect}
        />

        <FavoritesPanel
          isOpen={showFavorites}
          onToggle={() => setShowFavorites(!showFavorites)}
          onRestaurantSelect={handleRestaurantSelect}
        />

        <SettingsPanel
          isOpen={showSettings}
          onToggle={() => setShowSettings(!showSettings)}
          onThemeChange={handleThemeChange}
        />

        {/* Interface principale */}
        {userLocation && !isSearching && (
          <div className="space-y-6">
            {/* Filtres */}
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              availableCuisines={availableCuisines}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />

            {/* Statistiques */}
            {allRestaurants.length > 0 && (
              <div className={`rounded-lg shadow-md p-4 ${
                darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {allRestaurants.length} restaurant{allRestaurants.length > 1 ? 's' : ''} trouvé{allRestaurants.length > 1 ? 's' : ''}
                  </span>
                  <span>
                    {filteredRestaurants.length} après filtrage
                  </span>
                </div>
              </div>
            )}

            {/* Roulette animée */}
            {showRoulette && filteredRestaurants.length > 0 && (
              <div className="fade-in">
                <RouletteWheel
                  restaurants={filteredRestaurants}
                  isSpinning={isPicking}
                  onResult={handleRouletteResult}
                  animationsEnabled={preferences.animationsEnabled}
                />
              </div>
            )}

            {/* Bouton principal de sélection */}
            {filteredRestaurants.length > 0 && !showRoulette && (
              <div className="text-center space-y-4">
                <button
                  onClick={handlePickRandomRestaurant}
                  disabled={isPicking}
                  className={`pick-button font-bold py-4 px-8 rounded-xl text-xl shadow-lg disabled:cursor-not-allowed transition-all duration-300 ${
                    isPicking
                      ? 'bg-gray-400 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white hover:scale-105'
                  }`}
                >
                  {isPicking ? (
                    <div className="flex items-center">
                      <Dice6 className="w-6 h-6 mr-3 animate-spin" />
                      {funnyMessage}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Sparkles className="w-6 h-6 mr-3" />
                      Choisis pour moi !
                    </div>
                  )}
                </button>

                {/* Bouton mode roulette */}
                {preferences.animationsEnabled && (
                  <button
                    onClick={() => {
                      setShowRoulette(true);
                      handlePickRandomRestaurant();
                    }}
                    disabled={isPicking}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center mx-auto"
                  >
                    🎰 Mode roulette
                  </button>
                )}
              </div>
            )}

            {/* Restaurant sélectionné */}
            {selectedRestaurant && !showRoulette && (
              <div className="fade-in">
                {funnyMessage && !isPicking && (
                  <div className={`mb-6 text-center bounce-in p-4 rounded-lg ${
                    darkMode
                      ? 'bg-green-900/20 border border-green-800 text-green-300'
                      : 'bg-green-50 border border-green-200 text-green-700'
                  }`}>
                    <p className="text-lg font-medium">{funnyMessage}</p>
                  </div>
                )}

                <RestaurantCard
                  restaurant={selectedRestaurant}
                  onShowOnMap={handleShowOnMap}
                />

                <div className="text-center space-y-3">
                  <button
                    onClick={handlePickAnother}
                    className={`font-medium py-3 px-6 rounded-lg transition-colors flex items-center mx-auto ${
                      darkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Choisis-en un autre
                  </button>

                  {preferences.animationsEnabled && (
                    <button
                      onClick={() => {
                        setShowRoulette(true);
                        handlePickAnother();
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center mx-auto text-sm"
                    >
                      🎰 Avec la roulette
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Carte */}
            {userLocation && allRestaurants.length > 0 && showMap && (
              <div className="fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold flex items-center ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                    Carte des restaurants
                  </h3>
                  <button
                    onClick={() => setShowMap(false)}
                    className={`transition-colors ${
                      darkMode
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Masquer
                  </button>
                </div>

                <MapView
                  userLocation={userLocation}
                  restaurants={filteredRestaurants}
                  selectedRestaurant={selectedRestaurant || undefined}
                  onRestaurantSelect={handleRestaurantSelect}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Pied de page */}
      <footer className={`py-6 mt-12 transition-colors ${
        darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-800 text-white'
      }`}>
        <div className="container mx-auto container-responsive text-center space-y-2">
          <p className={darkMode ? 'text-gray-400' : 'text-gray-400'}>
            Fait avec ❤️ pour les indécis • Données OpenStreetMap
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <span>v2.0.0</span>
            <span>•</span>
            <span>{allRestaurants.length} restaurants trouvés</span>
            <span>•</span>
            <span>{HistoryService.getHistory().length} visites</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
