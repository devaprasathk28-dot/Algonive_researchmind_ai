import easyocr

reader = easyocr.Reader(['en'])

def extract_text_from_image(image_path):

    results = reader.readtext(image_path)

    extracted_text = []

    for result in results:
        extracted_text.append(result[1])

    return " ".join(extracted_text)
