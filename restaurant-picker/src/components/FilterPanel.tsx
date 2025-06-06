import React from 'react';
import { Filter, Clock, Euro } from 'lucide-react';
import { Filters } from '../types/restaurant';

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableCuisines: string[];
  isOpen: boolean;
  onToggle: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  availableCuisines,
  isOpen,
  onToggle
}) => {
  const handleCuisineChange = (cuisine: string) => {
    onFiltersChange({
      ...filters,
      cuisine: filters.cuisine === cuisine ? undefined : cuisine
    });
  };

  const handlePriceLevelChange = (level: number) => {
    const currentLevels = filters.priceLevel || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level];
    
    onFiltersChange({
      ...filters,
      priceLevel: newLevels.length > 0 ? newLevels : undefined
    });
  };

  const handleOpenNowChange = (openNow: boolean) => {
    onFiltersChange({
      ...filters,
      openNow: openNow || undefined
    });
  };

  const handleRadiusChange = (radius: number) => {
    onFiltersChange({
      ...filters,
      radius
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      radius: filters.radius // Garde le rayon
    });
  };

  const hasActiveFilters = filters.cuisine || filters.priceLevel?.length || filters.openNow;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center">
          <Filter className="w-5 h-5 mr-2 text-primary-500" />
          <span className="font-medium text-gray-800 dark:text-gray-200">Filtres</span>
          {hasActiveFilters && (
            <span className="ml-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
              Actifs
            </span>
          )}
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 space-y-6">
          {/* Rayon de recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rayon de recherche: {filters.radius || 5} km
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={filters.radius || 5}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 km</span>
              <span>20 km</span>
            </div>
          </div>

          {/* Type de cuisine */}
          {availableCuisines.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de cuisine
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCuisines.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => handleCuisineChange(cuisine)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.cuisine === cuisine
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Niveau de prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Euro className="w-4 h-4 mr-1" />
              Niveau de prix
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((level) => (
                <button
                  key={level}
                  onClick={() => handlePriceLevelChange(level)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.priceLevel?.includes(level)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {'€'.repeat(level)}
                </button>
              ))}
            </div>
          </div>

          {/* Ouvert maintenant */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.openNow || false}
                onChange={(e) => handleOpenNowChange(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors ${
                filters.openNow ? 'bg-primary-500' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  filters.openNow ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Ouvert maintenant
              </span>
            </label>
          </div>

          {/* Bouton pour effacer les filtres */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
