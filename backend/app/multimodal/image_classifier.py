import cv2

def classify_image_type(
    image_path
):
    image = cv2.imread(
        image_path
    )
    if image is None:
        return "general_figure"

    height, width, _ = image.shape
    aspect_ratio = width / height

    if aspect_ratio > 1.5:
        return "chart_or_table"
    elif aspect_ratio < 0.8:
        return "diagram"
    else:
        return "general_figure"
