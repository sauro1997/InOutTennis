#!/usr/bin/env python3
"""
Détecteur de balles de tennis utilisant Roboflow
===============================================

Module responsable de la détection des balles de tennis dans les vidéos
en utilisant l'API Roboflow et des modèles d'intelligence artificielle.
"""

import cv2
import numpy as np
import os
import tempfile
import logging
from typing import List, Optional, Tuple, Dict, Any
from roboflow import Roboflow
from tennis_hawkeye import BallDetection, ConfigManager

logger = logging.getLogger(__name__)

class RoboflowBallDetector:
    """Détecteur de balles utilisant l'API Roboflow"""
    
    def __init__(self, config: ConfigManager):
        self.config = config
        self.model = None
        self.temp_dir = tempfile.mkdtemp()
        self._initialize_model()
    
    def _initialize_model(self) -> None:
        """Initialise le modèle Roboflow"""
        try:
            api_key = self.config.get('roboflow.api_key')
            if not api_key or api_key == "YOUR_API_KEY_HERE":
                logger.error("Clé API Roboflow non configurée")
                return
            
            project_name = self.config.get('roboflow.project', 'tennis-misz2')
            version = self.config.get('roboflow.version', 3)
            
            rf = Roboflow(api_key=api_key)
            project = rf.workspace().project(project_name)
            self.model = project.version(version).model
            
            logger.info(f"Modèle Roboflow initialisé: {project_name} v{version}")
            
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du modèle Roboflow: {e}")
            self.model = None
    
    def detect_balls_in_frame(self, frame: np.ndarray, 
                            frame_number: int, 
                            timestamp: float) -> List[BallDetection]:
        """Détecte les balles dans une frame"""
        if self.model is None:
            logger.warning("Modèle Roboflow non disponible")
            return []
        
        detections = []
        
        try:
            # Sauvegarde temporaire de la frame
            temp_path = os.path.join(self.temp_dir, f"frame_{frame_number}.jpg")
            cv2.imwrite(temp_path, frame)
            
            # Prédiction avec Roboflow
            confidence = self.config.get('roboflow.confidence', 0.3) * 100
            overlap = self.config.get('roboflow.overlap', 0.6) * 100
            
            prediction = self.model.predict(
                temp_path, 
                confidence=confidence, 
                overlap=overlap
            ).json()
            
            # Traitement des résultats
            for detection in prediction.get("predictions", []):
                if detection.get("class") == "ball":
                    ball_detection = BallDetection(
                        x=float(detection["x"]),
                        y=float(detection["y"]),
                        confidence=float(detection["confidence"]),
                        timestamp=timestamp,
                        frame_number=frame_number
                    )
                    detections.append(ball_detection)
            
            # Nettoyage du fichier temporaire
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
        except Exception as e:
            logger.error(f"Erreur lors de la détection dans la frame {frame_number}: {e}")
        
        return detections
    
    def cleanup(self) -> None:
        """Nettoie les fichiers temporaires"""
        try:
            import shutil
            shutil.rmtree(self.temp_dir, ignore_errors=True)
            logger.info("Fichiers temporaires nettoyés")
        except Exception as e:
            logger.warning(f"Erreur lors du nettoyage: {e}")

class FallbackBallDetector:
    """Détecteur de balles de secours utilisant OpenCV classique"""
    
    def __init__(self, config: ConfigManager):
        self.config = config
        self.background_subtractor = cv2.createBackgroundSubtractorMOG2(
            detectShadows=True
        )
    
    def detect_balls_in_frame(self, frame: np.ndarray, 
                            frame_number: int, 
                            timestamp: float) -> List[BallDetection]:
        """Détecte les balles en utilisant des techniques OpenCV classiques"""
        detections = []
        
        try:
            # Conversion en niveaux de gris
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Soustraction de l'arrière-plan
            fg_mask = self.background_subtractor.apply(frame)
            
            # Détection de contours
            contours, _ = cv2.findContours(
                fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            
            for contour in contours:
                area = cv2.contourArea(contour)
                
                # Filtrage par taille (approximation d'une balle de tennis)
                if 10 < area < 500:
                    # Calcul du centre du contour
                    M = cv2.moments(contour)
                    if M["m00"] != 0:
                        cx = int(M["m10"] / M["m00"])
                        cy = int(M["m01"] / M["m00"])
                        
                        # Vérification de la circularité
                        perimeter = cv2.arcLength(contour, True)
                        if perimeter > 0:
                            circularity = 4 * np.pi * area / (perimeter * perimeter)
                            
                            if circularity > 0.3:  # Seuil de circularité
                                detection = BallDetection(
                                    x=float(cx),
                                    y=float(cy),
                                    confidence=min(circularity, 1.0),
                                    timestamp=timestamp,
                                    frame_number=frame_number
                                )
                                detections.append(detection)
        
        except Exception as e:
            logger.error(f"Erreur dans le détecteur de secours: {e}")
        
        return detections

class HybridBallDetector:
    """Détecteur hybride combinant Roboflow et OpenCV"""
    
    def __init__(self, config: ConfigManager):
        self.config = config
        self.roboflow_detector = RoboflowBallDetector(config)
        self.fallback_detector = FallbackBallDetector(config)
        self.use_fallback = False
    
    def detect_balls_in_frame(self, frame: np.ndarray, 
                            frame_number: int, 
                            timestamp: float) -> List[BallDetection]:
        """Détecte les balles en utilisant le meilleur détecteur disponible"""
        
        # Tentative avec Roboflow d'abord
        if not self.use_fallback and self.roboflow_detector.model is not None:
            detections = self.roboflow_detector.detect_balls_in_frame(
                frame, frame_number, timestamp
            )
            
            # Si Roboflow échoue plusieurs fois, basculer vers le détecteur de secours
            if not detections and frame_number % 10 == 0:
                logger.info("Roboflow ne détecte rien, test du détecteur de secours")
                fallback_detections = self.fallback_detector.detect_balls_in_frame(
                    frame, frame_number, timestamp
                )
                if fallback_detections:
                    logger.info("Détecteur de secours activé")
                    self.use_fallback = True
                    return fallback_detections
            
            return detections
        
        # Utilisation du détecteur de secours
        return self.fallback_detector.detect_balls_in_frame(
            frame, frame_number, timestamp
        )
    
    def cleanup(self) -> None:
        """Nettoie les ressources"""
        self.roboflow_detector.cleanup()

if __name__ == "__main__":
    print("Module de détection de balles de tennis")
    print("Utilisez HybridBallDetector pour une détection robuste")
