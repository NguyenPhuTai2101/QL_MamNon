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
  HeartHandshake
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [userRole, setUserRole] = useState<string>("ADMIN");

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
    { id: "tuition", label: "Quản lý Học phí", icon: CreditCard, roles: ["ADMIN", "PARENT"] },
    { id: "attendance", label: "Điểm danh Hàng ngày", icon: UserCheck, roles: ["ADMIN", "TEACHER"] },
    { id: "menu", label: "Thực đơn Hàng ngày", icon: Utensils, roles: ["ADMIN", "TEACHER", "PARENT"] },
    { id: "cost", label: "Chi phí Thực phẩm", icon: TrendingUp, roles: ["ADMIN"] },
    { id: "health", label: "Sức khỏe & Bé Ngoan", icon: HeartPulse, roles: ["ADMIN", "TEACHER", "PARENT"] },
    { id: "students", label: "Học sinh & Lớp học", icon: Users, roles: ["ADMIN", "TEACHER"] },
  ];

  // Filter items according to the logged-in user's role
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800 shadow-xl">
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
              onClick={() => setActiveTab(item.id)}
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
  );
}
