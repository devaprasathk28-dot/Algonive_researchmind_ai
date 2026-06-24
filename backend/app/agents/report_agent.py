def generate_final_report(results):

    report = {

        "retrieved_papers":
            results["papers"],

        "summaries":
            results["summaries"],

        "critiques":
            results["critiques"],

        "trend_analysis":
            results["trends"]
    }

    return report
