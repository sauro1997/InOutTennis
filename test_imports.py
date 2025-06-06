import pytest
import sys
import os

def test_opencv_import():
    """Test that OpenCV can be imported"""
    import cv2
    assert cv2.__version__ is not None

def test_numpy_import():
    """Test that numpy can be imported"""
    import numpy as np
    assert np.__version__ is not None

def test_pygame_import():
    """Test that pygame can be imported"""
    import pygame
    # pygame.init() might fail in headless environment, so just test import

def test_roboflow_import():
    """Test that roboflow can be imported"""
    from roboflow import Roboflow
    assert Roboflow is not None

def test_rectangle_coord_module():
    """Test that RectangleCoord module can be imported"""
    from RectangleCoord import select_points
    assert select_points is not None

def test_main_module_imports():
    """Test that main INOUT module imports work"""
    # Test individual imports from INOUT.py
    import cv2
    import os
    import numpy as np
    import pygame
    import sys
    from roboflow import Roboflow
    
    # Verify all imports are successful
    assert cv2 is not None
    assert np is not None
    assert pygame is not None
    assert Roboflow is not None
