import fitz
import os

# Resolve paths absolutely to prevent CWD dependency issues
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # points to backend/app
IMAGE_DIR = os.path.join(BASE_DIR, "uploads", "images")

os.makedirs(
    IMAGE_DIR,
    exist_ok=True
)

def extract_images(
    pdf_path
):
    document = fitz.open(
        pdf_path
    )

    image_paths = []

    for page_index in range(
        len(document)
    ):
        page = document[
            page_index
        ]

        image_list = page.get_images(
            full=True
        )

        for image_index, img in enumerate(image_list):
            xref = img[0]
            base_image = (
                document.extract_image(
                    xref
                )
            )

            image_bytes = (
                base_image["image"]
            )

            image_ext = (
                base_image["ext"]
            )

            image_name = (
                f"page_{page_index+1}_{image_index}.{image_ext}"
            )

            image_path = os.path.join(
                IMAGE_DIR,
                image_name
            )

            with open(
                image_path,
                "wb"
            ) as image_file:
                image_file.write(
                    image_bytes
                )

            # Return a relative path or absolute path. Let's return the relative path (relative to backend folder) for UI representation,
            # or keep the absolute path if needed. Let's return paths relative to 'backend' directory so they are easy to load, or absolute.
            # The prompt expected output contains: "app/uploads/images/page_1_0.png"
            # Let's return the path relative to the backend workspace root, which is "app/uploads/images/..."
            relative_path = f"app/uploads/images/{image_name}"
            image_paths.append(
                relative_path
            )

    return image_paths
