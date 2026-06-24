import torch
from transformers import ViltProcessor, ViltForQuestionAnswering
from PIL import Image

_processor = None
_model = None

def get_vqa_model_and_processor():
    global _processor, _model
    if _processor is None or _model is None:
        print("Loading dandelin/vilt-b32-finetuned-vqa...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _processor = ViltProcessor.from_pretrained("dandelin/vilt-b32-finetuned-vqa")
        _model = ViltForQuestionAnswering.from_pretrained("dandelin/vilt-b32-finetuned-vqa").to(device)
    return _model, _processor

def answer_visual_question(
    image_path,
    question
):
    model, processor = get_vqa_model_and_processor()
    device = next(model.parameters()).device

    image = Image.open(image_path).convert("RGB")

    inputs = processor(image, question, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits
    idx = logits.argmax(-1).item()
    return model.config.id2label[idx]
