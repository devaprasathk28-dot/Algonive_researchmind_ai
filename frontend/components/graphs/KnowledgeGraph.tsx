"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import {
  generateKnowledgeGraph,
  KnowledgeGraphNode,
  KnowledgeGraphPaper,
  KnowledgeGraphResponse,
  Relationship,
} from "@/services/api";


const DEMO_PAPER: KnowledgeGraphPaper = {
  title: "Attention Is All You Need",
  authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"],
  sections: {
    abstract:
      "We introduce the Transformer, a model based on self-attention for natural language processing.",
    methodology:
      "The Transformer uses self-attention and attention mechanisms. BERT builds on the Transformer and is trained on Wikipedia.",
    results:
      "The model is evaluated on machine translation benchmarks and achieves strong BLEU accuracy.",
  },
};

const NODE_COLORS: Record<string, string> = {
  PAPER: "#f8fafc",
  PERSON: "#34d399",
  ORG: "#22d3ee",
  MODEL: "#818cf8",
  METHOD: "#c084fc",
  DATASET: "#fb923c",
  METRIC: "#facc15",
  DOMAIN: "#2dd4bf",
  CONCEPT: "#f472b6",
};

interface SimulationNode extends KnowledgeGraphNode, d3.SimulationNodeDatum {}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  relation: string;
  weight: number;
}

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const resetViewRef = useRef<() => void>(() => undefined);
  const paperRef = useRef<KnowledgeGraphPaper>(DEMO_PAPER);
  const [graph, setGraph] = useState<KnowledgeGraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [paperTitle, setPaperTitle] = useState(DEMO_PAPER.title ?? "Demo paper");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [colorMode, setColorMode] = useState<"type" | "community">("type");
  const colorModeRef = useRef(colorMode);
  colorModeRef.current = colorMode;

  // D3 search highlighting effect
  useEffect(() => {
    if (!svgRef.current || !graph) return;
    const svg = d3.select(svgRef.current);
    const nodesG = svg.selectAll<SVGGElement, SimulationNode>("g.node-group");
    const linksLine = svg.selectAll<SVGLineElement, SimulationLink>("line.link-line");
    const labelsText = svg.selectAll<SVGTextElement, SimulationLink>("text.relation-label");

    if (!searchTerm.trim()) {
      nodesG.transition().duration(200).style("opacity", 1.0);
      linksLine.transition().duration(200).style("opacity", 0.75);
      labelsText.transition().duration(200).style("opacity", 1.0);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    
    // Find matching nodes and their connected edges
    const matchingNodeIds = new Set<string>();
    
    graph.nodes.forEach(n => {
      if (n.id.toLowerCase().includes(term)) {
        matchingNodeIds.add(n.id);
      }
    });

    graph.edges.forEach(e => {
      const srcMatch = e.source.toLowerCase().includes(term);
      const tgtMatch = e.target.toLowerCase().includes(term);
      if (srcMatch || tgtMatch) {
        matchingNodeIds.add(e.source);
        matchingNodeIds.add(e.target);
      }
    });

    // Update element opacities
    nodesG.transition().duration(200).style("opacity", (d) => {
      return matchingNodeIds.has(d.id) ? 1.0 : 0.15;
    });

    linksLine.transition().duration(200).style("opacity", (d) => {
      const srcId = typeof d.source === "object" ? (d.source as any).id : d.source;
      const tgtId = typeof d.target === "object" ? (d.target as any).id : d.target;
      return matchingNodeIds.has(srcId) && matchingNodeIds.has(tgtId) ? 0.75 : 0.05;
    });

    labelsText.transition().duration(200).style("opacity", (d) => {
      const srcId = typeof d.source === "object" ? (d.source as any).id : d.source;
      const tgtId = typeof d.target === "object" ? (d.target as any).id : d.target;
      return matchingNodeIds.has(srcId) && matchingNodeIds.has(tgtId) ? 1.0 : 0.05;
    });
  }, [searchTerm, graph]);

  // Dynamic color transition effect
  useEffect(() => {
    if (!svgRef.current || !graph) return;
    const svg = d3.select(svgRef.current);
    const circles = svg.selectAll<SVGCircleElement, SimulationNode>("g.node-group circle");
    const communityColors = d3.schemeCategory10;

    circles.transition().duration(300).attr("fill", (item) => {
      if (colorMode === "community" && item.community !== undefined) {
        return communityColors[item.community % communityColors.length];
      }
      return NODE_COLORS[item.label] ?? "#a1a1aa";
    });
  }, [colorMode, graph]);


  const loadGraph = useCallback(async (nextPaper: KnowledgeGraphPaper) => {
    setLoading(true);
    setError("");

    try {
      const response = await generateKnowledgeGraph(nextPaper);
      setGraph(response);
      setSelectedNode(null);
      setPaperTitle(nextPaper.title ?? "Research paper");
    } catch {
      setError("Could not generate the graph. Confirm that the FastAPI server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let initialPaper = DEMO_PAPER;
    const storedPaper = window.sessionStorage.getItem("researchmind:last-paper");

    if (storedPaper) {
      try {
        initialPaper = JSON.parse(storedPaper) as KnowledgeGraphPaper;
      } catch {
        window.sessionStorage.removeItem("researchmind:last-paper");
      }
    }

    paperRef.current = initialPaper;
    const timer = window.setTimeout(() => {
      void loadGraph(initialPaper);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadGraph]);

  useEffect(() => {
    if (!graph || !svgRef.current) {
      return;
    }

    const width = 1100;
    const height = 680;
    const nodes: SimulationNode[] = graph.nodes.map((node) => ({ ...node }));
    const links: SimulationLink[] = graph.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      relation: edge.relation,
      weight: edge.weight ?? 1,
    }));

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("*").remove();

    const definitions = svg.append("defs");
    definitions
      .append("marker")
      .attr("id", "knowledge-arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#52525b");

    const canvas = svg.append("g");
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 3])
      .on("zoom", (event) => {
        canvas.attr("transform", event.transform.toString());
      });

    svg.call(zoom);
    resetViewRef.current = () => {
      svg.call(zoom.transform, d3.zoomIdentity);
    };

    const link = canvas
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "link-line")
      .attr("stroke", "#3f3f46")
      .attr("stroke-opacity", 0.75)
      .attr("stroke-width", (edge) => Math.min(1 + edge.weight * 0.4, 4))
      .attr("marker-end", "url(#knowledge-arrow)");

    const relationLabels = canvas
      .append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("class", "relation-label")
      .text((edge) => edge.relation.replaceAll("_", " "))
      .attr("fill", "#71717a")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .attr("paint-order", "stroke")
      .attr("stroke", "#09090b")
      .attr("stroke-width", 4);

    const node = canvas
      .append("g")
      .selectAll<SVGGElement, SimulationNode>("g")
      .data(nodes)
      .join("g")
      .attr("class", "node-group")
      .attr("cursor", "pointer")
      .on("click", (_event, selected) => {
        setSelectedNode({
          id: selected.id,
          label: selected.label,
          mention_count: selected.mention_count,
          community: selected.community,
          centrality: selected.centrality,
        });
      });

    const communityColors = d3.schemeCategory10;

    node
      .append("circle")
      .attr("r", (item) => 9 + Math.min(item.mention_count, 8))
      .attr("fill", (item) => {
        if (colorModeRef.current === "community" && item.community !== undefined) {
          return communityColors[item.community % communityColors.length];
        }
        return NODE_COLORS[item.label] ?? "#a1a1aa";
      })
      .attr("stroke", "#e4e4e7")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1.5);

    node
      .append("text")
      .text((item) => item.id)
      .attr("x", 17)
      .attr("y", 4)
      .attr("fill", "#e4e4e7")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .attr("paint-order", "stroke")
      .attr("stroke", "#09090b")
      .attr("stroke-width", 4);

    node.append("title").text((item) => `${item.id} (${item.label})`);

    const simulation = d3
      .forceSimulation<SimulationNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimulationNode, SimulationLink>(links)
          .id((item) => item.id)
          .distance(130)
          .strength(0.45)
      )
      .force("charge", d3.forceManyBody().strength(-420))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<SimulationNode>().radius(45))
      .on("tick", () => {
        link
          .attr("x1", (edge) => (edge.source as SimulationNode).x ?? 0)
          .attr("y1", (edge) => (edge.source as SimulationNode).y ?? 0)
          .attr("x2", (edge) => (edge.target as SimulationNode).x ?? 0)
          .attr("y2", (edge) => (edge.target as SimulationNode).y ?? 0);

        relationLabels
          .attr(
            "x",
            (edge) =>
              (((edge.source as SimulationNode).x ?? 0) +
                ((edge.target as SimulationNode).x ?? 0)) /
              2
          )
          .attr(
            "y",
            (edge) =>
              (((edge.source as SimulationNode).y ?? 0) +
                ((edge.target as SimulationNode).y ?? 0)) /
                2 -
              5
          );

        node.attr(
          "transform",
          (item) => `translate(${item.x ?? width / 2},${item.y ?? height / 2})`
        );
      });

    node.call(
      d3
        .drag<SVGGElement, SimulationNode>()
        .on("start", (event, item) => {
          if (!event.active) {
            simulation.alphaTarget(0.3).restart();
          }
          item.fx = item.x;
          item.fy = item.y;
        })
        .on("drag", (event, item) => {
          item.fx = event.x;
          item.fy = event.y;
        })
        .on("end", (event, item) => {
          if (!event.active) {
            simulation.alphaTarget(0);
          }
          item.fx = null;
          item.fy = null;
        })
    );

    return () => {
      simulation.stop();
      svg.on(".zoom", null);
    };
  }, [graph]);

  const communities = useMemo(() => {
    if (!graph) return [];
    const set = new Set<number>();
    graph.nodes.forEach((n) => {
      if (n.community !== undefined) {
        set.add(n.community);
      }
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [graph]);

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-indigo-950/20">
      <div className="flex flex-col gap-4 border-b border-zinc-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Active research map
          </p>
          <h2 className="mt-1 text-lg font-bold text-white">{paperTitle}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search nodes or relations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:bg-zinc-900/80 sm:w-64"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => resetViewRef.current()}
            className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Reset view
          </button>
          <button
            type="button"
            onClick={() => void loadGraph(paperRef.current)}
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Regenerate
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex h-[680px] items-center justify-center text-sm text-zinc-400">
          Extracting entities and building relationships...
        </div>
      )}

      {!loading && error && (
        <div className="flex h-[680px] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="max-w-lg text-sm text-rose-300">{error}</p>
          <button
            type="button"
            onClick={() => void loadGraph(paperRef.current)}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && graph && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative min-w-0 bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.12),_transparent_58%)]">
            <svg ref={svgRef} className="h-[680px] w-full touch-none" aria-label="Interactive research knowledge graph" />
            <p className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/50 px-3 py-2 text-[11px] text-zinc-500 backdrop-blur">
              Drag nodes. Scroll to zoom. Drag the canvas to pan.
            </p>
          </div>

          <aside className="border-t border-zinc-800 bg-zinc-900/50 p-5 lg:border-l lg:border-t-0 overflow-y-auto max-h-[680px] custom-scrollbar">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Entities" value={graph.total_nodes} />
                <Stat label="Relations" value={graph.total_edges} />
              </div>

              {graph.metrics && (
                <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold text-zinc-400">Graph Quality</p>
                    <p className="text-3xl font-black text-indigo-400">
                      {graph.metrics.quality_score}
                      <span className="text-xs text-zinc-500 font-normal"> / 10</span>
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-800/60 pt-3">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Density</p>
                      <p className="mt-0.5 text-sm font-bold text-white">{(graph.metrics.density * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Typed Ratio</p>
                      <p className="mt-0.5 text-sm font-bold text-white">{(graph.metrics.typed_nodes_ratio * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-zinc-800/80 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Entity details
              </h3>
              {selectedNode ? (
                <div className="mt-4">
                  <p className="break-words text-lg font-bold text-white">{selectedNode.id}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-300">
                      {selectedNode.label}
                    </span>
                    {selectedNode.community !== undefined && (
                      <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                        Community #{selectedNode.community}
                      </span>
                    )}
                    {selectedNode.centrality !== undefined && (
                      <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                        Centrality: {selectedNode.centrality.toFixed(3)}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-zinc-500">
                    Mentioned {selectedNode.mention_count} time
                    {selectedNode.mention_count === 1 ? "" : "s"}
                  </p>

                  <div className="mt-5 space-y-2">
                    {selectedRelationships.map((edge, index) => (
                      <RelationshipRow
                        key={`${edge.source}-${edge.target}-${index}`}
                        edge={edge}
                        selectedId={selectedNode.id}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-zinc-500">
                  Select a node to inspect its type, community, centrality, and connected concepts.
                </p>
              )}
            </div>

            {graph.ecosystem && (
              <div className="mt-6 border-t border-zinc-800/80 pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Ecosystem Highlights
                </h3>
                <div className="mt-3 space-y-2">
                  <HighlightRow
                    label="Top Model"
                    value={graph.ecosystem.top_model}
                    onClick={() => setSearchTerm(graph.ecosystem!.top_model === "None" ? "" : graph.ecosystem!.top_model)}
                  />
                  <HighlightRow
                    label="Top Dataset"
                    value={graph.ecosystem.top_dataset}
                    onClick={() => setSearchTerm(graph.ecosystem!.top_dataset === "None" ? "" : graph.ecosystem!.top_dataset)}
                  />
                  <HighlightRow
                    label="Top Framework"
                    value={graph.ecosystem.top_framework}
                    onClick={() => setSearchTerm(graph.ecosystem!.top_framework === "None" ? "" : graph.ecosystem!.top_framework)}
                  />
                  <HighlightRow
                    label="Top Method"
                    value={graph.ecosystem.top_method}
                    onClick={() => setSearchTerm(graph.ecosystem!.top_method === "None" ? "" : graph.ecosystem!.top_method)}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-zinc-800/80 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Color Scheme
                </h3>
                <div className="inline-flex rounded-lg border border-zinc-800 bg-black/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => setColorMode("type")}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${
                      colorMode === "type"
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Type
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode("community")}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition ${
                      colorMode === "community"
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Community
                  </button>
                </div>
              </div>

              {colorMode === "type" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(NODE_COLORS).map(([label, color]) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 px-2 py-1 text-[10px] text-zinc-400"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {communities.map((cId) => {
                    const color = d3.schemeCategory10[cId % d3.schemeCategory10.length];
                    return (
                      <span
                        key={cId}
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 px-2 py-1 text-[10px] text-zinc-400"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                        Community {cId}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/30 p-3 text-center">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}

function RelationshipRow({
  edge,
  selectedId,
}: {
  edge: Relationship;
  selectedId: string;
}) {
  const otherEntity = edge.source === selectedId ? edge.target : edge.source;

  return (
    <div className="rounded-xl border border-zinc-800 bg-black/25 p-3">
      <p className="truncate text-xs font-semibold text-zinc-300">{otherEntity}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-indigo-400">
        {edge.relation.replaceAll("_", " ")}
      </p>
    </div>
  );
}

function HighlightRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  if (!value || value === "None") return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-2.5 text-left transition hover:border-indigo-500 hover:bg-zinc-900/50"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
      <span className="truncate text-xs font-bold text-indigo-300 max-w-[170px]">{value}</span>
    </button>
  );
}
