import os
import sys
from pyinstrument import Profiler
from memory_profiler import profile as mem_profile

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.pdf_processing.pdf_pipeline import process_pdf
from app.pdf_processing.image_extractor import extract_images
from app.ai.summarizer.summarization_pipeline import run_summarization_pipeline
from app.ai.semantic_search.semantic_engine import generate_paper_embedding
from app.knowledge_graph.knowledge_pipeline import generate_knowledge_graph

MOCK_PAPER = {
    "title": "Attention Is All You Need",
    "authors": ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"],
    "sections": {
        "abstract": "We introduce the Transformer, a model based on self-attention for natural language processing.",
        "methodology": "The Transformer uses self-attention and attention mechanisms.",
        "results": "The model achieves strong BLEU accuracy."
    }
}

SAMPLE_PDF = "sample_test.pdf"

def setup_dummy_pdf():
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        c = canvas.Canvas(SAMPLE_PDF, pagesize=letter)
        c.drawString(100, 750, "Sample Paper: Attention is All You Need")
        c.drawString(100, 720, "Authors: Ashish Vaswani et al.")
        c.drawString(100, 690, "Abstract: This is a sample paper abstract for profiling purposes.")
        c.drawString(100, 660, "Methodology: We propose the Transformer model which utilizes self-attention.")
        c.save()
    except Exception:
        with open(SAMPLE_PDF, "wb") as f:
            f.write(b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<< /Length 65 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Attention Is All You Need) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000062 00000 n\n0000000121 00000 n\n0000000281 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n397\n%%EOF\n")

@mem_profile
def profile_memory_operations():
    print("\n--- RUNNING MEMORY PROFILING ---")
    setup_dummy_pdf()
    
    # 1. Profile PDF processing
    print("Profiling PDF processing memory...")
    try:
        process_pdf(SAMPLE_PDF, "sample.pdf")
    except Exception as e:
        print(f"PDF processing skipped or failed: {e}")

    # 2. Profile embedding generation
    print("Profiling Embedding generation memory...")
    try:
        generate_paper_embedding("Attention is all you need. Self-attention mechanisms.")
    except Exception as e:
        print(f"Embedding generation failed: {e}")

def profile_cpu_operations():
    print("\n--- RUNNING CPU PERFORMANCE PROFILING ---")
    setup_dummy_pdf()
    
    profiler = Profiler()
    profiler.start()
    
    # 1. PDF Parsing
    print("Running PDF parsing...")
    try:
        process_pdf(SAMPLE_PDF, "sample.pdf")
    except Exception as e:
        print(f"PDF parsing error: {e}")

    # 2. OCR (Image extraction)
    print("Running OCR image extraction...")
    try:
        extract_images(SAMPLE_PDF)
    except Exception as e:
        print(f"OCR skipped or error: {e}")

    # 3. Summarization
    print("Running Summarization...")
    try:
        run_summarization_pipeline(MOCK_PAPER)
    except Exception as e:
        print(f"Summarization error or skipped: {e}")

    # 4. Embeddings
    print("Running Embeddings...")
    try:
        generate_paper_embedding("Attention is all you need. Self-attention mechanisms.")
    except Exception as e:
        print(f"Embeddings error: {e}")

    # 5. Knowledge Graph
    print("Running Knowledge Graph generation...")
    try:
        generate_knowledge_graph(MOCK_PAPER)
    except Exception as e:
        print(f"Knowledge Graph error or skipped: {e}")

    profiler.stop()
    profiler.print()

if __name__ == "__main__":
    profile_memory_operations()
    profile_cpu_operations()
    # Clean up dummy PDF
    if os.path.exists(SAMPLE_PDF):
        try:
            os.remove(SAMPLE_PDF)
        except Exception:
            pass
