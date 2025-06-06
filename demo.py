#!/usr/bin/env python3
"""
Démonstration du système Tennis Hawk-Eye
========================================

Script de démonstration pour tester rapidement le système
avec des données synthétiques ou des exemples.
"""

import cv2
import numpy as np
import json
import os
import tempfile
from pathlib import Path

from tennis_hawkeye import ConfigManager, BallTracker, BallDetection, CourtGeometry
from ball_detector import FallbackBallDetector
from court_setup import InteractiveCourtSetup

def create_demo_config():
    """Crée une configuration de démonstration"""
    config = {
        "roboflow": {
            "api_key": "DEMO_KEY",
            "project": "tennis-demo",
            "version": 1,
            "confidence": 0.3,
            "overlap": 0.6
        },
        "video": {
            "input_path": "demo_video.mp4",
            "output_path": "demo_output.mp4",
            "reference_image_path": "demo_court.jpg",
            "max_duration_seconds": 10
        },
        "court": {
            "court_corners": [[50, 50], [550, 50], [550, 350], [50, 350]],
            "service_box_corners": [[150, 100], [450, 100], [450, 300], [150, 300]],
            "baseline_corners": [[100, 75], [500, 75], [500, 325], [100, 325]]
        },
        "detection": {
            "min_ball_confidence": 0.3,
            "max_tracking_distance": 50,
            "bounce_detection_threshold": 0.8,
            "trajectory_smoothing": 0.7
        },
        "visualization": {
            "show_trajectory": True,
            "show_court_lines": True,
            "show_confidence": True,
            "line_thickness": 2,
            "colors": {
                "court_boundary": [0, 255, 0],
                "service_area": [0, 0, 255],
                "ball_in": [0, 255, 0],
                "ball_out": [0, 0, 255],
                "trajectory": [255, 255, 0]
            }
        }
    }
    
    with open("demo_config.json", "w") as f:
        json.dump(config, f, indent=4)
    
    print("✓ Configuration de démonstration créée: demo_config.json")
    return config

