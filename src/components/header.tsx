"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Calendar,
  LogOut,
  LogIn,
  Download,
  Command,
  Sparkles,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  School,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import Portal from "@/components/portal";

interface UserSession {
  username: string;
  name: string;
  role: string;
  token: string;
}

interface HeaderProps {
  activeTab?: string;
  onOpenCommandPalette?: () => void;
}

const TAB_BREADCRUMB_MAP: Record<string, { module: string; page: string }> = {
  overview: { module: "Điều hành & Báo cáo", page: "Tổng quan Điều hành" },
  reports: { module: "Điều hành & Báo cáo", page: "Báo cáo & Thống kê BI" },
  students: { module: "Đào tạo & Học sinh", page: "Hồ sơ Học sinh & Lớp học" },
  attendance: { module: "Đào tạo & Học sinh", page: "Điểm danh chuyên cần" },
  health: { module: "Đào tạo & Học sinh", page: "Sức khỏe & Y tế học đường" },
  menu: { module: "Đào tạo & Học sinh", page: "Thực đơn dinh dưỡng" },
  tuition: { module: "Tài chính & Học phí", page: "Học phí & Biểu phí VietQR" },
  finance: { module: "Tài chính & Học phí", page: "Sổ Quỹ Thu Chi Trường" },
  cost: { module: "Tài chính & Học phí", page: "Chi phí & Nguyên liệu Bếp" },
  staff: { module: "Nhân sự & Hành chính", page: "Hồ sơ Nhân sự & Giáo viên" },
  admissions: { module: "Nhân sự & Hành chính", page: "Tuyển sinh Mới (CRM)" },
  assets: { module: "Nhân sự & Hành chính", page: "Cơ sở vật chất & CSVC" },
  evaluations: { module: "Nhân sự & Hành chính", page: "Thi đua & Đánh giá KPI" },
  events: { module: "Hệ thống & Dịch vụ", page: "Sự kiện & Thông báo Trường" },
  accounts: { module: "Hệ thống & Dịch vụ", page: "Quản lý Tài khoản & Quyền" },
  parent_portal: { module: "Hệ thống & Dịch vụ", page: "Góc Phụ Huynh (Portal)" },
};

export default function Header({
  activeTab = "overview",
  onOpenCommandPalette,
}: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("2026-2027 | HK I");

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
    if (role === "ADMIN") return "Ban Giám Hiệu";
    if (role === "TEACHER") return "Giáo Viên";
    if (role === "PARENT") return "Phụ Huynh";
    return "Khách";
  };

  const breadcrumb = TAB_BREADCRUMB_MAP[activeTab] || {
    module: "Hệ thống",
    page: "Tổng quan",
  };

  const notifications = [
    { id: 1, title: "Hóa đơn học phí tháng 8", desc: "Còn 3 học sinh chưa hoàn thành đóng học phí", time: "10 phút trước", type: "warning" },
    { id: 2, title: "Đón trẻ buổi chiều", desc: "Phụ huynh bé Trương Thế An đã gửi lời dặn đón hộ", time: "30 phút trước", type: "info" },
    { id: 3, title: "Thực đơn dinh dưỡng tuần mới", desc: "Bếp đã cập nhật định lượng thực phẩm tuần 33", time: "2 giờ trước", type: "success" },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 py-2.5 sticky top-0 z-30 transition-all h-16 shrink-0">
      {/* Left: Breadcrumbs navigation */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 truncate">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <School className="w-3.5 h-3.5 text-indigo-600" /> NVSOFT ERP
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-500 truncate">{breadcrumb.module}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/80 truncate">
            {breadcrumb.page}
          </span>
        </div>

        {/* Global Search Trigger (Ctrl + K) */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 px-3 py-1.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-2xs group"
          title="Tìm kiếm nhanh phân hệ hoặc học sinh (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          <span className="hidden sm:inline">Tìm kiếm nhanh...</span>
          <div className="hidden lg:flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-[10px] font-mono font-bold text-slate-400 shadow-2xs">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Action Area */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* School Year / Semester Dropdown Selector */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-100/80 border border-slate-200/80 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <select
            value={selectedSchoolYear}
            onChange={(e) => setSelectedSchoolYear(e.target.value)}
            className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer text-xs"
          >
            <option value="2026-2027 | HK I">Năm học 2026 - 2027 (HK I)</option>
            <option value="2026-2027 | HK II">Năm học 2026 - 2027 (HK II)</option>
            <option value="2025-2026 | Cả năm">Năm học 2025 - 2026 (Đã lưu trữ)</option>
          </select>
        </div>

        {/* PWA Install Button */}
        {isInstallable && (
          <button
            onClick={handleInstallPWA}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 animate-bounce" />
            <span className="hidden sm:inline">Cài App</span>
          </button>
        )}

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 hover:bg-slate-100 rounded-xl relative transition-colors border border-slate-200/80 text-slate-600 cursor-pointer"
            title="Trung tâm thông báo"
          >
            <Bell className="w-4 h-4 text-slate-600 hover:text-indigo-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 space-y-3 animate-scaleUp z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-indigo-600" /> Thông Báo Hệ Thống
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors space-y-1 cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Area */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1 pl-2 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm shadow-indigo-500/20">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <h4 className="text-xs font-black text-slate-800 leading-tight truncate max-w-[120px]">
                  {user.name}
                </h4>
                <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider">
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 space-y-2 animate-scaleUp z-50 text-xs">
                <div className="p-2 border-b border-slate-100">
                  <div className="font-black text-slate-900">{user.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">@{user.username || "admin"}</div>
                  <span className="inline-block mt-1 text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng Xuất An Toàn</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng Nhập</span>
          </button>
        )}
      </div>
    </header>
  );
}
