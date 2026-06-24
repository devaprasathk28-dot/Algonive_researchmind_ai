import pyttsx3

def speak_text(text):
    """
    Convert text to speech and play it using pyttsx3.
    """
    try:
        engine = pyttsx3.init()
        # Set speed rate (default is usually 200, 160-180 sounds more natural)
        engine.setProperty("rate", 175)
        # Set volume (0.0 to 1.0)
        engine.setProperty("volume", 1.0)
        
        engine.say(text)
        engine.runAndWait()
        return "Speech generated successfully"
    except Exception as e:
        print(f"TTS Error: {e}")
        return f"Error: Speech driver unavailable. {str(e)}"
