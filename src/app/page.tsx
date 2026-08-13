"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Portal from "@/components/portal";
import AttendanceTab from "@/components/attendance-tab";
import VietQRModal from "@/components/vietqr-modal";
import MenuTab from "@/components/menu-tab";
import CostTab from "@/components/cost-tab";
import HealthTab from "@/components/health-tab";
import StaffTab from "@/components/staff-tab";
import ReportsTab from "@/components/reports-tab";
import FinanceTab from "@/components/finance-tab";
import EventsTab from "@/components/events-tab";
import AssetsTab from "@/components/assets-tab";
import AdmissionsTab from "@/components/admissions-tab";
import EvaluationsTab from "@/components/evaluations-tab";
import AccountsTab from "@/components/accounts-tab";
import ParentPortalTab from "@/components/parent-portal-tab";
import {
  mockStudents,
  mockWeeklyMenu,
  mockIngredients,
  Student,
  IngredientCost,
  MenuItem,
} from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
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
  X,
  Search,
  BookOpen,
  Filter,
  GraduationCap,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [weeklyMenu, setWeeklyMenu] =
    useState<Record<string, MenuItem>>(mockWeeklyMenu);
  const [ingredients, setIngredients] =
    useState<IngredientCost[]>(mockIngredients);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userRole, setUserRole] = useState<string>("ADMIN");

  // Load saved state after client mount to prevent Hydration Warning
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

    // Fetch danh sách Học Sinh & Hóa đơn trực tiếp từ CSDL PostgreSQL
    Promise.all([
      fetch("/api/students")
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/invoices")
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/ingredients")
        .then((r) => r.json())
        .catch(() => []),
    ]).then(([dbStudents, dbInvoices, dbIngredients]) => {
      if (Array.isArray(dbStudents) && dbStudents.length > 0) {
        const invoiceMap: Record<string, any> = {};
        if (Array.isArray(dbInvoices)) {
          dbInvoices.forEach((inv: any) => {
            if (!invoiceMap[inv.studentId] || inv.status === "PAID") {
              invoiceMap[inv.studentId] = inv;
            }
          });
        }

        const mapped: Student[] = dbStudents.map((st: any) => {
          const inv = invoiceMap[st.id] || {};
          return {
            id: st.id,
            name: `${st.lastName} ${st.firstName}`.trim(),
            className: st.class?.name || "Mầm 1",
            parentName: st.parentName || "Phụ huynh",
            parentPhone: st.parentPhone || "0900000000",
            tuitionStatus:
              (inv.status as "PAID" | "UNPAID" | "OVERDUE") || "UNPAID",
            amount: inv.amount || 3200000,
          };
        });
        setStudents(mapped);
      }

      if (Array.isArray(dbIngredients) && dbIngredients.length > 0) {
        const mappedIng: IngredientCost[] = dbIngredients.map((item: any) => ({
          id: item.id,
          name: item.name.replace(/\[.*?\]/, "").trim(),
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.totalCost || item.quantity * item.unitPrice,
          supplier: item.notes?.replace("Nhà cung cấp: ", "") || "Chợ đầu mối",
        }));
        setIngredients(mappedIng);
      }
    });
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("app_students", JSON.stringify(students));
    }
  }, [students, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("app_weekly_menu", JSON.stringify(weeklyMenu));
    }
  }, [weeklyMenu, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("app_ingredients", JSON.stringify(ingredients));
    }
  }, [ingredients, isMounted]);

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [selectedQRStudent, setSelectedQRStudent] = useState<Student | null>(
    null,
  );
  const [selectedStudentDetail, setSelectedStudentDetail] =
    useState<Student | null>(null);
  const [editingClass, setEditingClass] = useState<any | null>(null);

  // Class list state
  const [classList, setClassList] = useState([
    {
      id: "1",
      name: "Mầm 1",
      ageGroup: "3 - 4 tuổi",
      teacherName: "Cô Nguyễn Thị Mai",
      capacity: 25,
    },
    {
      id: "2",
      name: "Chồi 1",
      ageGroup: "4 - 5 tuổi",
      teacherName: "Cô Lê Thị Cúc",
      capacity: 28,
    },
    {
      id: "3",
      name: "Lá 1",
      ageGroup: "5 - 6 tuổi",
      teacherName: "Cô Phạm Thị Trúc",
      capacity: 30,
    },
  ]);

  // Form states
  const [newStudent, setNewStudent] = useState({
    code: "",
    name: "",
    gender: "Nam",
    birthDate: "2021-05-15",
    className: "Mầm 1",
    parentName: "",
    parentPhone: "",
    address: "",
    joinDate: new Date().toISOString().split("T")[0],
    amount: 3200000,
  });
  const [newClass, setNewClass] = useState({
    name: "",
    ageGroup: "3 - 4 tuổi",
    teacherName: "",
    capacity: 25,
  });
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: 0,
    unit: "kg",
    unitPrice: 0,
  });
  const [selectedDayMenu, setSelectedDayMenu] = useState("Thứ Hai");
  const [editMenuForm, setEditMenuForm] = useState<MenuItem>({
    breakfast: "",
    lunch: "",
    snack: "",
    cost: 35000,
  });

  // Tải danh sách Lớp học trực tiếp từ PostgreSQL Supabase
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((dbClasses) => {
        if (Array.isArray(dbClasses) && dbClasses.length > 0) {
          const mapped = dbClasses.map((c: any) => ({
            id: c.id,
            name: c.name,
            ageGroup: c.room || "3 - 4 tuổi",
            teacherName: c.teacher,
            capacity: 25,
          }));
          setClassList(mapped);
        }
      })
      .catch((err) => console.error("Lỗi tải danh sách lớp học:", err));
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name || !newClass.teacherName) return;

    try {
      const addedClass = {
        id: Date.now().toString(),
        name: newClass.name,
        ageGroup: newClass.ageGroup,
        teacherName: newClass.teacherName,
        capacity: Number(newClass.capacity) || 25,
      };

      setClassList([...classList, addedClass]);

      // Lưu trực tiếp vào Database PostgreSQL Supabase
      await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClass.name,
          teacher: newClass.teacherName,
          room: `Phòng ${newClass.name}`,
        }),
      });

      setNewClass({
        name: "",
        ageGroup: "3 - 4 tuổi",
        teacherName: "",
        capacity: 25,
      });
      setShowAddClassModal(false);
      alert(`🎉 Đã mở Lớp học mới "${newClass.name}" thành công vào Database!`);
    } catch (err) {
      console.error("Lỗi thêm lớp học mới:", err);
    }
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    try {
      setClassList(
        classList.map((c) => (c.id === editingClass.id ? editingClass : c)),
      );

      await fetch("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingClass.id,
          name: editingClass.name,
          teacher: editingClass.teacherName,
        }),
      });

      setEditingClass(null);
      alert(
        `🎉 Đã cập nhật thông tin Lớp học "${editingClass.name}" thành công!`,
      );
    } catch (err) {
      console.error("Lỗi cập nhật lớp học:", err);
    }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa Lớp học "${name}" này khỏi CSDL?`)) {
      setClassList(classList.filter((c) => c.id !== id));
      try {
        await fetch(`/api/classes?id=${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Lỗi xóa lớp học:", err);
      }
    }
  };

  // Quick stats
  const totalStudents = students.length;
  const paidCount = students.filter((s) => s.tuitionStatus === "PAID").length;
  const unpaidCount = students.filter(
    (s) => s.tuitionStatus === "UNPAID",
  ).length;
  const overdueCount = students.filter(
    (s) => s.tuitionStatus === "OVERDUE",
  ).length;

  const totalTuitionExpected = students.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );
  const totalTuitionCollected = students
    .filter((s) => s.tuitionStatus === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalIngredientsCost = ingredients.reduce(
    (acc, curr) => acc + curr.total,
    0,
  );

  // Mark tuition as paid action
  const handleMarkAsPaid = (studentId: string) => {
    setStudents(
      students.map((s) =>
        s.id === studentId ? { ...s, tuitionStatus: "PAID" } : s,
      ),
    );
  };

  // Add Student action (Lưu trực tiếp vào Supabase PostgreSQL DB)
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.parentName || !newStudent.parentPhone)
      return;

    try {
      const studentCode = newStudent.code || `HS0${students.length + 10}`;
      // 1. Thêm cục bộ giao diện
      const addedLocal: Student = {
        id: Date.now().toString(),
        code: studentCode,
        name: newStudent.name,
        gender: newStudent.gender as "Nam" | "Nữ",
        birthDate: newStudent.birthDate,
        className: newStudent.className,
        parentName: newStudent.parentName,
        parentPhone: newStudent.parentPhone,
        address: newStudent.address || "TP. Hồ Chí Minh",
        joinDate: newStudent.joinDate,
        tuitionStatus: "UNPAID",
        amount: Number(newStudent.amount) || 3200000,
      };
      setStudents([addedLocal, ...students]);

      // 2. Gọi API để lưu vào Database PostgreSQL Supabase
      await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudent.name,
          gender: newStudent.gender,
          birthDate: newStudent.birthDate,
          parentName: newStudent.parentName,
          parentPhone: newStudent.parentPhone,
          className: newStudent.className,
          address: newStudent.address,
        }),
      });

      setNewStudent({
        code: "",
        name: "",
        gender: "Nam",
        birthDate: "2021-05-15",
        className: "Mầm 1",
        parentName: "",
        parentPhone: "",
        address: "",
        joinDate: new Date().toISOString().split("T")[0],
        amount: 3200000,
      });
      setShowAddStudentModal(false);
    } catch (err) {
      console.error("Lỗi lưu học sinh vào DB:", err);
    }
  };

  // Delete Student action (Xóa khỏi Supabase PostgreSQL DB)
  const handleDeleteStudent = async (studentId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa hồ sơ học sinh này khỏi CSDL?")) {
      setStudents(students.filter((s) => s.id !== studentId));
      try {
        await fetch(`/api/students?id=${studentId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Lỗi xóa học sinh khỏi DB:", err);
      }
    }
  };

  // Add Ingredient action
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newIngredient.name ||
      newIngredient.quantity <= 0 ||
      newIngredient.unitPrice <= 0
    )
      return;

    const added: IngredientCost = {
      id: (ingredients.length + 1).toString(),
      name: newIngredient.name,
      quantity: Number(newIngredient.quantity),
      unit: newIngredient.unit,
      unitPrice: Number(newIngredient.unitPrice),
      total: Number(newIngredient.quantity) * Number(newIngredient.unitPrice),
    };

    setIngredients([...ingredients, added]);
    setNewIngredient({ name: "", quantity: 0, unit: "kg", unitPrice: 0 });
    setShowAddIngredientModal(false);
  };

  // Delete Ingredient action
  const handleDeleteIngredient = (ingredientId: string) => {
    setIngredients(ingredients.filter((item) => item.id !== ingredientId));
  };

  // Open Edit Menu Modal
  const handleOpenEditMenu = (day: string) => {
    setSelectedDayMenu(day);
    setEditMenuForm(
      weeklyMenu[day] || { breakfast: "", lunch: "", snack: "", cost: 35000 },
    );
    setShowEditMenuModal(true);
  };

  // Save Edited Menu
  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditMenuModal(false);
  };

  // Filter display students based on role (Parents only see their own children)
  const displayStudents =
    userRole === "PARENT"
      ? students.filter(
          (s) =>
            s.parentName.toLowerCase().includes("triết") ||
            s.parentName.toLowerCase().includes("nguyễn"),
        )
      : students;

  const handleExportTuitionExcel = () => {
    const headers = [
      "STT",
      "Họ và tên học sinh",
      "Lớp",
      "Tên phụ huynh",
      "Số điện thoại",
      "Trạng thái học phí",
      "Số tiền (VNĐ)",
    ];
    const statusMap = {
      PAID: "Đã đóng",
      UNPAID: "Chưa đóng",
      OVERDUE: "Trễ hạn",
    };
    const rows = displayStudents.map((st, idx) => [
      idx + 1,
      st.name,
      st.className,
      st.parentName,
      st.parentPhone,
      statusMap[st.tuitionStatus] || st.tuitionStatus,
      st.amount,
    ]);
    exportToExcel("Danh_Sach_Hoc_Phi_Hoc_Sinh", headers, rows);
  };

  const handleExportTuitionPDF = () => {
    const headers = [
      "STT",
      "Họ và tên học sinh",
      "Lớp",
      "Tên phụ huynh",
      "SĐT",
      "Trạng thái",
      "Học phí",
    ];
    const statusMap = {
      PAID: "Đã đóng",
      UNPAID: "Chưa đóng",
      OVERDUE: "Trễ hạn",
    };
    const rows = displayStudents.map((st, idx) => [
      idx + 1,
      st.name,
      st.className,
      st.parentName,
      st.parentPhone,
      statusMap[st.tuitionStatus] || st.tuitionStatus,
      formatCurrency(st.amount),
    ]);
    const summary = [
      {
        label: "Tổng số học sinh",
        value: `${displayStudents.length} học sinh`,
      },
      {
        label: "Đã hoàn thành học phí",
        value: `${paidCount}/${totalStudents} học sinh (${formatCurrency(totalTuitionCollected)})`,
      },
      {
        label: "Trễ hạn / Chưa thu",
        value: `${overdueCount + unpaidCount} học sinh`,
      },
    ];
    exportToPDF(
      "DANH SÁCH THU HỌC PHÍ VÀ CÔNG NỢ HỌC SINH",
      headers,
      rows,
      summary,
    );
  };

  const handleExportOverviewExcel = () => {
    const headers = ["Chỉ số tổng quan", "Giá trị thực tế", "Ghi chú"];
    const rows = [
      [
        "Tổng sĩ số học sinh",
        `${totalStudents} trẻ`,
        "Đang theo học tại trường",
      ],
      [
        "Học phí đã thu",
        formatCurrency(totalTuitionCollected),
        `${paidCount}/${totalStudents} trẻ đã hoàn tất`,
      ],
      [
        "Học phí chưa thu / Trễ hạn",
        formatCurrency(totalTuitionExpected - totalTuitionCollected),
        `${unpaidCount + overdueCount} trẻ chưa nộp`,
      ],
      [
        "Tổng chi phí bếp ăn",
        formatCurrency(totalIngredientsCost),
        "Đã nhập kho nguyên liệu tháng",
      ],
      [
        "Quỹ tiền mặt / Chuyển khoản dự kiến",
        formatCurrency(totalTuitionCollected - totalIngredientsCost),
        "Số dư ngân sách dự kiến",
      ],
    ];
    exportToExcel("Bao_Cao_Tong_Hop_Trang_Chu", headers, rows);
  };

  const handleExportOverviewPDF = () => {
    const headers = [
      "Chỉ số quản trị",
      "Giá trị báo cáo",
      "Chi tiết / Ghi chú",
    ];
    const rows = [
      [
        "Sĩ số học sinh chính thức",
        `${totalStudents} học sinh`,
        "100% hồ sơ học sinh",
      ],
      [
        "Học phí đã hoàn tất",
        formatCurrency(totalTuitionCollected),
        `${paidCount} trẻ (${Math.round((paidCount / (totalStudents || 1)) * 100)}%)`,
      ],
      [
        "Công nợ học phí chưa thu",
        formatCurrency(totalTuitionExpected - totalTuitionCollected),
        `${unpaidCount + overdueCount} trẻ chưa nộp`,
      ],
      [
        "Tổng chi phí kho thực phẩm bếp",
        formatCurrency(totalIngredientsCost),
        "Chi phí mua hàng thực phẩm",
      ],
      [
        "Dòng tiền thặng dư dự kiến",
        formatCurrency(totalTuitionCollected - totalIngredientsCost),
        "Tài chính hoạt động nhà trường",
      ],
    ];
    const summary = [
      { label: "Trường Mầm Non", value: "Báo cáo Tổng hợp Quản trị Hệ thống" },
      {
        label: "Ngày xuất báo cáo",
        value: new Date().toLocaleDateString("vi-VN"),
      },
      { label: "Tổng sĩ số", value: `${totalStudents} học sinh` },
    ];
    exportToPDF(
      "BÁO CÁO TỔNG HỢP TRANG CHỦ QUẢN TRỊ TRƯỜNG MẦM NON",
      headers,
      rows,
      summary,
    );
  };

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="flex h-screen bg-slate-900 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header component */}
        <Header />

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
          {/* Overview Dashboard Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Trang Chủ Quản Trị Hệ Thống
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Tổng quan thời gian thực về tài chính, sĩ số mầm non và chi
                    phí bếp ăn nhà trường.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleExportOverviewExcel}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                    title="Xuất Báo cáo tổng hợp ra file Excel"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất Excel</span>
                  </button>
                  <button
                    onClick={handleExportOverviewPDF}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                    title="In file Báo cáo tổng hợp chuẩn PDF"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In PDF Báo Cáo</span>
                  </button>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="glass-card p-5 border-l-4 border-l-indigo-600 flex items-center justify-between group">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Học Sinh Đang Học
                    </span>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">
                      {totalStudents}{" "}
                      <span className="text-xs font-bold text-slate-400">
                        trẻ
                      </span>
                    </h3>
                    <div className="text-[11px] text-indigo-600 font-bold flex items-center gap-1 mt-2 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                      <TrendingUp className="w-3.5 h-3.5" /> Sĩ số chính thức
                    </div>
                  </div>
                  <div className="bg-indigo-50/80 p-3.5 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card p-5 border-l-4 border-l-emerald-600 flex items-center justify-between group">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Học Phí Đã Thu
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {formatCurrency(totalTuitionCollected)}
                    </h3>
                    <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-2 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                      ✓{" "}
                      {totalTuitionExpected > 0
                        ? Math.round(
                            (totalTuitionCollected / totalTuitionExpected) *
                              100,
                          )
                        : 0}
                      % hoàn thành
                    </div>
                  </div>
                  <div className="bg-emerald-50/80 p-3.5 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card p-5 border-l-4 border-l-amber-500 flex items-center justify-between group">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Chi Phí Bếp Ăn
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {formatCurrency(totalIngredientsCost)}
                    </h3>
                    <div className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-2 bg-amber-50 px-2 py-0.5 rounded-md w-fit">
                      <TrendingDown className="w-3.5 h-3.5" /> Nhập kho tháng
                    </div>
                  </div>
                  <div className="bg-amber-50/80 p-3.5 rounded-2xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card p-5 border-l-4 border-l-purple-600 flex items-center justify-between group">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Tỷ Lệ Điểm Danh
                    </span>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">
                      96.8%
                    </h3>
                    <div className="text-[11px] text-purple-600 font-bold flex items-center gap-1 mt-2 bg-purple-50 px-2 py-0.5 rounded-md w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Có mặt trung bình
                    </div>
                  </div>
                  <div className="bg-purple-50/80 p-3.5 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                    <Calculator className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Secondary Layout Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Quick Menu list */}
                <div className="glass-card p-6 lg:col-span-2 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-indigo-600" /> Thực
                    đơn ngày hôm nay (Thứ Ba)
                  </h3>
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-3.5">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Bữa Sáng
                      </span>
                      <span className="text-sm font-bold text-indigo-900">
                        {weeklyMenu["Thứ Ba"]?.breakfast}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Bữa Trưa
                      </span>
                      <span className="text-sm font-bold text-indigo-900">
                        {weeklyMenu["Thứ Ba"]?.lunch}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Bữa Xế (Phụ)
                      </span>
                      <span className="text-sm font-bold text-indigo-900">
                        {weeklyMenu["Thứ Ba"]?.snack}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Tuition Progress */}
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Trạng thái Tiến độ Thu Học Phí
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">
                        Đã thu ({paidCount}/{totalStudents})
                      </span>
                      <span className="text-indigo-600 font-extrabold">
                        {formatCurrency(totalTuitionCollected)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${totalTuitionExpected > 0 ? (totalTuitionCollected / totalTuitionExpected) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                      <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-100">
                        <span className="text-rose-600 font-extrabold block text-sm">
                          {overdueCount} Trẻ
                        </span>
                        <span className="text-rose-500 text-[11px] font-semibold">
                          Trễ hạn đóng
                        </span>
                      </div>
                      <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100">
                        <span className="text-amber-700 font-extrabold block text-sm">
                          {unpaidCount} Trẻ
                        </span>
                        <span className="text-amber-600 text-[11px] font-semibold">
                          Chờ thu học phí
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tuition Management Tab */}
          {activeTab === "tuition" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {userRole === "PARENT"
                      ? "Học phí & Thanh toán VietQR cho con"
                      : "Quản lý Học phí & Thu tiền Trẻ"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {userRole === "PARENT"
                      ? "Tra cứu học phí và quét mã VietQR chuyển khoản 1-click."
                      : "Danh sách chi tiết học phí và nút xác nhận đóng tiền tức thì."}
                  </p>
                </div>
                {userRole === "ADMIN" && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={handleExportTuitionExcel}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer"
                      title="Xuất danh sách học phí ra file Excel CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Excel</span>
                    </button>
                    <button
                      onClick={handleExportTuitionPDF}
                      className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-2xs cursor-pointer"
                      title="In PDF danh sách học phí"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>In PDF</span>
                    </button>
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Thêm học sinh mới</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Student Tuition Data Table UI-UX PRO MAX */}
              <div className="table-pro-container">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-600">
                    Hiển thị{" "}
                    <strong className="text-indigo-600">
                      {displayStudents.length}
                    </strong>{" "}
                    học sinh trong danh sách
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="badge-pill badge-pill-emerald">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                      Đã thu: {paidCount}
                    </span>
                    <span className="badge-pill badge-pill-amber">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{" "}
                      Chờ thu: {unpaidCount}
                    </span>
                    <span className="badge-pill badge-pill-rose">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{" "}
                      Quá hạn: {overdueCount}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="table-pro">
                    <thead>
                      <tr>
                        <th>Học sinh</th>
                        <th>Lớp học</th>
                        <th>Phụ huynh liên hệ</th>
                        <th>Số điện thoại</th>
                        <th>Số tiền Học phí</th>
                        <th>Trạng thái</th>
                        <th className="text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-12 text-slate-400"
                          >
                            Chưa có dữ liệu học sinh nào trong danh sách.
                          </td>
                        </tr>
                      ) : (
                        displayStudents.map((student) => {
                          const initials = student.name
                            ? student.name
                                .split(" ")
                                .slice(-2)
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "HS";
                          return (
                            <tr key={student.id}>
                              <td>
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm ring-2 ring-indigo-50">
                                    {initials}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">
                                      {student.name}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      Mã: HS0{student.id.slice(-3)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-slate-200/60">
                                  Lớp {student.className}
                                </span>
                              </td>
                              <td className="font-medium text-slate-700">
                                {student.parentName}
                              </td>
                              <td className="text-slate-500 font-mono text-xs">
                                {student.parentPhone}
                              </td>
                              <td className="font-black text-slate-900">
                                {formatCurrency(student.amount)}
                              </td>
                              <td>
                                {student.tuitionStatus === "PAID" && (
                                  <span className="badge-pill badge-pill-emerald">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã
                                    đóng
                                  </span>
                                )}
                                {student.tuitionStatus === "UNPAID" && (
                                  <span className="badge-pill badge-pill-amber">
                                    <AlertTriangle className="w-3.5 h-3.5" />{" "}
                                    Chưa đóng
                                  </span>
                                )}
                                {student.tuitionStatus === "OVERDUE" && (
                                  <span className="badge-pill badge-pill-rose animate-pulse">
                                    <XCircle className="w-3.5 h-3.5" /> Trễ hạn
                                  </span>
                                )}
                              </td>
                              <td className="text-right whitespace-nowrap">
                                {student.tuitionStatus !== "PAID" && (
                                  <div className="flex items-center justify-end gap-2.5">
                                    <button
                                      onClick={() =>
                                        setSelectedQRStudent(student)
                                      }
                                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
                                    >
                                      <QrCode className="w-3.5 h-3.5" /> VietQR
                                    </button>
                                    {userRole === "ADMIN" && (
                                      <button
                                        onClick={() =>
                                          handleMarkAsPaid(student.id)
                                        }
                                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer shrink-0"
                                      >
                                        <Check className="w-3.5 h-3.5" /> Xác
                                        nhận
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Management Tab */}
          {activeTab === "attendance" && <AttendanceTab />}

          {/* Daily Menu Management Tab */}
          {activeTab === "menu" && <MenuTab />}

          {/* Ingredient Food Cost Tracking Tab */}
          {activeTab === "cost" && <CostTab />}

          {/* Health Records & Digital Diary Tab */}
          {activeTab === "health" && <HealthTab />}

          {/* Students & Classes Tab */}
          {activeTab === "students" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Thông tin Học sinh & Quản lý Lớp học
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Quản lý danh sách lớp học, giáo viên phụ trách và hồ sơ từng
                    trẻ.
                  </p>
                </div>
                {userRole === "ADMIN" && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAddClassModal(true)}
                      className="flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4 text-indigo-600" />
                      Thêm Lớp học mới
                    </button>
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10"
                    >
                      <UserPlus className="w-4 h-4" />
                      Thêm học sinh mới
                    </button>
                  </div>
                )}
              </div>

              {/* Class Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {classList.map((cls) => {
                  const studentCount = students.filter(
                    (s) =>
                      s.className.toLowerCase() === cls.name.toLowerCase() ||
                      s.className.includes(cls.name),
                  ).length;
                  return (
                    <div
                      key={cls.id}
                      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">
                            Lớp {cls.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            GV phụ trách:{" "}
                            <strong className="text-slate-700">
                              {cls.teacherName}
                            </strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full">
                            {cls.ageGroup}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingClass(cls)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Sửa lớp học"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteClass(cls.id, cls.name)
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa lớp học"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                        <span className="text-sm font-semibold text-slate-700">
                          Sĩ số:{" "}
                          <strong className="text-indigo-600">
                            {studentCount}
                          </strong>{" "}
                          / {cls.capacity} trẻ
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          Năm học 2026-2027
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Student Directory Table */}
              <div className="table-pro-container">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Danh sách Hồ sơ Trẻ theo Lớp
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Tra cứu danh sách trẻ, thông tin phụ huynh liên hệ và tình
                      trạng học phí.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                    Tổng số: {students.length} em
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="table-pro">
                    <thead>
                      <tr>
                        <th>Học sinh</th>
                        <th>Lớp học</th>
                        <th>Phụ huynh liên hệ</th>
                        <th>Số điện thoại</th>
                        <th>Trạng thái Học phí</th>
                        {userRole === "ADMIN" && (
                          <th className="text-right">Thao tác</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const initials = student.name
                          ? student.name
                              .split(" ")
                              .slice(-2)
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : "HS";
                        return (
                          <tr key={student.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm ring-2 ring-indigo-50">
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">
                                    {student.name}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    Mã: HS0{student.id.slice(-3)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="inline-block bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-indigo-100/60">
                                Lớp {student.className}
                              </span>
                            </td>
                            <td className="font-semibold text-slate-700">
                              {student.parentName}
                            </td>
                            <td className="font-mono text-xs text-slate-500">
                              {student.parentPhone}
                            </td>
                            <td>
                              {student.tuitionStatus === "PAID" && (
                                <span className="badge-pill badge-pill-emerald">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã
                                  hoàn tất
                                </span>
                              )}
                              {student.tuitionStatus === "UNPAID" && (
                                <span className="badge-pill badge-pill-amber">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Chờ
                                  thu
                                </span>
                              )}
                              {student.tuitionStatus === "OVERDUE" && (
                                <span className="badge-pill badge-pill-rose animate-pulse">
                                  <XCircle className="w-3.5 h-3.5" /> Quá hạn
                                </span>
                              )}
                            </td>
                            {userRole === "ADMIN" && (
                              <td className="text-right space-x-1">
                                <button
                                  onClick={() =>
                                    setSelectedStudentDetail(student)
                                  }
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xem hồ sơ chi tiết"
                                >
                                  <BookOpen className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteStudent(student.id)
                                  }
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa học sinh"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Staff & HR Management Tab */}
          {activeTab === "staff" && <StaffTab />}

          {/* Reports & Charts Tab */}
          {activeTab === "reports" && <ReportsTab />}

          {/* Financial Ledger Tab */}
          {activeTab === "finance" && <FinanceTab />}

          {/* Events & Announcements Tab */}
          {activeTab === "events" && <EventsTab />}

          {/* Assets & Equipment Management Tab */}
          {activeTab === "assets" && <AssetsTab />}

          {/* Admissions & Student Enrollment Pipeline Tab */}
          {activeTab === "admissions" && <AdmissionsTab />}

          {/* Account Management Tab */}
          {activeTab === "accounts" && <AccountsTab />}

          {/* Dedicated Parent Portal Tab */}
          {activeTab === "parent_portal" && <ParentPortalTab />}

          {/* Teacher Evaluations & Performance Tab */}
          {activeTab === "evaluations" && <EvaluationsTab />}
        </main>
      </div>

      {/* Add Student Modal - Premium UI */}
      {showAddStudentModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Top Ribbon Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">
                      Thêm học sinh mới
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Khai báo hồ sơ trẻ và thông tin liên hệ của phụ huynh
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleAddStudent}
                className="p-6 pt-0 space-y-4 overflow-y-auto flex-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Mã học sinh
                    </label>
                    <input
                      type="text"
                      value={newStudent.code}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, code: e.target.value })
                      }
                      placeholder="VD: HS016 (tự tạo nếu để trống)"
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Họ và tên học sinh *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudent.name}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, name: e.target.value })
                      }
                      placeholder="VD: Nguyễn Văn An..."
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Giới tính
                    </label>
                    <select
                      value={newStudent.gender}
                      onChange={(e) =>
                        setNewStudent({ ...newStudent, gender: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      <option value="Nam">👦 Nam</option>
                      <option value="Nữ">👧 Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Ngày tháng năm sinh
                    </label>
                    <input
                      type="date"
                      value={newStudent.birthDate}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          birthDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Lớp học xếp vào *
                    </label>
                    <select
                      value={newStudent.className}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          className: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      {classList.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.ageGroup})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Mức học phí cơ bản (VND)
                    </label>
                    <input
                      type="number"
                      required
                      step={100000}
                      value={newStudent.amount}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          amount: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Họ và tên Phụ huynh *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudent.parentName}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          parentName: e.target.value,
                        })
                      }
                      placeholder="VD: Nguyễn Văn Bình..."
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Số điện thoại liên hệ *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newStudent.parentPhone}
                      onChange={(e) =>
                        setNewStudent({
                          ...newStudent,
                          parentPhone: e.target.value,
                        })
                      }
                      placeholder="VD: 0912345678..."
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                    Địa chỉ thường trú / Nơi ở hiện tại
                  </label>
                  <input
                    type="text"
                    value={newStudent.address}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, address: e.target.value })
                    }
                    placeholder="VD: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM..."
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Lưu hồ sơ học sinh
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Add Class Modal - Ultra Premium UI */}
      {showAddClassModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Top Ribbon Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">
                      Thêm Lớp học mới
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mở lớp học mới, phân công giáo viên phụ trách & chỉ tiêu
                      sĩ số
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddClassModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleAddClass}
                className="p-6 pt-0 space-y-4 overflow-y-auto flex-1"
              >
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                    Tên lớp học
                  </label>
                  <input
                    type="text"
                    required
                    value={newClass.name}
                    onChange={(e) =>
                      setNewClass({ ...newClass, name: e.target.value })
                    }
                    placeholder="Ví dụ: Mầm 2, Chồi 2, Lá 2, Nhà Trẻ 1..."
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Khối độ tuổi
                    </label>
                    <select
                      value={newClass.ageGroup}
                      onChange={(e) =>
                        setNewClass({ ...newClass, ageGroup: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      <option value="18 - 36 tháng">
                        18 - 36 tháng (Nhà trẻ)
                      </option>
                      <option value="3 - 4 tuổi">3 - 4 tuổi (Khối Mầm)</option>
                      <option value="4 - 5 tuổi">4 - 5 tuổi (Khối Chồi)</option>
                      <option value="5 - 6 tuổi">5 - 6 tuổi (Khối Lá)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                      Sĩ số tối đa
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="50"
                      value={newClass.capacity}
                      onChange={(e) =>
                        setNewClass({
                          ...newClass,
                          capacity: Number(e.target.value),
                        })
                      }
                      placeholder="25"
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                    Giáo viên chủ nhiệm phụ trách
                  </label>
                  <input
                    type="text"
                    required
                    value={newClass.teacherName}
                    onChange={(e) =>
                      setNewClass({ ...newClass, teacherName: e.target.value })
                    }
                    placeholder="Ví dụ: Cô Nguyễn Thu Hà..."
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Kích hoạt mở lớp mới
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Top Ribbon Accent */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

            <div className="flex justify-between items-start p-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">
                    Cập nhật Lớp học: {editingClass.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chỉnh sửa thông tin giáo viên phụ trách và khối lớp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingClass(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleEditClass}
              className="p-6 pt-0 space-y-4 overflow-y-auto flex-1"
            >
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Tên lớp học
                </label>
                <input
                  type="text"
                  required
                  value={editingClass.name}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Giáo viên chủ nhiệm phụ trách
                </label>
                <input
                  type="text"
                  required
                  value={editingClass.teacherName}
                  onChange={(e) =>
                    setEditingClass({
                      ...editingClass,
                      teacherName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                >
                  <GraduationCap className="w-4 h-4" />
                  Lưu thay đổi lớp học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

            <div className="flex justify-between items-start p-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">
                    Nhập Thực Phẩm Mới
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bổ sung nguyên liệu vào kho thực phẩm nhà bếp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddIngredientModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddIngredient}
              className="p-6 pt-0 space-y-4 overflow-y-auto flex-1"
            >
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Tên nguyên liệu *
                </label>
                <input
                  type="text"
                  required
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                  placeholder="Ví dụ: Thịt bò, Bắp cải..."
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                    Số lượng *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    value={newIngredient.quantity || ""}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        quantity: Number(e.target.value),
                      })
                    }
                    placeholder="10"
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                    Đơn vị *
                  </label>
                  <input
                    type="text"
                    required
                    value={newIngredient.unit}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        unit: e.target.value,
                      })
                    }
                    placeholder="kg / lít..."
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Đơn giá (VND) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={newIngredient.unitPrice || ""}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      unitPrice: Number(e.target.value),
                    })
                  }
                  placeholder="80000"
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Thêm vào danh sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Modal */}
      {showEditMenuModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

            <div className="flex justify-between items-start p-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                  <Edit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">
                    Chỉnh Sửa Thực Đơn - {selectedDayMenu}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cập nhật các món ăn trong ngày cho bé
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditMenuModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveMenu}
              className="p-6 pt-0 space-y-4 overflow-y-auto flex-1"
            >
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Món ăn Bữa Sáng
                </label>
                <input
                  type="text"
                  required
                  value={editMenuForm.breakfast}
                  onChange={(e) =>
                    setEditMenuForm({
                      ...editMenuForm,
                      breakfast: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Món ăn Bữa Trưa
                </label>
                <input
                  type="text"
                  required
                  value={editMenuForm.lunch}
                  onChange={(e) =>
                    setEditMenuForm({ ...editMenuForm, lunch: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Món ăn Bữa Xế (Phụ)
                </label>
                <input
                  type="text"
                  required
                  value={editMenuForm.snack}
                  onChange={(e) =>
                    setEditMenuForm({ ...editMenuForm, snack: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Chi phí ước tính / trẻ (VND)
                </label>
                <input
                  type="number"
                  required
                  value={editMenuForm.cost}
                  onChange={(e) =>
                    setEditMenuForm({
                      ...editMenuForm,
                      cost: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Cập nhật thực đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VietQR Payment Modal */}
      {selectedQRStudent && (
        <VietQRModal
          studentName={selectedQRStudent.name}
          parentName={selectedQRStudent.parentName}
          amount={selectedQRStudent.amount}
          onClose={() => setSelectedQRStudent(null)}
          onConfirmPayment={() => {
            handleMarkAsPaid(selectedQRStudent.id);
            setSelectedQRStudent(null);
          }}
        />
      )}

      {/* FULL STUDENT PROFILE MODAL (Trang Chi Tiết Hồ Sơ Học Sinh Chuẩn demo.docx) */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />
            {/* Header Modal */}
            <div className="flex justify-between items-start p-6 pb-4 shrink-0 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  {selectedStudentDetail.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-800 text-xl">
                      {selectedStudentDetail.name}
                    </h3>
                    <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-full border border-indigo-100">
                      {selectedStudentDetail.code ||
                        `HS00${selectedStudentDetail.id}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lớp phụ trách:{" "}
                    <strong className="text-indigo-600">
                      Lớp {selectedStudentDetail.className}
                    </strong>{" "}
                    • Nhóm trẻ độc lập Ánh Bình Minh
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sections Content */}
            <div className="p-6 pt-4 space-y-6 text-sm overflow-y-auto flex-1">
              {/* Section 1: Thông tin cá nhân trẻ */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-extrabold text-indigo-700 text-xs uppercase tracking-wider">
                  I. Thông Tin Cá Nhân Của Trẻ
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Họ và tên:
                    </span>
                    <span className="font-bold text-slate-800">
                      {selectedStudentDetail.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Ngày sinh:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {selectedStudentDetail.birthDate || "15/04/2023"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Giới tính:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {selectedStudentDetail.gender || "Nam"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Dân tộc:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {selectedStudentDetail.ethnicity || "Kinh"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Quốc tịch:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {selectedStudentDetail.nationality || "Việt Nam"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Trạng thái:
                    </span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {selectedStudentDetail.status || "Đang học"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Thông tin Phụ huynh & Nghề nghiệp */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                <h4 className="font-extrabold text-indigo-700 text-xs uppercase tracking-wider">
                  II. Thông Tin Phụ Huynh Liên Hệ (Theo demo.docx)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1">
                    <span className="font-bold text-slate-800 block text-sm">
                      👨 Họ tên Cha:{" "}
                      {selectedStudentDetail.fatherName ||
                        selectedStudentDetail.parentName}
                    </span>
                    <span className="text-slate-600 block">
                      Nghề nghiệp:{" "}
                      <strong>
                        {selectedStudentDetail.fatherJob || "Kỹ sư phần mềm"}
                      </strong>
                    </span>
                    <span className="text-slate-600 block">
                      Số điện thoại:{" "}
                      <strong className="text-indigo-600 font-mono">
                        {selectedStudentDetail.parentPhone}
                      </strong>
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-indigo-100 space-y-1">
                    <span className="font-bold text-slate-800 block text-sm">
                      👩 Họ tên Mẹ:{" "}
                      {selectedStudentDetail.motherName || "Lê Thị Mai"}
                    </span>
                    <span className="text-slate-600 block">
                      Nghề nghiệp:{" "}
                      <strong>
                        {selectedStudentDetail.motherJob || "Kế toán tài chính"}
                      </strong>
                    </span>
                    <span className="text-slate-600 block">
                      Số điện thoại:{" "}
                      <strong className="text-indigo-600 font-mono">
                        {selectedStudentDetail.parentPhone}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="pt-1 text-xs">
                  <span className="text-slate-500 font-medium">
                    Địa chỉ hộ khẩu / Thường trú:{" "}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedStudentDetail.address ||
                      "123 Nguyễn Trãi, Phường 2, Quận 5, TP. Hồ Chí Minh"}
                  </span>
                </div>
              </div>

              {/* Section 3: Học phí & Miễn giảm */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                <h4 className="font-extrabold text-emerald-700 text-xs uppercase tracking-wider">
                  III. Tình Trạng Học Phí & Ưu Đãi
                </h4>
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-emerald-100">
                  <div>
                    <span className="text-slate-500 block">
                      Học phí định kỳ tháng:
                    </span>
                    <span className="font-extrabold text-slate-800 text-base">
                      3.200.000 VNĐ
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">
                      Ưu đãi miễn giảm:
                    </span>
                    <span className="font-bold text-emerald-600">
                      ✓ Giảm 10% tháng đầu + Tặng 1 Bộ đồng phục
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-xs"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
