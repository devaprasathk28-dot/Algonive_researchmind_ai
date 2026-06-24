import torch.nn as nn

def build_training_model():

    model = nn.Sequential(

        nn.Linear(768, 512),

        nn.ReLU(),

        nn.Linear(512, 256),

        nn.ReLU(),

        nn.Linear(256, 10)
    )

    return model
