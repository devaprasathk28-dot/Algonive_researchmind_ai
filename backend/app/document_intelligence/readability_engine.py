def analyze_readability(text: str) -> dict:
    """
    Compute text readability indices using the textstat package.
    """
    if not text or not text.strip():
        return {"level": "Intermediate", "flesch_score": 50.0, "gunning_fog": 10.0, "smog_index": 10.0}

    try:
        import textstat
        # Sample first 5,000 words to keep execution fast and prevent timeouts
        sample_text = " ".join(text.split()[:5000])
        
        flesch = textstat.flesch_reading_ease(sample_text)
        fog = textstat.gunning_fog(sample_text)
        smog = textstat.smog_index(sample_text)

        if flesch < 30.0 or fog > 14.0:
            level = "Advanced"
        elif flesch < 60.0 or fog > 10.0:
            level = "Intermediate"
        else:
            level = "Basic"

        return {
            "level": level,
            "flesch_score": flesch,
            "gunning_fog": fog,
            "smog_index": smog
        }
    except Exception as e:
        print(f"Warning: Failed to compute readability metrics: {e}")
        return {"level": "Advanced", "flesch_score": 25.0, "gunning_fog": 15.0, "smog_index": 14.0}
