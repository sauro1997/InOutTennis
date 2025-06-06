import React, { useState, useEffect } from 'react';
import { Star, Heart, MapPin, Phone, Globe, Trash2 } from 'lucide-react';
import { Restaurant } from '../types/restaurant';
import { FavoritesService } from '../services/storageService';

interface FavoritesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onRestaurantSelect: (restaurant: Restaurant) => void;
}

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({
  isOpen,
  onToggle,
  onRestaurantSelect
}) => {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  const loadFavorites = () => {
    const favoritesData = FavoritesService.getFavorites();
    setFavorites(favoritesData);
  };

  const handleRemoveFavorite = (restaurantId: string) => {
    FavoritesService.removeFromFavorites(restaurantId);
    loadFavorites();
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(1)} km`;
    }
  };

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${phone}`, '_self');
  };

  const handleWebsite = (website: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(website, '_blank');
  };

  const handleDirections = (restaurant: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lon}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <Heart className="w-5 h-5 mr-2 text-red-500" />
          <span className="font-medium text-gray-800">Mes favoris</span>
          {favorites.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {favorites.length}
            </span>
          )}
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          {favorites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun restaurant favori</p>
              <p className="text-sm mt-2">Ajoutez des restaurants à vos favoris en cliquant sur l'étoile</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {favorites.length} restaurant{favorites.length > 1 ? 's' : ''} favori{favorites.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {favorites.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onRestaurantSelect(restaurant)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">
                          {restaurant.name}
                        </h4>
                        
                        {restaurant.cuisine && (
                          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                            {restaurant.cuisine}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(restaurant.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        title="Retirer des favoris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {restaurant.address && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{restaurant.address}</span>
                        {restaurant.distance && (
                          <span className="ml-2 text-primary-600 font-medium">
                            • {formatDistance(restaurant.distance)}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        {restaurant.priceLevel && (
                          <span className="text-gray-600">
                            {'€'.repeat(restaurant.priceLevel)}
                          </span>
                        )}
                        
                        {restaurant.isOpen !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            restaurant.isOpen 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {restaurant.isOpen ? 'Ouvert' : 'Fermé'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {restaurant.phone && (
                          <button
                            onClick={(e) => handleCall(restaurant.phone!, e)}
                            className="text-green-600 hover:text-green-700 p-1 transition-colors"
                            title="Appeler"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        )}
                        
                        {restaurant.website && (
                          <button
                            onClick={(e) => handleWebsite(restaurant.website!, e)}
                            className="text-blue-600 hover:text-blue-700 p-1 transition-colors"
                            title="Site web"
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => handleDirections(restaurant, e)}
                          className="text-primary-600 hover:text-primary-700 p-1 transition-colors"
                          title="Itinéraire"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {favorites.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const randomFavorite = favorites[Math.floor(Math.random() * favorites.length)];
                      onRestaurantSelect(randomFavorite);
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Choisir un favori au hasard
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoritesPanel;
