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
  X,
  UserCog,
  BarChart3,
  Wallet,
  CalendarDays,
  Building2,
  UserPlus,
  Award,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
  category: "main" | "academic" | "finance" | "admin";
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

  const allMenuItems: MenuItem[] = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "PARENT"], category: "main" },
    { id: "parent_portal", label: "Góc Phụ Huynh", icon: HeartHandshake, roles: ["PARENT"], category: "main" },
    { id: "attendance", label: "Điểm danh hàng ngày", icon: UserCheck, roles: ["ADMIN", "TEACHER"], category: "academic" },
    { id: "students", label: "Học sinh & Lớp học", icon: Users, roles: ["ADMIN", "TEACHER"], category: "academic" },
    { id: "health", label: "Theo dõi Sức khỏe", icon: HeartPulse, roles: ["ADMIN", "TEACHER", "PARENT"], category: "academic" },
    { id: "menu", label: "Thực đơn tuần", icon: Utensils, roles: ["ADMIN", "TEACHER", "PARENT"], category: "academic" },
    
    { id: "tuition", label: "Học phí VietQR", icon: CreditCard, roles: ["ADMIN", "PARENT"], category: "finance" },
    { id: "finance", label: "Sổ Thu Chi Quỹ", icon: Wallet, roles: ["ADMIN"], category: "finance" },
    { id: "cost", label: "Chi phí Nhà bếp", icon: TrendingUp, roles: ["ADMIN"], category: "finance" },

    { id: "accounts", label: "Quản lý Tài khoản", icon: UserCog, roles: ["ADMIN"], category: "admin" },
    { id: "reports", label: "Báo cáo Thống kê", icon: BarChart3, roles: ["ADMIN"], category: "admin" },
    { id: "staff", label: "Nhân sự & Giáo viên", icon: UserCog, roles: ["ADMIN"], category: "admin" },
    { id: "events", label: "Sự kiện & Thông báo", icon: CalendarDays, roles: ["ADMIN", "TEACHER", "PARENT"], category: "admin" },
    { id: "admissions", label: "Tuyển sinh Mới", icon: UserPlus, roles: ["ADMIN"], category: "admin" },
    { id: "assets", label: "Cơ sở vật chất", icon: Building2, roles: ["ADMIN"], category: "admin" },
    { id: "evaluations", label: "Thi đua & Đánh giá", icon: Award, roles: ["ADMIN"], category: "admin" },
  ];

  const categories = [
    { key: "main", label: "HỆ THỐNG" },
    { key: "academic", label: "ĐÀO TẠO & SỨC KHỎE" },
    { key: "finance", label: "TÀI CHÍNH & THU CHI" },
    { key: "admin", label: "QUẢN TRỊ & THỐNG KÊ" },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  const handleTabSelect = (id: string) => {
    setActiveTab(id);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-950 text-white flex-col h-full border-r border-slate-800/80 shadow-2xl relative z-20 select-none">
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3.5 bg-slate-900/60 backdrop-blur-md">
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight tracking-wide bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              NVSOFT ERP
            </h1>
            <div className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase flex items-center gap-1 mt-0.5">
              {userRole === "ADMIN" && <><ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Ban Giám Hiệu</>}
              {userRole === "TEACHER" && <><TeacherIcon className="w-3.5 h-3.5 text-emerald-400" /> Giáo Viên</>}
              {userRole === "PARENT" && <><HeartHandshake className="w-3.5 h-3.5 text-pink-400" /> Phụ Huynh</>}
            </div>
          </div>
        </div>

        {/* Nav Menu Categorized */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto no-scrollbar">
          {categories.map((cat) => {
            const catItems = menuItems.filter(item => item.category === cat.key);
            if (catItems.length === 0) return null;
            return (
              <div key={cat.key} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  {cat.label}
                </div>
                {catItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative cursor-pointer",
                        isActive 
                          ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold shadow-md shadow-indigo-600/30 border border-indigo-500/40" 
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/90"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("w-4 h-4 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400")} />
                        <span>{item.label}</span>
                      </div>
                      {isActive ? (
                        <div className="w-1.5 h-4 bg-white rounded-full shadow-sm" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Role Indicator Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-400 flex items-center justify-between font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Hệ thống Hoạt động
          </span>
          <strong className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">{userRole}</strong>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-950 text-white border-b border-slate-800/80 p-3.5 mobile-header-notch flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl text-white shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              NVSOFT Mầm Non
            </h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
              {userRole === "PARENT" ? "Phụ Huynh" : userRole === "TEACHER" ? "Giáo Viên" : "Ban Giám Hiệu"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-300 border border-slate-800 transition-colors"
          aria-label="Toggle Mobile Navigation"
        >
          {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Bottom Quick Switcher */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 flex justify-around items-center px-2 py-1.5 text-white shadow-2xl safe-area-pb">
        {menuItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all text-[10px] font-bold w-1/5",
                isActive 
                  ? "text-indigo-400 font-extrabold bg-indigo-500/15" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400 scale-110" : "text-slate-400")} />
              <span className="truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className={cn(
            "flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all text-[10px] font-bold w-1/5",
            mobileDrawerOpen ? "text-indigo-400 bg-indigo-500/15" : "text-slate-400"
          )}
        >
          <Menu className="w-5 h-5" />
          <span>Tất cả</span>
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex flex-col justify-end animate-fadeIn">
          <div className="bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-white text-sm tracking-wide">TẤT CẢ DANH MỤC QUẢN LÝ</h3>
              <button 
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all text-left border",
                      isActive 
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-500 shadow-lg shadow-indigo-600/30" 
                        : "bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-900"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-indigo-400")} />
                    <span className="truncate">{item.label}</span>
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

