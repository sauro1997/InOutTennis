import React, { useState, useEffect, useRef } from 'react';
import { Restaurant } from '../types/restaurant';

interface RouletteWheelProps {
  restaurants: Restaurant[];
  isSpinning: boolean;
  onResult: (restaurant: Restaurant) => void;
  animationsEnabled: boolean;
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({
  restaurants,
  isSpinning,
  onResult,
  animationsEnabled
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSpinning && restaurants.length > 0) {
      startSpin();
    } else {
      stopSpin();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isSpinning, restaurants]);

  const startSpin = () => {
    if (!animationsEnabled) {
      // Si les animations sont désactivées, sélectionner directement
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      setTimeout(() => onResult(restaurants[randomIndex]), 100);
      return;
    }

    setSpinCount(0);
    let speed = 50; // Vitesse initiale en ms
    let count = 0;
    const maxSpins = 20 + Math.floor(Math.random() * 20); // 20-40 tours

    const spin = () => {
      setCurrentIndex(prev => (prev + 1) % restaurants.length);
      setSpinCount(prev => prev + 1);
      count++;

      // Ralentir progressivement
      if (count > maxSpins * 0.7) {
        speed += 20;
      } else if (count > maxSpins * 0.5) {
        speed += 10;
      } else if (count > maxSpins * 0.3) {
        speed += 5;
      }

      if (count >= maxSpins) {
        stopSpin();
        // Sélectionner le restaurant final
        const finalIndex = Math.floor(Math.random() * restaurants.length);
        setCurrentIndex(finalIndex);
        setTimeout(() => onResult(restaurants[finalIndex]), 500);
      } else {
        timeoutRef.current = window.setTimeout(spin, speed);
      }
    };

    spin();
  };

  const stopSpin = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  if (restaurants.length === 0) {
    return null;
  }

  const displayedRestaurants = restaurants.slice(0, 8); // Afficher max 8 restaurants
  const angleStep = 360 / displayedRestaurants.length;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Roulette */}
      <div className="relative">
        {/* Indicateur */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
        </div>

        {/* Roue */}
        <div 
          className={`relative w-80 h-80 rounded-full border-8 border-gray-300 bg-white shadow-2xl ${
            isSpinning && animationsEnabled ? 'animate-spin-slow' : ''
          }`}
          style={{
            transform: animationsEnabled ? `rotate(${currentIndex * angleStep}deg)` : 'none',
            transition: isSpinning ? 'none' : 'transform 0.5s ease-out'
          }}
        >
          {displayedRestaurants.map((restaurant, index) => {
            const angle = (index * angleStep) - 90; // -90 pour commencer en haut
            const isSelected = index === currentIndex;
            
            return (
              <div
                key={restaurant.id}
                className={`absolute w-full h-full flex items-center justify-center transition-all duration-300 ${
                  isSelected ? 'z-10' : 'z-0'
                }`}
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'center'
                }}
              >
                <div 
                  className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg text-center max-w-32 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-primary-500 text-white scale-110 shadow-lg' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  style={{
                    transform: `rotate(${-angle}deg) ${isSelected ? 'scale(1.1)' : 'scale(1)'}`
                  }}
                >
                  <div className="text-xs font-medium truncate">
                    {restaurant.name}
                  </div>
                  {restaurant.cuisine && (
                    <div className="text-xs opacity-75 truncate">
                      {restaurant.cuisine}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Centre de la roue */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="text-white font-bold text-lg">🍽️</div>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="text-center space-y-2">
        {isSpinning ? (
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-800">
              La roulette tourne... 🎰
            </p>
            <p className="text-sm text-gray-600">
              Tours: {spinCount}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-800">
              Restaurant sélectionné:
            </p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-bold text-primary-800 text-xl">
                {restaurants[currentIndex]?.name}
              </h3>
              {restaurants[currentIndex]?.cuisine && (
                <p className="text-primary-600 text-sm">
                  {restaurants[currentIndex].cuisine}
                </p>
              )}
              {restaurants[currentIndex]?.distance && (
                <p className="text-primary-600 text-sm">
                  À {restaurants[currentIndex].distance! < 1000 
                    ? `${Math.round(restaurants[currentIndex].distance!)} m`
                    : `${(restaurants[currentIndex].distance! / 1000).toFixed(1)} km`
                  }
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Légende */}
      {!isSpinning && restaurants.length > 8 && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Affichage de 8 restaurants sur {restaurants.length} disponibles
          </p>
        </div>
      )}
    </div>
  );
};

export default RouletteWheel;
