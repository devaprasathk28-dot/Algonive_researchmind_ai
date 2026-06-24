import speech_recognition as sr

def recognize_speech():
    """
    Capture audio from host microphone and transcribe it using Google Speech API.
    """
    recognizer = sr.Recognizer()
    try:
        # Check if microphone is available, adjust for ambient noise, then listen
        with sr.Microphone() as source:
            print("[STT] Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=0.8)
            print("[STT] Listening on microphone...")
            audio = recognizer.listen(source, timeout=6.0, phrase_time_limit=10.0)
            
        print("[STT] Transcribing audio...")
        text = recognizer.recognize_google(audio)
        return text
    except sr.WaitTimeoutError:
        return "Error: Listening timed out. Speak when the microphone is active."
    except sr.UnknownValueError:
        return "Error: Could not understand speech audio."
    except sr.RequestError as e:
        return f"Error: Speech recognition request failed; {e}"
    except Exception as e:
        return f"Error: Microphone initialization failed. {str(e)}"
