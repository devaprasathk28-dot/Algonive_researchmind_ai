from app.rag.chunking import (
    create_text_chunks
)

from app.rag.vector_store import (
    store_chunks
)

from app.rag.retriever import (
    retrieve_relevant_chunks
)

from app.rag.rag_chat import (
    generate_rag_answer
)

from app.rag.citation_engine import (
    attach_citations
)

def index_paper_for_rag(
    parsed_paper
):
    # -----------------------------------
    # Combine Text
    # -----------------------------------
    full_text = ""
    for _, section in parsed_paper[
        "sections"
    ].items():
        full_text += (
            section + "\n"
        )

    # -----------------------------------
    # Chunking
    # -----------------------------------
    chunks = create_text_chunks(
        full_text
    )

    # -----------------------------------
    # Store in Vector DB
    # -----------------------------------
    store_chunks(
        chunks,
        parsed_paper[
            "filename"
        ]
    )

    return {
        "status":
            "indexed",
        "chunks":
            len(chunks)
    }

from app.core.cache import cache

def ask_question(
    question
):
    cache_key = f"rag:question:{question}"
    cached_res = cache.get(cache_key)
    if cached_res is not None:
        return cached_res

    # -----------------------------------
    # Retrieve Relevant Chunks
    # -----------------------------------
    retrieved_chunks = (
        retrieve_relevant_chunks(
            question
        )
    )

    # -----------------------------------
    # Combine Context
    # -----------------------------------
    context = "\n".join(
        retrieved_chunks
    )

    # -----------------------------------
    # Generate AI Answer
    # -----------------------------------
    answer = generate_rag_answer(
        question,
        context
    )

    # -----------------------------------
    # Citations
    # -----------------------------------
    citations = attach_citations(
        retrieved_chunks
    )

    res = {
        "question":
            question,
        "answer":
            answer,
        "citations":
            citations
    }
    cache.set(cache_key, res, expire_seconds=3600)
    return res
