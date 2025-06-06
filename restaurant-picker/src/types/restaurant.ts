export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  cuisine?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  rating?: number;
  priceLevel?: 1 | 2 | 3 | 4; // 1 = €, 2 = €€, 3 = €€€, 4 = €€€€
  isOpen?: boolean;
  distance?: number; // en mètres
  // Nouvelles propriétés pour l'historique et favoris
  visitedAt?: Date;
  isFavorite?: boolean;
  userNote?: string;
  userRating?: number; // 1-5 étoiles
}

export interface Location {
  lat: number;
  lon: number;
  name?: string; // Nom de l'endroit pour l'historique
}

export interface Filters {
  cuisine?: string;
  priceLevel?: number[];
  openNow?: boolean;
  radius?: number; // en kilomètres
  excludeVisited?: boolean; // Exclure les restaurants déjà visités
  favoritesOnly?: boolean; // Afficher seulement les favoris
}

export interface ApiResponse {
  restaurants: Restaurant[];
  total: number;
}

// Nouveaux types pour les fonctionnalités avancées
export interface HistoryEntry {
  restaurant: Restaurant;
  selectedAt: Date;
  location: Location;
}

export interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  defaultRadius: number;
  favoriteLocation?: Location;
  excludeVisitedByDefault: boolean;
  animationsEnabled: boolean;
}

export interface ShareData {
  restaurant: Restaurant;
  message: string;
  url: string;
}

export interface RouletteState {
  isSpinning: boolean;
  currentIndex: number;
  finalIndex?: number;
  restaurants: Restaurant[];
}
