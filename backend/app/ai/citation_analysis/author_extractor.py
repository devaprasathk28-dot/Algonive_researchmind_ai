import spacy

nlp = spacy.load(
    "en_core_web_sm"
)

def extract_authors(text):

    doc = nlp(text)

    authors = []

    for ent in doc.ents:

        if ent.label_ == "PERSON":

            authors.append(ent.text)

    return list(dict.fromkeys(authors))
