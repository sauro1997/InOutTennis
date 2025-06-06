import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Restaurant, Location } from '../types/restaurant';

// Fix pour les icônes Leaflet avec Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icône personnalisée pour l'utilisateur
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icône personnalisée pour le restaurant sélectionné
const selectedRestaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  userLocation: Location;
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
}

// Composant pour centrer la carte sur un restaurant sélectionné
const MapController: React.FC<{ selectedRestaurant?: Restaurant }> = ({ selectedRestaurant }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedRestaurant) {
      map.setView([selectedRestaurant.lat, selectedRestaurant.lon], 16);
    }
  }, [selectedRestaurant, map]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({
  userLocation,
  restaurants,
  selectedRestaurant,
  onRestaurantSelect
}) => {
  const mapRef = useRef<L.Map>(null);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-96 w-full">
        <MapContainer
          ref={mapRef}
          center={[userLocation.lat, userLocation.lon]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marqueur de l'utilisateur */}
          <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>Votre position</strong>
              </div>
            </Popup>
          </Marker>
          
          {/* Marqueurs des restaurants */}
          {restaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              position={[restaurant.lat, restaurant.lon]}
              icon={selectedRestaurant?.id === restaurant.id ? selectedRestaurantIcon : undefined}
              eventHandlers={{
                click: () => onRestaurantSelect?.(restaurant)
              }}
            >
              <Popup>
                <div className="min-w-48">
                  <h3 className="font-semibold text-lg mb-2">{restaurant.name}</h3>
                  
                  {restaurant.cuisine && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Cuisine:</strong> {restaurant.cuisine}
                    </p>
                  )}
                  
                  {restaurant.address && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Adresse:</strong> {restaurant.address}
                    </p>
                  )}
                  
                  {restaurant.distance && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Distance:</strong> {restaurant.distance < 1000 
                        ? `${Math.round(restaurant.distance)} m`
                        : `${(restaurant.distance / 1000).toFixed(1)} km`
                      }
                    </p>
                  )}
                  
                  {restaurant.isOpen !== undefined && (
                    <p className="text-sm mb-2">
                      <strong>Statut:</strong>{' '}
                      <span className={restaurant.isOpen ? 'text-green-600' : 'text-red-600'}>
                        {restaurant.isOpen ? 'Ouvert' : 'Fermé'}
                      </span>
                    </p>
                  )}
                  
                  {restaurant.phone && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Téléphone:</strong> {restaurant.phone}
                    </p>
                  )}
                  
                  <button
                    onClick={() => onRestaurantSelect?.(restaurant)}
                    className="w-full mt-2 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Sélectionner ce restaurant
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          <MapController selectedRestaurant={selectedRestaurant} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