def create_synthetic_court_image():
    """Crée une image synthétique de terrain de tennis"""
    # Créer une image de terrain de tennis basique
    img = np.zeros((400, 600, 3), dtype=np.uint8)
    img.fill(34)  # Couleur de fond (vert foncé)
    
    # Terrain principal (rectangle extérieur)
    cv2.rectangle(img, (50, 50), (550, 350), (0, 255, 0), 3)
    
    # Ligne centrale
    cv2.line(img, (300, 50), (300, 350), (255, 255, 255), 2)
    
    # Zones de service
    cv2.rectangle(img, (150, 100), (450, 300), (0, 0, 255), 2)
    cv2.line(img, (150, 200), (450, 200), (255, 255, 255), 2)
    
    # Lignes de fond
    cv2.rectangle(img, (100, 75), (500, 325), (255, 0, 0), 2)
    
    # Ajouter du texte
    cv2.putText(img, "DEMO TENNIS COURT", (200, 30), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    
    cv2.imwrite("demo_court.jpg", img)
    print("✓ Image de terrain synthétique créée: demo_court.jpg")
    return img

def create_synthetic_video():
    """Crée une vidéo synthétique avec une balle qui bouge"""
    # Paramètres de la vidéo
    width, height = 600, 400
    fps = 30
    duration = 5  # secondes
    total_frames = fps * duration
    
    # Créer le writer vidéo
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter('demo_video.mp4', fourcc, fps, (width, height))
    
    # Créer l'image de fond (terrain)
    court_img = create_synthetic_court_image()
    
    print(f"Création de la vidéo synthétique ({total_frames} frames)...")
    
    for frame_num in range(total_frames):
        # Copier l'image du terrain
        frame = court_img.copy()
        
        # Calculer la position de la balle (trajectoire sinusoïdale)
        t = frame_num / total_frames
        x = int(100 + 400 * t)  # Mouvement horizontal
        y = int(200 + 50 * np.sin(t * 4 * np.pi))  # Mouvement vertical sinusoïdal
        
        # Dessiner la balle
        cv2.circle(frame, (x, y), 8, (255, 255, 0), -1)  # Balle jaune
        cv2.circle(frame, (x, y), 8, (0, 0, 0), 2)       # Contour noir
        
        # Ajouter des informations
        cv2.putText(frame, f"Frame: {frame_num+1}/{total_frames}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(frame, f"Ball: ({x}, {y})", (10, 60),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Écrire la frame
        out.write(frame)
        
        # Afficher le progrès
        if frame_num % 30 == 0:
            progress = (frame_num / total_frames) * 100
            print(f"Progrès: {progress:.1f}%")
    
    out.release()
    print("✓ Vidéo synthétique créée: demo_video.mp4")

def test_ball_tracker():
    """Test du tracker de balles avec des données synthétiques"""
    print("\n=== Test du Ball Tracker ===")
    
    config = ConfigManager("demo_config.json")
    tracker = BallTracker(config)
    
    # Simuler une trajectoire de balle
    trajectory_points = [
        (100, 200), (120, 190), (140, 185), (160, 190), (180, 200),
        (200, 210), (220, 205), (240, 195), (260, 190), (280, 200)
    ]
    
    print("Ajout de détections à la trajectoire...")
    for i, (x, y) in enumerate(trajectory_points):
        detection = BallDetection(
            x=float(x), y=float(y), confidence=0.8,
            timestamp=i * 0.1, frame_number=i
        )
        
        success = tracker.add_detection(detection)
        print(f"Frame {i}: ({x}, {y}) - {'✓' if success else '✗'}")
        
        # Test de détection de rebond
        if tracker.detect_bounce():
            print(f"  🏀 Rebond détecté à la frame {i}!")
    
    print(f"Trajectoire finale: {len(tracker.trajectory)} points")
    print(f"Position actuelle: {tracker.get_current_position()}")

def test_fallback_detector():
    """Test du détecteur de secours OpenCV"""
    print("\n=== Test du Détecteur de Secours ===")
    
    config = ConfigManager("demo_config.json")
    detector = FallbackBallDetector(config)
    
    # Créer une frame de test avec une balle
    frame = np.zeros((400, 600, 3), dtype=np.uint8)
    cv2.circle(frame, (300, 200), 12, (255, 255, 255), -1)  # Balle blanche
    
    print("Test de détection sur frame synthétique...")
    detections = detector.detect_balls_in_frame(frame, 1, 1.0)
    
    print(f"Détections trouvées: {len(detections)}")
    for i, detection in enumerate(detections):
        print(f"  Détection {i+1}: ({detection.x:.1f}, {detection.y:.1f}) "
              f"confiance={detection.confidence:.2f}")

def demo_court_setup():
    """Démonstration de la configuration du terrain"""
    print("\n=== Démonstration Configuration Terrain ===")
    
    # Vérifier si l'image existe
    if not Path("demo_court.jpg").exists():
        create_synthetic_court_image()
    
    print("Image de terrain disponible: demo_court.jpg")
    print("Pour tester la configuration interactive, lancez:")
    print("  python court_setup.py")
    print("Et utilisez 'demo_court.jpg' comme image de référence")

def run_full_demo():
    """Lance une démonstration complète"""
    print("🎾 Tennis Hawk-Eye System - Démonstration Complète")
    print("=" * 50)
    
    # 1. Créer la configuration
    print("\n1. Création de la configuration...")
    create_demo_config()
    
    # 2. Créer les fichiers de test
    print("\n2. Création des fichiers de test...")
    create_synthetic_court_image()
    create_synthetic_video()
    
    # 3. Test des composants
    print("\n3. Test des composants...")
    test_ball_tracker()
    test_fallback_detector()
    
    # 4. Instructions pour la suite
    print("\n4. Prochaines étapes:")
    print("   - Configurez votre clé API Roboflow dans demo_config.json")
    print("   - Lancez: python main_hawkeye.py")
    print("   - Utilisez demo_court.jpg comme image de référence")
    print("   - Analysez demo_video.mp4")
    
    print("\n✅ Démonstration terminée!")
    print("Fichiers créés:")
    print("  - demo_config.json (configuration)")
    print("  - demo_court.jpg (image de terrain)")
    print("  - demo_video.mp4 (vidéo de test)")

def cleanup_demo_files():
    """Nettoie les fichiers de démonstration"""
    demo_files = [
        "demo_config.json",
        "demo_court.jpg", 
        "demo_video.mp4",
        "demo_output.mp4"
    ]
    
    print("Nettoyage des fichiers de démonstration...")
    for file in demo_files:
        if Path(file).exists():
            os.remove(file)
            print(f"✓ Supprimé: {file}")
    
    print("Nettoyage terminé!")

def main():
    """Menu principal de démonstration"""
    print("🎾 Tennis Hawk-Eye System - Menu de Démonstration")
    print("=" * 50)
    print("1. Démonstration complète")
    print("2. Test du tracker de balles")
    print("3. Test du détecteur de secours")
    print("4. Créer des fichiers de test")
    print("5. Configuration du terrain")
    print("6. Nettoyer les fichiers de démo")
    print("0. Quitter")
    
    while True:
        choice = input("\nChoisissez une option (0-6): ").strip()
        
        if choice == "1":
            run_full_demo()
        elif choice == "2":
            if not Path("demo_config.json").exists():
                create_demo_config()
            test_ball_tracker()
        elif choice == "3":
            if not Path("demo_config.json").exists():
                create_demo_config()
            test_fallback_detector()
        elif choice == "4":
            create_demo_config()
            create_synthetic_court_image()
            create_synthetic_video()
        elif choice == "5":
            demo_court_setup()
        elif choice == "6":
            cleanup_demo_files()
        elif choice == "0":
            print("Au revoir!")
            break
        else:
            print("Option invalide, essayez encore.")

if __name__ == "__main__":
    main()
