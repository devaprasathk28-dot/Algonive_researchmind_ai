import { Card } from "@/components/ui/card";

interface Props {

  futureWork: string;

  recommendations: string[];
}

export default function FutureWorkPanel({

  futureWork,
  recommendations,

}: Props) {

  return (

    <Card className="bg-zinc-900 border-zinc-800 p-6">

      <h2 className="text-2xl font-bold mb-6 text-white">

        AI Future Work Generator
      </h2>

      <div className="mb-6">

        <h3 className="font-semibold mb-3 text-zinc-200">

          Future Research Directions
        </h3>

        <p className="text-zinc-300 leading-7 whitespace-pre-line">

          {futureWork}
        </p>

      </div>

      <div>

        <h3 className="font-semibold mb-3 text-zinc-200">

          Recommended Improvements
        </h3>

        <ul className="space-y-2">

          {recommendations.map(

            (item, index) => (

              <li
                key={index}
                className="text-zinc-300"
              >
                • {item}
              </li>
            )
          )}

        </ul>

      </div>

    </Card>
  );
}
