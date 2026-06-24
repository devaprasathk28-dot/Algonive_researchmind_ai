"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumbs from "./Breadcrumbs";
import UserProfile from "./UserProfile";
import PaperUpload from "../upload/PaperUpload";
import api from "@/services/api";

export default function TopNavbar() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("user_id"));
    }
  }, []);

  const fetchNotifications = () => {
    if (!userId) return;
    api.get(`/feed/notifications/${userId}`)
      .then((res) => {
        setNotifications(res.data || []);
      })
      .catch((err) => console.error("Error fetching notifications:", err));
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      // Poll every 12 seconds
      const interval = setInterval(fetchNotifications, 12000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: number) => {
    api.post(`/feed/notifications/read/${id}`)
      .then(() => {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
      })
      .catch((err) => console.error("Error marking notification read:", err));
  };

  const handleMarkAllRead = () => {
    if (!userId) return;
    api.post(`/feed/notifications/read-all/${userId}`)
      .then(() => {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
      })
      .catch((err) => console.error("Error marking all notifications read:", err));
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left section: Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <Breadcrumbs />
      </div>

      {/* Right section: Search, Upload, Alerts, Avatar */}
      <div className="flex items-center space-x-5">
        {/* Global Search Bar */}
        <div className="w-64 relative hidden sm:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search console portfolios..."
            className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-indigo-500/40 rounded-xl pl-9 pr-4 py-2 text-xs outline-none transition text-white placeholder-zinc-550"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z" />
          </svg>
        </div>

        {/* Global Upload Quick Action */}
        <button
          onClick={() => setUploadOpen(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload Paper
        </button>

        {/* Notification Bell with Dropdown Panel */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`p-2 rounded-xl transition relative cursor-pointer ${
              dropdownOpen ? "text-white bg-zinc-900" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-zinc-950 animate-pulse" />
            )}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in font-sans">
              <div className="px-4.5 py-3.5 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
                <span className="text-xs font-bold text-white tracking-tight">Notifications</span>
                {hasUnread && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto no-scrollbar divide-y divide-zinc-900/60">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                      className={`p-4 flex flex-col gap-1 transition cursor-pointer hover:bg-zinc-900/20 ${
                        notif.is_read ? "opacity-60" : "bg-indigo-600/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-xs font-bold ${notif.is_read ? "text-zinc-300" : "text-white"}`}>
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-450 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-zinc-600 font-medium mt-1">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4.5 py-2 border-t border-zinc-900 bg-zinc-900/5 text-center">
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="text-[10px] font-extrabold text-zinc-500 hover:text-zinc-300 transition tracking-wide uppercase"
                >
                  Close Panel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <UserProfile />
      </div>

      {/* Global Upload Overlay Dialog */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-[#18181b] border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setUploadOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 hover:bg-zinc-900 rounded-lg transition cursor-pointer font-bold text-xs"
            >
              ✕ Close
            </button>
            <h2 className="text-xl font-bold tracking-tight text-white mb-2">Upload Research Publication</h2>
            <PaperUpload onUploadSuccess={() => { setUploadOpen(false); }} />
          </div>
        </div>
      )}
    </header>
  );
}
