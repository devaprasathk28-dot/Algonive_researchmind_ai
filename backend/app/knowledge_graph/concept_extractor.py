from collections import Counter

def extract_research_concepts(text):

    keywords = [

        "transformer",
        "bert",
        "gpt",
        "cnn",
        "lstm",
        "rag",
        "attention",
        "dataset",
        "accuracy",
        "embedding",
        "chromadb",
        "retrieval"
    ]

    text = text.lower()

    concepts = []

    for keyword in keywords:

        if keyword in text:

            concepts.append({

                "text":
                    keyword.title(),

                "label":
                    "CONCEPT"
            })

    return concepts
