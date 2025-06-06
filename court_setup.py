#!/usr/bin/env python3
"""
Interface de configuration du terrain de tennis
==============================================

Module pour la configuration interactive du terrain de tennis,
incluant la sélection des zones et la calibration de la caméra.
"""

import cv2
import pygame
import numpy as np
import json
import logging
from typing import List, Tuple, Optional, Callable
from pathlib import Path
from tennis_hawkeye import ConfigManager, CourtGeometry

logger = logging.getLogger(__name__)

class InteractiveCourtSetup:
    """Interface interactive pour configurer le terrain de tennis"""
    
    def __init__(self, config: ConfigManager):
        self.config = config
        self.image = None
        self.points = []
        self.current_zone = ""
        self.zones = {
            "court_boundary": {"points": [], "color": (0, 255, 0), "name": "Limites du terrain"},
            "service_area": {"points": [], "color": (0, 0, 255), "name": "Zone de service"},
            "baseline": {"points": [], "color": (255, 0, 0), "name": "Ligne de fond"}
        }
        self.setup_complete = False
    
    def setup_from_image(self, image_path: str) -> bool:
        """Configure le terrain à partir d'une image de référence"""
        try:
            if not Path(image_path).exists():
                logger.error(f"Image non trouvée: {image_path}")
                return False
            
            self.image = cv2.imread(image_path)
            if self.image is None:
                logger.error(f"Impossible de charger l'image: {image_path}")
                return False
            
            logger.info(f"Image chargée: {image_path}")
            self._run_interactive_setup()
            return self.setup_complete
            
        except Exception as e:
            logger.error(f"Erreur lors du setup: {e}")
            return False
    
    def _run_interactive_setup(self) -> None:
        """Lance l'interface interactive de configuration"""
        print("\n=== Configuration du terrain de tennis ===")
        print("Instructions:")
        print("1. Cliquez sur les 4 coins des limites du terrain (dans l'ordre)")
        print("2. Cliquez sur les 4 coins de la zone de service")
        print("3. Cliquez sur les 4 coins de la ligne de fond")
        print("4. Appuyez sur 'q' pour terminer chaque zone")
        print("5. Appuyez sur 'r' pour recommencer la zone actuelle")
        print("6. Appuyez sur 's' pour sauvegarder et terminer")
        
        # Configuration des zones dans l'ordre
        zone_order = ["court_boundary", "service_area", "baseline"]
        
        for zone_key in zone_order:
            zone = self.zones[zone_key]
            print(f"\n--- Configuration: {zone['name']} ---")
            print("Cliquez sur 4 points pour définir cette zone")
            
            if self._configure_zone(zone_key):
                print(f"✓ {zone['name']} configurée avec {len(zone['points'])} points")
            else:
                print(f"✗ Erreur lors de la configuration de {zone['name']}")
                return
        
        # Validation et sauvegarde
        if self._validate_configuration():
            self._save_configuration()
            self.setup_complete = True
            print("\n✓ Configuration terminée avec succès!")
        else:
            print("\n✗ Configuration invalide")
    
    def _configure_zone(self, zone_key: str) -> bool:
        """Configure une zone spécifique"""
        zone = self.zones[zone_key]
        zone["points"] = []
        
        # Création de la fenêtre OpenCV
        window_name = f"Configuration - {zone['name']}"
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        
        # Callback pour les clics de souris
        def mouse_callback(event, x, y, flags, param):
            if event == cv2.EVENT_LBUTTONDOWN and len(zone["points"]) < 4:
                zone["points"].append((x, y))
                print(f"Point {len(zone['points'])}: ({x}, {y})")
        
        cv2.setMouseCallback(window_name, mouse_callback)
        
        while True:
            # Copie de l'image pour l'affichage
            display_image = self.image.copy()
            
            # Affichage des zones déjà configurées
            self._draw_configured_zones(display_image)
            
            # Affichage des points de la zone actuelle
            self._draw_zone_points(display_image, zone)
            
            # Affichage des instructions
            self._draw_instructions(display_image, zone_key)
            
            cv2.imshow(window_name, display_image)
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('q') and len(zone["points"]) == 4:
                break
            elif key == ord('r'):
                zone["points"] = []
                print("Zone réinitialisée")
            elif key == 27:  # Escape
                cv2.destroyAllWindows()
                return False
        
        cv2.destroyAllWindows()
        return len(zone["points"]) == 4
    
    def _draw_configured_zones(self, image: np.ndarray) -> None:
        """Dessine les zones déjà configurées"""
        for zone_key, zone in self.zones.items():
            if len(zone["points"]) == 4:
                points = np.array(zone["points"], np.int32)
                cv2.polylines(image, [points], True, zone["color"], 2)
                
                # Label de la zone
                if zone["points"]:
                    cv2.putText(image, zone["name"], zone["points"][0], 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.7, zone["color"], 2)
    
    def _draw_zone_points(self, image: np.ndarray, zone: dict) -> None:
        """Dessine les points de la zone en cours de configuration"""
        for i, point in enumerate(zone["points"]):
            cv2.circle(image, point, 5, zone["color"], -1)
            cv2.putText(image, str(i+1), (point[0]+10, point[1]-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, zone["color"], 2)
        
        # Ligne entre les points
        if len(zone["points"]) > 1:
            points = np.array(zone["points"], np.int32)
            cv2.polylines(image, [points], False, zone["color"], 1)
    
    def _draw_instructions(self, image: np.ndarray, zone_key: str) -> None:
        """Affiche les instructions sur l'image"""
        zone = self.zones[zone_key]
        instructions = [
            f"Zone: {zone['name']}",
            f"Points: {len(zone['points'])}/4",
            "Q: Terminer | R: Recommencer | ESC: Annuler"
        ]
        
        y_offset = 30
        for instruction in instructions:
            cv2.putText(image, instruction, (10, y_offset),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            y_offset += 25
    
    def _validate_configuration(self) -> bool:
        """Valide la configuration complète"""
        for zone_key, zone in self.zones.items():
            if len(zone["points"]) != 4:
                logger.error(f"Zone {zone_key} incomplète: {len(zone['points'])}/4 points")
                return False
        
        # Vérification que les zones ne se chevauchent pas de manière incohérente
        # (logique de validation plus avancée peut être ajoutée ici)
        
        return True
    
    def _save_configuration(self) -> None:
        """Sauvegarde la configuration dans le fichier de config"""
        try:
            self.config.set('court.court_corners', self.zones["court_boundary"]["points"])
            self.config.set('court.service_box_corners', self.zones["service_area"]["points"])
            self.config.set('court.baseline_corners', self.zones["baseline"]["points"])
            self.config.save_config()
            
            logger.info("Configuration du terrain sauvegardée")
            
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde: {e}")
    
    def get_court_geometry(self) -> Optional[CourtGeometry]:
        """Retourne la géométrie du terrain configuré"""
        if not self.setup_complete:
            return None
        
        return CourtGeometry(
            court_corners=self.zones["court_boundary"]["points"],
            service_box_corners=self.zones["service_area"]["points"],
            baseline_corners=self.zones["baseline"]["points"]
        )

class AutoCourtDetector:
    """Détecteur automatique des lignes du terrain (fonctionnalité avancée)"""
    
    def __init__(self):
        pass
    
    def detect_court_lines(self, image: np.ndarray) -> Optional[CourtGeometry]:
        """Détecte automatiquement les lignes du terrain (à implémenter)"""
        # Cette fonctionnalité pourrait utiliser:
        # - Détection de lignes avec transformée de Hough
        # - Reconnaissance de formes géométriques
        # - Machine learning pour la détection de terrains
        
        logger.info("Détection automatique non encore implémentée")
        return None

def main():
    """Fonction principale pour tester le module"""
    config = ConfigManager()
    
    # Demander le chemin de l'image de référence
    image_path = input("Chemin vers l'image de référence du terrain: ").strip()
    
    if not image_path:
        print("Aucun chemin fourni")
        return
    
    setup = InteractiveCourtSetup(config)
    
    if setup.setup_from_image(image_path):
        print("Configuration réussie!")
        geometry = setup.get_court_geometry()
        if geometry:
            print(f"Terrain configuré avec {len(geometry.court_corners)} coins")
    else:
        print("Échec de la configuration")

if __name__ == "__main__":
    main()
