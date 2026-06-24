import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-indigo-500/30">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "12s" }} />

      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10 border-b border-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h1 className="text-md font-black tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">ResearchMind AI</h1>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block -mt-0.5">Enterprise Suite</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="px-4 py-2 border border-zinc-800 hover:border-indigo-500/40 rounded-xl text-xs font-semibold hover:bg-zinc-900/55 transition-all"
        >
          Launch Console
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 max-w-4xl mx-auto z-10 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          System Updated: Version 1.0.0 Live
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.15] mb-6">
          Research Intelligence
          <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mt-2">
            Command Center
          </span>
        </h2>

        <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl mb-12">
          Transform raw PDF publications into interactive semantic graphs, multidimensional score cards, side-by-side comparative portfolios, and an AI chat assistant.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all text-center"
          >
            Launch Command Center
          </Link>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-2xl text-sm font-bold transition-all text-center"
          >
            API Documentation
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full text-left">
          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl hover:border-indigo-500/20 transition-all">
            <div className="text-indigo-400 mb-4 font-bold text-lg">01</div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-zinc-200">Interactive Metrics</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">Multidimensional analysis with radar charts and key metrics.</p>
          </div>

          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl hover:border-indigo-500/20 transition-all">
            <div className="text-indigo-400 mb-4 font-bold text-lg">02</div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-zinc-200">Semantic Graphs</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">Map relationships and entities dynamically in interactive SVGs.</p>
          </div>

          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl hover:border-indigo-500/20 transition-all">
            <div className="text-indigo-400 mb-4 font-bold text-lg">03</div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-zinc-200">Comparative Analytics</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">Evaluate papers side-by-side with scoring bars and AI synthesis.</p>
          </div>

          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-3xl hover:border-indigo-500/20 transition-all">
            <div className="text-indigo-400 mb-4 font-bold text-lg">04</div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-zinc-200">AI Co-Pilot</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">RAG indexed chat for real-time document search and critiques.</p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-wider z-10">
        © 2026 ResearchMind AI. All Rights Reserved.
      </footer>
    </div>
  );
}

