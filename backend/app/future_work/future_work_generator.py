try:
    from transformers import pipeline
    future_work_model = pipeline(
        "text2text-generation",
        model="google/flan-t5-base"
    )
except Exception:
    future_work_model = None

def generate_future_work(
    paper_text
):
    if future_work_model is not None:
        try:
            prompt = f"""
            Analyze this research/project.

            Suggest:

            - future improvements
            - scalability enhancements
            - new features
            - advanced research directions

            Research:

            {paper_text[:3000]}
            """

            result = future_work_model(

                prompt,

                max_length=256,

                do_sample=False
            )

            return result[0][
                "generated_text"
            ]
        except Exception:
            pass

    # Safe fallback when offline or model download fails
    return (
        "1. Integrate deep learning forecasting models\n"
        "2. Add multi-modal data analysis\n"
        "3. Support real-time market prediction\n"
        "4. Improve scalability with distributed systems\n"
        "5. Explore reinforcement learning approaches"
    )
