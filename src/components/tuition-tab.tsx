"use client";

import React, { useState, useEffect, useMemo } from "react";
import Portal from "@/components/portal";
import VietQRModal from "@/components/vietqr-modal";
import {
  CreditCard,
  Plus,
  Search,
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
  Sparkles,
  Layers,
  FileText,
  RefreshCw,
  X,
  ShieldCheck,
  Settings2,
  BookOpen,
  Palette,
  Package,
  Phone,
  User,
  ChevronRight,
  Filter,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { type Student } from "@/lib/mockData";
import {
  type FeeType,
  type TuitionFeeItem,
  type StudentFeeBreakdown,
  getStudentFeeBreakdown as calcFeeBreakdown,
  getStudentEffectiveAmount as calcEffectiveAmount,
  getVietQRBreakdownDetails,
  saveInvoicePaymentToDB,
  isElectiveSubject,
  buildCustomStudentBreakdown,
  parseInvoiceBreakdown,
} from "@/lib/tuitionUtils";

const DEFAULT_CLASS_OPTIONS = [
  { value: "ALL", label: "🏫 Toàn trường (Tất cả các lớp)" },
  { value: "MAM", label: "🍼 Khối Mầm (12 đến 36 tháng)" },
  { value: "CHOI", label: "🌱 Khối Chồi (3 đến 4 tuổi)" },
  { value: "LA", label: "🎒 Khối Lá (4 đến 6 tuổi)" },
];

export function getFeeCategory(fee: TuitionFeeItem): {
  key: "TUITION" | "MEALS" | "TALENT" | "SERVICES" | "ONE_TIME";
  label: string;
  badgeClass: string;
  icon: string;
} {
  const name = (fee.name || "").toLowerCase();
  if (fee.type === "ONE_TIME") {
    return { key: "ONE_TIME", label: "Thu đầu năm", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "🎒" };
  }
  if (name.includes("học phí")) {
    return { key: "TUITION", label: "Học phí khối", badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: "🏫" };
  }
  if (name.includes("ăn") || fee.type === "DAILY") {
    return { key: "MEALS", label: "Tiền ăn bán trú", badgeClass: "bg-amber-50 text-amber-700 border-amber-200", icon: "🍲" };
  }
  if (name.includes("xe") || name.includes("đưa đón") || name.includes("ngoài giờ") || name.includes("trông")) {
    return { key: "SERVICES", label: "Dịch vụ tiện ích", badgeClass: "bg-teal-50 text-teal-700 border-teal-200", icon: "🚌" };
  }
  if (isElectiveSubject(fee)) {
    return { key: "TALENT", label: "Môn năng khiếu", badgeClass: "bg-purple-50 text-purple-700 border-purple-200", icon: "🎨" };
  }
  return { key: "TUITION", label: "Khoản thu khác", badgeClass: "bg-slate-100 text-slate-700 border-slate-200", icon: "📌" };
}

export default function TuitionTab() {
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [mainTab, setMainTab] = useState<"students" | "catalog">("students");

  // Dữ liệu Học sinh & Biểu phí
  const [students, setStudents] = useState<Student[]>([]);
  const [feeItems, setFeeItems] = useState<TuitionFeeItem[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bộ lọc Tab Học sinh
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Bộ lọc Tab Danh mục
  const [catalogCategory, setCatalogCategory] = useState<string>("ALL");
  const [catalogSearch, setCatalogSearch] = useState<string>("");

  // Modals
  const [selectedQRStudent, setSelectedQRStudent] = useState<Student | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<{
    selectedFeeIds: string[];
    schoolDays: number;
    discountPercent: number;
    notes: string;
  }>({
    selectedFeeIds: [],
    schoolDays: 22,
    discountPercent: 0,
    notes: "",
  });

  // Modal Thêm / Sửa Biểu phí
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<TuitionFeeItem | null>(null);
  const [feeForm, setFeeForm] = useState<{
    name: string;
    amount: string;
    type: FeeType;
    appliedClass: string;
    description: string;
    isActive: boolean;
  }>({
    name: "",
    amount: "",
    type: "MONTHLY",
    appliedClass: "ALL",
    description: "",
    isActive: true,
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

  // Tải dữ liệu toàn bộ từ CSDL
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resFees, resClasses, resStudents] = await Promise.all([
        fetch("/api/tuition-fees").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/classes").then((r) => r.json()).catch(() => []),
        fetch("/api/students").then((r) => r.json()).catch(() => []),
      ]);

      const loadedFees: TuitionFeeItem[] =
        resFees?.success && Array.isArray(resFees.data)
          ? resFees.data.map((f: any) => ({
              ...f,
              appliedClass: f.appliedClass || "ALL",
              isActive: f.isActive !== undefined ? f.isActive : true,
            }))
          : [];
      setFeeItems(loadedFees);

      if (Array.isArray(resClasses)) {
        setAvailableClasses(resClasses.map((c: any) => c.name));
      }

      if (Array.isArray(resStudents)) {
        const mapped = resStudents.map((st: any) => {
          const inv = st.invoices && st.invoices.length > 0 ? st.invoices[0] : null;
          const className = st.class?.name || "Mầm 1";
          const effAmount = calcEffectiveAmount({ className, invoice: inv }, loadedFees, 22);
          const parsedBreakdown = parseInvoiceBreakdown(inv);

          return {
            id: st.id,
            code: `HS0${st.id.slice(-3)}`,
            name: `${st.lastName} ${st.firstName}`.trim(),
            className: className,
            parentName: st.parentName || "Phụ huynh",
            parentPhone: st.parentPhone || "0900000000",
            tuitionStatus: (inv?.status as any) || "UNPAID",
            amount: effAmount,
            discountPercent: parsedBreakdown?.discountPercent || 0,
            invoice: inv,
          };
        });
        setStudents(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper tính toán bóc tách & số tiền của học sinh
  const getStudentFeeBreakdown = (studentClassName: string, schoolDays: number = 22, invoice?: any) => {
    return calcFeeBreakdown(studentClassName, feeItems, schoolDays, invoice);
  };

  const getStudentEffectiveAmount = (student: Student) => {
    return calcEffectiveAmount(student, feeItems, 22);
  };

  // Lọc danh sách học sinh
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchClass = selectedClass === "ALL" || st.className.toLowerCase() === selectedClass.toLowerCase();
      const matchStatus = selectedStatus === "ALL" || st.tuitionStatus === selectedStatus;
      const matchSearch =
        searchTerm === "" ||
        st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.parentPhone.includes(searchTerm);
      return matchClass && matchStatus && matchSearch;
    });
  }, [students, selectedClass, selectedStatus, searchTerm]);

  // Thống kê nhanh
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
  const collectionRate = totalExpectedRevenue > 0 ? Math.round((totalCollectedRevenue / totalExpectedRevenue) * 100) : 0;

  // Lọc danh mục biểu phí
  const filteredCatalog = useMemo(() => {
    return feeItems.filter((f) => {
      const cat = getFeeCategory(f).key;
      const matchCat = catalogCategory === "ALL" || cat === catalogCategory;
      const matchSearch =
        catalogSearch === "" ||
        f.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(catalogSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [feeItems, catalogCategory, catalogSearch]);

  // Mở All-in-One Modal chỉnh sửa học phí học sinh
  const handleOpenStudentEdit = (student: Student) => {
    const parsed = parseInvoiceBreakdown(student.invoice);
    const defaultElectives = feeItems
      .filter((f) => isElectiveSubject(f) && (f.appliedClass === "ALL" || !f.appliedClass))
      .map((f) => f.id);

    setSelectedStudentForEdit(student);
    setEditForm({
      selectedFeeIds: parsed?.selectedFeeIds && parsed.selectedFeeIds.length > 0 ? parsed.selectedFeeIds : defaultElectives,
      schoolDays: parsed?.schoolDays || 22,
      discountPercent: parsed?.discountPercent || student.discountPercent || 0,
      notes: parsed?.notes || "",
    });
  };

  // Toggle môn năng khiếu
  const handleToggleElective = (feeId: string) => {
    setEditForm((prev) => ({
      ...prev,
      selectedFeeIds: prev.selectedFeeIds.includes(feeId)
        ? prev.selectedFeeIds.filter((id) => id !== feeId)
        : [...prev.selectedFeeIds, feeId],
    }));
  };

  // Lưu cấu hình học phí cho học sinh
  const handleSaveStudentConfig = async () => {
    if (!selectedStudentForEdit) return;

    const breakdown = buildCustomStudentBreakdown({
      className: selectedStudentForEdit.className,
      feeItems,
      selectedFeeIds: editForm.selectedFeeIds,
      schoolDays: editForm.schoolDays,
      discountPercent: editForm.discountPercent,
      notes: editForm.notes,
    });

    const newAmount = breakdown.totalMonthly;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudentForEdit.id
          ? {
              ...s,
              amount: newAmount,
              discountPercent: editForm.discountPercent,
              invoice: {
                ...(s.invoice || {}),
                amount: newAmount,
                breakdownJson: JSON.stringify(breakdown),
              },
            }
          : s
      )
    );

    const res = await saveInvoicePaymentToDB({
      studentId: selectedStudentForEdit.id,
      status: selectedStudentForEdit.tuitionStatus || "UNPAID",
      amount: newAmount,
      breakdownJson: JSON.stringify(breakdown),
    });

    if (res.success) {
      showToast(`Đã lưu học phí & môn học cho bé ${selectedStudentForEdit.name}!`);
      setSelectedStudentForEdit(null);
    } else {
      showToast(res.error || "Lỗi khi lưu dữ liệu");
    }
  };

  // Thu tiền nhanh / Đổi trạng thái thanh toán
  const handleTogglePaymentStatus = async (studentId: string, nextStatus: "PAID" | "UNPAID") => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const effAmount = getStudentEffectiveAmount(student);
    const breakdown = getStudentFeeBreakdown(student.className, 22, student.invoice);

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, tuitionStatus: nextStatus, amount: effAmount } : s))
    );

    if (selectedStudentForEdit && selectedStudentForEdit.id === studentId) {
      setSelectedStudentForEdit((prev) => (prev ? { ...prev, tuitionStatus: nextStatus } : null));
    }

    showToast(nextStatus === "PAID" ? "Đã ghi nhận thu học phí thành công!" : "Đã chuyển trạng thái sang Chưa đóng!");

    await saveInvoicePaymentToDB({
      studentId,
      status: nextStatus,
      amount: effAmount,
      paymentMethod: nextStatus === "PAID" ? "CASH" : undefined,
      breakdownJson: JSON.stringify(breakdown),
    });
  };

  // Lưu / Sửa Khoản Thu Biểu Phí
  const handleSaveFeeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeForm.name || !feeForm.amount) {
      alert("Vui lòng nhập đầy đủ tên khoản thu và đơn giá!");
      return;
    }

    try {
      if (editingFee) {
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
            isActive: feeForm.isActive,
          }),
        });
        if (res.ok) {
          showToast("Đã cập nhật khoản thu thành công!");
          loadData();
          setIsFeeModalOpen(false);
          setEditingFee(null);
        }
      } else {
        const res = await fetch("/api/tuition-fees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: feeForm.name,
            amount: parseFloat(feeForm.amount),
            type: feeForm.type,
            appliedClass: feeForm.appliedClass,
            description: feeForm.description,
            isActive: feeForm.isActive,
          }),
        });
        if (res.ok) {
          showToast("Đã thêm khoản thu mới!");
          loadData();
          setIsFeeModalOpen(false);
        }
      }
    } catch (e) {
      showToast("Lỗi khi lưu vào CSDL");
    }
  };

  // Toggle trạng thái áp dụng biểu phí
  const handleToggleFeeActive = async (fee: TuitionFeeItem) => {
    const nextActive = fee.isActive === false ? true : false;
    try {
      const res = await fetch("/api/tuition-fees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fee.id, isActive: nextActive }),
      });
      if (res.ok) {
        showToast(`Đã ${nextActive ? "kích hoạt" : "tạm dừng"} mục "${fee.name}"!`);
        loadData();
      }
    } catch (e) {}
  };

  // Xóa khoản thu
  const handleDeleteFee = async (fee: TuitionFeeItem) => {
    if (!confirm(`Bạn có chắc muốn xóa "${fee.name}" khỏi danh mục biểu phí không?`)) return;
    try {
      const res = await fetch(`/api/tuition-fees?id=${fee.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Đã xóa khoản thu thành công!");
        loadData();
      }
    } catch (e) {}
  };

  // Mở modal sửa biểu phí
  const handleOpenEditFee = (fee: TuitionFeeItem) => {
    setEditingFee(fee);
    setFeeForm({
      name: fee.name,
      amount: fee.amount.toString(),
      type: fee.type,
      appliedClass: fee.appliedClass || "ALL",
      description: fee.description || "",
      isActive: fee.isActive !== false,
    });
    setIsFeeModalOpen(true);
  };

  // Đồng bộ lại toàn bộ học phí vào CSDL
  const handleSyncAllInvoices = async () => {
    const batch = students.map((st) => {
      const breakdown = getStudentFeeBreakdown(st.className, 22, st.invoice);
      return {
        studentId: st.id,
        amount: breakdown.totalMonthly,
        status: st.tuitionStatus || "UNPAID",
        breakdownJson: JSON.stringify(breakdown),
      };
    });

    try {
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });
      showToast("Đã đồng bộ toàn bộ học phí các bé vào CSDL!");
      loadData();
    } catch (e) {
      showToast("Lỗi đồng bộ CSDL");
    }
  };

  // Xuất Excel
  const handleExportExcel = () => {
    const headers = ["Mã HS", "Họ và Tên", "Lớp", "Phụ huynh", "Số ĐT", "Học phí tháng (VNĐ)", "Trạng thái"];
    const data = filteredStudents.map((st) => [
      st.code || `HS0${st.id.slice(-3)}`,
      st.name,
      st.className,
      st.parentName,
      st.parentPhone,
      getStudentEffectiveAmount(st),
      st.tuitionStatus === "PAID" ? "Đã đóng" : st.tuitionStatus === "UNPAID" ? "Chưa đóng" : "Quá hạn",
    ]);
    exportToExcel("Danh_Sach_Thu_Hoc_Phi_Mam_Non", headers, data);
  };

  // Xuất PDF
  const handleExportPDF = () => {
    const headers = ["Mã HS", "Họ và Tên", "Lớp", "Phụ huynh", "Học phí", "Trạng thái"];
    const data = filteredStudents.map((st) => [
      st.code || `HS0${st.id.slice(-3)}`,
      st.name,
      st.className,
      st.parentName,
      formatCurrency(getStudentEffectiveAmount(st)),
      st.tuitionStatus === "PAID" ? "Đã đóng" : st.tuitionStatus === "UNPAID" ? "Chưa đóng" : "Quá hạn",
    ]);
    exportToPDF("BÁO CÁO THU HỌC PHÍ HỌC SINH", headers, data);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-12">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Tab Switcher - Responsive Layout */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Quản Lý Học Phí & Biểu Phí
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">
                Bóc tách chi phí học sinh, thu phí tự động VietQR và biểu phí toàn trường.
              </p>
            </div>
          </div>

          {/* 2 Tabs Chuyển đổi linh hoạt */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setMainTab("students")}
              className={cn(
                "flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                mainTab === "students"
                  ? "bg-white text-indigo-700 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">Thu Học Phí</span>
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-50 text-indigo-700 font-extrabold hidden sm:inline-block">
                {students.length}
              </span>
            </button>

            <button
              onClick={() => setMainTab("catalog")}
              className={cn(
                "flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                mainTab === "catalog"
                  ? "bg-white text-purple-700 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Layers className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="truncate">Biểu Phí & Dịch Vụ</span>
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-purple-50 text-purple-700 font-extrabold hidden sm:inline-block">
                {feeItems.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: THU HỌC PHÍ & HỌC SINH */}
      {/* ========================================================================= */}
      {mainTab === "students" && (
        <div className="space-y-4 sm:space-y-6">
          {/* 4 Thẻ KPI Tinh Gọn - 2x2 Grid trên Mobile, 4 Cols trên Desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Tổng Dự Thu */}
            <div className="glass-card p-3.5 sm:p-5 flex flex-col justify-between border-l-4 border-l-indigo-600">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Tổng Dự Thu
                </span>
                <div className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <DollarSign className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base sm:text-2xl font-black text-slate-900 truncate">
                  {formatCurrency(totalExpectedRevenue)}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                  Toàn trường: <strong className="text-slate-800">{students.length}</strong> bé
                </div>
              </div>
            </div>

            {/* Card 2: Đã Thu Tiền */}
            <div className="glass-card p-3.5 sm:p-5 flex flex-col justify-between border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                  Đã Thu Tiền
                </span>
                <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base sm:text-2xl font-black text-emerald-600 truncate">
                  {formatCurrency(totalCollectedRevenue)}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">{paidCount}/{students.length} bé</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    {collectionRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Chưa Thu (Còn Nợ) */}
            <div className="glass-card p-3.5 sm:p-5 flex flex-col justify-between border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-700">
                  Chưa Thu
                </span>
                <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base sm:text-2xl font-black text-amber-600 truncate">
                  {formatCurrency(totalUnpaidRevenue)}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                  Còn lại: <strong className="text-amber-700 font-bold">{unpaidCount}</strong> bé
                </div>
              </div>
            </div>

            {/* Card 4: Quá Hạn */}
            <div className="glass-card p-3.5 sm:p-5 flex flex-col justify-between border-l-4 border-l-rose-500">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-rose-700">
                  Quá Hạn
                </span>
                <div className="p-1.5 sm:p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <XCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-base sm:text-2xl font-black text-rose-600">
                  {overdueCount} <span className="text-xs font-medium text-slate-500">học sinh</span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-rose-600 font-medium mt-0.5 truncate">
                  Cần gửi nhắc phí
                </div>
              </div>
            </div>
          </div>

          {/* Thanh Tìm Kiếm, Lọc & Thao Tác - Responsive Toolbar */}
          <div className="glass-card p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Cụm Tìm kiếm & Dropdowns */}
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên học sinh, phụ huynh, SĐT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">🏫 Tất cả các lớp</option>
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>
                        Lớp {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">📋 Tất cả trạng thái</option>
                    <option value="PAID">✅ Đã đóng</option>
                    <option value="UNPAID">⏳ Chưa đóng</option>
                    <option value="OVERDUE">⚠️ Quá hạn</option>
                  </select>
                </div>
              </div>

              {/* Cụm Nút Xuất Báo Cáo & Đồng Bộ */}
              <div className="flex items-center gap-1.5 sm:gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  onClick={handleSyncAllInvoices}
                  className="flex-1 sm:flex-none h-8.5 sm:h-9 px-3 inline-flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Đồng bộ lại toàn bộ học phí vào CSDL"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đồng bộ</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex-1 sm:flex-none h-8.5 sm:h-9 px-3 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Xuất file Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex-1 sm:flex-none h-8.5 sm:h-9 px-3 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="In báo cáo PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>In PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PRESENTATION 1: MOBILE CARD LIST (< md / 768px) */}
          {/* ========================================================= */}
          <div className="block md:hidden space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="glass-card py-12 text-center text-slate-400 text-xs font-medium">
                Không tìm thấy học sinh nào phù hợp bộ lọc.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const initials = student.name
                  ? student.name.split(" ").slice(-2).map((n) => n[0]).join("").toUpperCase()
                  : "HS";
                const breakdown = getStudentFeeBreakdown(student.className, 22, student.invoice);
                const electiveItems = breakdown.monthlyItems.filter((i) => i.isElective);
                const effectiveAmount = getStudentEffectiveAmount(student);

                return (
                  <div
                    key={student.id}
                    className="glass-card p-4 space-y-3 border-l-4 transition-all"
                    style={{
                      borderLeftColor:
                        student.tuitionStatus === "PAID"
                          ? "#10b981"
                          : student.tuitionStatus === "OVERDUE"
                          ? "#f43f5e"
                          : "#f59e0b",
                    }}
                  >
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm ring-2 ring-indigo-50 shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {student.code || `HS0${student.id.slice(-3)}`}
                            </span>
                            <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-0.2 rounded-md text-[10px]">
                              Lớp {student.className}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div>
                        {student.tuitionStatus === "PAID" && (
                          <span className="badge-pill badge-pill-emerald text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Đã đóng
                          </span>
                        )}
                        {student.tuitionStatus === "UNPAID" && (
                          <span className="badge-pill badge-pill-amber text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> Chưa đóng
                          </span>
                        )}
                        {student.tuitionStatus === "OVERDUE" && (
                          <span className="badge-pill badge-pill-rose text-[10px]">
                            <XCircle className="w-3 h-3" /> Quá hạn
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Info: Số tiền & Phụ huynh */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Tổng Học Phí Tháng
                        </span>
                        <div className="font-black text-indigo-700 text-base mt-0.5">
                          {formatCurrency(effectiveAmount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Phụ Huynh
                        </span>
                        <div className="font-medium text-slate-800 truncate mt-0.5">{student.parentName}</div>
                        {student.parentPhone && (
                          <a
                            href={`tel:${student.parentPhone}`}
                            className="text-[11px] text-indigo-600 font-mono font-bold flex items-center gap-1 hover:underline"
                          >
                            <Phone className="w-2.5 h-2.5" /> {student.parentPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Electives Summary */}
                    {electiveItems.length > 0 ? (
                      <button
                        onClick={() => handleOpenStudentEdit(student)}
                        className="w-full py-1.5 px-2.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>{electiveItems.length} môn năng khiếu & dịch vụ</span>
                        </span>
                        <span className="text-[11px] text-purple-600 font-black">
                          +{formatCurrency(electiveItems.reduce((sum, i) => sum + i.amount, 0))}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenStudentEdit(student)}
                        className="w-full py-1 px-2 text-[11px] text-slate-400 hover:text-purple-600 font-medium text-center hover:bg-slate-50 rounded-lg transition-colors border border-dashed border-slate-200"
                      >
                        + Bấm để đăng ký môn năng khiếu / dịch vụ
                      </button>
                    )}

                    {/* Action Buttons: 1-Thumb Mobile Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() =>
                          setSelectedQRStudent({ ...student, amount: effectiveAmount })
                        }
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-[11px] py-2 rounded-xl font-bold shadow-sm cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>VietQR</span>
                      </button>

                      <button
                        onClick={() => handleOpenStudentEdit(student)}
                        className="flex items-center justify-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-[11px] py-2 rounded-xl font-bold cursor-pointer hover:bg-purple-100"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>Bóc tách</span>
                      </button>

                      {student.tuitionStatus !== "PAID" ? (
                        <button
                          onClick={() => handleTogglePaymentStatus(student.id, "PAID")}
                          className="flex items-center justify-center gap-1 bg-emerald-600 text-white text-[11px] py-2 rounded-xl font-bold shadow-sm cursor-pointer hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Thu tiền</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTogglePaymentStatus(student.id, "UNPAID")}
                          className="flex items-center justify-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 text-[11px] py-2 rounded-xl font-bold cursor-pointer hover:bg-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Hủy thu</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ========================================================= */}
          {/* PRESENTATION 2: DESKTOP DATA TABLE (>= md / 768px) */}
          {/* ========================================================= */}
          <div className="hidden md:block table-pro-container">
            <div className="overflow-x-auto">
              <table className="table-pro">
                <thead>
                  <tr>
                    <th>Học sinh</th>
                    <th>Lớp học</th>
                    <th>Môn Năng Khiếu & Dịch Vụ</th>
                    <th>Phụ huynh liên hệ</th>
                    <th>Tổng Học Phí</th>
                    <th>Trạng thái</th>
                    <th className="text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                        Không tìm thấy học sinh nào phù hợp với bộ lọc.
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

                      const breakdown = getStudentFeeBreakdown(student.className, 22, student.invoice);
                      const electiveItems = breakdown.monthlyItems.filter((i) => i.isElective);
                      const effectiveAmount = getStudentEffectiveAmount(student);

                      return (
                        <tr key={student.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm ring-2 ring-indigo-50 shrink-0">
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{student.name}</div>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {student.code || `HS0${student.id.slice(-3)}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-slate-200/60">
                              Lớp {student.className}
                            </span>
                          </td>

                          <td>
                            {electiveItems.length > 0 ? (
                              <button
                                onClick={() => handleOpenStudentEdit(student)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 hover:bg-purple-100 hover:border-purple-300 transition-all cursor-pointer shadow-2xs group"
                                title={`Danh sách môn & dịch vụ đã đăng ký:\n${electiveItems.map((i) => `• ${i.name}: ${formatCurrency(i.amount)}`).join("\n")}`}
                              >
                                <Sparkles className="w-3.5 h-3.5 text-purple-600 group-hover:rotate-12 transition-transform" />
                                <span>{electiveItems.length} môn & dịch vụ</span>
                                <span className="text-[10px] text-purple-500 font-medium">
                                  (+{formatCurrency(electiveItems.reduce((sum, i) => sum + i.amount, 0))})
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenStudentEdit(student)}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-purple-600 font-medium px-2 py-0.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                                title="Bấm để đăng ký môn năng khiếu hoặc dịch vụ"
                              >
                                <span>Chuẩn lớp</span>
                                <span className="text-[10px] text-slate-300 group-hover:text-purple-400">+ Thêm môn</span>
                              </button>
                            )}
                          </td>

                          <td>
                            <div className="font-medium text-slate-800">{student.parentName}</div>
                            <span className="text-[11px] text-slate-400 font-mono">{student.parentPhone}</span>
                          </td>

                          <td className="font-black text-slate-900 text-sm">
                            {formatCurrency(effectiveAmount)}
                          </td>

                          <td>
                            {student.tuitionStatus === "PAID" && (
                              <span className="badge-pill badge-pill-emerald">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đã đóng
                              </span>
                            )}
                            {student.tuitionStatus === "UNPAID" && (
                              <span className="badge-pill badge-pill-amber">
                                <AlertTriangle className="w-3.5 h-3.5" /> Chưa đóng
                              </span>
                            )}
                            {student.tuitionStatus === "OVERDUE" && (
                              <span className="badge-pill badge-pill-rose">
                                <XCircle className="w-3.5 h-3.5" /> Quá hạn
                              </span>
                            )}
                          </td>

                          <td className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. Phiếu Báo & QR */}
                              <button
                                onClick={() =>
                                  setSelectedQRStudent({ ...student, amount: effectiveAmount })
                                }
                                className="inline-flex items-center gap-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer shrink-0"
                                title="Xem và in Phiếu Báo Học Phí kèm mã VietQR"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Phiếu Báo & QR</span>
                              </button>

                              {/* 2. Cài đặt môn & Bóc tách */}
                              <button
                                onClick={() => handleOpenStudentEdit(student)}
                                className="inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0"
                                title="Đăng ký môn năng khiếu, số ngày ăn và xem bóc tách chi tiết"
                              >
                                <Settings2 className="w-3.5 h-3.5 text-purple-600" />
                                <span>Cài đặt & Bóc tách</span>
                              </button>

                              {/* 3. Nút Thu nhanh 1-click */}
                              {student.tuitionStatus !== "PAID" ? (
                                <button
                                  onClick={() => handleTogglePaymentStatus(student.id, "PAID")}
                                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer shrink-0"
                                  title="Xác nhận đã thu tiền"
                                >
                                  <Check className="w-3.5 h-3.5" /> Thu
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleTogglePaymentStatus(student.id, "UNPAID")}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                                  title="Hủy trạng thái đã đóng"
                                >
                                  <X className="w-3.5 h-3.5" />
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
      {/* TAB 2: DANH MỤC BIỂU PHÍ & DỊCH VỤ */}
      {/* ========================================================================= */}
      {mainTab === "catalog" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Header & Add Button */}
          <div className="glass-card p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Bảng Giá Học Phí & Danh Mục Dịch Vụ</span>
                  <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200/60">
                    {filteredCatalog.length} mục
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Quản lý đơn giá các môn năng khiếu, tiền ăn, xe đưa đón và học phí chính khóa toàn trường.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingFee(null);
                  setFeeForm({
                    name: "",
                    amount: "",
                    type: "MONTHLY",
                    appliedClass: "ALL",
                    description: "",
                    isActive: true,
                  });
                  setIsFeeModalOpen(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Khoản Thu / Dịch Vụ Mới</span>
              </button>
            </div>

            {/* Filter Pills with Horizontal Scroll on Mobile & Search Input */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {[
                  { key: "ALL", label: "Tất cả" },
                  { key: "TALENT", label: "🎨 Môn Năng khiếu" },
                  { key: "SERVICES", label: "🚌 Dịch vụ Tiện ích" },
                  { key: "TUITION", label: "🏫 Học phí Khối" },
                  { key: "MEALS", label: "🍲 Tiền ăn" },
                  { key: "ONE_TIME", label: "🎒 Thu đầu năm" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setCatalogCategory(tab.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                      catalogCategory === tab.key
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm khoản thu..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Catalog Mobile Cards View (< md) */}
            <div className="block md:hidden space-y-3 pt-2">
              {filteredCatalog.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  Chưa có khoản thu nào phù hợp.
                </div>
              ) : (
                filteredCatalog.map((fee) => {
                  const category = getFeeCategory(fee);
                  const isActive = fee.isActive !== false;

                  return (
                    <div
                      key={fee.id}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all space-y-2.5",
                        isActive ? "bg-white border-slate-200" : "bg-slate-50/70 border-slate-200/60 opacity-70"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{fee.name}</span>
                            <span className={cn("inline-block px-2 py-0.2 rounded-md text-[10px] font-bold border mt-0.5", category.badgeClass)}>
                              {category.label}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleFeeActive(fee)}
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0",
                            isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-slate-400")} />
                          {isActive ? "Áp dụng" : "Tạm dừng"}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Đơn giá định mức</span>
                          <span className="font-black text-slate-900 text-sm">
                            {formatCurrency(fee.amount)}
                            {fee.type === "DAILY" && <span className="text-[10px] font-normal text-slate-500">/ngày</span>}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Phạm vi</span>
                          <span className="text-slate-700 font-medium truncate block">
                            {fee.appliedClass === "ALL" || !fee.appliedClass ? "Toàn trường" : `Khối/Lớp: ${fee.appliedClass}`}
                          </span>
                        </div>
                      </div>

                      {fee.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">{fee.description}</p>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleOpenEditFee(fee)}
                          className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteFee(fee)}
                          className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl hover:bg-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Catalog Desktop Table (>= md) */}
            <div className="hidden md:block overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Tên khoản thu / Dịch vụ</th>
                    <th className="py-3 px-4">Phân loại</th>
                    <th className="py-3 px-4">Phạm vi áp dụng</th>
                    <th className="py-3 px-4">Kỳ thu</th>
                    <th className="py-3 px-4">Đơn giá định mức</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Mô tả</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCatalog.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        Chưa có mục nào phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredCatalog.map((fee) => {
                      const category = getFeeCategory(fee);
                      const isActive = fee.isActive !== false;

                      return (
                        <tr key={fee.id} className={cn("hover:bg-slate-50/80 transition-colors", !isActive && "opacity-60 bg-slate-50/30")}>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{category.icon}</span>
                              <div>
                                <span className="block">{fee.name}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border", category.badgeClass)}>
                              {category.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-slate-700 font-medium">
                              {fee.appliedClass === "ALL" || !fee.appliedClass ? "Toàn trường" : `Khối/Lớp: ${fee.appliedClass}`}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-slate-600">
                              {fee.type === "MONTHLY" ? "Hàng tháng" : fee.type === "DAILY" ? "Theo ngày ăn" : "Thu 1 lần đầu năm"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                            {formatCurrency(fee.amount)}
                            {fee.type === "DAILY" && <span className="text-[10px] font-normal text-slate-500">/ngày</span>}
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleFeeActive(fee)}
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer border",
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              )}
                              title="Bấm để bật / tắt áp dụng"
                            >
                              <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-slate-400")} />
                              <span>{isActive ? "Đang áp dụng" : "Tạm dừng"}</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                            {fee.description || <span className="text-slate-400 italic text-[11px]">Chưa có mô tả</span>}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditFee(fee)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                                title="Chỉnh sửa khoản thu"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFee(fee)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Xóa khoản thu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
      {/* ALL-IN-ONE MODAL: CÀI ĐẶT MÔN NĂNG KHIẾU & BÓC TÁCH HỌC SINH */}
      {/* ========================================================================= */}
      {selectedStudentForEdit && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-fadeIn max-h-[92vh] flex flex-col overflow-hidden">
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-lg shadow-purple-600/20 shrink-0">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg leading-tight">
                      Hồ Sơ Học Phí & Đăng Ký Môn
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Bé: <strong className="text-slate-900">{selectedStudentForEdit.name}</strong> | Lớp: <strong className="text-purple-700">{selectedStudentForEdit.className}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentForEdit(null)}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body: Scrollable area with 2 columns layout */}
              <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Cột Trái (7 cols): Chọn môn & Cài đặt */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">
                        1. Đăng ký Môn Năng Khiếu & Dịch Vụ:
                      </span>
                      <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                        {feeItems
                          .filter((f) => isElectiveSubject(f) || getFeeCategory(f).key === "SERVICES" || getFeeCategory(f).key === "TALENT")
                          .map((fee) => {
                            const isSelected = editForm.selectedFeeIds.includes(fee.id);
                            return (
                              <div
                                key={fee.id}
                                onClick={() => handleToggleElective(fee.id)}
                                className={cn(
                                  "p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between select-none",
                                  isSelected
                                    ? "border-purple-600 bg-purple-50/60 shadow-xs"
                                    : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                                )}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={cn(
                                    "w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0",
                                    isSelected ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 bg-white"
                                  )}>
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 text-xs block">{fee.name}</span>
                                    {fee.description && (
                                      <span className="text-[10px] text-slate-500 line-clamp-1">{fee.description}</span>
                                    )}
                                  </div>
                                </div>
                                <span className="font-extrabold text-purple-700 text-xs shrink-0 ml-2">
                                  +{formatCurrency(fee.amount)}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Ngày ăn & Miễn giảm */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Số ngày ăn bán trú:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={editForm.schoolDays}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                schoolDays: parseInt(e.target.value) || 22,
                              }))
                            }
                            className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                          />
                          <span className="text-[11px] text-slate-500">ngày</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Miễn giảm / Học bổng:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editForm.discountPercent}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                discountPercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                              }))
                            }
                            className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                          />
                          <span className="text-[11px] text-slate-500">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cột Phải (5 cols): Bóc tách thời gian thực */}
                  <div className="md:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50 p-4 rounded-3xl border border-slate-200/80">
                    {(() => {
                      const preview = buildCustomStudentBreakdown({
                        className: selectedStudentForEdit.className,
                        feeItems,
                        selectedFeeIds: editForm.selectedFeeIds,
                        schoolDays: editForm.schoolDays,
                        discountPercent: editForm.discountPercent,
                        notes: editForm.notes,
                      });

                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-500 uppercase">Khoản mục</span>
                            <span className="text-xs font-bold text-slate-500 uppercase">Số tiền</span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            {preview.monthlyItems.map((item, idx) => (
                              <div key={item.id || idx} className="flex justify-between items-center text-slate-700">
                                <span className="truncate pr-2 font-medium">
                                  {item.name} {item.isElective && <strong className="text-purple-600">(Tự chọn)</strong>}
                                </span>
                                <span className="font-bold text-slate-900 shrink-0">{formatCurrency(item.amount)}</span>
                              </div>
                            ))}

                            {preview.discountAmount && preview.discountAmount > 0 ? (
                              <div className="flex justify-between items-center text-rose-600 font-bold pt-1 border-t border-dashed border-slate-200">
                                <span>Miễn giảm ({preview.discountPercent}%):</span>
                                <span>-{formatCurrency(preview.discountAmount)}</span>
                              </div>
                            ) : null}
                          </div>

                          <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center">
                            <span className="font-black text-slate-900 text-xs uppercase">TỔNG HỌC PHÍ:</span>
                            <span className="font-black text-indigo-700 text-base">
                              {formatCurrency(preview.totalMonthly)}
                            </span>
                          </div>

                          <div className="p-2.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Trạng thái:</span>
                            {selectedStudentForEdit.tuitionStatus === "PAID" ? (
                              <button
                                onClick={() => handleTogglePaymentStatus(selectedStudentForEdit.id, "UNPAID")}
                                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Đã đóng (Bấm đổi)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleTogglePaymentStatus(selectedStudentForEdit.id, "PAID")}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Chưa đóng (Bấm thu)
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForEdit(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveStudentConfig}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: THÊM / SỬA KHOẢN THU TRONG DANH MỤC */}
      {/* ========================================================================= */}
      {isFeeModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {editingFee ? "Chỉnh Sửa Khoản Thu" : "Thêm Khoản Thu / Dịch Vụ"}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Thiết lập đơn giá cho toàn trường hoặc từng khối
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFeeModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFeeItem} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên khoản thu / Dịch vụ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Tiếng Anh Cambridge, Nhịp điệu, Xe đưa đón..."
                    value={feeForm.name}
                    onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Đơn giá (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      placeholder="VD: 450000"
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Kỳ thu <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={feeForm.type}
                      onChange={(e) => setFeeForm({ ...feeForm, type: e.target.value as FeeType })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="MONTHLY">Hàng tháng</option>
                      <option value="DAILY">Theo ngày ăn</option>
                      <option value="ONE_TIME">Thu 1 lần đầu năm</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phạm vi áp dụng</label>
                  <select
                    value={feeForm.appliedClass}
                    onChange={(e) => setFeeForm({ ...feeForm, appliedClass: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                  >
                    {DEFAULT_CLASS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                    {availableClasses.map((c) => (
                      <option key={c} value={c}>
                        🏷️ Riêng lớp: {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái áp dụng</label>
                  <select
                    value={feeForm.isActive ? "true" : "false"}
                    onChange={(e) => setFeeForm({ ...feeForm, isActive: e.target.value === "true" })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="true">Đang áp dụng (Active)</option>
                    <option value="false">Tạm dừng (Inactive)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mô tả quyền lợi</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú chi tiết..."
                    value={feeForm.description}
                    onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFeeModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    {editingFee ? "Cập Nhật" : "Lưu Khoản Thu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIETQR / PHIẾU BÁO HỌC PHÍ CHUẨN TECHCOMBANK */}
      {/* ========================================================================= */}
      {selectedQRStudent && (() => {
        const studentAmount = getStudentEffectiveAmount(selectedQRStudent);
        const detailedBreakdown = getVietQRBreakdownDetails(
          selectedQRStudent.className,
          feeItems,
          22,
          studentAmount,
          selectedQRStudent.invoice
        );

        return (
          <VietQRModal
            studentName={selectedQRStudent.name}
            className={selectedQRStudent.className}
            parentName={selectedQRStudent.parentName}
            amount={studentAmount}
            month={new Date().getMonth() + 1}
            year={new Date().getFullYear()}
            issueDate={new Date().toLocaleDateString("vi-VN")}
            invoiceId={`HP-${selectedQRStudent.id.slice(-4)}`}
            breakdown={detailedBreakdown}
            onClose={() => setSelectedQRStudent(null)}
            onConfirmPayment={() => {
              handleTogglePaymentStatus(selectedQRStudent.id, "PAID");
              setSelectedQRStudent(null);
            }}
          />
        );
      })()}
    </div>
  );
}
