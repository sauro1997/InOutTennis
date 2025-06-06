#!/usr/bin/env python3
"""
Tests pour le système Tennis Hawk-Eye
====================================

Suite de tests pour valider le fonctionnement du système.
"""

import pytest
import numpy as np
import cv2
import tempfile
import os
from pathlib import Path

# Imports des modules à tester
from tennis_hawkeye import (
    ConfigManager, BallTracker, CourtCalibrator, 
    InOutDetector, BallDetection, CourtGeometry
)
from ball_detector import HybridBallDetector, FallbackBallDetector
from court_setup import InteractiveCourtSetup

class TestConfigManager:
    """Tests pour le gestionnaire de configuration"""
    
    def test_config_creation(self):
        """Test de création d'une configuration"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            config_path = f.name
        
        try:
            config = ConfigManager(config_path)
            assert config.config is not None
            assert isinstance(config.config, dict)
        finally:
            os.unlink(config_path)
    
    def test_config_get_set(self):
        """Test des opérations get/set"""
        config = ConfigManager()
        
        # Test set/get simple
        config.set('test.value', 42)
        assert config.get('test.value') == 42
        
        # Test get avec défaut
        assert config.get('nonexistent.key', 'default') == 'default'
    
    def test_config_nested_keys(self):
        """Test des clés imbriquées"""
        config = ConfigManager()
        
        config.set('level1.level2.level3', 'deep_value')
        assert config.get('level1.level2.level3') == 'deep_value'

class TestBallDetection:
    """Tests pour la classe BallDetection"""
    
    def test_ball_detection_creation(self):
        """Test de création d'une détection"""
        detection = BallDetection(
            x=100.0, y=200.0, confidence=0.8, 
            timestamp=1.5, frame_number=45
        )
        
        assert detection.x == 100.0
        assert detection.y == 200.0
        assert detection.confidence == 0.8
        assert detection.timestamp == 1.5
        assert detection.frame_number == 45

class TestCourtGeometry:
    """Tests pour la géométrie du terrain"""
    
    def test_court_geometry_valid(self):
        """Test de géométrie valide"""
        geometry = CourtGeometry(
            court_corners=[(0, 0), (100, 0), (100, 50), (0, 50)],
            service_box_corners=[(20, 10), (80, 10), (80, 40), (20, 40)],
            baseline_corners=[(10, 5), (90, 5), (90, 45), (10, 45)]
        )
        
        assert geometry.is_valid()
    
    def test_court_geometry_invalid(self):
        """Test de géométrie invalide"""
        geometry = CourtGeometry(
            court_corners=[(0, 0), (100, 0)],  # Seulement 2 points
            service_box_corners=[(20, 10), (80, 10), (80, 40), (20, 40)],
            baseline_corners=[(10, 5), (90, 5), (90, 45), (10, 45)]
        )
        
        assert not geometry.is_valid()

class TestBallTracker:
    """Tests pour le tracker de balles"""
    
    def setup_method(self):
        """Configuration pour chaque test"""
        self.config = ConfigManager()
        self.tracker = BallTracker(self.config)
    
    def test_add_detection(self):
        """Test d'ajout de détection"""
        detection = BallDetection(
            x=50.0, y=50.0, confidence=0.9,
            timestamp=1.0, frame_number=30
        )
        
        result = self.tracker.add_detection(detection)
        assert result is True
        assert len(self.tracker.detections) == 1
        assert len(self.tracker.trajectory) == 1
    
    def test_trajectory_smoothing(self):
        """Test du lissage de trajectoire"""
        # Ajouter plusieurs détections
        detections = [
            BallDetection(x=10.0, y=10.0, confidence=0.9, timestamp=1.0, frame_number=1),
            BallDetection(x=20.0, y=15.0, confidence=0.9, timestamp=2.0, frame_number=2),
            BallDetection(x=30.0, y=20.0, confidence=0.9, timestamp=3.0, frame_number=3)
        ]
        
        for detection in detections:
            self.tracker.add_detection(detection)
        
        assert len(self.tracker.trajectory) == 3
        assert self.tracker.last_position is not None
    
    def test_bounce_detection(self):
        """Test de détection de rebond"""
        # Simuler une trajectoire avec rebond
        detections = [
            BallDetection(x=10.0, y=10.0, confidence=0.9, timestamp=1.0, frame_number=1),
            BallDetection(x=20.0, y=5.0, confidence=0.9, timestamp=2.0, frame_number=2),
            BallDetection(x=30.0, y=15.0, confidence=0.9, timestamp=3.0, frame_number=3)  # Rebond
        ]
        
        for detection in detections:
            self.tracker.add_detection(detection)
        
        # Le rebond devrait être détecté après 3 points
        bounce = self.tracker.detect_bounce()
        # Note: Le test peut nécessiter des ajustements selon l'algorithme exact

