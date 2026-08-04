"use client";

import React from "react";
import { 
  LayoutDashboard, 
  CreditCard, 
  Utensils, 
  TrendingUp, 
  Users, 
  UserCheck,
  HeartPulse,
  Settings,
  HelpCircle,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { id: "tuition", label: "Quản lý Học phí", icon: CreditCard },
    { id: "attendance", label: "Điểm danh Hàng ngày", icon: UserCheck },
    { id: "menu", label: "Thực đơn Hàng ngày", icon: Utensils },
    { id: "cost", label: "Chi phí Thực phẩm", icon: TrendingUp },
    { id: "health", label: "Sức khỏe & Bé Ngoan", icon: HeartPulse },
    { id: "students", label: "Học sinh & Lớp học", icon: Users },
  ];

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
          <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
            Mầm Non PWA
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
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />
              )}
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-white" : "text-slate-400 group-hover:text-white"
              )} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer support */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
          Cài đặt hệ thống
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white transition-colors">
          <HelpCircle className="w-4 h-4" />
          Hỗ trợ kỹ thuật
        </button>
      </div>
    </aside>
  );
}
