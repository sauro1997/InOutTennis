import React, { useState } from 'react';
import { MapPin, Phone, Globe, Clock, Euro, Navigation, Star, Share2 } from 'lucide-react';
import { Restaurant } from '../types/restaurant';
import { FavoritesService, ShareService, NotificationService, RatingService } from '../services/storageService';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onShowOnMap: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onShowOnMap }) => {
  const [isFavorite, setIsFavorite] = useState(FavoritesService.isFavorite(restaurant.id));
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userNote, setUserNote] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';

    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(1)} km`;
    }
  };

  const formatPriceLevel = (level?: number): string => {
    if (!level) return '';
    return '€'.repeat(level);
  };

  const handleCall = () => {
    if (restaurant.phone) {
      window.open(`tel:${restaurant.phone}`, '_self');
    }
  };

  const handleWebsite = () => {
    if (restaurant.website) {
      window.open(restaurant.website, '_blank');
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lon}`;
    window.open(url, '_blank');
  };

  const handleToggleFavorite = () => {
    const newFavoriteStatus = FavoritesService.toggleFavorite(restaurant);
    setIsFavorite(newFavoriteStatus);

    if (newFavoriteStatus) {
      NotificationService.showNotification('Ajouté aux favoris ! ⭐', {
        body: `${restaurant.name} a été ajouté à vos favoris`,
        tag: 'favorite-added'
      });
    }
  };

  const handleShare = async () => {
    const success = await ShareService.shareRestaurant(restaurant);
    if (success) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const handleRating = () => {
    const existingRating = RatingService.getRating(restaurant.id);
    setUserRating(existingRating.rating || 0);
    setUserNote(existingRating.note || '');
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (userRating > 0) {
      RatingService.addRating(restaurant.id, userRating, userNote);
      setShowRatingModal(false);
      NotificationService.showNotification('Note enregistrée ! 📝', {
        body: `Vous avez noté ${restaurant.name} ${userRating}/5 étoiles`,
        tag: 'rating-saved'
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-primary-500 relative">
        {/* Bouton favori en haut à droite */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
            isFavorite
              ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
        >
          <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        <div className="flex justify-between items-start mb-4 pr-12">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {restaurant.name}
            </h2>

            <div className="flex flex-wrap gap-2 mb-3">
              {restaurant.cuisine && (
                <span className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
                  {restaurant.cuisine}
                </span>
              )}

              {RatingService.getRating(restaurant.id).rating && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                  ⭐ {RatingService.getRating(restaurant.id).rating}/5
                </span>
              )}
            </div>

            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {restaurant.address || `${restaurant.lat.toFixed(4)}, ${restaurant.lon.toFixed(4)}`}
              </span>
              {restaurant.distance && (
                <span className="ml-2 text-primary-600 font-medium">
                  • {formatDistance(restaurant.distance)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              {restaurant.isOpen !== undefined && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className={restaurant.isOpen ? 'text-green-600' : 'text-red-600'}>
                    {restaurant.isOpen ? 'Ouvert' : 'Fermé'}
                  </span>
                </div>
              )}

              {restaurant.priceLevel && (
                <div className="flex items-center">
                  <Euro className="w-4 h-4 mr-1" />
                  <span>{formatPriceLevel(restaurant.priceLevel)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions principales */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={onShowOnMap}
            className="flex items-center bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Voir sur la carte
          </button>

          <button
            onClick={handleDirections}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Itinéraire
          </button>

          {restaurant.phone && (
            <button
              onClick={handleCall}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Appeler
            </button>
          )}

          {restaurant.website && (
            <button
              onClick={handleWebsite}
              className="flex items-center bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4 mr-2" />
              Site web
            </button>
          )}
        </div>

        {/* Actions secondaires */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={handleRating}
            className="flex items-center bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <Star className="w-4 h-4 mr-1" />
            Noter
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${
              shareSuccess
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
            }`}
          >
            <Share2 className="w-4 h-4 mr-1" />
            {shareSuccess ? 'Partagé !' : 'Partager'}
          </button>
        </div>
      </div>

      {/* Modal de notation */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Noter {restaurant.name}</h3>

            {/* Étoiles */}
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= userRating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {userRating > 0 ? `${userRating}/5` : 'Cliquez pour noter'}
              </span>
            </div>

            {/* Note textuelle */}
            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Ajoutez une note personnelle (optionnel)..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-sm"
            />

            {/* Boutons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={submitRating}
                disabled={userRating === 0}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantCard;
