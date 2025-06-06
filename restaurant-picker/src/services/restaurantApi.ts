import { Restaurant, Location, Filters } from '../types/restaurant';
import { calculateDistance } from '../utils/randomPicker';

// Mapping des types de cuisine OpenStreetMap
const cuisineMapping: { [key: string]: string } = {
  'french': 'Française',
  'italian': 'Italienne',
  'chinese': 'Chinoise',
  'japanese': 'Japonaise',
  'indian': 'Indienne',
  'thai': 'Thaïlandaise',
  'mexican': 'Mexicaine',
  'pizza': 'Pizza',
  'burger': 'Burger',
  'kebab': 'Kebab',
  'sushi': 'Sushi',
  'seafood': 'Fruits de mer',
  'vegetarian': 'Végétarienne',
  'regional': 'Régionale'
};

// Fonction pour déterminer si un restaurant est ouvert maintenant
const isRestaurantOpen = (openingHours?: string): boolean => {
  if (!openingHours) return true; // Assume ouvert si pas d'info
  
  const now = new Date();
  const currentDay = now.getDay(); // 0 = dimanche, 1 = lundi, etc.
  const currentTime = now.getHours() * 100 + now.getMinutes(); // Format HHMM
  
  // Parsing basique des horaires OpenStreetMap
  // Format typique: "Mo-Fr 12:00-14:00,19:00-22:00; Sa 19:00-22:00"
  try {
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const currentDayName = dayNames[currentDay];
    
    // Recherche simple pour le jour actuel
    if (openingHours.includes(currentDayName) || openingHours.includes('Mo-Su')) {
      // Extraction basique des heures (à améliorer)
      const timeRegex = /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/g;
      let match;
      
      while ((match = timeRegex.exec(openingHours)) !== null) {
        const openTime = parseInt(match[1]) * 100 + parseInt(match[2]);
        const closeTime = parseInt(match[3]) * 100 + parseInt(match[4]);
        
        if (currentTime >= openTime && currentTime <= closeTime) {
          return true;
        }
      }
    }
    
    return false;
  } catch {
    return true; // En cas d'erreur de parsing, assume ouvert
  }
};

export const searchRestaurants = async (
  location: Location, 
  filters: Filters = {}
): Promise<Restaurant[]> => {
  const radius = (filters.radius || 5) * 1000; // Conversion km -> m
  
  // Construction de la requête Overpass API
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:${radius},${location.lat},${location.lon});
      way["amenity"="restaurant"](around:${radius},${location.lat},${location.lon});
      relation["amenity"="restaurant"](around:${radius},${location.lat},${location.lon});
    );
    out center meta;
  `;
  
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la recherche de restaurants');
    }
    
    const data = await response.json();
    
    const restaurants: Restaurant[] = data.elements
      .filter((element: any) => element.tags && element.tags.name)
      .map((element: any) => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        
        if (!lat || !lon) return null;
        
        const distance = calculateDistance(location.lat, location.lon, lat, lon);
        const cuisine = element.tags.cuisine ? cuisineMapping[element.tags.cuisine] || element.tags.cuisine : undefined;
        
        return {
          id: element.id.toString(),
          name: element.tags.name,
          lat,
          lon,
          address: element.tags['addr:full'] || 
                   `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street'] || ''}`.trim() ||
                   undefined,
          cuisine,
          phone: element.tags.phone,
          website: element.tags.website,
          openingHours: element.tags.opening_hours,
          isOpen: isRestaurantOpen(element.tags.opening_hours),
          distance,
          // Estimation du niveau de prix basé sur les tags OSM
          priceLevel: element.tags.price_level ? parseInt(element.tags.price_level) : undefined
        } as Restaurant;
      })
      .filter((restaurant: Restaurant | null) => restaurant !== null)
      .sort((a: Restaurant, b: Restaurant) => (a.distance || 0) - (b.distance || 0));
    
    return restaurants;
  } catch (error) {
    console.error('Erreur API restaurants:', error);
    throw new Error('Impossible de récupérer les restaurants. Vérifiez votre connexion internet.');
  }
};

// Fonction pour obtenir les types de cuisine disponibles
export const getAvailableCuisines = (restaurants: Restaurant[]): string[] => {
  const cuisines = new Set<string>();
  
  restaurants.forEach(restaurant => {
    if (restaurant.cuisine) {
      cuisines.add(restaurant.cuisine);
    }
  });
  
  return Array.from(cuisines).sort();
};
