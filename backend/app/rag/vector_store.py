import chromadb

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="research_papers"
)

def store_chunks(
    chunks,
    filename
):
    for index, chunk in enumerate(chunks):
        collection.add(
            documents=[chunk],
            ids=[
                f"{filename}_{index}"
            ]
        )
