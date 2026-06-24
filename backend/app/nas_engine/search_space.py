def generate_search_space():

    search_space = {

        "layers": [

            "Conv2D",
            "Transformer",
            "Attention",
            "LSTM",
            "Dense"
        ],

        "activations": [

            "ReLU",
            "GELU",
            "Sigmoid"
        ],

        "optimizers": [

            "Adam",
            "AdamW",
            "SGD"
        ]
    }

    return search_space
