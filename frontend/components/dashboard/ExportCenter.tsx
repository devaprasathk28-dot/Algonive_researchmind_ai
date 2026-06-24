"use client";

interface Props {
  reportLinks: {
    pdf?: string;
    docx?: string;
    ppt?: string;
  } | null;
}

export default function ExportCenter({
  reportLinks
}: Props) {

  if (!reportLinks) return null;

  return (

    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">

      <h2 className="text-2xl font-bold mb-6 text-white">

        Export Center
      </h2>

      <div className="flex gap-4 flex-wrap">

        {reportLinks.pdf && (
          <a
            href={reportLinks.pdf}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-white text-black px-5 py-2.5 rounded-xl font-semibold hover:bg-zinc-200 transition cursor-pointer">
              Download PDF
            </button>
          </a>
        )}

        {reportLinks.docx && (
          <a
            href={reportLinks.docx}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-zinc-800 text-white border border-zinc-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-zinc-700 transition cursor-pointer">
              Download DOCX
            </button>
          </a>
        )}

        {reportLinks.ppt && (
          <a
            href={reportLinks.ppt}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-zinc-800 text-white border border-zinc-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-zinc-700 transition cursor-pointer">
              Download PPT Presentation
            </button>
          </a>
        )}

      </div>

    </div>
  );
}
