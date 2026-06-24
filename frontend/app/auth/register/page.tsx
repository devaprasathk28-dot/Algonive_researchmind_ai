"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      if (res.data.error) {
        setError(res.data.error);
      } else {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.error || 
        "Something went wrong. Please try again."
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
          <div className="inline-flex p-2.5 bg-indigo-600 rounded-2xl text-white mb-2 shadow-lg shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            Create Account
          </h2>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
            Join the Command Center
          </p>
        </div>

        {/* Message Banner */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs font-semibold text-red-400 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-xs font-semibold text-emerald-400 text-center">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Arthur Pendelton"
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-500/40 rounded-xl px-4 py-3 text-xs outline-none transition text-white"
              required
            />
          </div>

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

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-500/40 rounded-xl px-4 py-3 text-xs outline-none transition text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer mt-6"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-zinc-500 font-semibold">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-all ml-1">
              Login here
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