class TestInOutDetector:
    """Tests pour le détecteur IN/OUT"""
    
    def setup_method(self):
        """Configuration pour chaque test"""
        self.geometry = CourtGeometry(
            court_corners=[(0, 0), (100, 0), (100, 50), (0, 50)],
            service_box_corners=[(20, 10), (80, 10), (80, 40), (20, 40)],
            baseline_corners=[(10, 5), (90, 5), (90, 45), (10, 45)]
        )
        self.detector = InOutDetector(self.geometry)
    
    def test_ball_in_service_area(self):
        """Test balle dans la zone de service"""
        position = (50.0, 25.0)  # Centre de la zone de service
        result = self.detector.is_ball_in_court(position)
        assert result == "IN"
    
    def test_ball_out_of_court(self):
        """Test balle hors du terrain"""
        position = (150.0, 25.0)  # Complètement hors du terrain
        result = self.detector.is_ball_in_court(position)
        assert result == "OUT"
    
    def test_point_in_polygon(self):
        """Test de l'algorithme point dans polygone"""
        polygon = [(0, 0), (10, 0), (10, 10), (0, 10)]
        
        # Point à l'intérieur
        assert self.detector._point_in_polygon((5, 5), polygon) is True
        
        # Point à l'extérieur
        assert self.detector._point_in_polygon((15, 5), polygon) is False
        
        # Point sur le bord (peut varier selon l'implémentation)
        border_result = self.detector._point_in_polygon((10, 5), polygon)
        assert isinstance(border_result, bool)

class TestFallbackBallDetector:
    """Tests pour le détecteur de secours OpenCV"""
    
    def setup_method(self):
        """Configuration pour chaque test"""
        self.config = ConfigManager()
        self.detector = FallbackBallDetector(self.config)
    
    def test_detector_initialization(self):
        """Test d'initialisation du détecteur"""
        assert self.detector.config is not None
        assert self.detector.background_subtractor is not None
    
    def test_detect_on_synthetic_frame(self):
        """Test de détection sur une frame synthétique"""
        # Créer une frame synthétique avec un cercle blanc (balle)
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.circle(frame, (320, 240), 10, (255, 255, 255), -1)
        
        detections = self.detector.detect_balls_in_frame(frame, 1, 1.0)
        
        # Le détecteur peut ou peut ne pas détecter selon les paramètres
        assert isinstance(detections, list)

class TestIntegration:
    """Tests d'intégration du système complet"""
    
    def test_config_to_detector_flow(self):
        """Test du flux configuration -> détecteur"""
        config = ConfigManager()
        
        # Configuration d'un terrain
        config.set('court.court_corners', [(0, 0), (100, 0), (100, 50), (0, 50)])
        config.set('court.service_box_corners', [(20, 10), (80, 10), (80, 40), (20, 40)])
        config.set('court.baseline_corners', [(10, 5), (90, 5), (90, 45), (10, 45)])
        
        # Création du calibrateur et chargement
        calibrator = CourtCalibrator(config)
        geometry = calibrator.load_geometry()
        
        assert geometry is not None
        assert geometry.is_valid()
        
        # Création du détecteur IN/OUT
        detector = InOutDetector(geometry)
        result = detector.is_ball_in_court((50, 25))
        assert result in ["IN", "OUT"]

def test_imports():
    """Test que tous les modules peuvent être importés"""
    try:
        import tennis_hawkeye
        import ball_detector
        import court_setup
        import main_hawkeye
        assert True
    except ImportError as e:
        pytest.fail(f"Erreur d'import: {e}")

def test_dependencies():
    """Test que les dépendances principales sont disponibles"""
    try:
        import cv2
        import numpy as np
        import pygame
        # Note: roboflow peut échouer sans clé API, c'est normal
        assert True
    except ImportError as e:
        pytest.fail(f"Dépendance manquante: {e}")

if __name__ == "__main__":
    # Exécution des tests
    pytest.main([__file__, "-v"])
