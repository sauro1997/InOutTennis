import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Bell, BellOff, Zap, ZapOff, Trash2, Download, Share2 } from 'lucide-react';
import { UserPreferences } from '../types/restaurant';
import { PreferencesService, NotificationService, HistoryService, FavoritesService } from '../services/storageService';

interface SettingsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onThemeChange: (darkMode: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onToggle,
  onThemeChange
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>(PreferencesService.getPreferences());
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    PreferencesService.updatePreferences({ [key]: value });
    
    if (key === 'darkMode') {
      onThemeChange(value as boolean);
    }
  };

  const handleNotificationToggle = async () => {
    if (!preferences.notifications) {
      const granted = await NotificationService.requestPermission();
      if (granted) {
        updatePreference('notifications', true);
        setNotificationPermission('granted');
      }
    } else {
      updatePreference('notifications', false);
    }
  };

  const handleResetAllData = () => {
    HistoryService.clearHistory();
    FavoritesService.getFavorites().forEach(fav => 
      FavoritesService.removeFromFavorites(fav.id)
    );
    PreferencesService.resetPreferences();
    setPreferences(PreferencesService.getPreferences());
    setShowConfirmReset(false);
    onThemeChange(false);
  };

  const exportData = () => {
    const data = {
      history: HistoryService.getHistory(),
      favorites: FavoritesService.getFavorites(),
      preferences: PreferencesService.getPreferences(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `on-mange-ou-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareApp = async () => {
    const shareData = {
      title: 'On mange où? 🍽️',
      text: 'Découvre cette super app pour choisir un restaurant au hasard !',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback: copier l'URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-600" />
          <span className="font-medium text-gray-800">Paramètres</span>
        </div>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 space-y-6">
          {/* Apparence */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Apparence</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {preferences.darkMode ? (
                  <Moon className="w-4 h-4 mr-2 text-gray-600" />
                ) : (
                  <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                )}
                <span className="text-sm text-gray-700">Mode sombre</span>
              </div>
              <button
                onClick={() => updatePreference('darkMode', !preferences.darkMode)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  preferences.darkMode ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.darkMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Notifications</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {preferences.notifications ? (
                  <Bell className="w-4 h-4 mr-2 text-green-600" />
                ) : (
                  <BellOff className="w-4 h-4 mr-2 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Notifications push</span>
              </div>
              <button
                onClick={handleNotificationToggle}
                disabled={notificationPermission === 'denied'}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  preferences.notifications ? 'bg-green-500' : 'bg-gray-300'
                } ${notificationPermission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.notifications ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            {notificationPermission === 'denied' && (
              <p className="text-xs text-red-600 mt-1">
                Notifications bloquées par le navigateur
              </p>
            )}
          </div>

          {/* Animations */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Interface</h4>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {preferences.animationsEnabled ? (
                  <Zap className="w-4 h-4 mr-2 text-blue-500" />
                ) : (
                  <ZapOff className="w-4 h-4 mr-2 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">Animations</span>
              </div>
              <button
                onClick={() => updatePreference('animationsEnabled', !preferences.animationsEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  preferences.animationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.animationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Exclure les restaurants visités</span>
              <button
                onClick={() => updatePreference('excludeVisitedByDefault', !preferences.excludeVisitedByDefault)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  preferences.excludeVisitedByDefault ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  preferences.excludeVisitedByDefault ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Rayon par défaut */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Recherche</h4>
            <div className="space-y-2">
              <label className="block text-sm text-gray-700">
                Rayon par défaut: {preferences.defaultRadius} km
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={preferences.defaultRadius}
                onChange={(e) => updatePreference('defaultRadius', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 km</span>
                <span>20 km</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Actions</h4>
            
            <div className="space-y-3">
              <button
                onClick={exportData}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter mes données
              </button>
              
              <button
                onClick={shareApp}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager l'app
              </button>
              
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Réinitialiser toutes les données
              </button>
            </div>
          </div>

          {/* Confirmation de réinitialisation */}
          {showConfirmReset && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 mb-3 font-medium">
                ⚠️ Attention !
              </p>
              <p className="text-red-700 text-sm mb-3">
                Cette action supprimera définitivement :
              </p>
              <ul className="text-red-700 text-sm mb-4 list-disc list-inside">
                <li>Tout l'historique</li>
                <li>Tous les favoris</li>
                <li>Toutes les préférences</li>
              </ul>
              <div className="flex gap-2">
                <button
                  onClick={handleResetAllData}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  Confirmer la suppression
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
