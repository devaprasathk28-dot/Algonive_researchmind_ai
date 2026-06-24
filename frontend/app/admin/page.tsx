"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getMonitoringMetrics, MonitoringMetrics } from "@/services/api";

export default function AdminMonitoringPage() {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    try {
      const data = await getMonitoringMetrics();
      setMetrics(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch monitoring metrics", err);
      setError("Unable to connect to backend monitoring services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout activeSection="admin">
      <div className="space-y-8 animate-fade-in font-sans pb-12">
        {/* Header */}
        <div className="border-b border-zinc-900 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest block mb-1">
              Infrastructure Operations
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">System Monitoring</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Real-time server resources, cache states, database sizing, and traffic telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Live Polling (5s)
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {loading && !metrics ? (
          <div className="flex h-[400px] items-center justify-center text-sm text-zinc-400">
            Connecting to telemetries...
          </div>
        ) : metrics ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Database Metrics */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur shadow-xl">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
                Database Stats
              </h2>
              <div className="space-y-4">
                <StatRow label="Registered Users" value={metrics.database.users} />
                <StatRow label="Papers Indexed" value={metrics.database.papers} />
                <StatRow label="Active Workspaces" value={metrics.database.workspaces} />
                <StatRow label="Processing Failures" value={metrics.database.failures} highlight={metrics.database.failures > 0} />
              </div>
            </div>

            {/* Resources Metrics */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur shadow-xl">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
                System Resources
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-2">
                    <span>CPU Load</span>
                    <span>{metrics.system.cpu_usage_percent}%</span>
                  </div>
                  <ProgressBar percent={metrics.system.cpu_usage_percent} color="bg-indigo-500" />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-2">
                    <span>Memory Usage</span>
                    <span>{metrics.system.memory_usage_mb} MB</span>
                  </div>
                  <ProgressBar percent={Math.min(100, (metrics.system.memory_usage_mb / 512) * 100)} color="bg-purple-500" />
                </div>
              </div>
            </div>

            {/* Service Connectors */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur shadow-xl">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
                Service States
              </h2>
              <div className="space-y-4">
                <StatusRow label="FastAPI Server" status={metrics.status === "healthy"} />
                <StatusRow label="Redis Caching" status={metrics.system.redis_connected} />
                <StatusRow label="Chroma Vector DB" status={metrics.system.chroma_connected} />
              </div>
            </div>

            {/* Traffic & Telemetry */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-6 backdrop-blur shadow-xl md:col-span-2 lg:col-span-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
                Traffic & Latency
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                <StatCard label="API Request Counter" value={metrics.traffic.api_requests} desc="Aggregated since process boot" />
                <StatCard label="API Errors Logged" value={metrics.traffic.api_errors} desc="Exceptions caught by middleware" highlight={metrics.traffic.api_errors > 0} />
                <StatCard label="Avg Response Latency" value={`${metrics.traffic.avg_response_time_ms} ms`} desc="Standard internal loop duration" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}

function StatRow({ label, value, highlight = false }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`text-lg font-extrabold ${highlight ? "text-rose-400" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-900 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${status ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`} />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          {status ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}

function StatCard({ label, value, desc, highlight = false }: { label: string; value: number | string; desc: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-900 bg-black/20 p-5">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className={`mt-2 text-3xl font-black ${highlight ? "text-rose-400" : "text-white"}`}>{value}</p>
      <p className="mt-1 text-[10px] text-zinc-500">{desc}</p>
    </div>
  );
}
