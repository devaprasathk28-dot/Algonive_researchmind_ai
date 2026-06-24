from fastapi import APIRouter, HTTPException
from app.ai.voice.voice_assistant import generate_voice_summary
from app.ai.voice.speech_to_text import recognize_speech

router = APIRouter(tags=["voice"])

@router.post("/voice-summary")
def voice_summary(payload: dict):
    """
    Synthesize and speak the provided text summary on the host machine.
    """
    summary = payload.get("summary")
    if not summary:
        raise HTTPException(status_code=400, detail="Missing 'summary' in request body")
        
    result = generate_voice_summary(summary)
    return result

@router.post("/voice-recognize")
def voice_recognize():
    """
    Trigger speech recognition on the host machine's microphone.
    Returns the recognized text.
    """
    text = recognize_speech()
    if text.startswith("Error:"):
        return {"success": False, "error": text}
    return {"success": True, "text": text}
