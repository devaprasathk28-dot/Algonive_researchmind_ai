import easyocr

reader = None

def get_reader():
    global reader
    if reader is None:
        print("Initializing EasyOCR Reader...")
        reader = easyocr.Reader(['en'])
    return reader

def extract_text_from_image(
    image_path
):
    r = get_reader()
    results = r.readtext(
        image_path
    )

    extracted_text = []
    for result in results:
        extracted_text.append(
            result[1]
        )

    return " ".join(
        extracted_text
    )
