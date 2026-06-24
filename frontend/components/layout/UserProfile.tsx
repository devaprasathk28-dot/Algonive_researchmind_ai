"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("researcher@workspace");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(localStorage.getItem("email") || "researcher@workspace");
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("email");
      sessionStorage.clear();
      router.push("/auth/login");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 hover:border-indigo-500/40 flex items-center justify-center text-xs font-bold text-zinc-300 uppercase cursor-pointer select-none transition"
      >
        {email.substring(0, 2)}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-zinc-850 rounded-xl shadow-2xl p-1.5 z-40 animate-fade-in font-sans">
          <div className="px-3 py-2 border-b border-zinc-900 mb-1">
            <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">Logged In As</span>
            <span className="text-xs text-zinc-300 font-semibold truncate block max-w-full">{email}</span>
          </div>

          <button
            onClick={() => { setOpen(false); router.push("/settings"); }}
            className="w-full text-left px-3 py-2 hover:bg-zinc-900 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.59 4.59A2 2 0 1 1 12.42 7.42 2 2 0 0 1 9.59 4.59ZM9.59 16.59A2 2 0 1 1 12.42 19.42 2 2 0 0 1 9.59 16.59ZM4.59 9.59A2 2 0 1 1 7.42 12.42 2 2 0 0 1 4.59 9.59ZM16.59 9.59A2 2 0 1 1 19.42 12.42 2 2 0 0 1 16.59 9.59Z" />
            </svg>
            Preferences
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 hover:bg-red-950/20 rounded-lg text-xs font-bold text-zinc-400 hover:text-red-400 transition flex items-center gap-2 cursor-pointer border-t border-zinc-900 mt-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
