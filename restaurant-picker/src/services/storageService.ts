import { Restaurant, HistoryEntry, UserPreferences, Location } from '../types/restaurant';

const STORAGE_KEYS = {
  HISTORY: 'restaurant-picker-history',
  FAVORITES: 'restaurant-picker-favorites',
  PREFERENCES: 'restaurant-picker-preferences',
  VISITED: 'restaurant-picker-visited'
};

// Service pour gérer l'historique des sélections
export class HistoryService {
  static getHistory(): HistoryEntry[] {
    try {
      const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return history ? JSON.parse(history).map((entry: any) => ({
        ...entry,
        selectedAt: new Date(entry.selectedAt)
      })) : [];
    } catch {
      return [];
    }
  }

  static addToHistory(restaurant: Restaurant, location: Location): void {
    try {
      const history = this.getHistory();
      const newEntry: HistoryEntry = {
        restaurant: { ...restaurant, visitedAt: new Date() },
        selectedAt: new Date(),
        location
      };
      
      // Éviter les doublons récents (même restaurant dans les 24h)
      const recentEntry = history.find(entry => 
        entry.restaurant.id === restaurant.id && 
        Date.now() - entry.selectedAt.getTime() < 24 * 60 * 60 * 1000
      );
      
      if (!recentEntry) {
        history.unshift(newEntry);
        // Garder seulement les 50 dernières entrées
        const limitedHistory = history.slice(0, 50);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout à l\'historique:', error);
    }
  }

  static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }

  static getRecentRestaurantIds(hours: number = 24): string[] {
    const history = this.getHistory();
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return history
      .filter(entry => entry.selectedAt.getTime() > cutoff)
      .map(entry => entry.restaurant.id);
  }
}

// Service pour gérer les favoris
export class FavoritesService {
  static getFavorites(): Restaurant[] {
    try {
      const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch {
      return [];
    }
  }

  static addToFavorites(restaurant: Restaurant): void {
    try {
      const favorites = this.getFavorites();
      const exists = favorites.find(fav => fav.id === restaurant.id);
      
      if (!exists) {
        const favoriteRestaurant = { ...restaurant, isFavorite: true };
        favorites.push(favoriteRestaurant);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
    }
  }

  static removeFromFavorites(restaurantId: string): void {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter(fav => fav.id !== restaurantId);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
    }
  }

  static isFavorite(restaurantId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.id === restaurantId);
  }

  static toggleFavorite(restaurant: Restaurant): boolean {
    const isFav = this.isFavorite(restaurant.id);
    if (isFav) {
      this.removeFromFavorites(restaurant.id);
      return false;
    } else {
      this.addToFavorites(restaurant);
      return true;
    }
  }
}

// Service pour gérer les préférences utilisateur
export class PreferencesService {
  static getPreferences(): UserPreferences {
    try {
      const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      const defaultPrefs: UserPreferences = {
        darkMode: false,
        notifications: true,
        defaultRadius: 5,
        excludeVisitedByDefault: false,
        animationsEnabled: true
      };
      
      return prefs ? { ...defaultPrefs, ...JSON.parse(prefs) } : defaultPrefs;
    } catch {
      return {
        darkMode: false,
        notifications: true,
        defaultRadius: 5,
        excludeVisitedByDefault: false,
        animationsEnabled: true
      };
    }
  }

  static updatePreferences(updates: Partial<UserPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
    }
  }

  static resetPreferences(): void {
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  }
}

// Service pour gérer les notes et évaluations
export class RatingService {
  static addRating(restaurantId: string, rating: number, note?: string): void {
    try {
      const visited = this.getVisitedRestaurants();
      const existing = visited.find(v => v.id === restaurantId);
      
      if (existing) {
        existing.userRating = rating;
        existing.userNote = note;
      } else {
        visited.push({
          id: restaurantId,
          userRating: rating,
          userNote: note,
          visitedAt: new Date()
        });
      }
      
      localStorage.setItem(STORAGE_KEYS.VISITED, JSON.stringify(visited));
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error);
    }
  }

  static getRating(restaurantId: string): { rating?: number; note?: string } {
    const visited = this.getVisitedRestaurants();
    const restaurant = visited.find(v => v.id === restaurantId);
    return {
      rating: restaurant?.userRating,
      note: restaurant?.userNote
    };
  }

  private static getVisitedRestaurants(): any[] {
    try {
      const visited = localStorage.getItem(STORAGE_KEYS.VISITED);
      return visited ? JSON.parse(visited) : [];
    } catch {
      return [];
    }
  }
}

// Service pour les notifications
export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
      });
    }
  }

  static notifyRestaurantSelected(restaurantName: string): void {
    this.showNotification('Restaurant sélectionné ! 🍽️', {
      body: `Direction ${restaurantName} pour votre prochain repas !`,
      tag: 'restaurant-selected'
    });
  }
}

// Service pour le partage
export class ShareService {
  static async shareRestaurant(restaurant: Restaurant): Promise<boolean> {
    const shareData = {
      title: `On mange où? - ${restaurant.name}`,
      text: `J'ai découvert ${restaurant.name} grâce à "On mange où?" ! 🍽️`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return true;
      } catch {
        return false;
      }
    }

    // Fallback: copier dans le presse-papier
    try {
      const text = `${shareData.text}\n${shareData.url}`;
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  static generateShareUrl(restaurant: Restaurant): string {
    const params = new URLSearchParams({
      name: restaurant.name,
      lat: restaurant.lat.toString(),
      lon: restaurant.lon.toString()
    });
    return `${window.location.origin}?shared=${encodeURIComponent(params.toString())}`;
  }
}
