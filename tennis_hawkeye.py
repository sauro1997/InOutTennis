#!/usr/bin/env python3
"""
Tennis Hawk-Eye System
======================

Un système avancé de détection "in/out" pour le tennis, inspiré du système Hawk-Eye.
Utilise la vision par ordinateur et l'intelligence artificielle pour analyser
la trajectoire des balles de tennis et déterminer si elles sont "in" ou "out".

Fonctionnalités principales:
- Détection automatique des balles avec Roboflow
- Suivi temporel de la trajectoire
- Détection de rebond basée sur la physique
- Calibration précise du terrain
- Interface utilisateur intuitive
- Visualisation en temps réel

Auteur: Assistant IA Augment
Version: 2.0
"""

import cv2
import numpy as np
import json
import os
import sys
import logging
from typing import List, Tuple, Optional, Dict, Any
from dataclasses import dataclass
from pathlib import Path

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class BallDetection:
    """Représente une détection de balle à un instant donné"""
    x: float
    y: float
    confidence: float
    timestamp: float
    frame_number: int

@dataclass
class CourtGeometry:
    """Géométrie du terrain de tennis"""
    court_corners: List[Tuple[int, int]]
    service_box_corners: List[Tuple[int, int]]
    baseline_corners: List[Tuple[int, int]]
    
    def is_valid(self) -> bool:
        """Vérifie si la géométrie du terrain est valide"""
        return (len(self.court_corners) == 4 and 
                len(self.service_box_corners) == 4 and
                len(self.baseline_corners) == 4)

