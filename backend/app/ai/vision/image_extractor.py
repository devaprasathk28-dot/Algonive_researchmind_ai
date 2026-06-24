import fitz
import os

def extract_images_from_pdf(pdf_path, output_folder):

    os.makedirs(output_folder, exist_ok=True)

    pdf_document = fitz.open(pdf_path)

    image_paths = []

    for page_index in range(len(pdf_document)):

        page = pdf_document[page_index]

        image_list = page.get_images(full=True)

        for image_index, img in enumerate(image_list):

            xref = img[0]

            base_image = pdf_document.extract_image(xref)

            image_bytes = base_image["image"]

            image_ext = base_image["ext"]

            image_filename = (
                f"page_{page_index+1}_img_{image_index+1}.{image_ext}"
            )

            image_path = os.path.join(
                output_folder,
                image_filename
            )

            with open(image_path, "wb") as image_file:
                image_file.write(image_bytes)

            image_paths.append(image_path)

    return image_paths
