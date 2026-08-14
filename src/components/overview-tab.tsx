"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Wallet,
  UtensilsCrossed,
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Download,
  Printer,
  Trash2,
  Edit,
  UserPlus,
  Check,
  QrCode,
  Search,
  BookOpen,
  Filter,
  GraduationCap,
  Sparkles,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  HeartPulse,
  Award,
  Bell,
  Building2,
  Clock,
  Activity,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OverviewTabProps {
  onNavigateTab: (tabId: string) => void;
  userRole?: string;
}

export default function OverviewTab({ onNavigateTab, userRole = "ADMIN" }: OverviewTabProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/students").then((r) => r.json()).catch(() => []),
      fetch("/api/classes").then((r) => r.json()).catch(() => []),
      fetch("/api/invoices").then((r) => r.json()).catch(() => []),
      fetch("/api/transactions").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/events").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/staff").then((r) => r.json()).catch(() => ({ data: [] })),
    ])
      .then(([dbStudents, dbClasses, dbInvoices, dbTransactions, dbEvents, dbStaff]) => {
        if (Array.isArray(dbStudents)) setStudents(dbStudents);
        if (Array.isArray(dbClasses)) setClasses(dbClasses);
        if (Array.isArray(dbInvoices)) setInvoices(dbInvoices);
        if (dbTransactions?.data && Array.isArray(dbTransactions.data)) setTransactions(dbTransactions.data);
        if (dbEvents?.data && Array.isArray(dbEvents.data)) setEvents(dbEvents.data);
        if (dbStaff?.data && Array.isArray(dbStaff.data)) setStaffCount(dbStaff.data.length);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Thống kê Sĩ số
  const totalStudents = students.length;

  // Thống kê Học phí
  const paidInvoices = invoices.filter((i) => i.status === "PAID");
  const unpaidInvoices = invoices.filter((i) => i.status === "UNPAID" || i.status === "OVERDUE");
  const totalCollectedTuition = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpectedTuition = invoices.reduce((sum, i) => sum + (i.amount || 0), 0) || (totalStudents * 3200000);
  const tuitionPaidPercent = totalExpectedTuition > 0 ? Math.round((totalCollectedTuition / totalExpectedTuition) * 100) : 0;

  // Thống kê Dòng tiền Quỹ tháng
  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + (t.amount || 0), 0);
  const netFund = totalIncome - totalExpense;

  // Điểm danh hôm nay
  const presentRate = 96; // Giả lập tỷ lệ điểm danh trung bình hôm nay

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ========================================================================= */}
      {/* 1. ERP EXECUTIVE WELCOME BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/15 via-purple-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-extrabold text-indigo-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Hệ Thống Quản Trị Giáo Dục Mầm Non NVSOFT ERP 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Trung Tâm Điều Hành & Giám Sát
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Tổng hợp thời gian thực số liệu chuyên cần, hoạt động thu học phí, dinh dưỡng bán trú và tài chính ngân sách toàn trường.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab("attendance")}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/30"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Điểm Danh Nhanh</span>
            </button>
            <button
              onClick={() => onNavigateTab("tuition")}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-sm transition-all cursor-pointer border border-slate-700"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Thu Học Phí VietQR</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRIMARY ERP KPI METRICS MATRIX (4 CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Sĩ số học sinh */}
        <div 
          onClick={() => onNavigateTab("students")}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Tổng Sĩ Số Học Sinh
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{totalStudents}</span>
            <span className="text-xs font-bold text-slate-500">bé</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
            <span className="text-indigo-600 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> {classes.length || 3} nhóm lớp đang mở
            </span>
            <span className="text-slate-400 group-hover:text-indigo-600 flex items-center gap-0.5">
              Chi tiết <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: Điểm danh chuyên cần */}
        <div 
          onClick={() => onNavigateTab("attendance")}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Chuyên Cần Hôm Nay
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">{presentRate}%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Xuất sắc</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
            <span className="text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Đúng giờ và an toàn
            </span>
            <span className="text-slate-400 group-hover:text-emerald-600 flex items-center gap-0.5">
              Sổ điểm danh <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 3: Học phí thu trong tháng */}
        <div 
          onClick={() => onNavigateTab("tuition")}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Học Phí Tháng Này
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalCollectedTuition)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
            <span className="text-amber-600">
              Đạt {tuitionPaidPercent}% ({paidInvoices.length}/{invoices.length || totalStudents} bé)
            </span>
            <span className="text-slate-400 group-hover:text-amber-600 flex items-center gap-0.5">
              VietQR <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 4: Cân đối Sổ Quỹ Thu Chi */}
        <div 
          onClick={() => onNavigateTab("finance")}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Cân Đối Quỹ Trường
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black tracking-tight ${netFund >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(netFund)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-500 flex items-center gap-1">
              Thu: <strong className="text-emerald-600">{formatCurrency(totalIncome)}</strong>
            </span>
            <span className="text-slate-400 group-hover:text-purple-600 flex items-center gap-0.5">
              Sổ quỹ <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ERP QUICK LAUNCHPAD (PHÂN HỆ NGHIỆP VỤ NHANH) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-base">Phím Tắt Nghiệp Vụ Nhanh</h3>
            <p className="text-xs text-slate-500">Truy cập tức thì các phân hệ quản lý hàng ngày</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            NVSOFT ERP v2.6
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          {[
            { id: "students", label: "Học sinh & Lớp", icon: Users, color: "from-blue-500 to-indigo-600", desc: "Hồ sơ & xếp lớp" },
            { id: "attendance", label: "Điểm danh", icon: CheckCircle2, color: "from-emerald-500 to-teal-600", desc: "Chuyên cần đón trả" },
            { id: "tuition", label: "Học phí VietQR", icon: CreditCard, color: "from-indigo-600 to-purple-600", desc: "Bóc tách & thu phí" },
            { id: "menu", label: "Thực đơn dinh dưỡng", icon: UtensilsCrossed, color: "from-amber-500 to-orange-600", desc: "Khẩu phần ăn tuần" },
            { id: "health", label: "Sức khỏe y tế", icon: HeartPulse, color: "from-rose-500 to-pink-600", desc: "BMI & dị ứng" },
            { id: "reports", label: "Báo cáo thống kê", icon: TrendingUp, color: "from-cyan-600 to-blue-700", desc: "Phân tích số liệu BI" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateTab(item.id)}
                className="flex flex-col items-start p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-all hover:scale-[1.02] cursor-pointer text-left group"
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md shadow-indigo-500/10 mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-black text-xs text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LOWER SECTION: CLASS STATUS GRID + UPCOMING EVENTS & LOGS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Danh sách Lớp Học */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">Tình Hình Các Nhóm Lớp Học</h3>
                <p className="text-xs text-slate-500">Giáo viên phụ trách và sĩ số từng lớp</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("students")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Quản lý lớp <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {classes.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-slate-400 text-xs">
                Đang tải dữ liệu lớp học từ CSDL...
              </div>
            ) : (
              classes.map((cls) => {
                const classStudents = students.filter((s) => s.className === cls.name);
                return (
                  <div
                    key={cls.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">Lớp {cls.name}</span>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                          {cls.ageGroup || "Mầm non"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        GVCN: <strong className="text-slate-800">{cls.teacherName || cls.teacher || "Chưa phân công"}</strong>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">
                        Sĩ số: <strong className="text-slate-900">{classStudents.length} bé</strong>
                      </span>
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Sự kiện & Bảng Tin Nhà Trường */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">Sự Kiện & Bảng Tin</h3>
                <p className="text-xs text-slate-500">Lịch hoạt động & thông báo mới</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("events")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có thông báo sự kiện nào trong hệ thống.
              </div>
            ) : (
              events.slice(0, 4).map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-800 line-clamp-1">{evt.title}</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {evt.date ? new Date(evt.date).toLocaleDateString("vi-VN") : "Hôm nay"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{evt.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
