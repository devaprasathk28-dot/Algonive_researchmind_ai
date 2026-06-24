from typing import List, Dict, Any

def recommend_datasets(domain: str) -> List[Dict[str, Any]]:
    """
    Recommend standard research datasets based on target domain.
    """
    dom_lower = domain.lower()
    
    if "fintech" in dom_lower or "crypto" in dom_lower or "finance" in dom_lower:
        return [
            {
                "name": "Uniswap V3 Historical Telemetry pool",
                "size": "50 GB",
                "metric": "Price Slippage, Concentrated Liquidity ticks",
                "suitability": "Ideal for testing low-latency exchange liquidity slippage forecast algorithms."
            },
            {
                "name": "Binance WebSocket Orderflow records",
                "size": "120 GB",
                "metric": "Trades & Orderbook updates at 100ms ticks",
                "suitability": "Highly suited for training convolutional slipping slip models on raw execution orders."
            },
            {
                "name": "FiQA 2018 (Financial Opinion Mining)",
                "size": "50 MB",
                "metric": "Sentiment Score, Aspect term relevance",
                "suitability": "Perfect for testing financial sentiment predictions and multi-exchange market trends."
            }
        ]
        
    elif "nlp" in dom_lower or "language" in dom_lower or "text" in dom_lower:
        return [
            {
                "name": "SQuAD v2.0 (Stanford Question Answering)",
                "size": "40 MB",
                "metric": "Exact Match (EM), F1-Score",
                "suitability": "The gold standard for evaluating context retrieval reading comprehension tasks."
            },
            {
                "name": "GLUE Benchmark (General Language Understanding)",
                "size": "1.2 GB",
                "metric": "Accuracy, F1, Pearson-Spearman Correlation",
                "suitability": "A collection of 9 language understanding tasks, excellent for general model validation."
            },
            {
                "name": "MMLU (Massive Multitask Language Understanding)",
                "size": "150 MB",
                "metric": "Accuracy",
                "suitability": "Evaluates models on 57 academic subjects, mapping general reasoning readiness."
            }
        ]
        
    elif "vision" in dom_lower or "image" in dom_lower or "multimodal" in dom_lower:
        return [
            {
                "name": "ImageNet-1k",
                "size": "150 GB",
                "metric": "Top-1 / Top-5 Accuracy",
                "suitability": "Standard benchmark for evaluating general image classification backbones (ResNet, ViT)."
            },
            {
                "name": "MS COCO (Common Objects in Context)",
                "size": "25 GB",
                "metric": "Mean Average Precision (mAP)",
                "suitability": "Perfect for object detection, keypoint tracking, and layout segmentation pipelines."
            },
            {
                "name": "LAION-5B (subset)",
                "size": "Terabytes",
                "metric": "CLIP Similarity Score",
                "suitability": "Standard corpus for training text-to-image generator latent diffusion adapters."
            }
        ]
        
    else:
        return [
            {
                "name": "WikiText-103",
                "size": "180 MB",
                "metric": "Perplexity (PPL)",
                "suitability": "Standard corpus for validating language modeling pretraining architectures."
            },
            {
                "name": "GLUE Benchmark",
                "size": "1.2 GB",
                "metric": "Accuracy, F1",
                "suitability": "Validates general representations on structural tasks."
            }
        ]
