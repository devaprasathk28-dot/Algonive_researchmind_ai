def design_evaluation_pipeline():

    metrics = [

        "Accuracy",

        "Precision",

        "Recall",

        "F1 Score",

        "ROC-AUC"
    ]

    evaluation = {

        "evaluation_metrics":
            metrics,

        "cross_validation":
            "5-Fold",

        "benchmarking":
            "Enabled"
    }

    return evaluation
