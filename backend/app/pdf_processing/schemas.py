from pydantic import BaseModel
from typing import List

class ParsedPaper(BaseModel):
    filename: str
    title: str
    authors: List[str]
    abstract: str
    sections: dict
    extracted_tables: List[str]
    extracted_images: List[str]
