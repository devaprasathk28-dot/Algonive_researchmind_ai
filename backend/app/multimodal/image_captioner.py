import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image

_processor = None
_model = None

def get_caption_model_and_processor():
    global _processor, _model
    if _processor is None or _model is None:
        print("Loading Salesforce/blip-image-captioning-base...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        _model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)
    return _model, _processor

def generate_image_caption(
    image_path
):
    model, processor = get_caption_model_and_processor()
    device = next(model.parameters()).device

    image = Image.open(image_path).convert("RGB")

    inputs = processor(image, return_tensors="pt").to(device)
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=50)

    return processor.decode(out[0], skip_special_tokens=True)