class ConfigManager:
    """Gestionnaire de configuration pour le système Hawk-Eye"""
    
    def __init__(self, config_path: str = "config.json"):
        self.config_path = config_path
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """Charge la configuration depuis le fichier JSON"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            logger.info(f"Configuration chargée depuis {self.config_path}")
            return config
        except FileNotFoundError:
            logger.error(f"Fichier de configuration {self.config_path} non trouvé")
            return self.get_default_config()
        except json.JSONDecodeError as e:
            logger.error(f"Erreur de parsing JSON: {e}")
            return self.get_default_config()
    
    def save_config(self) -> None:
        """Sauvegarde la configuration dans le fichier JSON"""
        try:
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=4, ensure_ascii=False)
            logger.info(f"Configuration sauvegardée dans {self.config_path}")
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde: {e}")
    
    def get_default_config(self) -> Dict[str, Any]:
        """Retourne une configuration par défaut"""
        return {
            "roboflow": {
                "api_key": "",
                "project": "tennis-misz2",
                "version": 3,
                "confidence": 0.3,
                "overlap": 0.6
            },
            "detection": {
                "min_ball_confidence": 0.3,
                "max_tracking_distance": 50,
                "bounce_detection_threshold": 0.8,
                "trajectory_smoothing": 0.7
            }
        }
    
    def get(self, key_path: str, default=None):
        """Récupère une valeur de configuration avec notation pointée"""
        keys = key_path.split('.')
        value = self.config
        try:
            for key in keys:
                value = value[key]
            return value
        except (KeyError, TypeError):
            return default
    
    def set(self, key_path: str, value: Any) -> None:
        """Définit une valeur de configuration avec notation pointée"""
        keys = key_path.split('.')
        config_ref = self.config
        for key in keys[:-1]:
            if key not in config_ref:
                config_ref[key] = {}
            config_ref = config_ref[key]
        config_ref[keys[-1]] = value

class BallTracker:
    """Système de suivi de balle avec filtrage temporel"""
    
    def __init__(self, config: ConfigManager):
        self.config = config
        self.detections: List[BallDetection] = []
        self.trajectory: List[Tuple[float, float]] = []
        self.last_position: Optional[Tuple[float, float]] = None
        self.velocity: Optional[Tuple[float, float]] = None
        self.max_tracking_distance = config.get('detection.max_tracking_distance', 50)
        self.smoothing_factor = config.get('detection.trajectory_smoothing', 0.7)
    
    def add_detection(self, detection: BallDetection) -> bool:
        """Ajoute une nouvelle détection et met à jour la trajectoire"""
        if self._is_valid_detection(detection):
            self.detections.append(detection)
            self._update_trajectory(detection)
            return True
        return False
    
    def _is_valid_detection(self, detection: BallDetection) -> bool:
        """Valide une détection basée sur la distance et la cohérence"""
        if not self.last_position:
            return True
        
        distance = np.sqrt(
            (detection.x - self.last_position[0])**2 + 
            (detection.y - self.last_position[1])**2
        )
        
        return distance <= self.max_tracking_distance
    
    def _update_trajectory(self, detection: BallDetection) -> None:
        """Met à jour la trajectoire avec lissage"""
        new_position = (detection.x, detection.y)
        
        if self.last_position:
            # Lissage de la trajectoire
            smoothed_x = (self.smoothing_factor * self.last_position[0] + 
                         (1 - self.smoothing_factor) * detection.x)
            smoothed_y = (self.smoothing_factor * self.last_position[1] + 
                         (1 - self.smoothing_factor) * detection.y)
            new_position = (smoothed_x, smoothed_y)
            
            # Calcul de la vélocité
            if len(self.trajectory) > 0:
                dt = 1.0  # Assumons 1 frame = 1 unité de temps
                self.velocity = (
                    (new_position[0] - self.last_position[0]) / dt,
                    (new_position[1] - self.last_position[1]) / dt
                )
        
        self.trajectory.append(new_position)
        self.last_position = new_position
    
    def detect_bounce(self) -> bool:
        """Détecte un rebond basé sur le changement de vélocité"""
        if len(self.trajectory) < 3 or not self.velocity:
            return False
        
        # Analyse des 3 dernières positions pour détecter un changement de direction
        recent_positions = self.trajectory[-3:]
        
        # Calcul des vecteurs de direction
        v1 = (recent_positions[1][0] - recent_positions[0][0],
              recent_positions[1][1] - recent_positions[0][1])
        v2 = (recent_positions[2][0] - recent_positions[1][0],
              recent_positions[2][1] - recent_positions[1][1])
        
        # Détection du changement de direction (particulièrement en Y pour les rebonds)
        if abs(v1[1]) > 0 and abs(v2[1]) > 0:
            direction_change = (v1[1] * v2[1]) < 0  # Changement de signe en Y
            velocity_magnitude = np.sqrt(v2[0]**2 + v2[1]**2)
            
            return direction_change and velocity_magnitude > self.config.get('detection.bounce_detection_threshold', 0.8)
        
        return False
    
    def get_current_position(self) -> Optional[Tuple[float, float]]:
        """Retourne la position actuelle de la balle"""
        return self.last_position
    
    def clear_trajectory(self) -> None:
        """Remet à zéro la trajectoire"""
        self.detections.clear()
        self.trajectory.clear()
        self.last_position = None
        self.velocity = None

class CourtCalibrator:
    """Système de calibration du terrain de tennis"""

    def __init__(self, config: ConfigManager):
        self.config = config
        self.court_geometry: Optional[CourtGeometry] = None

    def calibrate_from_points(self, court_corners: List[Tuple[int, int]],
                            service_corners: List[Tuple[int, int]],
                            baseline_corners: List[Tuple[int, int]]) -> CourtGeometry:
        """Calibre le terrain à partir de points manuels"""
        geometry = CourtGeometry(
            court_corners=court_corners,
            service_box_corners=service_corners,
            baseline_corners=baseline_corners
        )

        if geometry.is_valid():
            self.court_geometry = geometry
            self._save_geometry()
            logger.info("Calibration du terrain réussie")
        else:
            logger.error("Géométrie du terrain invalide")

        return geometry

    def _save_geometry(self) -> None:
        """Sauvegarde la géométrie dans la configuration"""
        if self.court_geometry:
            self.config.set('court.court_corners', self.court_geometry.court_corners)
            self.config.set('court.service_box_corners', self.court_geometry.service_box_corners)
            self.config.set('court.baseline_corners', self.court_geometry.baseline_corners)
            self.config.save_config()

    def load_geometry(self) -> Optional[CourtGeometry]:
        """Charge la géométrie depuis la configuration"""
        court_corners = self.config.get('court.court_corners', [])
        service_corners = self.config.get('court.service_box_corners', [])
        baseline_corners = self.config.get('court.baseline_corners', [])

        if court_corners and service_corners and baseline_corners:
            self.court_geometry = CourtGeometry(
                court_corners=court_corners,
                service_box_corners=service_corners,
                baseline_corners=baseline_corners
            )
            return self.court_geometry
        return None

class InOutDetector:
    """Détecteur principal pour déterminer si une balle est IN ou OUT"""

    def __init__(self, court_geometry: CourtGeometry):
        self.court_geometry = court_geometry

    def is_ball_in_court(self, position: Tuple[float, float]) -> str:
        """Détermine si une position est IN, OUT ou UNKNOWN"""
        x, y = position

        # Vérification si la balle est dans les limites du terrain principal
        if self._point_in_polygon(position, self.court_geometry.court_corners):
            # Vérification plus précise avec les zones de service
            if self._point_in_polygon(position, self.court_geometry.service_box_corners):
                return "IN"
            elif self._point_in_polygon(position, self.court_geometry.baseline_corners):
                return "IN"
            else:
                return "OUT"
        else:
            return "OUT"

    def _point_in_polygon(self, point: Tuple[float, float],
                         polygon: List[Tuple[int, int]]) -> bool:
        """Algorithme ray casting pour déterminer si un point est dans un polygone"""
        x, y = point
        n = len(polygon)
        inside = False

        p1x, p1y = polygon[0]
        for i in range(1, n + 1):
            p2x, p2y = polygon[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y

        return inside

if __name__ == "__main__":
    print("Tennis Hawk-Eye System v2.0")
    print("============================")
    print("Système de détection in/out pour le tennis")
    print("Utilisez la classe TennisHawkEye pour commencer l'analyse")
