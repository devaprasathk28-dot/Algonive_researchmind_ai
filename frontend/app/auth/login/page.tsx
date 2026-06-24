"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      if (res.data.error) {
        setError(res.data.error);
      } else {
        // Store JWT token & User ID in localStorage
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user_id", res.data.user_id.toString());
        
        setSuccess("Authentication successful! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error || 
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex justify-center items-center p-6 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="w-full max-w-md bg-zinc-950/45 border border-zinc-900 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative z-10 space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 bg-indigo-650 rounded-2xl text-white mb-2 shadow-lg shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            Launch Console
          </h2>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
            Enter Research Credentials
          </p>
        </div>

        {/* Message Banner */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs font-semibold text-red-400 text-center animate-shake">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-xs font-semibold text-emerald-400 text-center">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="scientist@researchmind.ai"
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-500/40 rounded-xl px-4 py-3 text-xs outline-none transition text-white"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-500/40 rounded-xl px-4 py-3 text-xs outline-none transition text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-655 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer mt-6"
          >
            {loading ? "Authenticating..." : "Login to Console"}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-zinc-500 font-semibold">
            Don't have an account yet?{" "}
            <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-all ml-1">
              Create account
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
