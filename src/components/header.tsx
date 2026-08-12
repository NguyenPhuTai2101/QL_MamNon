"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Search, 
  Calendar, 
  LogOut, 
  LogIn,
  Sparkles,
  UserCheck,
  Smartphone,
  Download
} from "lucide-react";

interface UserSession {
  username: string;
  name: string;
  role: string;
  token: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    setUser(null);
    router.push("/login");
  };

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getRoleLabel = (role?: string) => {
    if (role === "ADMIN") return "Quản trị viên";
    if (role === "TEACHER") return "Giáo viên";
    if (role === "PARENT") return "Phụ huynh";
    return "Khách";
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 py-3.5 mobile-header-notch shadow-sm sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative w-44 sm:w-72 md:w-80">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm thông tin..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
        />
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Date display */}
        <div className="hidden md:flex items-center gap-2.5 text-xs text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80 font-semibold shadow-2xs">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="capitalize">{today}</span>
        </div>

        {/* PWA Install Button */}
        {isInstallable && (
          <button
            onClick={handleInstallPWA}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all animate-pulse cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Cài App PWA
          </button>
        )}

        {/* Notifications */}
        <button className="p-2.5 hover:bg-slate-50 rounded-xl relative transition-colors border border-slate-200/80 text-slate-600 cursor-pointer">
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile / Auth Area */}
        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 ring-2 ring-indigo-50">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="hidden sm:block text-left">
              <h4 className="text-xs font-bold text-slate-800 leading-tight">{user.name}</h4>
              <span className="text-[11px] text-indigo-600 font-semibold">{getRoleLabel(user.role)}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
}
