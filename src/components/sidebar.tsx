"use client";

import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  CreditCard, 
  Utensils, 
  TrendingUp, 
  Users, 
  UserCheck,
  HeartPulse,
  GraduationCap,
  ShieldCheck,
  UserCheck as TeacherIcon,
  HeartHandshake,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setUserRole(parsed.role || "ADMIN");
      } catch (e) {}
    }
  }, []);

  const allMenuItems = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "PARENT"] },
    { id: "tuition", label: "Học phí VietQR", icon: CreditCard, roles: ["ADMIN", "PARENT"] },
    { id: "attendance", label: "Điểm danh", icon: UserCheck, roles: ["ADMIN", "TEACHER"] },
    { id: "menu", label: "Thực đơn", icon: Utensils, roles: ["ADMIN", "TEACHER", "PARENT"] },
    { id: "cost", label: "Chi phí Bếp", icon: TrendingUp, roles: ["ADMIN"] },
    { id: "health", label: "Sức khỏe", icon: HeartPulse, roles: ["ADMIN", "TEACHER", "PARENT"] },
    { id: "students", label: "Học sinh & Lớp", icon: Users, roles: ["ADMIN", "TEACHER"] },
  ];

  // Filter items according to the logged-in user's role
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  const handleTabSelect = (id: string) => {
    setActiveTab(id);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col h-full border-r border-slate-800 shadow-xl">
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              NVSOFT ERP
            </h1>
            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase flex items-center gap-1 mt-0.5">
              {userRole === "ADMIN" && <><ShieldCheck className="w-3 h-3 text-indigo-400" /> Ban Giám Hiệu</>}
              {userRole === "TEACHER" && <><TeacherIcon className="w-3 h-3 text-emerald-400" /> Giáo viên</>}
              {userRole === "PARENT" && <><HeartHandshake className="w-3 h-3 text-pink-400" /> Phụ huynh</>}
            </span>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={cn(
                  "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="absolute right-0 top-2 bottom-2 w-1 bg-white rounded-l-full shadow-sm" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Role Indicator Footer */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 text-center">
          Tài khoản: <strong className="text-white">{userRole}</strong>
        </div>
      </aside>

      {/* Mobile Top Navbar with Drawer Toggle */}
      <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 p-4 mobile-header-notch flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              NVSOFT Mầm Non
            </h1>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase">
              {userRole === "PARENT" ? "Phụ huynh" : userRole === "TEACHER" ? "Giáo viên" : "BGH"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
          aria-label="Toggle Mobile Navigation"
        >
          {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar (1-Thumb Quick Switcher) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center px-2 py-2 text-white shadow-2xl safe-area-pb">
        {menuItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all text-[11px] font-semibold w-1/5",
                isActive 
                  ? "text-indigo-400 font-bold bg-indigo-500/10" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-slate-400")} />
              <span className="truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all text-[11px] font-semibold w-1/5",
            mobileDrawerOpen ? "text-indigo-400 bg-indigo-500/10" : "text-slate-400"
          )}
        >
          <Menu className="w-5 h-5" />
          <span>Tất cả</span>
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex flex-col justify-end animate-fadeIn">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Danh mục Quản lý</h3>
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-2xl text-xs font-bold transition-all text-left border",
                      isActive 
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30" 
                        : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-5 h-5 text-indigo-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
