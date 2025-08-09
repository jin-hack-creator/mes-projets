import cv2

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Erreur : Impossible d'accéder à la caméra.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Erreur : Impossible de lire l'image.")
        break

    cv2.imshow("Test Caméra", frame)

    if cv2.waitKey(1) == 27:  # ESC pour quitter
        break

cap.release()
cv2.destroyAllWindows()


