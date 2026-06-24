from app.ai.voice.text_to_speech import speak_text

def generate_voice_summary(summary: str):
    """
    Generate spoken summary of research papers.
    """
    response = speak_text(summary)
    return {
        "message": response,
        "spoken_summary": summary
    }
