#!/usr/bin/env python3
"""
Application principale Tennis Hawk-Eye
=====================================

Application complète de détection "in/out" pour le tennis.
Combine tous les modules pour créer un système Hawk-Eye fonctionnel.
"""

import cv2
import numpy as np
import os
import sys
import time
import logging
from pathlib import Path
from typing import List, Optional, Tuple

# Imports des modules locaux
from tennis_hawkeye import (
    ConfigManager, BallTracker, CourtCalibrator, 
    InOutDetector, BallDetection, CourtGeometry
)
from ball_detector import HybridBallDetector
from court_setup import InteractiveCourtSetup

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('tennis_hawkeye.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TennisHawkEyeSystem:
    """Système principal Tennis Hawk-Eye"""
    
    def __init__(self, config_path: str = "config.json"):
        self.config = ConfigManager(config_path)
        self.ball_detector = HybridBallDetector(self.config)
        self.ball_tracker = BallTracker(self.config)
        self.court_calibrator = CourtCalibrator(self.config)
        self.in_out_detector = None
        self.court_geometry = None
        
        # Variables de traitement vidéo
        self.video_capture = None
        self.video_writer = None
        self.frame_count = 0
        self.fps = 30
        
        # Statistiques
        self.stats = {
            "total_frames": 0,
            "balls_detected": 0,
            "in_calls": 0,
            "out_calls": 0,
            "bounces_detected": 0
        }
    
    def setup_court(self, reference_image_path: str) -> bool:
        """Configure le terrain de tennis"""
        logger.info("Début de la configuration du terrain")
        
        # Vérifier si une configuration existe déjà
        existing_geometry = self.court_calibrator.load_geometry()
        if existing_geometry and existing_geometry.is_valid():
            response = input("Configuration existante trouvée. Utiliser? (y/n): ")
            if response.lower() == 'y':
                self.court_geometry = existing_geometry
                self.in_out_detector = InOutDetector(self.court_geometry)
                logger.info("Configuration existante chargée")
                return True
        
        # Configuration interactive
        setup = InteractiveCourtSetup(self.config)
        if setup.setup_from_image(reference_image_path):
            self.court_geometry = setup.get_court_geometry()
            if self.court_geometry:
                self.in_out_detector = InOutDetector(self.court_geometry)
                logger.info("Terrain configuré avec succès")
                return True
        
        logger.error("Échec de la configuration du terrain")
        return False
    
    def process_video(self, video_path: str, output_path: str, 
                     max_duration: Optional[float] = None) -> bool:
        """Traite une vidéo complète"""
        try:
            # Ouverture de la vidéo
            self.video_capture = cv2.VideoCapture(video_path)
            if not self.video_capture.isOpened():
                logger.error(f"Impossible d'ouvrir la vidéo: {video_path}")
                return False
            
            # Propriétés de la vidéo
            self.fps = int(self.video_capture.get(cv2.CAP_PROP_FPS))
            frame_width = int(self.video_capture.get(cv2.CAP_PROP_FRAME_WIDTH))
            frame_height = int(self.video_capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
            total_frames = int(self.video_capture.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Limitation de durée
            if max_duration:
                max_frames = int(max_duration * self.fps)
                total_frames = min(total_frames, max_frames)
            
            logger.info(f"Traitement vidéo: {total_frames} frames à {self.fps} FPS")
            
            # Configuration du writer de sortie
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            self.video_writer = cv2.VideoWriter(
                output_path, fourcc, self.fps, (frame_width, frame_height)
            )
            
            # Traitement frame par frame
            self.frame_count = 0
            start_time = time.time()
            
            while self.frame_count < total_frames:
                ret, frame = self.video_capture.read()
                if not ret:
                    break
                
                # Traitement de la frame
                processed_frame = self._process_frame(frame)
                
                # Écriture de la frame traitée
                self.video_writer.write(processed_frame)
                
                # Affichage du progrès
                if self.frame_count % 30 == 0:
                    progress = (self.frame_count / total_frames) * 100
                    elapsed = time.time() - start_time
                    eta = (elapsed / (self.frame_count + 1)) * (total_frames - self.frame_count)
                    logger.info(f"Progrès: {progress:.1f}% - ETA: {eta:.1f}s")
                
                self.frame_count += 1
            
            # Finalisation
            self._cleanup_video_processing()
            self._print_statistics()
            
            logger.info(f"Traitement terminé: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement vidéo: {e}")
            self._cleanup_video_processing()
            return False
    
    def _process_frame(self, frame: np.ndarray) -> np.ndarray:
        """Traite une frame individuelle"""
        processed_frame = frame.copy()
        timestamp = self.frame_count / self.fps
        
        # Détection des balles
        detections = self.ball_detector.detect_balls_in_frame(
            frame, self.frame_count, timestamp
        )
        
        # Mise à jour des statistiques
        self.stats["total_frames"] += 1
        if detections:
            self.stats["balls_detected"] += len(detections)
        
        # Traitement de chaque détection
        for detection in detections:
            # Ajout au tracker
            if self.ball_tracker.add_detection(detection):
                # Vérification du rebond
                if self.ball_tracker.detect_bounce():
                    self.stats["bounces_detected"] += 1
                    logger.info(f"Rebond détecté à la frame {self.frame_count}")
                
                # Détermination IN/OUT
                if self.in_out_detector:
                    position = (detection.x, detection.y)
                    call = self.in_out_detector.is_ball_in_court(position)
                    
                    if call == "IN":
                        self.stats["in_calls"] += 1
                    elif call == "OUT":
                        self.stats["out_calls"] += 1
                    
                    # Visualisation
                    processed_frame = self._draw_detection(
                        processed_frame, detection, call
                    )
        
        # Dessin du terrain
        if self.court_geometry:
            processed_frame = self._draw_court(processed_frame)
        
        # Dessin de la trajectoire
        processed_frame = self._draw_trajectory(processed_frame)
        
        return processed_frame
    
    def _draw_detection(self, frame: np.ndarray, 
                       detection: BallDetection, call: str) -> np.ndarray:
        """Dessine une détection de balle sur la frame"""
        x, y = int(detection.x), int(detection.y)
        
        # Couleur selon le call
        colors = self.config.get('visualization.colors', {})
        if call == "IN":
            color = colors.get('ball_in', [0, 255, 0])
        elif call == "OUT":
            color = colors.get('ball_out', [0, 0, 255])
        else:
            color = [255, 255, 255]
        
        # Dessin du cercle et du label
        cv2.circle(frame, (x, y), 10, color, 2)
        
        # Label avec call et confiance
        label = f"{call} ({detection.confidence:.2f})"
        cv2.putText(frame, label, (x + 15, y - 15),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        return frame
    
    def _draw_court(self, frame: np.ndarray) -> np.ndarray:
        """Dessine les lignes du terrain"""
        if not self.court_geometry:
            return frame
        
        colors = self.config.get('visualization.colors', {})
        thickness = self.config.get('visualization.line_thickness', 2)
        
        # Limites du terrain
        court_color = colors.get('court_boundary', [0, 255, 0])
        points = np.array(self.court_geometry.court_corners, np.int32)
        cv2.polylines(frame, [points], True, court_color, thickness)
        
        # Zone de service
        service_color = colors.get('service_area', [0, 0, 255])
        points = np.array(self.court_geometry.service_box_corners, np.int32)
        cv2.polylines(frame, [points], True, service_color, thickness)
        
        return frame
    
    def _draw_trajectory(self, frame: np.ndarray) -> np.ndarray:
        """Dessine la trajectoire de la balle"""
        if not self.config.get('visualization.show_trajectory', True):
            return frame
        
        trajectory = self.ball_tracker.trajectory
        if len(trajectory) < 2:
            return frame
        
        color = self.config.get('visualization.colors.trajectory', [255, 255, 0])
        
        # Dessin de la trajectoire
        for i in range(1, len(trajectory)):
            pt1 = (int(trajectory[i-1][0]), int(trajectory[i-1][1]))
            pt2 = (int(trajectory[i][0]), int(trajectory[i][1]))
            cv2.line(frame, pt1, pt2, color, 1)
        
        return frame
    
    def _cleanup_video_processing(self) -> None:
        """Nettoie les ressources de traitement vidéo"""
        if self.video_capture:
            self.video_capture.release()
        if self.video_writer:
            self.video_writer.release()
        self.ball_detector.cleanup()
    
    def _print_statistics(self) -> None:
        """Affiche les statistiques de traitement"""
        print("\n=== Statistiques de traitement ===")
        print(f"Frames traitées: {self.stats['total_frames']}")
        print(f"Balles détectées: {self.stats['balls_detected']}")
        print(f"Appels IN: {self.stats['in_calls']}")
        print(f"Appels OUT: {self.stats['out_calls']}")
        print(f"Rebonds détectés: {self.stats['bounces_detected']}")
        
        if self.stats['total_frames'] > 0:
            detection_rate = (self.stats['balls_detected'] / self.stats['total_frames']) * 100
            print(f"Taux de détection: {detection_rate:.1f}%")

def main():
    """Fonction principale"""
    print("Tennis Hawk-Eye System v2.0")
    print("============================")
    
    # Initialisation du système
    system = TennisHawkEyeSystem()
    
    # Configuration interactive
    print("\n1. Configuration du terrain")
    reference_image = input("Chemin vers l'image de référence: ").strip()
    
    if not reference_image or not Path(reference_image).exists():
        print("Image de référence non trouvée")
        return
    
    if not system.setup_court(reference_image):
        print("Échec de la configuration du terrain")
        return
    
    print("\n2. Traitement de la vidéo")
    video_path = input("Chemin vers la vidéo à analyser: ").strip()
    
    if not video_path or not Path(video_path).exists():
        print("Vidéo non trouvée")
        return
    
    output_path = input("Chemin de sortie (défaut: output_hawkeye.mp4): ").strip()
    if not output_path:
        output_path = "output_hawkeye.mp4"
    
    max_duration = input("Durée max en secondes (défaut: 30): ").strip()
    try:
        max_duration = float(max_duration) if max_duration else 30.0
    except ValueError:
        max_duration = 30.0
    
    # Traitement
    print(f"\n3. Analyse en cours...")
    if system.process_video(video_path, output_path, max_duration):
        print(f"\n✓ Analyse terminée: {output_path}")
    else:
        print("\n✗ Échec de l'analyse")

if __name__ == "__main__":
    main()
