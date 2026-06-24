from app.ai.dataset_discovery.dataset_database import (
    DATASET_DATABASE
)

def recommend_datasets(domain):

    if domain in DATASET_DATABASE:

        return DATASET_DATABASE[domain]

    return DATASET_DATABASE["general_ai"]
