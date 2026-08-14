"use client";

import React, { useState, useEffect, useMemo } from "react";
import Portal from "@/components/portal";
import {
  Search,
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  Wallet,
  Utensils,
  TrendingUp,
  HeartPulse,
  BarChart3,
  CalendarDays,
  UserPlus,
  Building2,
  Award,
  UserCog,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  X,
  Command,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
  students?: any[];
  userRole?: string;
}

interface NavItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: any;
  roles: string[];
}

const ALL_MODULES: NavItem[] = [
  { id: "overview", title: "Tổng quan Điều hành", category: "Điều hành & Báo cáo", description: "Bảng thống kê KPI, biểu đồ sĩ số và dòng tiền", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "PARENT"] },
  { id: "reports", title: "Báo cáo & Thống kê BI", category: "Điều hành & Báo cáo", description: "Phân tích học vụ, tài chính, báo cáo chuyên sâu", icon: BarChart3, roles: ["ADMIN"] },
  { id: "students", title: "Học sinh & Lớp học", category: "Đào tạo & Học sinh", description: "Hồ sơ học sinh, danh sách lớp học, phân lớp", icon: Users, roles: ["ADMIN", "TEACHER"] },
  { id: "attendance", title: "Điểm danh chuyên cần", category: "Đào tạo & Học sinh", description: "Điểm danh đón/trả, báo vắng có phép", icon: UserCheck, roles: ["ADMIN", "TEACHER"] },
  { id: "health", title: "Sức khỏe & Y tế học đường", category: "Đào tạo & Học sinh", description: "Chỉ số BMI, sổ khám sức khỏe, dị ứng", icon: HeartPulse, roles: ["ADMIN", "TEACHER", "PARENT"] },
  { id: "menu", title: "Thực đơn dinh dưỡng", category: "Đào tạo & Học sinh", description: "Thực đơn tuần, định mức calo, bóc tách khẩu phần", icon: Utensils, roles: ["ADMIN", "TEACHER", "PARENT"] },
  { id: "tuition", title: "Học phí & Biểu phí VietQR", category: "Tài chính & Học phí", description: "Quản lý thu học phí, biểu phí lớp, quét mã QR", icon: CreditCard, roles: ["ADMIN", "PARENT"] },
  { id: "finance", title: "Sổ Quỹ Thu Chi", category: "Tài chính & Học phí", description: "Sổ cái dòng tiền, phiếu thu chi, cân đối quỹ", icon: Wallet, roles: ["ADMIN"] },
  { id: "cost", title: "Chi phí & Nguyên liệu Bếp", category: "Tài chính & Học phí", description: "Định lượng thực phẩm, giá vốn bữa ăn, chợ đầu mối", icon: TrendingUp, roles: ["ADMIN"] },
  { id: "staff", title: "Nhân sự & Giáo viên", category: "Nhân sự & Hành chính", description: "Hồ sơ giáo viên, chấm công, tính lương", icon: UserCog, roles: ["ADMIN"] },
  { id: "admissions", title: "Tuyển sinh Mới (CRM)", category: "Nhân sự & Hành chính", description: "Tiếp nhận hồ sơ, tư vấn phụ huynh, xếp lớp mới", icon: UserPlus, roles: ["ADMIN"] },
  { id: "assets", title: "Cơ sở vật chất & Tài sản", category: "Nhân sự & Hành chính", description: "Kiểm kê phòng học, đồ chơi, bảo dưỡng trang thiết bị", icon: Building2, roles: ["ADMIN"] },
  { id: "evaluations", title: "Thi đua & Đánh giá KPI", category: "Nhân sự & Hành chính", description: "Đánh giá tiết dạy, xếp loại thi đua cán bộ", icon: Award, roles: ["ADMIN"] },
  { id: "events", title: "Sự kiện & Thông báo", category: "Hệ thống & Dịch vụ", description: "Lịch hoạt động trường, thông báo khẩn, bảng tin", icon: CalendarDays, roles: ["ADMIN", "TEACHER", "PARENT"] },
  { id: "accounts", title: "Quản lý Tài khoản & Phân quyền", category: "Hệ thống & Dịch vụ", description: "Phân quyền quản trị, danh sách tài khoản", icon: UserCog, roles: ["ADMIN"] },
  { id: "parent_portal", title: "Góc Phụ Huynh (Portal)", category: "Hệ thống & Dịch vụ", description: "Cổng thông tin phụ huynh theo dõi con em", icon: HeartHandshake, roles: ["PARENT"] },
];

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  students = [],
  userRole = "ADMIN",
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Lọc các module theo quyền và từ khóa
  const filteredModules = useMemo(() => {
    return ALL_MODULES.filter((m) => {
      const matchRole = m.roles.includes(userRole);
      if (!matchRole) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, userRole]);

  // Lọc học sinh theo từ khóa nếu có nhập tìm kiếm
  const matchedStudents = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return students
      .filter((s) => s.name?.toLowerCase().includes(q) || s.parentName?.toLowerCase().includes(q) || s.parentPhone?.includes(q) || s.className?.toLowerCase().includes(q))
      .slice(0, 5);
  }, [searchQuery, students]);

  // Lắng nghe phím tắt điều hướng trong palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredModules.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredModules.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredModules[selectedIndex]) {
          onSelectTab(filteredModules[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredModules, selectedIndex, onClose, onSelectTab]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-20 sm:pt-28 px-4 animate-fadeIn">
        <div
          className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3.5 bg-slate-50/50">
            <Search className="w-5 h-5 text-indigo-600 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Tìm nhanh phân hệ, tính năng hoặc học sinh... (VD: Học phí, Thực đơn, An...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="hidden sm:inline-block text-[10px] font-bold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-md border border-slate-300/60">
                ESC để đóng
              </span>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[60vh]">
            {/* Học sinh khớp từ khóa (nếu có) */}
            {matchedStudents.length > 0 && (
              <div className="space-y-1.5">
                <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Hồ Sơ Học Sinh Tìm Thấy ({matchedStudents.length})</span>
                </div>
                <div className="space-y-1">
                  {matchedStudents.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => {
                        onSelectTab("students");
                        onClose();
                      }}
                      className="p-3 bg-indigo-50/50 hover:bg-indigo-100/70 rounded-2xl border border-indigo-100/60 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                          {st.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{st.name}</div>
                          <span className="text-[10px] text-slate-500">
                            Lớp: {st.className} | PH: {st.parentName} ({st.parentPhone})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                        Xem hồ sơ <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Danh sách các Phân hệ ERP */}
            <div className="space-y-1.5">
              <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Phân Hệ & Chức Năng ERP ({filteredModules.length})</span>
              </div>

              {filteredModules.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Không tìm thấy phân hệ nào phù hợp từ khóa &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredModules.map((item, idx) => {
                    const Icon = item.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                            : "hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`p-2 rounded-xl transition-colors ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-indigo-600"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-xs sm:text-sm flex items-center gap-2">
                              <span>{item.title}</span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  isSelected
                                    ? "bg-white/20 text-indigo-100 border-white/30"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}
                              >
                                {item.category}
                              </span>
                            </div>
                            <p
                              className={`text-[11px] mt-0.5 line-clamp-1 ${
                                isSelected ? "text-indigo-100" : "text-slate-500"
                              }`}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isSelected && (
                            <div className="flex items-center gap-1 text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg">
                              <span>Mở</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Footer Instructions */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between px-5 font-medium">
            <div className="flex items-center gap-3">
              <span>
                <strong className="text-slate-700">↑↓</strong> để di chuyển
              </span>
              <span>
                <strong className="text-slate-700">Enter</strong> để chọn
              </span>
              <span>
                <strong className="text-slate-700">ESC</strong> để thoát
              </span>
            </div>
            <div className="flex items-center gap-1 font-bold text-indigo-600">
              <Command className="w-3.5 h-3.5" /> NVSOFT Command Center
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
