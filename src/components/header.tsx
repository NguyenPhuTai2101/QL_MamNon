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
    <header className="bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 py-3 mobile-header-notch shadow-sm">
      {/* Search Bar */}
      <div className="relative w-44 sm:w-72 md:w-80">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-6">
        {/* Date display */}
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="font-medium capitalize">{today}</span>
        </div>

        {/* Parent Multi-Child Selector */}
        {user?.role === "PARENT" && (
          <div className="flex items-center gap-2 bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-pink-600 font-bold hidden sm:inline">👶 Chọn con:</span>
            <select className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer">
              <option value="1">Nguyễn Minh Khang (Lớp Mầm 1)</option>
              <option value="2">Nguyễn Minh Anh (Lớp Lá 1)</option>
            </select>
          </div>
        )}

        {/* PWA Install Button */}
        {isInstallable && (
          <button
            onClick={handleInstallPWA}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs px-3.5 py-2 rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all animate-pulse"
          >
            <Download className="w-3.5 h-3.5" />
            Cài App PWA
          </button>
        )}

        {/* Notifications */}
        <button className="p-2.5 hover:bg-slate-50 rounded-xl relative transition-colors border border-slate-100">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Profile / Auth Area */}
        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/25">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="hidden sm:block text-left">
              <h4 className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</h4>
              <span className="text-xs text-indigo-600 font-medium">{getRoleLabel(user.role)}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all ml-2"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  );
}
