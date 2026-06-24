"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Node {
  id: string;
  label: string;
  val?: number;
}

interface Edge {
  source: string;
  target: string;
  relation: string;
}

interface Props {
  nodes: Node[];
  edges: Edge[];
}

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

export default function MiniKnowledgeGraph({ nodes, edges }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = 280;

    // Deep copy data for simulation
    const simulationNodes = nodes.map((n) => ({ ...n }));
    const simulationEdges = edges.map((e) => ({ ...e }));

    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("*").remove();

    // Define arrow markers
    svg
      .append("defs")
      .append("marker")
      .attr("id", "mini-arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 18)
      .attr("refY", 0)
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#4b5563");

    const g = svg.append("g");

    // Enable drag behavior
    const drag = (simulation: any) => {
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    };

    const simulation = d3
      .forceSimulation(simulationNodes as any)
      .force(
        "link",
        d3
          .forceLink(simulationEdges)
          .id((d: any) => d.id)
          .distance(70)
      )
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(25));

    // Draw link lines
    const link = g
      .append("g")
      .selectAll("line")
      .data(simulationEdges)
      .join("line")
      .attr("stroke", "#374151")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#mini-arrow)");

    // Draw nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(simulationNodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(drag(simulation) as any);

    // Node circles
    node
      .append("circle")
      .attr("r", (d) => (d.label === "PAPER" ? 9 : 6))
      .attr("fill", (d) => NODE_COLORS[d.label] || "#a1a1aa")
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 1.5);

    // Node text labels
    node
      .append("text")
      .text((d) => (d.id.length > 15 ? d.id.slice(0, 12) + "..." : d.id))
      .attr("x", 10)
      .attr("y", 4)
      .attr("fill", "#9ca3af")
      .attr("font-size", 9)
      .attr("font-weight", 500)
      .attr("paint-order", "stroke")
      .attr("stroke", "#030712")
      .attr("stroke-width", 3);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Zoom/pan handler
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 2.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    return () => {
      simulation.stop();
    };
  }, [nodes, edges]);

  return (
    <div ref={containerRef} className="w-full h-[280px] bg-zinc-950/80 rounded-xl overflow-hidden border border-zinc-800/80 relative">
      <svg ref={svgRef} className="w-full h-full" />
      <span className="absolute bottom-2 right-2 text-[9px] text-zinc-650 bg-black/60 px-2 py-0.5 rounded pointer-events-none">
        Interactive Preview
      </span>
    </div>
  );
}
