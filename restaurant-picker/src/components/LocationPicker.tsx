import React, { useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Location } from '../types/restaurant';
import { getCurrentLocation, geocode } from '../services/geolocation';

interface LocationPickerProps {
  onLocationSelected: (location: Location) => void;
  currentLocation?: Location;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelected, 
  currentLocation 
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    setError(null);
    
    try {
      const location = await getCurrentLocation();
      onLocationSelected(location);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de géolocalisation');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAddress.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const location = await geocode(searchAddress);
      onLocationSelected(location);
      setSearchAddress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adresse non trouvée');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-primary-500" />
        Où êtes-vous ?
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {currentLocation && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Position actuelle : {currentLocation.lat.toFixed(4)}, {currentLocation.lon.toFixed(4)}
        </div>
      )}
      
      <div className="space-y-4">
        {/* Géolocalisation automatique */}
        <button
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isGettingLocation ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Localisation en cours...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Utiliser ma position actuelle
            </>
          )}
        </button>
        
        <div className="text-center text-gray-500">ou</div>
        
        {/* Recherche d'adresse */}
        <form onSubmit={handleSearchAddress} className="flex gap-2">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Entrez une adresse..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isSearching || !searchAddress.trim()}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors flex items-center"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocationPicker;
