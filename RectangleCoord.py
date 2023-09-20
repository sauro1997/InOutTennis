import pygame
import sys

def select_points():
    pygame.init()

    # screen_width = 1920
    # screen_height = 1080

    white = (255, 255, 255)
    blue = (0, 0, 255)

    # Loading an image from the video
    image = pygame.image.load("C:\PATH OF THE IMAGE")    

    # Get the dimensions of the image
    screen_width, screen_height = image.get_size()

    # Initializing the window.
    screen = pygame.display.set_mode((screen_width, screen_height))
    pygame.display.set_caption("Selection of points on the image")

    # A list to store the coordinates of the rectangle points.
    rectangle_points = []

    def draw_points():
        for point in rectangle_points:
            pygame.draw.circle(screen, blue, point, 5)

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                x, y = pygame.mouse.get_pos()
                rectangle_points.append((x, y))
                if len(rectangle_points) == 4:
                    running = False

        screen.fill(white)

        # Display the image in the pygame window
        screen.blit(image, (0, 0))

        draw_points()
        pygame.display.flip()

    pygame.quit()

    return rectangle_points

if __name__ == "__main__":
    selected_points = select_points()
    print("Selected points :", selected_points)
