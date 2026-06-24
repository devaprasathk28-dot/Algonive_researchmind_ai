import pdfplumber

def extract_tables(
    pdf_path
):
    extracted_tables = []

    with pdfplumber.open(
        pdf_path
    ) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                extracted_tables.append(
                    str(table)
                )

    return extracted_tables
