import React, { useState, useEffect } from 'react';
import { History, Clock, MapPin, Star, Trash2 } from 'lucide-react';
import { HistoryEntry, Restaurant } from '../types/restaurant';
import { HistoryService, FavoritesService } from '../services/storageService';

interface HistoryPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onRestaurantSelect: (restaurant: Restaurant) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onToggle,
  onRestaurantSelect
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    const historyData = HistoryService.getHistory();
    setHistory(historyData);
  };

  const handleClearHistory = () => {
    HistoryService.clearHistory();
    setHistory([]);
    setShowConfirmClear(false);
  };

  const handleToggleFavorite = (restaurant: Restaurant) => {
    FavoritesService.toggleFavorite(restaurant);
    // Recharger l'historique pour mettre à jour les icônes de favoris
    loadHistory();
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Il y a moins d\'une heure';
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: diffDays > 365 ? 'numeric' : undefined
      });
    }
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(1)} km`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <History className="w-5 h-5 mr-2 text-primary-500" />
          <span className="font-medium text-gray-800">Historique</span>
          {history.length > 0 && (
            <span className="ml-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
              {history.length}
            </span>
          )}
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun restaurant dans l'historique</p>
              <p className="text-sm mt-2">Vos sélections apparaîtront ici</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  {history.length} restaurant{history.length > 1 ? 's' : ''} visité{history.length > 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Effacer
                </button>
              </div>

              {showConfirmClear && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 mb-3">
                    Êtes-vous sûr de vouloir effacer tout l'historique ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearHistory}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setShowConfirmClear(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((entry, index) => (
                  <div
                    key={`${entry.restaurant.id}-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onRestaurantSelect(entry.restaurant)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800 flex-1">
                        {entry.restaurant.name}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(entry.restaurant);
                        }}
                        className={`ml-2 p-1 rounded transition-colors ${
                          FavoritesService.isFavorite(entry.restaurant.id)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star className="w-4 h-4" fill={
                          FavoritesService.isFavorite(entry.restaurant.id) ? 'currentColor' : 'none'
                        } />
                      </button>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDate(entry.selectedAt)}</span>
                      
                      {entry.restaurant.distance && (
                        <>
                          <span className="mx-2">•</span>
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{formatDistance(entry.restaurant.distance)}</span>
                        </>
                      )}
                    </div>
                    
                    {entry.restaurant.cuisine && (
                      <div className="flex items-center mb-2">
                        <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                          {entry.restaurant.cuisine}
                        </span>
                        
                        {entry.restaurant.priceLevel && (
                          <span className="ml-2 text-gray-600 text-xs">
                            {'€'.repeat(entry.restaurant.priceLevel)}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {entry.restaurant.address && (
                      <p className="text-xs text-gray-500 truncate">
                        {entry.restaurant.address}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
