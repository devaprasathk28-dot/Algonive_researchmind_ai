def compare_innovation(

    score_a,
    score_b
):

    winner = (

        "Paper A"

        if score_a > score_b

        else "Paper B"
    )

    return {

        "paper_a_innovation":
            score_a,

        "paper_b_innovation":
            score_b,

        "winner":
            winner
    }
