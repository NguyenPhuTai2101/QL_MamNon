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
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: any;
  roles: string[];
  category: "management" | "academic" | "finance" | "hr" | "system";
  badge?: string;
  badgeColor?: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed = false,
  setIsCollapsed,
}: SidebarProps) {
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [collapsedInternal, setCollapsedInternal] = useState(false);

  const collapsed = isCollapsed !== undefined ? isCollapsed : collapsedInternal;
  const toggleCollapse = () => {
    if (setIsCollapsed) {
      setIsCollapsed(!collapsed);
    } else {
      setCollapsedInternal(!collapsedInternal);
    }
  };

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
    // 1. ĐIỀU HÀNH & BÁO CÁO
    { id: "overview", label: "Tổng quan Điều hành", shortLabel: "Tổng quan", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "PARENT"], category: "management" },
    { id: "reports", label: "Báo cáo & Thống kê BI", shortLabel: "Báo cáo", icon: BarChart3, roles: ["ADMIN"], category: "management" },

    // 2. ĐÀO TẠO & HỌC SINH
    { id: "students", label: "Học sinh & Lớp học", shortLabel: "Học sinh", icon: Users, roles: ["ADMIN", "TEACHER"], category: "academic" },
    { id: "attendance", label: "Điểm danh chuyên cần", shortLabel: "Điểm danh", icon: UserCheck, roles: ["ADMIN", "TEACHER"], category: "academic" },
    { id: "health", label: "Sức khỏe & Y tế học đường", shortLabel: "Sức khỏe", icon: HeartPulse, roles: ["ADMIN", "TEACHER", "PARENT"], category: "academic" },
    { id: "menu", label: "Thực đơn dinh dưỡng", shortLabel: "Thực đơn", icon: Utensils, roles: ["ADMIN", "TEACHER", "PARENT"], category: "academic" },

    // 3. TÀI CHÍNH & HỌC PHÍ
    { id: "tuition", label: "Học phí & Biểu phí VietQR", shortLabel: "Học phí", icon: CreditCard, roles: ["ADMIN", "PARENT"], category: "finance", badge: "VietQR", badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    { id: "finance", label: "Sổ Quỹ Thu Chi", shortLabel: "Sổ Quỹ", icon: Wallet, roles: ["ADMIN"], category: "finance" },
    { id: "cost", label: "Chi phí & Nguyên liệu Bếp", shortLabel: "Chi phí bếp", icon: TrendingUp, roles: ["ADMIN"], category: "finance" },

    // 4. NHÂN SỰ & GIÁO VIÊN
    { id: "staff", label: "Nhân sự & Giáo viên", shortLabel: "Nhân sự", icon: UserCog, roles: ["ADMIN"], category: "hr" },

    // 5. HỆ THỐNG & TÀI KHOẢN
    { id: "accounts", label: "Quản lý Tài khoản", shortLabel: "Tài khoản", icon: ShieldCheck, roles: ["ADMIN"], category: "system" },
    { id: "parent_portal", label: "Góc Phụ Huynh (Portal)", shortLabel: "Phụ Huynh", icon: HeartHandshake, roles: ["PARENT"], category: "system", badge: "Portal", badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  ];

  const categories = [
    { key: "management", label: "I. ĐIỀU HÀNH & BÁO CÁO" },
    { key: "academic", label: "II. ĐÀO TẠO & HỌC SINH" },
    { key: "finance", label: "III. TÀI CHÍNH & HỌC PHÍ" },
    { key: "hr", label: "IV. NHÂN SỰ & GIÁO VIÊN" },
    { key: "system", label: "V. HỆ THỐNG & TÀI KHOẢN" },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(userRole));

  const handleTabSelect = (id: string) => {
    setActiveTab(id);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop ERP Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex bg-slate-950 text-white flex-col h-full border-r border-slate-800/90 shadow-2xl relative z-20 select-none transition-all duration-300",
          collapsed ? "w-20" : "w-68"
        )}
      >
        {/* Brand Logo Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80 backdrop-blur-md h-16 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
              <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-2 rounded-2xl text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
            </div>

            {!collapsed && (
              <div className="animate-fadeIn truncate">
                <h1 className="font-black text-sm tracking-wide bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent truncate">
                  NVSOFT ERP
                </h1>
                <div className="text-[9px] text-indigo-400 font-extrabold tracking-wider uppercase flex items-center gap-1 mt-0.5">
                  {userRole === "ADMIN" && <><ShieldCheck className="w-3 h-3 text-indigo-400" /> Ban Giám Hiệu</>}
                  {userRole === "TEACHER" && <><TeacherIcon className="w-3 h-3 text-emerald-400" /> Giáo Viên</>}
                  {userRole === "PARENT" && <><HeartHandshake className="w-3 h-3 text-pink-400" /> Phụ Huynh</>}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
            title={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav Menu Categorized */}
        <nav className="flex-1 px-2.5 py-3 space-y-3.5 overflow-y-auto no-scrollbar">
          {categories.map((cat) => {
            const catItems = menuItems.filter((item) => item.category === cat.key);
            if (catItems.length === 0) return null;
            return (
              <div key={cat.key} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 text-[9px] font-black text-slate-500 tracking-wider uppercase truncate">
                    {cat.label}
                  </div>
                )}
                {catItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 group relative cursor-pointer",
                        isActive
                          ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold shadow-md shadow-indigo-600/30 border border-indigo-500/40"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/90",
                        collapsed ? "justify-center px-2 py-2.5" : ""
                      )}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                            isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                          )}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            "text-[9px] font-black px-1.5 py-0.2 rounded-md border",
                            item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {!collapsed && isActive && !item.badge && (
                        <div className="w-1.5 h-3.5 bg-white rounded-full shadow-sm shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Role Indicator Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 text-[10px] text-slate-400 flex items-center justify-between font-medium shrink-0">
          {!collapsed ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300">CSDL Kết Nối</span>
              </span>
              <strong className="text-indigo-400 font-extrabold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                {userRole}
              </strong>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="CSDL Trực Tuyến" />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-950 text-white border-b border-slate-800/80 p-3.5 mobile-header-notch flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl text-white shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-sm bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              NVSOFT Mầm Non
            </h1>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
              {userRole === "PARENT" ? "Phụ Huynh" : userRole === "TEACHER" ? "Giáo Viên" : "Ban Giám Hiệu"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-300 border border-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle Mobile Navigation"
        >
          {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end animate-fadeIn">
          <div className="bg-slate-950 text-white rounded-t-3xl border-t border-slate-800 p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-black text-sm text-slate-200">Danh Mục Phân Hệ ERP</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 bg-slate-900 text-slate-400 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {categories.map((cat) => {
                const catItems = menuItems.filter((item) => item.category === cat.key);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat.key} className="space-y-1">
                    <div className="px-2 text-[10px] font-black text-slate-500 uppercase">{cat.label}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {catItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleTabSelect(item.id)}
                            className={cn(
                              "flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold transition-all text-left",
                              isActive
                                ? "bg-indigo-600 text-white font-extrabold"
                                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.shortLabel || item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all",
                isActive ? "text-indigo-400 font-extrabold" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5", isActive ? "text-indigo-400" : "text-slate-400")} />
              <span>{item.shortLabel || item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
