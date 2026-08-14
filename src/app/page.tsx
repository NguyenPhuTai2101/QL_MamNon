"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import CommandPalette from "@/components/command-palette";

// 16 ERP Modular Components
import OverviewTab from "@/components/overview-tab";
import StudentsTab from "@/components/students-tab";
import AttendanceTab from "@/components/attendance-tab";
import HealthTab from "@/components/health-tab";
import MenuTab from "@/components/menu-tab";
import TuitionTab from "@/components/tuition-tab";
import FinanceTab from "@/components/finance-tab";
import CostTab from "@/components/cost-tab";
import StaffTab from "@/components/staff-tab";
import AdmissionsTab from "@/components/admissions-tab";
import AssetsTab from "@/components/assets-tab";
import EvaluationsTab from "@/components/evaluations-tab";
import ReportsTab from "@/components/reports-tab";
import EventsTab from "@/components/events-tab";
import AccountsTab from "@/components/accounts-tab";
import ParentPortalTab from "@/components/parent-portal-tab";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  // Kiểm tra phiên đăng nhập và phân quyền
  useEffect(() => {
    setIsMounted(true);
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(session);
      if (parsed.role) {
        setUserRole(parsed.role);
        if (parsed.role === "PARENT") {
          setActiveTab("parent_portal");
        }
      }
      setIsAuthenticated(true);
    } catch (e) {
      router.push("/login");
      return;
    }

    // Tải danh sách học sinh phục vụ Command Palette
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStudentsList(
            data.map((st: any) => ({
              id: st.id,
              name: `${st.lastName} ${st.firstName}`.trim(),
              className: st.class?.name || "Mầm 1",
              parentName: st.parentName || "Phụ huynh",
              parentPhone: st.parentPhone || "0900000000",
            }))
          );
        }
      })
      .catch(() => {});
  }, [router]);

  // Lắng nghe phím tắt toàn cầu Ctrl + K hoặc Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-extrabold text-slate-300">
          Đang khởi tạo hệ thống NVSOFT ERP...
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100/70 overflow-hidden font-sans select-none">
      {/* 1. ERP Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* 2. Main ERP Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Global ERP Header */}
        <Header
          activeTab={activeTab}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Dynamic ERP Module Tab Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 no-scrollbar">
          {/* I. ĐIỀU HÀNH & BÁO CÁO */}
          {activeTab === "overview" && (
            <OverviewTab onNavigateTab={setActiveTab} userRole={userRole} />
          )}
          {activeTab === "reports" && <ReportsTab />}

          {/* II. ĐÀO TẠO & HỌC SINH */}
          {activeTab === "students" && <StudentsTab />}
          {activeTab === "attendance" && <AttendanceTab />}
          {activeTab === "health" && <HealthTab />}
          {activeTab === "menu" && <MenuTab />}

          {/* III. TÀI CHÍNH & HỌC PHÍ */}
          {activeTab === "tuition" && <TuitionTab />}
          {activeTab === "finance" && <FinanceTab />}
          {activeTab === "cost" && <CostTab />}

          {/* IV. NHÂN SỰ & HÀNH CHÍNH */}
          {activeTab === "staff" && <StaffTab />}
          {activeTab === "admissions" && <AdmissionsTab />}
          {activeTab === "assets" && <AssetsTab />}
          {activeTab === "evaluations" && <EvaluationsTab />}

          {/* V. HỆ THỐNG & DỊCH VỤ */}
          {activeTab === "events" && <EventsTab />}
          {activeTab === "accounts" && <AccountsTab />}
          {activeTab === "parent_portal" && <ParentPortalTab />}
        </main>
      </div>

      {/* 3. Global Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        students={studentsList}
        userRole={userRole}
      />
    </div>
  );
}
