import { Location } from '../types/restaurant';

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par ce navigateur'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position non disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout de géolocalisation';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Géocodage inverse pour obtenir une adresse à partir de coordonnées
export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors du géocodage inverse');
    }
    
    const data = await response.json();
    
    if (data.display_name) {
      return data.display_name;
    }
    
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch (error) {
    console.error('Erreur géocodage inverse:', error);
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
};

// Géocodage pour obtenir des coordonnées à partir d'une adresse
export const geocode = async (address: string): Promise<Location> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors du géocodage');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Adresse non trouvée');
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } catch (error) {
    console.error('Erreur géocodage:', error);
    throw error;
  }
};
