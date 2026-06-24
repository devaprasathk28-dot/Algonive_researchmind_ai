"use client";

import React, { useState, useEffect, useRef } from "react";
import { Entity, Relationship } from "@/services/api";

interface Props {
  entities: Entity[];
  relationships: Relationship[];
  width?: number;
  height?: number;
}

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
}

interface Link {
  source: string;
  target: string;
  relation: string;
}

export default function KnowledgeGraphView({ entities, relationships, width = 800, height = 500 }: Props) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  
  const isDraggingCanvas = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const activeDragNode = useRef<string | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Initialize graph data
  useEffect(() => {
    if (!entities.length) return;

    // Deduplicate entities by text
    const uniqueEntitiesMap = new Map<string, string>();
    entities.forEach((e) => {
      uniqueEntitiesMap.set(e.text, e.label);
    });

    const initialNodes: Node[] = Array.from(uniqueEntitiesMap.entries()).map(([text, label], idx) => {
      // Place nodes in a spiral or circular arrangement initially
      const angle = (idx / uniqueEntitiesMap.size) * Math.PI * 2 * 3;
      const radius = 50 + idx * 5;
      return {
        id: text,
        label: label,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        mass: 1.0,
      };
    });

    // Match links
    const initialLinks: Link[] = relationships
      .filter((r) => uniqueEntitiesMap.has(r.source) && uniqueEntitiesMap.has(r.target))
      .map((r) => ({
        source: r.source,
        target: r.target,
        relation: r.relation,
      }));

    const timer = window.setTimeout(() => {
      setNodes(initialNodes);
      setLinks(initialLinks);
      setSelectedNode(null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [entities, relationships, width, height]);

  // Physics simulation loop
  useEffect(() => {
    if (nodes.length === 0) return;

    const runSimulation = () => {
      setNodes((currentNodes) => {
        const nextNodes = currentNodes.map((n) => ({ ...n }));
        const nodeMap = new Map(nextNodes.map((n) => [n.id, n]));

        const k = 0.05; // spring constant
        const rep = 800; // repulsion constant
        const centerGravity = 0.015; // pull to center
        const maxVelocity = 8;

        // 1. Repulsion between all node pairs (Coulomb's Law)
        for (let i = 0; i < nextNodes.length; i++) {
          const nodeA = nextNodes[i];
          for (let j = i + 1; j < nextNodes.length; j++) {
            const nodeB = nextNodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distSq = dx * dx + dy * dy + 0.1;
            const dist = Math.sqrt(distSq);

            if (dist < 280) {
              const force = rep / distSq;
              const fX = (dx / dist) * force;
              const fY = (dy / dist) * force;

              // Push away
              if (nodeA.id !== activeDragNode.current) {
                nodeA.vx -= fX;
                nodeA.vy -= fY;
              }
              if (nodeB.id !== activeDragNode.current) {
                nodeB.vx += fX;
                nodeB.vy += fY;
              }
            }
          }
        }

        // 2. Attraction along links (Hooke's Law)
        links.forEach((link) => {
          const nodeA = nodeMap.get(link.source);
          const nodeB = nodeMap.get(link.target);

          if (nodeA && nodeB) {
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
            const restLength = 90; // desired bond distance
            const force = (dist - restLength) * k;
            
            const fX = (dx / dist) * force;
            const fY = (dy / dist) * force;

            if (nodeA.id !== activeDragNode.current) {
              nodeA.vx += fX;
              nodeA.vy += fY;
            }
            if (nodeB.id !== activeDragNode.current) {
              nodeB.vx -= fX;
              nodeB.vy -= fY;
            }
          }
        });

        // 3. Gravity towards center & friction integration
        nextNodes.forEach((node) => {
          if (node.id === activeDragNode.current) return;

          // Pull to center
          const dx = width / 2 - node.x;
          const dy = height / 2 - node.y;
          node.vx += dx * centerGravity;
          node.vy += dy * centerGravity;

          // Apply velocity and drag
          node.vx *= 0.85; // friction
          node.vy *= 0.85;

          // Clamp speed
          const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          if (speed > maxVelocity) {
            node.vx = (node.vx / speed) * maxVelocity;
            node.vy = (node.vy / speed) * maxVelocity;
          }

          node.x += node.vx;
          node.y += node.vy;

          // Boundaries checking (padding of 20px)
          node.x = Math.max(20, Math.min(width - 20, node.x));
          node.y = Math.max(20, Math.min(height - 20, node.y));
        });

        return nextNodes;
      });

      animationFrameId.current = requestAnimationFrame(runSimulation);
    };

    animationFrameId.current = requestAnimationFrame(runSimulation);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [links, nodes.length, width, height]);

  // Color picker helper based on Spacy Entity Labels
  const getEntityColorClass = (label: string): { bg: string; text: string; dot: string } => {
    switch (label.toUpperCase()) {
      case "ORG": // Organisation
        return { bg: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/45 dark:border-indigo-800", text: "fill-indigo-600 dark:fill-indigo-400", dot: "#6366f1" };
      case "PERSON": // People
        return { bg: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/45 dark:border-emerald-800", text: "fill-emerald-600 dark:fill-emerald-400", dot: "#10b981" };
      case "GPE":
      case "LOC": // Locations
        return { bg: "bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-950/45 dark:border-cyan-800", text: "fill-cyan-600 dark:fill-cyan-400", dot: "#06b6d4" };
      case "DATE":
      case "TIME":
        return { bg: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/45 dark:border-amber-800", text: "fill-amber-600 dark:fill-amber-400", dot: "#f59e0b" };
      case "PRODUCT":
      case "WORK_OF_ART":
        return { bg: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/45 dark:border-purple-800", text: "fill-purple-600 dark:fill-purple-400", dot: "#a855f7" };
      default: // Other/Default labels
        return { bg: "bg-slate-50 border-slate-200 text-slate-700 dark:bg-zinc-800/60 dark:border-zinc-700", text: "fill-slate-600 dark:fill-zinc-400", dot: "#94a3b8" };
    }
  };

  // Canvas interaction helpers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeDragNode.current) return;
    isDraggingCanvas.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingCanvas.current) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    } else if (activeDragNode.current && svgRef.current) {
      // Dragging a specific node
      const rect = svgRef.current.getBoundingClientRect();
      // Translate client coordinate back into graph coordinate including zoom & pan
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((currentNodes) =>
        currentNodes.map((n) => {
          if (n.id === activeDragNode.current) {
            return { ...n, x, y, vx: 0, vy: 0 };
          }
          return n;
        })
      );
    }
  };

  const handleMouseUp = () => {
    isDraggingCanvas.current = false;
    activeDragNode.current = null;
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (!entities.length) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-400 dark:text-zinc-500 text-sm">No semantic relationships extracted for this paper yet.</p>
      </div>
    );
  }

  // Create an easily searchable lookup of node positions for line rendering
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
      {/* Visual Canvas Area */}
      <div className="lg:col-span-3 relative bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-inner">
        {/* Graph control overlays */}
        <div className="absolute top-4 left-4 z-10 flex gap-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 shadow-sm">
          <button onClick={zoomIn} className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-xs font-bold" title="Zoom In">+</button>
          <button onClick={zoomOut} className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-xs font-bold" title="Zoom Out">-</button>
          <button onClick={resetZoom} className="px-2.5 py-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-xs font-medium" title="Reset View">Reset</button>
        </div>

        <div className="absolute bottom-4 left-4 z-10 text-[10px] text-zinc-400 bg-zinc-900/10 dark:bg-black/20 backdrop-blur px-2.5 py-1 rounded">
          💡 Drag nodes to move them. Drag background to pan.
        </div>

        {/* SVG Render Canvas */}
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          {/* Defined glow markers for edges */}
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Group containing all zoomed/panned objects */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Draw Links / Edges first */}
            {links.map((link, idx) => {
              const fromNode = nodeMap.get(link.source);
              const toNode = nodeMap.get(link.target);
              if (!fromNode || !toNode) return null;

              const isHighlighted =
                selectedNode?.id === link.source ||
                selectedNode?.id === link.target ||
                hoveredNode?.id === link.source ||
                hoveredNode?.id === link.target;

              return (
                <g key={`link-${idx}`}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isHighlighted ? "rgba(99, 102, 241, 0.7)" : "url(#edgeGradient)"}
                    strokeWidth={isHighlighted ? 2.5 : 1.25}
                    className="transition-all duration-200"
                  />
                  {/* Subtle relation text on hover */}
                  {isHighlighted && (
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 - 4}
                      className="text-[8px] fill-zinc-400 font-semibold text-center select-none"
                      textAnchor="middle"
                    >
                      {link.relation}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Draw Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const colors = getEntityColorClass(node.label);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid triggering canvas click deselect
                    setSelectedNode(node);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    activeDragNode.current = node.id;
                  }}
                  className="cursor-pointer"
                >
                  {/* Glowing selection outline */}
                  {(isSelected || isHovered) && (
                    <circle
                      r={15}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      className="animate-spin-slow"
                      style={{ animationDuration: "12s" }}
                    />
                  )}

                  {/* Node Core circle */}
                  <circle
                    r={isSelected ? 10 : 8}
                    fill={colors.dot}
                    stroke={isSelected ? "#fff" : "rgba(255, 255, 255, 0.45)"}
                    strokeWidth={1.5}
                    className="shadow-sm transition-all duration-200 hover:scale-110"
                  />

                  {/* Text Label overlay */}
                  <text
                    y={18}
                    className={`text-[9px] font-medium tracking-wide ${colors.text} select-none`}
                    textAnchor="middle"
                  >
                    {node.id.length > 18 ? `${node.id.substring(0, 16)}...` : node.id}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Side Details Panel */}
      <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-200/50 dark:border-zinc-800 pb-2">
          Graph Intelligence
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-slate-50 dark:bg-zinc-950/45 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{nodes.length}</div>
            <div className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Entities</div>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-950/45 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{links.length}</div>
            <div className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Relations</div>
          </div>
        </div>

        {selectedNode ? (
          <div className="space-y-3 pt-2">
            <div>
              <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Active Entity</div>
              <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">
                {selectedNode.id}
              </div>
            </div>
            
            <div>
              <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Semantic Label</div>
              <span className={`inline-flex px-2 py-1 mt-1 text-xs font-bold rounded-lg border ${getEntityColorClass(selectedNode.label).bg}`}>
                {selectedNode.label}
              </span>
            </div>

            <div>
              <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Connected Entities</div>
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {links
                  .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                  .map((l, i) => {
                    const other = l.source === selectedNode.id ? l.target : l.source;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          const n = nodeMap.get(other);
                          if (n) setSelectedNode(n);
                        }}
                        className="text-xs p-2 rounded-lg bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-950/30 dark:hover:bg-zinc-800/60 border border-zinc-200/30 dark:border-zinc-800/40 text-zinc-700 dark:text-zinc-300 flex justify-between items-center cursor-pointer transition-colors"
                      >
                        <span className="truncate font-medium">{other}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500/80 font-bold uppercase">{l.relation}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 dark:text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 opacity-55 text-indigo-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 9.152c.582.448 1.148.89 1.676 1.345m-1.676-1.345c-.528-.407-1.074-.82-1.636-1.24m3.312 2.585a9.043 9.043 0 0 1-1.636-1.24m1.636 1.24a9.044 9.044 0 0 0-1.636 1.24M13.406 7.912c-.562-.42-1.108-.833-1.636-1.24M11.77 6.672a9.045 9.045 0 0 0-1.636 1.24M10.134 7.912c-.528.407-1.074.82-1.636 1.24m3.272-2.48a9.043 9.043 0 0 1-1.636 1.24M6.862 9.152A9.043 9.043 0 0 1 8.5 7.912M6.862 9.152c-.528-.407-1.074-.82-1.636-1.24M5.226 7.912c-.562-.42-1.108-.833-1.636-1.24M3.59 6.672a9.044 9.044 0 0 0-1.636 1.24M1.954 7.912c.528.407 1.074.82 1.636 1.24" />
            </svg>
            <p className="text-xs">Click any entity in the network to inspect its semantic connections.</p>
          </div>
        )}
      </div>
    </div>
  );
}
