from roboflow import Roboflow
import cv2
import os
import numpy as np
import pygame
import sys
from RectangleCoord import select_points

print("Please select the 4 corners of the ground floor.")
coordOutRectangle = select_points()
print("gros rectangle :", coordOutRectangle)

print("Please select the 4 corners to create a rectangle representing the IN area of the tennis court.")
coordInRectangle = select_points()
print("petit rectangle :", coordInRectangle)

#Roboflow api key (free)
rf = Roboflow(api_key="YOUR API KEY")
project = rf.workspace().project("tennis-misz2")
model = project.version(3).model

# Open a video file for prediction
video_path = "C:\YOUR VIDEO PATH"  # Replace with your video file path

# Initialize a video capture object
cap = cv2.VideoCapture(video_path)

# Get frames per second (fps) and frame count
fps = int(cap.get(cv2.CAP_PROP_FPS))
frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

# Calculate the number of frames for the first 5 seconds
num_frames = int(fps * 5)

# Get video frame dimensions
frame_width = int(cap.get(3))
frame_height = int(cap.get(4))
fps = int(cap.get(5))

# Define the codec and create a VideoWriter object
output_path = "C:\VIDEO OUTPUT PATH"
fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # You can change the codec as needed
out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

frame_number = 0
lastX = 0
lastY = 0
isRebound = False
result = "IN"

while frame_number < num_frames and cap.isOpened():
    ret, frame = cap.read()

    if not ret:
        break

    # Save the frame as a temporary image file
    temp_image_path = "C:\TEMPORARY IMAGE FILE"
    cv2.imwrite(temp_image_path, frame)

    # Perform prediction on the temporary image file
    prediction = model.predict(temp_image_path, confidence=10, overlap=60).json()
        
# Draw bounding boxes on the frame
   # Draw bounding boxes on the frame
    for detection in prediction["predictions"]:
        if detection["class"] == 'ball' :
            x = detection["x"]
            y = detection["y"]
            label = detection["class"]
            
            # Calculate the coordinates for the top-left and bottom-right points of the enlarged bounding box
            margin = 5  # Adjust the margin as needed
            
            # Calculate adjusted y-coordinates to center the object vertically
            label_height = 20  # Adjust this value based on the label height
            y_min = int(y - detection["height"] / 2 - margin - label_height)
            y_max = int(y + detection["height"] / 2 + margin)
            
            # Calculate x-coordinates as before
            x_min = int(x - detection["width"] / 2 - margin)
            x_max = int(x + detection["width"] / 2 + margin)
            
            ## uncomment to get the ball always in a rectangle when detected
            # # # Draw bounding box for the ball
            # # cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)          
                        
            rectangle_coords = coordInRectangle            
            rectangle_coordsOut = coordOutRectangle
                
            # Draw the manually determined rectangle on the frame
            cv2.polylines(frame, [np.array(rectangle_coords)], isClosed=True, color=(0, 0, 255), thickness=2)

            cv2.polylines(frame, [np.array(rectangle_coordsOut)], isClosed=True, color=(0, 255, 0), thickness=2)                    
            
            # Check if the ball is inside the rectangle.
            if (
                x >= min(rectangle_coordsOut[0][0], rectangle_coordsOut[1][0], rectangle_coordsOut[2][0], rectangle_coordsOut[3][0])
                and x <= max(rectangle_coordsOut[0][0], rectangle_coordsOut[1][0], rectangle_coordsOut[2][0], rectangle_coordsOut[3][0])
                and y >= min(rectangle_coordsOut[0][1], rectangle_coordsOut[1][1], rectangle_coordsOut[2][1], rectangle_coordsOut[3][1])
                and y <= max(rectangle_coordsOut[0][1], rectangle_coordsOut[1][1], rectangle_coordsOut[2][1], rectangle_coordsOut[3][1])
            ):
                
                if (
                x >= min(rectangle_coords[0][0], rectangle_coords[1][0], rectangle_coords[2][0], rectangle_coords[3][0])
                and x <= max(rectangle_coords[0][0], rectangle_coords[1][0], rectangle_coords[2][0], rectangle_coords[3][0])
                and y >= min(rectangle_coords[0][1], rectangle_coords[1][1], rectangle_coords[2][1], rectangle_coords[3][1])
                and y <= max(rectangle_coords[0][1], rectangle_coords[1][1], rectangle_coords[2][1], rectangle_coords[3][1])
                ):
                    # Draw bounding box for the ball
                    cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2) 
                    cv2.rectangle(frame, (x_min, y_min), (x_max, y_min + label_height), (0, 255, 0), -1)
                    cv2.putText(frame, 'IN', (x_min, y_min + label_height - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
                    # pygame.mixer.init()
                    # sound = pygame.mixer.Sound("YOUR SOUND PATH")
                    # sound.play()
                else:
                    # Draw bounding box for the ball
                    cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2) 
                    cv2.rectangle(frame, (x_min, y_min), (x_max, y_min + label_height), (0, 255, 0), -1)
                    cv2.putText(frame, 'OUT', (x_min, y_min + label_height - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
                    # pygame.mixer.init()
                    # sound = pygame.mixer.Sound("YOUR SOUND PATH")
                    # sound.play()
            ##else:
                # print("The ball is outside the rectangle.")
                # # cv2.putText(frame, 'NONE', (x_min, y_min + label_height - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

            ##            

        else :                         
            # Here, we are using points in a clockwise order (top-left, top-right, bottom-right, bottom-left)
            rectangle_coords = coordInRectangle

            rectangle_coordsOut = coordOutRectangle                       
                
            # Draw the manually determined rectangle on the frame
            cv2.polylines(frame, [np.array(rectangle_coords)], isClosed=True, color=(0, 0, 255), thickness=2)

            cv2.polylines(frame, [np.array(rectangle_coordsOut)], isClosed=True, color=(0, 255, 0), thickness=2)        
    
    # Write the modified frame to the output video
    out.write(frame)
    
    # Delete the temporary image file
    os.remove(temp_image_path)
    
    frame_number += 1
    isRebound = False

cap.release()
out.release()
# cv2.destroyAllWindows()
