def aggregate_results(results):

    final_output = {

        "summary": None,

        "critique": None,

        "benchmarking": None,

        "trends": None
    }

    for result in results:

        if "summary" in result:

            final_output["summary"] = (
                result["summary"]
            )

        if "critique" in result:

            final_output["critique"] = (
                result["critique"]
            )

        if "benchmarking" in result:

            final_output["benchmarking"] = (
                result["benchmarking"]
            )

        if "trend" in result:

            final_output["trends"] = (
                result["trend"]
            )

    return final_output
