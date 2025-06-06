import { Restaurant, Filters } from '../types/restaurant';

export const filterRestaurants = (restaurants: Restaurant[], filters: Filters): Restaurant[] => {
  return restaurants.filter(restaurant => {
    // Filtre par type de cuisine
    if (filters.cuisine && restaurant.cuisine !== filters.cuisine) {
      return false;
    }

    // Filtre par niveau de prix
    if (filters.priceLevel && filters.priceLevel.length > 0) {
      if (!restaurant.priceLevel || !filters.priceLevel.includes(restaurant.priceLevel)) {
        return false;
      }
    }

    // Filtre par ouverture maintenant
    if (filters.openNow && !restaurant.isOpen) {
      return false;
    }

    // Filtre par rayon (déjà appliqué lors de la recherche API)
    if (filters.radius && restaurant.distance) {
      if (restaurant.distance > filters.radius * 1000) { // conversion km -> m
        return false;
      }
    }

    return true;
  });
};

export const pickRandomRestaurant = (restaurants: Restaurant[]): Restaurant | null => {
  if (restaurants.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * restaurants.length);
  return restaurants[randomIndex];
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance en mètres
};
