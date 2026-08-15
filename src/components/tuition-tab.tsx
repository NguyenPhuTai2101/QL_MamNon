"use client";

import React, { useState, useEffect, useMemo } from "react";
import Portal from "@/components/portal";
import VietQRModal from "@/components/vietqr-modal";
import {
  CreditCard,
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  QrCode,
  Check,
  Download,
  Printer,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
  Utensils,
  Bus,
  BookOpen,
  Sparkles,
  Info,
  Layers,
  FileText,
  Calculator,
  RefreshCw,
  X,
  ChevronRight,
  ShieldCheck,
  Tag,
  GraduationCap,
  Building2
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { mockStudents, type Student } from "@/lib/mockData";

export type FeeType = "MONTHLY" | "DAILY" | "ONE_TIME";

export interface TuitionFeeItem {
  id: string;
  name: string;
  amount: number;
  type: FeeType;
  description?: string;
  appliedClass?: string; // "ALL" | "MAM" | "CHOI" | "LA" | "Mầm 1" ...
}

const DEFAULT_CLASS_OPTIONS = [
  { value: "ALL", label: "🏫 Toàn trường (Tất cả các lớp)" },
  { value: "MAM", label: "🍼 Khối Mầm (12 đến 36 tháng)" },
  { value: "CHOI", label: "🌱 Khối Chồi (3 đến 4 tuổi)" },
  { value: "LA", label: "🎒 Khối Lá (4 đến 6 tuổi)" },
];

export default function TuitionTab() {
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [currentSubTab, setCurrentSubTab] = useState<"invoices" | "config" | "calculator">("invoices");

  // Dữ liệu Học sinh & Hóa đơn
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedQRStudent, setSelectedQRStudent] = useState<Student | null>(null);
  const [breakdownStudent, setBreakdownStudent] = useState<Student | null>(null);

  // Dữ liệu Danh mục Cấu hình Khoản thu
  const [feeItems, setFeeItems] = useState<TuitionFeeItem[]>([]);
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [configClassFilter, setConfigClassFilter] = useState<string>("ALL");
  const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<TuitionFeeItem | null>(null);

  // Mô phỏng & Dự toán
  const [simulatedClass, setSimulatedClass] = useState<string>("MAM");
  const [standardSchoolDays, setStandardSchoolDays] = useState<number>(22);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form thêm / sửa khoản thu
  const [feeForm, setFeeForm] = useState<{
    name: string;
    amount: string;
    type: FeeType;
    description: string;
    appliedClass: string;
  }>({
    name: "",
    amount: "",
    type: "MONTHLY",
    description: "",
    appliedClass: "ALL",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  // Tải danh sách học sinh từ CSDL
  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const dbStudents = await res.json();
      if (Array.isArray(dbStudents) && dbStudents.length > 0) {
        const mapped = dbStudents.map((st: any) => {
          const inv = st.invoices && st.invoices.length > 0 ? st.invoices[0] : null;
          const className = st.class?.name || "Mầm 1";
          const breakdown = getStudentFeeBreakdown(className, standardSchoolDays);
          return {
            id: st.id,
            code: `HS0${st.id.slice(-3)}`,
            name: `${st.lastName} ${st.firstName}`.trim(),
            className: className,
            parentName: st.parentName || "Phụ huynh",
            parentPhone: st.parentPhone || "0900000000",
            tuitionStatus: inv ? inv.status : "UNPAID",
            amount: inv ? inv.amount : breakdown.totalMonthly,
          };
        });
        setStudents(mapped);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải học sinh:", err);
    }
  };

  // Tải danh sách lớp học thực tế từ CSDL
  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAvailableClasses(data.map((c: any) => c.name));
      }
    } catch (e) {}
  };

  // Tải danh sách cấu hình khoản thu từ API
  const fetchFees = async () => {
    setIsLoadingFees(true);
    try {
      const res = await fetch("/api/tuition-fees");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFeeItems(
          data.data.map((f: any) => ({
            ...f,
            appliedClass: f.appliedClass || "ALL",
          }))
        );
      }
    } catch (err) {
      console.error("Lỗi khi tải biểu phí:", err);
    } finally {
      setIsLoadingFees(false);
    }
  };

  // Danh sách các tùy chọn lớp học linh hoạt (Gồm các Khối và từng Lớp cụ thể)
  const dynamicClassOptions = useMemo(() => {
    const specificClassSet = new Set<string>();
    availableClasses.forEach((c) => specificClassSet.add(c));
    students.forEach((s) => {
      if (s.className) specificClassSet.add(s.className);
    });

    const specificOpts = Array.from(specificClassSet)
      .filter((c) => !["ALL", "MAM", "CHOI", "LA"].includes(c))
      .map((c) => ({
        value: c,
        label: `🏷️ Riêng lớp: ${c}`,
      }));

    return [...DEFAULT_CLASS_OPTIONS, ...specificOpts];
  }, [availableClasses, students]);

  useEffect(() => {
    fetchFees();
    fetchStudents();
    fetchClasses();
  }, []);

  // Hàm tính toán tổng học phí & bóc tách chi tiết theo LỚP HỌC của từng bé
  const getStudentFeeBreakdown = (studentClassName: string, schoolDays: number = 22) => {
    const cls = (studentClassName || "").toLowerCase();
    
    // Nhận diện khối lớp thông minh theo tên lớp (Mầm / Chồi / Lá / Tháng tuổi)
    const isMam =
      cls.includes("mầm") ||
      cls.includes("nhà trẻ") ||
      cls.includes("thơ") ||
      cls.includes("12") ||
      cls.includes("18") ||
      cls.includes("24") ||
      cls.includes("36") ||
      cls.includes("tháng");

    const isChoi =
      cls.includes("chồi") ||
      cls.includes("3-4") ||
      cls.includes("3 - 4") ||
      cls.includes("3 – 4") ||
      cls.includes("3-5") ||
      cls.includes("3 – 5") ||
      cls.includes("3 tuổi") ||
      cls.includes("4 tuổi");

    const isLa =
      cls.includes("lá") ||
      cls.includes("4-5") ||
      cls.includes("4 - 5") ||
      cls.includes("4 – 5") ||
      cls.includes("5-6") ||
      cls.includes("5 – 6") ||
      cls.includes("5 tuổi") ||
      cls.includes("6 tuổi") ||
      cls.includes("tiền tiểu học") ||
      cls.includes("chồi lá");

    const applicableFees = feeItems.filter((f) => {
      if (f.appliedClass === "ALL" || !f.appliedClass) return true;
      if (f.appliedClass.toLowerCase() === studentClassName.toLowerCase()) return true; // Khớp đích danh từng lớp
      if (isMam && f.appliedClass === "MAM") return true;
      if (isChoi && f.appliedClass === "CHOI") return true;
      if (isLa && f.appliedClass === "LA") return true;
      return false;
    });

    const monthlyItems: Array<{ id: string; name: string; type: FeeType; amount: number; note: string }> = [];
    const oneTimeItems: Array<{ id: string; name: string; type: FeeType; amount: number; note: string }> = [];

    applicableFees.forEach((fee) => {
      if (fee.type === "DAILY") {
        monthlyItems.push({
          id: fee.id,
          name: fee.name,
          type: fee.type,
          amount: fee.amount * schoolDays,
          note: `${schoolDays} ngày × ${formatCurrency(fee.amount)}/ngày`,
        });
      } else if (fee.type === "MONTHLY") {
        monthlyItems.push({
          id: fee.id,
          name: fee.name,
          type: fee.type,
          amount: fee.amount,
          note: "Cố định hàng tháng",
        });
      } else if (fee.type === "ONE_TIME") {
        oneTimeItems.push({
          id: fee.id,
          name: fee.name,
          type: fee.type,
          amount: fee.amount,
          note: "Thu 1 lần đầu năm học",
        });
      }
    });

    const totalMonthly = monthlyItems.reduce((sum, i) => sum + i.amount, 0);
    const totalOneTime = oneTimeItems.reduce((sum, i) => sum + i.amount, 0);

    return {
      items: [...monthlyItems, ...oneTimeItems],
      monthlyItems,
      oneTimeItems,
      totalMonthly,
      totalOneTime,
      totalAll: totalMonthly + totalOneTime,
    };
  };

  // Helper lấy số tiền học phí thực tế của học sinh (đảm bảo luôn khớp 100% với bóc tách)
  const getStudentEffectiveAmount = (student: Student) => {
    const breakdown = getStudentFeeBreakdown(student.className, standardSchoolDays);
    if (breakdown.totalMonthly > 0) return breakdown.totalMonthly;
    if (student.amount && student.amount > 0) return student.amount;
    return 3200000;
  };

  // Tự động đồng bộ số tiền học phí của học sinh theo đúng cấu hình biểu phí & số ngày học
  useEffect(() => {
    if (feeItems.length > 0 && students.length > 0) {
      setStudents((prev) =>
        prev.map((st) => {
          const breakdown = getStudentFeeBreakdown(st.className, standardSchoolDays);
          return {
            ...st,
            amount: breakdown.totalMonthly > 0 ? breakdown.totalMonthly : st.amount,
          };
        })
      );
    }
  }, [feeItems, standardSchoolDays]);

  // Lọc danh sách học sinh
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchClass = selectedClass === "ALL" || st.className.toLowerCase() === selectedClass.toLowerCase();
      const matchStatus = selectedStatus === "ALL" || st.tuitionStatus === selectedStatus;
      const matchSearch =
        st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.parentPhone.includes(searchTerm);
      return matchClass && matchStatus && matchSearch;
    });
  }, [students, selectedClass, selectedStatus, searchTerm]);

  // Thống kê hóa đơn
  const paidCount = students.filter((s) => s.tuitionStatus === "PAID").length;
  const unpaidCount = students.filter((s) => s.tuitionStatus === "UNPAID").length;
  const overdueCount = students.filter((s) => s.tuitionStatus === "OVERDUE").length;
  const totalExpectedRevenue = students.reduce((acc, s) => acc + getStudentEffectiveAmount(s), 0);
  const totalCollectedRevenue = students
    .filter((s) => s.tuitionStatus === "PAID")
    .reduce((acc, s) => acc + getStudentEffectiveAmount(s), 0);
  const totalUnpaidRevenue = students
    .filter((s) => s.tuitionStatus === "UNPAID")
    .reduce((acc, s) => acc + getStudentEffectiveAmount(s), 0);
  const totalOverdueRevenue = students
    .filter((s) => s.tuitionStatus === "OVERDUE")
    .reduce((acc, s) => acc + getStudentEffectiveAmount(s), 0);

  // Lọc danh mục khoản thu theo lớp cấu hình
  const filteredFeeItems = useMemo(() => {
    if (configClassFilter === "ALL") return feeItems;
    return feeItems.filter(
      (f) => f.appliedClass === "ALL" || f.appliedClass === configClassFilter
    );
  }, [feeItems, configClassFilter]);

  // Thao tác xác nhận đã thu
  const handleMarkAsPaid = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, tuitionStatus: "PAID" } : s))
    );
    showToast("Đã xác nhận thanh toán học phí thành công!");
  };

  // Thao tác Lưu / Sửa Khoản thu
  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeForm.name || !feeForm.amount) {
      alert("Vui lòng nhập đầy đủ tên khoản thu và số tiền!");
      return;
    }

    try {
      if (editingFee) {
        // Cập nhật
        const res = await fetch("/api/tuition-fees", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingFee.id,
            name: feeForm.name,
            amount: parseFloat(feeForm.amount),
            type: feeForm.type,
            appliedClass: feeForm.appliedClass,
            description: feeForm.description,
          }),
        });
        const result = await res.json();
        if (result.success) {
          showToast("Đã cập nhật khoản thu thành công!");
          fetchFees();
          setEditingFee(null);
          setIsAddFeeModalOpen(false);
        }
      } else {
        // Thêm mới
        const res = await fetch("/api/tuition-fees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: feeForm.name,
            amount: parseFloat(feeForm.amount),
            type: feeForm.type,
            appliedClass: feeForm.appliedClass,
            description: feeForm.description,
          }),
        });
        const result = await res.json();
        if (result.success) {
          showToast("Đã thêm khoản thu mới vào biểu phí!");
          fetchFees();
          setIsAddFeeModalOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Lỗi thao tác với CSDL.");
    }
  };

  // Xóa khoản thu
  const handleDeleteFee = async (feeId: string, feeName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khoản thu "${feeName}" khỏi biểu phí không?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/tuition-fees?id=${feeId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        showToast("Đã xóa khoản thu thành công!");
        setFeeItems((prev) => prev.filter((f) => f.id !== feeId));
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể xóa khoản thu.");
    }
  };

  // Mở modal sửa khoản thu
  const handleOpenEditFee = (fee: TuitionFeeItem) => {
    setEditingFee(fee);
    setFeeForm({
      name: fee.name,
      amount: fee.amount.toString(),
      type: fee.type,
      description: fee.description || "",
      appliedClass: fee.appliedClass || "ALL",
    });
    setIsAddFeeModalOpen(true);
  };

  // Tự động tính toán & áp dụng định mức học phí riêng cho TỪNG LỚP của học sinh
  const handleRecalculateInvoicesByClass = () => {
    setStudents((prev) =>
      prev.map((st) => {
        const breakdown = getStudentFeeBreakdown(st.className, standardSchoolDays);
        return {
          ...st,
          amount: breakdown.totalMonthly,
        };
      })
    );
    showToast(`Đã tự động tính toán lại học phí riêng biệt cho từng lớp học!`);
  };

  // Xuất Excel học phí
  const handleExportTuitionExcel = () => {
    const headers = [
      "Mã HS",
      "Họ và Tên",
      "Lớp học",
      "Phụ huynh",
      "Số điện thoại",
      "Học phí (VNĐ)",
      "Trạng thái",
    ];
    const data = filteredStudents.map((st) => [
      `HS0${st.id.slice(-3)}`,
      st.name,
      st.className,
      st.parentName,
      st.parentPhone,
      getStudentEffectiveAmount(st),
      st.tuitionStatus === "PAID"
        ? "Đã đóng"
        : st.tuitionStatus === "UNPAID"
        ? "Chưa đóng"
        : "Quá hạn",
    ]);
    exportToExcel("Danh_Sach_Thu_Hoc_Phi_Mam_Non", headers, data);
  };

  // Xuất PDF học phí
  const handleExportTuitionPDF = () => {
    const headers = [
      "Mã HS",
      "Họ và Tên",
      "Lớp",
      "Phụ huynh",
      "Học phí",
      "Trạng thái",
    ];
    const data = filteredStudents.map((st) => [
      `HS0${st.id.slice(-3)}`,
      st.name,
      st.className,
      st.parentName,
      formatCurrency(getStudentEffectiveAmount(st)),
      st.tuitionStatus === "PAID"
        ? "Đã đóng"
        : st.tuitionStatus === "UNPAID"
        ? "Chưa đóng"
        : "Quá hạn",
    ]);
    exportToPDF("BÁO CÁO THU HỌC PHÍ THEO LỚP", headers, data);
  };

  const getClassBadge = (appliedClass?: string) => {
    switch (appliedClass) {
      case "MAM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-50 text-pink-700 border border-pink-200">
            🍼 Khối Mầm (18-36T)
          </span>
        );
      case "CHOI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            🌱 Khối Chồi (3-4T)
          </span>
        );
      case "LA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
            🎒 Khối Lá (4-5T)
          </span>
        );
      case "ALL":
      case undefined:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            🏫 Toàn trường (Tất cả)
          </span>
        );
    }
  };

  const getFeeTypeBadge = (type: FeeType) => {
    switch (type) {
      case "MONTHLY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Calendar className="w-3 h-3" /> Hàng tháng
          </span>
        );
      case "DAILY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Utensils className="w-3 h-3" /> Theo ngày ăn
          </span>
        );
      case "ONE_TIME":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3 h-3" /> Thu đầu năm
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Sub-tab Navigation */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-md shadow-indigo-500/20">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {userRole === "PARENT"
                    ? "Học phí & Thanh toán VietQR cho con"
                    : "Quản lý Học phí & Biểu phí Theo Lớp"}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Hỗ trợ định mức học phí riêng biệt cho từng Khối lớp (Mầm, Chồi, Lá), tiền ăn theo ngày và quét VietQR 1-click.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-tabs switch */}
          {userRole === "ADMIN" && (
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
              <button
                onClick={() => setCurrentSubTab("invoices")}
                className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                  currentSubTab === "invoices"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <CreditCard className="w-4 h-4" />
                <span>Thu tiền & VietQR</span>
              </button>

              <button
                onClick={() => setCurrentSubTab("config")}
                className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                  currentSubTab === "config"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Settings className="w-4 h-4" />
                <span>⚙️ Cấu hình Biểu phí Lớp</span>
              </button>

              <button
                onClick={() => setCurrentSubTab("calculator")}
                className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                  currentSubTab === "calculator"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Calculator className="w-4 h-4" />
                <span>So sánh Học phí các Lớp</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: THU HỌC PHÍ & VIETQR */}
      {/* ========================================================================= */}
      {currentSubTab === "invoices" && (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tổng dự thu tháng
                </span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {formatCurrency(totalExpectedRevenue)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Số lượng: <strong className="text-slate-800">{students.length} học sinh</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Đã thu hoàn tất
                </span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-2">
                {formatCurrency(totalCollectedRevenue)}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">
                {paidCount} / {students.length} học sinh ({Math.round((paidCount / (students.length || 1)) * 100)}%)
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Chưa đóng tiền
                </span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-600 mt-2">
                {formatCurrency(totalUnpaidRevenue)}
              </div>
              <div className="text-[11px] text-amber-600 font-bold mt-1">
                {unpaidCount} học sinh chờ thu
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Quá hạn thanh toán
                </span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600 mt-2">
                {formatCurrency(totalOverdueRevenue)}
              </div>
              <div className="text-[11px] text-rose-600 font-bold mt-1">
                {overdueCount} học sinh trễ hạn
              </div>
            </div>
          </div>

          {/* Search, Filter and Actions */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm học sinh, phụ huynh, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Tất cả các lớp</option>
                <option value="Mầm 1">Lớp Mầm 1</option>
                <option value="Mầm 2">Lớp Mầm 2</option>
                <option value="Chồi 1">Lớp Chồi 1</option>
                <option value="Chồi 2">Lớp Chồi 2</option>
                <option value="Lá 1">Lớp Lá 1</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PAID">Đã đóng</option>
                <option value="UNPAID">Chưa đóng</option>
                <option value="OVERDUE">Quá hạn</option>
              </select>
            </div>

            {userRole === "ADMIN" && (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0 justify-start sm:justify-end">
                <button
                  onClick={handleRecalculateInvoicesByClass}
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex-1 sm:flex-initial cursor-pointer"
                  title="Tính toán lại toàn bộ học phí chính xác theo bảng giá từng lớp"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Áp biểu phí lớp</span>
                </button>
                <button
                  onClick={handleExportTuitionExcel}
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex-1 sm:flex-initial cursor-pointer"
                  title="Xuất danh sách ra file Excel CSV"
                >
                  <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Xuất Excel</span>
                </button>
                <button
                  onClick={handleExportTuitionPDF}
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex-1 sm:flex-initial cursor-pointer"
                  title="In PDF danh sách học phí"
                >
                  <Printer className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>In PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Student Tuition Data Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-600">
                Hiển thị <strong className="text-indigo-600">{filteredStudents.length}</strong> học sinh
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                💡 Định mức học phí được tính tự động dựa trên <strong className="text-slate-800">Biểu phí của từng Lớp</strong>.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Học sinh</th>
                    <th className="py-3.5 px-4">Lớp học</th>
                    <th className="py-3.5 px-4">Phụ huynh liên hệ</th>
                    <th className="py-3.5 px-4">Số điện thoại</th>
                    <th className="py-3.5 px-4">Tổng Học phí</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        Không tìm thấy học sinh nào phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const initials = student.name
                        ? student.name
                            .split(" ")
                            .slice(-2)
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "HS";
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm ring-2 ring-indigo-50">
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{student.name}</div>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Mã: HS0{student.id.slice(-3)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-xl text-xs border border-slate-200/60">
                              Lớp {student.className}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            {student.parentName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                            {student.parentPhone}
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                            {formatCurrency(getStudentEffectiveAmount(student))}
                          </td>
                          <td className="py-3.5 px-4">
                            {student.tuitionStatus === "PAID" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã đóng
                              </span>
                            )}
                            {student.tuitionStatus === "UNPAID" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Chưa đóng
                              </span>
                            )}
                            {student.tuitionStatus === "OVERDUE" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Quá hạn
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Nút Xem Phiếu Báo Học Phí & VietQR chuẩn mẫu */}
                              <button
                                onClick={() => setSelectedQRStudent({ ...student, amount: getStudentEffectiveAmount(student) })}
                                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all shadow-md shadow-teal-600/20 cursor-pointer"
                                title="Xem và in Phiếu Báo Học Phí kèm mã VietQR"
                              >
                                <FileText className="w-3.5 h-3.5" /> Phiếu Báo & QR
                              </button>

                              {/* Xác nhận thu */}
                              {userRole === "ADMIN" && student.tuitionStatus !== "PAID" && (
                                <button
                                  onClick={() => handleMarkAsPaid(student.id)}
                                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
                                  title="Xác nhận đã nhận tiền"
                                >
                                  <Check className="w-3.5 h-3.5" /> Thu
                                </button>
                              )}
                            </div>
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

      {/* ========================================================================= */}
      {/* SUB-TAB 2: CẤU HÌNH BIỂU PHÍ THEO LỚP (CLASS-SPECIFIC CONFIG) */}
      {/* ========================================================================= */}
      {currentSubTab === "config" && userRole === "ADMIN" && (
        <div className="space-y-6">
          {/* Class-based summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-5 rounded-3xl shadow-lg shadow-pink-500/20">
              <div className="flex items-center justify-between text-pink-100">
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Khối Mầm (18-36T)
                </span>
                <span className="p-1.5 bg-white/20 rounded-xl">🍼</span>
              </div>
              <div className="text-2xl font-black mt-2">
                {formatCurrency(
                  (feeItems.find((f) => f.appliedClass === "MAM")?.amount || 2300000)
                )}
                <span className="text-xs font-normal text-pink-100">/tháng</span>
              </div>
              <div className="text-[11px] text-pink-100 mt-1 font-medium">
                Tỷ lệ cô/trẻ cao, chăm sóc ăn ngủ đặc biệt
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-3xl shadow-lg shadow-amber-500/20">
              <div className="flex items-center justify-between text-amber-100">
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Khối Chồi (3-4T)
                </span>
                <span className="p-1.5 bg-white/20 rounded-xl">🌱</span>
              </div>
              <div className="text-2xl font-black mt-2">
                {formatCurrency(
                  (feeItems.find((f) => f.appliedClass === "CHOI")?.amount || 2000000)
                )}
                <span className="text-xs font-normal text-amber-100">/tháng</span>
              </div>
              <div className="text-[11px] text-amber-100 mt-1 font-medium">
                Phát triển ngôn ngữ & Vận động tinh/thô
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-3xl shadow-lg shadow-emerald-500/20">
              <div className="flex items-center justify-between text-emerald-100">
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Khối Lá (4-5T)
                </span>
                <span className="p-1.5 bg-white/20 rounded-xl">🌿</span>
              </div>
              <div className="text-2xl font-black mt-2">
                {formatCurrency(
                  (feeItems.find((f) => f.appliedClass === "LA")?.amount || 2100000)
                )}
                <span className="text-xs font-normal text-emerald-100">/tháng</span>
              </div>
              <div className="text-[11px] text-emerald-100 mt-1 font-medium">
                Tiền tiểu học, rèn chữ và tư duy toán học
              </div>
            </div>
          </div>

          {/* Fee Management List & Actions */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Danh mục Biểu phí Các Lớp</span>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full">
                    {filteredFeeItems.length} mục
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thiết lập từng khoản thu riêng cho Khối Mầm, Khối Chồi, Khối Lá hoặc khoản thu chung toàn trường.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Lọc theo lớp trên bảng cấu hình */}
                <select
                  value={configClassFilter}
                  onChange={(e) => setConfigClassFilter(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">Xem tất cả các lớp</option>
                  {dynamicClassOptions
                    .filter((opt) => opt.value !== "ALL")
                    .map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                </select>

                <button
                  onClick={handleRecalculateInvoicesByClass}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                  title="Cập nhật lại toàn bộ hóa đơn của từng bé theo đúng lớp"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Áp dụng vào Hóa đơn</span>
                </button>

                <button
                  onClick={() => {
                    setEditingFee(null);
                    setFeeForm({
                      name: "",
                      amount: "",
                      type: "MONTHLY",
                      description: "",
                      appliedClass: "ALL",
                    });
                    setIsAddFeeModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Khoản thu mới</span>
                </button>
              </div>
            </div>

            {/* Fee Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Tên khoản thu</th>
                    <th className="py-3 px-4">Áp dụng cho</th>
                    <th className="py-3 px-4">Loại kỳ thu</th>
                    <th className="py-3 px-4">Đơn giá định mức</th>
                    <th className="py-3 px-4">Mô tả quyền lợi</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredFeeItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        Chưa có khoản thu nào phù hợp bộ lọc lớp này.
                      </td>
                    </tr>
                  ) : (
                    filteredFeeItems.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                              {fee.type === "MONTHLY" ? <Calendar className="w-4 h-4" /> : fee.type === "DAILY" ? <Utensils className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            </div>
                            <span>{fee.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getClassBadge(fee.appliedClass)}
                        </td>
                        <td className="py-3.5 px-4">
                          {getFeeTypeBadge(fee.type)}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          {formatCurrency(fee.amount)}
                          {fee.type === "DAILY" && <span className="text-[11px] font-normal text-slate-500"> /ngày</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-md">
                          {fee.description || <span className="text-slate-400 italic">Chưa có mô tả</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditFee(fee)}
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                              title="Chỉnh sửa khoản thu"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFee(fee.id, fee.name)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Xóa khoản thu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: DỰ TOÁN & SO SÁNH HỌC PHÍ CÁC LỚP */}
      {/* ========================================================================= */}
      {currentSubTab === "calculator" && userRole === "ADMIN" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>Bảng So Sánh Dự Toán Học Phí Từng Khối Lớp</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Xem chi tiết cơ cấu học phí tự động cho Khối Mầm, Khối Chồi và Khối Lá khi thay đổi số ngày ăn bán trú thực tế.
            </p>

            {/* Selector Khối lớp mô phỏng */}
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Chọn khối lớp để xem mô phỏng:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSimulatedClass("MAM")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                    simulatedClass === "MAM"
                      ? "bg-pink-600 text-white shadow-md shadow-pink-600/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  🍼 Khối Mầm (18-36T)
                </button>
                <button
                  onClick={() => setSimulatedClass("CHOI")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                    simulatedClass === "CHOI"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  🌱 Khối Chồi (3-4T)
                </button>
                <button
                  onClick={() => setSimulatedClass("LA")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                    simulatedClass === "LA"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  🌿 Khối Lá (4-5T)
                </button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-bold text-slate-600">Số ngày ăn thực tế:</span>
                <input
                  type="number"
                  min={0}
                  max={31}
                  value={standardSchoolDays}
                  onChange={(e) => setStandardSchoolDays(parseInt(e.target.value) || 0)}
                  className="w-16 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center"
                />
                <span className="text-xs text-slate-500">ngày</span>
              </div>
            </div>

            {/* Bảng bóc tách theo khối lớp đã chọn */}
            <div className="mt-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-black text-slate-900 text-sm uppercase">
                  Khoản thu áp dụng cho {simulatedClass === "MAM" ? "Khối Mầm" : simulatedClass === "CHOI" ? "Khối Chồi" : "Khối Lá"}
                </span>
                <span className="font-black text-slate-900 text-sm uppercase">Định mức tính tháng</span>
              </div>

              <div className="divide-y divide-slate-200/60 text-xs mt-2">
                {getStudentFeeBreakdown(
                  simulatedClass === "MAM" ? "Mầm 1" : simulatedClass === "CHOI" ? "Chồi 1" : "Lá 1",
                  standardSchoolDays
                ).items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.type === "ONE_TIME" && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            1 lần/năm
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{item.note}</span>
                    </div>
                    <div className="font-black text-slate-900 text-sm">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t-2 border-slate-900 flex items-center justify-between mt-4">
                <div>
                  <span className="text-sm font-black text-slate-900 uppercase">
                    Tổng Học Phí Tháng Cần Thu ({simulatedClass === "MAM" ? "Khối Mầm" : simulatedClass === "CHOI" ? "Khối Chồi" : "Khối Lá"}):
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Bao gồm học phí riêng của khối + {standardSchoolDays} ngày tiền ăn + các môn năng khiếu/ngoại khóa tương ứng.
                  </p>
                </div>
                <div className="text-2xl font-black text-indigo-600">
                  {formatCurrency(
                    getStudentFeeBreakdown(
                      simulatedClass === "MAM" ? "Mầm 1" : simulatedClass === "CHOI" ? "Chồi 1" : "Lá 1",
                      standardSchoolDays
                    ).totalMonthly
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: THÊM / SỬA KHOẢN THU (ADD/EDIT FEE MODAL) */}
      {/* ========================================================================= */}
      {isAddFeeModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingFee ? "Chỉnh sửa Khoản thu" : "Thêm Khoản thu Mới"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddFeeModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFee} className="space-y-4 mt-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tên khoản thu / dịch vụ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Học phí Khối Mầm, Tiền ăn, Tiếng Anh Cambridge..."
                    value={feeForm.name}
                    onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Áp dụng cho Lớp / Khối lớp <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={feeForm.appliedClass}
                    onChange={(e) => setFeeForm({ ...feeForm, appliedClass: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {dynamicClassOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Số tiền định mức (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1000}
                      placeholder="VD: 2300000 hoặc 45000"
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Loại kỳ thu <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={feeForm.type}
                      onChange={(e) => setFeeForm({ ...feeForm, type: e.target.value as FeeType })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="MONTHLY">Hàng tháng (MONTHLY)</option>
                      <option value="DAILY">Theo ngày thực tế (DAILY)</option>
                      <option value="ONE_TIME">Đóng 1 lần / Năm (ONE_TIME)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mô tả / Quyền lợi áp dụng
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả số buổi/tuần, tỷ lệ chăm sóc hoặc đối tượng..."
                    value={feeForm.description}
                    onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddFeeModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    {editingFee ? "Lưu thay đổi" : "Thêm khoản thu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BÓC TÁCH CHI TIẾT HÓA ĐƠN HỌC SINH THEO LỚP (BREAKDOWN MODAL) */}
      {/* ========================================================================= */}
      {breakdownStudent && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      Bóc tách Học phí: {breakdownStudent.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Lớp: <strong className="text-slate-800">{breakdownStudent.className}</strong> | Phụ huynh: {breakdownStudent.parentName} ({breakdownStudent.parentPhone})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBreakdownStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                    <span className="font-extrabold text-slate-700 uppercase">Hạng mục thu tháng ({breakdownStudent.className})</span>
                    <span className="font-extrabold text-slate-700 uppercase">Thành tiền</span>
                  </div>

                  {/* Danh sách các khoản thu định kỳ tháng */}
                  {(() => {
                    const breakdown = getStudentFeeBreakdown(breakdownStudent.className, standardSchoolDays);
                    return (
                      <>
                        <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
                          {breakdown.monthlyItems.length === 0 ? (
                            <p className="text-slate-400 text-center py-2">Chưa cấu hình khoản thu tháng nào cho lớp này.</p>
                          ) : (
                            breakdown.monthlyItems.map((item, idx) => (
                              <div key={item.id || idx} className="flex justify-between items-center py-1">
                                <div>
                                  <div className="font-bold text-slate-800">{idx + 1}. {item.name}</div>
                                  <span className="text-[10px] text-slate-400">{item.note}</span>
                                </div>
                                <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                              </div>
                            ))
                          )}

                          {/* Khoản thu 1 lần (nếu có) */}
                          {breakdown.oneTimeItems.length > 0 && (
                            <div className="pt-2 mt-2 border-t border-dashed border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Khoản thu 1 lần đầu năm (Tham khảo):</span>
                              {breakdown.oneTimeItems.map((item, idx) => (
                                <div key={item.id || idx} className="flex justify-between items-center py-1 text-slate-500">
                                  <div>
                                    <div className="font-medium">{item.name}</div>
                                    <span className="text-[10px] text-slate-400">{item.note}</span>
                                  </div>
                                  <span className="font-semibold">{formatCurrency(item.amount)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center">
                          <div>
                            <span className="font-black text-slate-900 text-sm">TỔNG HỌC PHÍ THÁNG CẦN THU:</span>
                            <p className="text-[10px] text-slate-500">Trùng khớp 100% với số tiền trên danh sách & mã VietQR</p>
                          </div>
                          <span className="font-black text-indigo-600 text-base">
                            {formatCurrency(breakdown.totalMonthly)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Trạng thái thanh toán:</span>
                  {breakdownStudent.tuitionStatus === "PAID" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã thanh toán
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Chưa thanh toán
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const st = breakdownStudent;
                      setBreakdownStudent(null);
                      setSelectedQRStudent(st);
                    }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Quét VietQR
                  </button>
                  <button
                    onClick={() => setBreakdownStudent(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* VietQR / Phiếu Báo Học Phí Modal */}
      {selectedQRStudent && (() => {
        const breakdown = getStudentFeeBreakdown(selectedQRStudent.className, standardSchoolDays);
        const baseTuition = breakdown.monthlyItems.find(i => i.name.toLowerCase().includes("học phí"))?.amount || 1620000;
        const semiBoarding = breakdown.monthlyItems.find(i => i.name.toLowerCase().includes("bán trú"))?.amount || 400000;
        const mealFee = breakdown.monthlyItems.find(i => i.name.toLowerCase().includes("ăn"))?.amount || 780000;
        const facilityFee = breakdown.oneTimeItems.find(i => i.name.toLowerCase().includes("csvc") || i.name.toLowerCase().includes("cơ sở"))?.amount || 0;
        const mathLogic = breakdown.monthlyItems.find(i => i.name.toLowerCase().includes("toán"))?.amount || 0;
        const english = breakdown.monthlyItems.find(i => i.name.toLowerCase().includes("anh") || i.name.toLowerCase().includes("tiếng anh"))?.amount || 0;
        const rhythmDance = breakdown.monthlyItems.find(i => i.name.toLowerCase().includes("nhịp") || i.name.toLowerCase().includes("múa"))?.amount || 0;
        const discountPercent = 10;
        const discountAmount = Math.round(baseTuition * (discountPercent / 100));
        const total = baseTuition + semiBoarding + mealFee + facilityFee + mathLogic + english + rhythmDance - discountAmount;

        const detailedBreakdown = {
          baseTuition,
          semiBoarding,
          mealFee,
          facilityFee,
          mathLogic,
          english,
          rhythmDance,
          leaveDays: 0,
          refundMealFee: 0,
          discountAmount,
          discountPercent,
        };

        return (
          <VietQRModal
            studentName={selectedQRStudent.name}
            className={selectedQRStudent.className}
            parentName={selectedQRStudent.parentName}
            amount={total}
            month={8}
            year={2025}
            issueDate="03/08/2026"
            invoiceId={`HP-${selectedQRStudent.id.slice(-4)}`}
            breakdown={detailedBreakdown}
            onClose={() => setSelectedQRStudent(null)}
            onConfirmPayment={() => {
              handleMarkAsPaid(selectedQRStudent.id);
              setSelectedQRStudent(null);
            }}
          />
        );
      })()}
    </div>
  );
}
