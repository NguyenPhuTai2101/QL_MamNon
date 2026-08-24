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
  FolderPlus,
  Tag,
  ToggleLeft,
  ToggleRight,
  Info,
  CalendarCheck2,
  Coins,
  Loader2,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { ToastNotification, ConfirmDeleteModal, ToastState } from "@/components/crud-feedback";
import { type Student } from "@/lib/mockData";
import {
  type FeeType,
  type TuitionFeeItem,
  type TuitionCategory,
  type InvoiceSubItem,
  type StudentInvoiceBreakdown,
  DEFAULT_CATEGORY_NAMES,
  getCategoryIcon,
  normalizeCategoryName,
  groupFeesIntoCategories,
  parseInvoiceBreakdown,
  buildDefaultStudentBreakdown,
  calculateInvoiceTotal,
  getVietQRBreakdownDetails,
  saveInvoicePaymentToDB,
  getDailyMealRate,
} from "@/lib/tuitionUtils";

// Helper lấy họ tên đầy đủ linh hoạt cho cả MockData lẫn Prisma model
export function getStudentFullName(student: any): string {
  if (!student) return "Học sinh";
  if (student.name) return student.name;
  const last = student.lastName || "";
  const first = student.firstName || "";
  const full = `${last} ${first}`.trim();
  return full || "Học sinh";
}

// Helper lấy tên lớp
export function getStudentClassName(student: any): string {
  if (!student) return "Mầm";
  return student.className || student.class?.name || "Mầm";
}

export default function TuitionTab() {
  const [mainTab, setMainTab] = useState<"invoices" | "categories">("invoices");

  // Dữ liệu Hệ thống
  const [students, setStudents] = useState<Student[]>([]);
  const [feeItems, setFeeItems] = useState<TuitionFeeItem[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Bộ lọc Tháng & Danh sách học sinh
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal / Drawer State
  const [activeInvoiceStudent, setActiveInvoiceStudent] = useState<Student | null>(null);
  const [editingBreakdown, setEditingBreakdown] = useState<StudentInvoiceBreakdown | null>(null);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemAmount, setCustomItemAmount] = useState("");

  // Modal Quản Lý Danh Mục & Mục Con
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TuitionFeeItem | null>(null);
  const [targetCategoryForNewItem, setTargetCategoryForNewItem] = useState<string>(DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE);
  const [itemFormName, setItemFormName] = useState("");
  const [itemFormAmount, setItemFormAmount] = useState("");
  const [itemFormType, setItemFormType] = useState<FeeType>("MONTHLY");
  const [itemFormDesc, setItemFormDesc] = useState("");

  // VietQR Modal
  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    student: Student | null;
    amount: number;
    breakdown?: any;
  }>({
    isOpen: false,
    student: null,
    amount: 0,
  });

  // CRUD Animation & Feedback states
  const [toast, setToast] = useState<ToastState | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [highlightType, setHighlightType] = useState<"add" | "edit">("add");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    feeItem: TuitionFeeItem | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    feeItem: null,
    isLoading: false,
  });

  const showToast = (msg: string, type: "success" | "edit" | "delete" | "error" = "success") => {
    setToast({
      type: type === "edit" ? "info" : type,
      title: type === "error" ? "Thông báo" : "Thao tác thành công",
      message: msg,
    });
  };

  // 1. Tải dữ liệu ban đầu
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Tải Học Sinh
      const studentsRes = await fetch("/api/students");
      const studentsJson = await studentsRes.json();
      const rawStudents: any[] = Array.isArray(studentsJson)
        ? studentsJson
        : (studentsJson?.data && Array.isArray(studentsJson.data))
        ? studentsJson.data
        : [];

      const normalizedStudents = rawStudents.map((st: any) => ({
        ...st,
        name: st.name || `${st.lastName || ""} ${st.firstName || ""}`.trim() || "Học sinh",
        className: st.className || st.class?.name || "Mầm",
        parentName: st.parentName || st.motherName || st.fatherName || "Phụ huynh",
        parentPhone: st.parentPhone || st.motherPhone || st.fatherPhone || "",
        code: st.code || (st.id ? `HS${st.id.slice(-3)}` : ""),
      }));

      setStudents(normalizedStudents);
      const classes = Array.from(
        new Set(normalizedStudents.map((s: any) => getStudentClassName(s)).filter(Boolean))
      ) as string[];
      setAvailableClasses(classes);

      // Tải Biểu Phí
      const feesRes = await fetch("/api/tuition-fees");
      const feesJson = await feesRes.json();
      const loadedFees: TuitionFeeItem[] = Array.isArray(feesJson)
        ? feesJson
        : (feesJson?.data && Array.isArray(feesJson.data))
        ? feesJson.data
        : [];
      setFeeItems(loadedFees);

      // Tải Hóa Đơn Tháng Này
      const invoicesRes = await fetch(`/api/invoices?month=${selectedMonth}&year=${selectedYear}`);
      const invoicesJson = await invoicesRes.json();
      const loadedInvoices: any[] = Array.isArray(invoicesJson)
        ? invoicesJson
        : (invoicesJson?.data && Array.isArray(invoicesJson.data))
        ? invoicesJson.data
        : [];
      setInvoices(loadedInvoices);

      // Tải Dữ Liệu Điểm Danh Tháng Này (Tự động liên kết hoàn tiền ăn)
      const attRes = await fetch(`/api/attendance?month=${selectedMonth}&year=${selectedYear}`);
      const attJson = await attRes.json();
      const loadedAttendances: any[] = Array.isArray(attJson)
        ? attJson
        : (attJson?.data && Array.isArray(attJson.data))
        ? attJson.data
        : [];
      setAttendances(loadedAttendances);
    } catch (err) {
      console.error("Failed to fetch tuition data:", err);
      showToast("Lỗi khi tải dữ liệu từ máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  // Gom nhóm danh mục biểu phí
  const categories: TuitionCategory[] = useMemo(() => {
    return groupFeesIntoCategories(feeItems);
  }, [feeItems]);

  // Đơn giá tiền ăn theo ngày tính từ danh mục biểu phí
  const dailyMealRate = useMemo(() => {
    return getDailyMealRate(feeItems);
  }, [feeItems]);

  // Thống kê điểm danh theo từng học sinh trong tháng được chọn
  const attendanceStatsMap = useMemo(() => {
    const map = new Map<string, { present: number; absentPermit: number; absentNoPermit: number }>();
    attendances.forEach((att) => {
      if (!att.studentId) return;
      const current = map.get(att.studentId) || { present: 0, absentPermit: 0, absentNoPermit: 0 };
      if (att.status === "PRESENT") current.present++;
      else if (att.status === "ABSENT_PERMIT") current.absentPermit++;
      else if (att.status === "ABSENT_NO_PERMIT") current.absentNoPermit++;
      map.set(att.studentId, current);
    });
    return map;
  }, [attendances]);

  // Map hóa đơn của từng học sinh
  const studentInvoicesMap = useMemo(() => {
    const map = new Map<string, any>();
    invoices.forEach((inv) => {
      if (inv.studentId) map.set(inv.studentId, inv);
    });
    return map;
  }, [invoices]);

  // Danh sách học sinh đã lọc
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const fullName = getStudentFullName(s);
      const sClass = getStudentClassName(s);
      const matchesSearch =
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.parentPhone && s.parentPhone.includes(searchTerm)) ||
        (s.parentName && s.parentName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesClass = selectedClass === "ALL" || sClass === selectedClass;

      const inv = studentInvoicesMap.get(s.id);
      const isPaid = inv?.status === "PAID";
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "PAID" && isPaid) ||
        (selectedStatus === "UNPAID" && !isPaid);

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchTerm, selectedClass, selectedStatus, studentInvoicesMap]);

  // Thống kê tổng quan tháng
  const summaryStats = useMemo(() => {
    let totalExpected = 0;
    let totalCollected = 0;
    let paidCount = 0;
    let totalRefundMeals = 0;

    students.forEach((s) => {
      const inv = studentInvoicesMap.get(s.id);
      const att = attendanceStatsMap.get(s.id);
      const breakdown = buildDefaultStudentBreakdown(s, feeItems, inv, att?.absentPermit || 0);
      const amount = inv?.amount !== undefined ? inv.amount : breakdown.totalAmount;
      totalExpected += amount;
      totalRefundMeals += breakdown.refundMealFee || 0;

      if (inv?.status === "PAID") {
        totalCollected += amount;
        paidCount++;
      }
    });

    const totalUnpaid = Math.max(0, totalExpected - totalCollected);
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return {
      totalExpected,
      totalCollected,
      totalUnpaid,
      totalRefundMeals,
      paidCount,
      unpaidCount: students.length - paidCount,
      collectionRate,
    };
  }, [students, feeItems, studentInvoicesMap, attendanceStatsMap]);

  // ===== XỬ LÝ HÓA ĐƠN TỪNG BÉ (DRAWER) =====

  const handleOpenInvoiceDrawer = (student: Student) => {
    setActiveInvoiceStudent(student);
    const existingInv = studentInvoicesMap.get(student.id);
    const att = attendanceStatsMap.get(student.id);
    const breakdown = buildDefaultStudentBreakdown(
      student,
      feeItems,
      existingInv,
      att?.absentPermit || 0
    );
    setEditingBreakdown(breakdown);
    setCustomItemName("");
    setCustomItemAmount("");
  };

  const handleToggleItemInInvoice = (fee: TuitionFeeItem) => {
    if (!editingBreakdown) return;
    const catName = normalizeCategoryName(fee);
    const existingIndex = editingBreakdown.items.findIndex(
      (it) => it.feeId === fee.id || (it.name === fee.name && it.categoryName === catName)
    );

    let newItems = [...editingBreakdown.items];
    if (existingIndex >= 0) {
      newItems.splice(existingIndex, 1);
    } else {
      newItems.push({
        feeId: fee.id,
        name: fee.name,
        amount: fee.amount,
        type: fee.type,
        categoryName: catName,
      });
    }

    const { total } = calculateInvoiceTotal(
      newItems,
      editingBreakdown.discountPercent,
      editingBreakdown.discountAmount,
      editingBreakdown.refundMealFee
    );

    setEditingBreakdown({
      ...editingBreakdown,
      items: newItems,
      totalAmount: total,
    });
  };

  const handleItemAmountChange = (index: number, newAmount: number) => {
    if (!editingBreakdown) return;
    const newItems = [...editingBreakdown.items];
    newItems[index] = { ...newItems[index], amount: Math.max(0, newAmount) };

    const { total } = calculateInvoiceTotal(
      newItems,
      editingBreakdown.discountPercent,
      editingBreakdown.discountAmount,
      editingBreakdown.refundMealFee
    );

    setEditingBreakdown({
      ...editingBreakdown,
      items: newItems,
      totalAmount: total,
    });
  };

  const handleApplyStandardPackage = () => {
    if (!editingBreakdown) return;
    const standardCategoryItems = feeItems.filter(
      (f) => f.isActive !== false && normalizeCategoryName(f) === DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE
    );

    // Giữ lại các mục năng khiếu & dịch vụ khác, thay thế các mục thuộc Gói chuẩn
    const nonPackageItems = editingBreakdown.items.filter(
      (it) => it.categoryName !== DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE
    );

    const packageItems: InvoiceSubItem[] = standardCategoryItems.map((f) => ({
      id: f.id,
      feeId: f.id,
      name: f.name,
      amount: f.amount,
      type: f.type,
      categoryName: DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE,
    }));

    const combined = [...packageItems, ...nonPackageItems];
    const { total } = calculateInvoiceTotal(
      combined,
      editingBreakdown.discountPercent,
      editingBreakdown.discountAmount,
      editingBreakdown.refundMealFee
    );

    setEditingBreakdown({
      ...editingBreakdown,
      packageApplied: DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE,
      items: combined,
      totalAmount: total,
    });
    showToast("Đã áp dụng Gói học phí chuẩn cho bé!");
  };

  const handleClearAllItems = () => {
    if (!editingBreakdown) return;
    setEditingBreakdown({
      ...editingBreakdown,
      packageApplied: undefined,
      items: [],
      totalAmount: 0,
    });
  };

  const handleAddCustomItemToInvoice = () => {
    if (!editingBreakdown || !customItemName.trim() || !customItemAmount) return;
    const amt = parseFloat(customItemAmount) || 0;
    if (amt <= 0) return;

    const newItem: InvoiceSubItem = {
      name: customItemName.trim(),
      amount: amt,
      type: "MONTHLY",
      categoryName: "Khoản thu tùy chỉnh",
    };

    const newItems = [...editingBreakdown.items, newItem];
    const { total } = calculateInvoiceTotal(
      newItems,
      editingBreakdown.discountPercent,
      editingBreakdown.discountAmount,
      editingBreakdown.refundMealFee
    );

    setEditingBreakdown({
      ...editingBreakdown,
      items: newItems,
      totalAmount: total,
    });

    setCustomItemName("");
    setCustomItemAmount("");
    showToast("Đã thêm khoản thu riêng cho bé!");
  };

  const handleDiscountChange = (percent: number, amount: number, reason: string) => {
    if (!editingBreakdown) return;
    const { total, finalDiscount } = calculateInvoiceTotal(
      editingBreakdown.items,
      percent,
      amount,
      editingBreakdown.refundMealFee
    );

    setEditingBreakdown({
      ...editingBreakdown,
      discountPercent: percent,
      discountAmount: finalDiscount,
      discountReason: reason,
      totalAmount: total,
    });
  };

  const handleMealRefundChange = (days: number) => {
    if (!editingBreakdown) return;
    const refundFee = Math.round(days * dailyMealRate);

    const { total } = calculateInvoiceTotal(
      editingBreakdown.items,
      editingBreakdown.discountPercent,
      editingBreakdown.discountAmount,
      refundFee
    );

    setEditingBreakdown({
      ...editingBreakdown,
      refundMealDays: days,
      refundMealFee: refundFee,
      refundMealAmount: refundFee,
      leaveDays: days,
      totalAmount: total,
    });
  };

  const handleSaveInvoice = async () => {
    if (!activeInvoiceStudent || !editingBreakdown) return;
    setIsLoading(true);
    try {
      const existingInv = studentInvoicesMap.get(activeInvoiceStudent.id);
      const status = existingInv?.status || "UNPAID";

      const ok = await saveInvoicePaymentToDB(
        activeInvoiceStudent.id,
        selectedMonth,
        selectedYear,
        editingBreakdown.totalAmount,
        status,
        existingInv?.paymentMethod || "CASH",
        editingBreakdown
      );

      if (ok) {
        showToast("Đã lưu hóa đơn học phí cho bé thành công!");
        setActiveInvoiceStudent(null);
        fetchData();
      } else {
        showToast("Lỗi khi lưu hóa đơn vào CSDL");
      }
    } catch (e) {
      showToast("Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePaymentStatus = async (student: Student) => {
    const inv = studentInvoicesMap.get(student.id);
    const att = attendanceStatsMap.get(student.id);
    const currentStatus = inv?.status || "UNPAID";
    const nextStatus = currentStatus === "PAID" ? "UNPAID" : "PAID";
    const breakdown = buildDefaultStudentBreakdown(student, feeItems, inv, att?.absentPermit || 0);
    const amount = inv?.amount !== undefined ? inv.amount : breakdown.totalAmount;

    setIsLoading(true);
    const ok = await saveInvoicePaymentToDB(
      student.id,
      selectedMonth,
      selectedYear,
      amount,
      nextStatus,
      nextStatus === "PAID" ? "CASH" : "CASH",
      breakdown
    );
    setIsLoading(false);

    if (ok) {
      showToast(nextStatus === "PAID" ? "Đã ghi nhận ĐÃ THU TIỀN!" : "Đã chuyển về CHƯA THANH TOÁN");
      fetchData();
    }
  };

  // Đồng bộ hoàn tiền ăn toàn trường từ điểm danh
  const handleAutoSyncAllAttendanceMealRefunds = async () => {
    setIsLoading(true);
    let count = 0;
    try {
      for (const student of students) {
        const att = attendanceStatsMap.get(student.id);
        const absentPermit = att?.absentPermit || 0;
        const inv = studentInvoicesMap.get(student.id);

        if (absentPermit > 0 && (!inv || inv.status !== "PAID")) {
          const breakdown = buildDefaultStudentBreakdown(student, feeItems, inv, absentPermit);
          await saveInvoicePaymentToDB(
            student.id,
            selectedMonth,
            selectedYear,
            breakdown.totalAmount,
            inv?.status || "UNPAID",
            inv?.paymentMethod || "CASH",
            breakdown
          );
          count++;
        }
      }
      showToast(`Đã tự động tính & hoàn tiền ăn cho ${count} học sinh có ngày nghỉ phép!`);
      fetchData();
    } catch (e) {
      showToast("Lỗi khi đồng bộ dữ liệu điểm danh");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== XỬ LÝ QUẢN LÝ DANH MỤC & MỤC CON =====

  const handleOpenAddItemModal = (catName: string) => {
    setTargetCategoryForNewItem(catName);
    setEditingItem(null);
    setItemFormName("");
    setItemFormAmount("");
    setItemFormType(catName === DEFAULT_CATEGORY_NAMES.ONE_TIME ? "ONE_TIME" : "MONTHLY");
    setItemFormDesc("");
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (item: TuitionFeeItem) => {
    setEditingItem(item);
    setTargetCategoryForNewItem(normalizeCategoryName(item));
    setItemFormName(item.name);
    setItemFormAmount(item.amount.toString());
    setItemFormType(item.type);
    setItemFormDesc(item.description || "");
    setIsItemModalOpen(true);
  };

  const handlePromptDeleteFee = (item: TuitionFeeItem) => {
    setDeleteModal({
      isOpen: true,
      feeItem: item,
      isLoading: false,
    });
  };

  const handleConfirmDeleteFee = async () => {
    if (!deleteModal.feeItem) return;
    const itemToDelete = deleteModal.feeItem;
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const res = await fetch(`/api/tuition-fees?id=${itemToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeletingId(itemToDelete.id);
        setDeleteModal({ isOpen: false, feeItem: null, isLoading: false });

        setTimeout(() => {
          setFeeItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
          setDeletingId(null);
          showToast(`Đã xóa mục phí "${itemToDelete.name}" khỏi danh mục!`, "delete");
        }, 350);
      } else {
        setDeleteModal((prev) => ({ ...prev, isLoading: false }));
        showToast("Không thể xóa mục phí lúc này.", "error");
      }
    } catch (e) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      showToast("Lỗi khi xóa mục phí.", "error");
    }
  };

  const handleSaveSubItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormName.trim() || !itemFormAmount) {
      showToast("Vui lòng nhập tên mục và số tiền", "error");
      return;
    }

    const amt = parseFloat(itemFormAmount) || 0;
    setIsSubmitting(true);

    try {
      if (editingItem) {
        // Cập nhật mục
        const res = await fetch("/api/tuition-fees", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingItem.id,
            name: itemFormName.trim(),
            amount: amt,
            type: itemFormType,
            appliedClass: targetCategoryForNewItem,
            description: itemFormDesc.trim() || null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsItemModalOpen(false);
          setHighlightType("edit");
          setHighlightedId(editingItem.id);
          showToast("Đã cập nhật mục phí thành công!", "success");
          setTimeout(() => setHighlightedId(null), 2500);
          fetchData();
        }
      } else {
        // Tạo mới mục
        const res = await fetch("/api/tuition-fees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: itemFormName.trim(),
            amount: amt,
            type: itemFormType,
            appliedClass: targetCategoryForNewItem,
            description: itemFormDesc.trim() || null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsItemModalOpen(false);
          const newId = data.data?.id || data.id;
          if (newId) {
            setHighlightType("add");
            setHighlightedId(newId);
            setTimeout(() => setHighlightedId(null), 2500);
          }
          showToast("Đã thêm mục phí mới vào danh mục!", "success");
          fetchData();
        }
      }
    } catch (err) {
      showToast("Lỗi khi lưu mục phí", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setTargetCategoryForNewItem(newCategoryName.trim());
    setIsCategoryModalOpen(false);
    setIsItemModalOpen(true);
    setItemFormName("");
    setItemFormAmount("");
    setItemFormType("MONTHLY");
    setItemFormDesc("");
    setNewCategoryName("");
    showToast(`Đã tạo danh mục "${newCategoryName.trim()}". Hãy thêm mục con đầu tiên!`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans pb-24">
      {/* Toast Thông Báo */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Xác nhận xóa mục biểu phí"
        itemName={deleteModal.feeItem ? `${deleteModal.feeItem.name} (${formatCurrency(deleteModal.feeItem.amount)})` : ""}
        itemType="mục biểu phí"
        isLoading={deleteModal.isLoading}
        onConfirm={handleConfirmDeleteFee}
        onCancel={() => setDeleteModal({ isOpen: false, feeItem: null, isLoading: false })}
      />

      {/* HEADER TAB: Chuyển đổi giữa 2 Tab chính */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Học Phí & Hóa Đơn
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Tự động liên kết Điểm danh & Hoàn tiền ăn • Hóa đơn từng bé & Danh mục biểu phí
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 w-full sm:w-auto">
          <button
            onClick={() => setMainTab("invoices")}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
              mainTab === "invoices"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Hóa Đơn Học Sinh</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-black">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setMainTab("categories")}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer",
              mainTab === "categories"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Layers className="w-4 h-4" />
            <span>Danh Mục Biểu Phí</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-black">
              {categories.length} Nhóm
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH HÓA ĐƠN HỌC SINH                                        */}
      {/* ========================================================================= */}
      {mainTab === "invoices" && (
        <div className="space-y-6">
          {/* Thanh Chọn Tháng & Bộ Lọc */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Chọn Tháng / Năm */}
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <Calendar className="w-4 h-4 text-indigo-600 ml-2" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-transparent font-bold text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer pr-2"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m < 10 ? `0${m}` : m}
                    </option>
                  ))}
                </select>

                <span className="text-slate-300">/</span>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-transparent font-bold text-xs sm:text-sm text-slate-800 focus:outline-none cursor-pointer pr-2"
                >
                  {[2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nút Xuất Báo Cáo & Refresh */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Nút Đồng Bộ Hoàn Tiền Ăn Tự Động Toàn Trường */}
                <button
                  onClick={handleAutoSyncAllAttendanceMealRefunds}
                  disabled={isLoading}
                  className="h-9 px-3.5 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Tự động tính hoàn trả tiền ăn cho tất cả học sinh có ngày nghỉ phép trong tháng"
                >
                  <CalendarCheck2 className="w-3.5 h-3.5" />
                  <span>Đồng bộ Hoàn tiền ăn từ Điểm danh</span>
                </button>

                <button
                  onClick={fetchData}
                  disabled={isLoading}
                  className="h-9 px-3.5 inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Tải lại dữ liệu"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                  <span className="hidden sm:inline">Làm mới</span>
                </button>

                <button
                  onClick={() =>
                    exportToExcel(
                      `Danh_Sach_Hoc_Phi_T${selectedMonth}_${selectedYear}`,
                      ["Mã Học Sinh", "Họ và Tên", "Lớp", "Tổng Học Phí", "Trạng Thái", "Phụ Huynh", "SĐT"],
                      filteredStudents.map((s) => {
                        const inv = studentInvoicesMap.get(s.id);
                        const att = attendanceStatsMap.get(s.id);
                        const breakdown = buildDefaultStudentBreakdown(s, feeItems, inv, att?.absentPermit || 0);
                        return [
                          s.code || "",
                          getStudentFullName(s),
                          getStudentClassName(s),
                          inv?.amount || breakdown.totalAmount,
                          inv?.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán",
                          s.parentName || "",
                          s.parentPhone || "",
                        ];
                      })
                    )
                  }
                  className="h-9 px-3.5 inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xuất Excel</span>
                </button>
              </div>
            </div>

            {/* Thanh Tìm Kiếm & Bộ Lọc Nhanh */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên học sinh, mã HS, phụ huynh, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">🏫 Tất cả các lớp</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Lớp {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">📌 Tất cả trạng thái</option>
                  <option value="UNPAID">🔴 Chưa thanh toán</option>
                  <option value="PAID">🟢 Đã thanh toán</option>
                </select>
              </div>
            </div>
          </div>

          {/* Thẻ Thống Kê Tổng Quan */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tổng Dự Thu
                </p>
                <p className="text-base sm:text-xl font-black text-slate-900 mt-1">
                  {formatCurrency(summaryStats.totalExpected)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  {students.length} học sinh
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Đã Thu Tiền
                </p>
                <p className="text-base sm:text-xl font-black text-emerald-600 mt-1">
                  {formatCurrency(summaryStats.totalCollected)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-0.5">
                  {summaryStats.paidCount} bé ({summaryStats.collectionRate}%)
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider">
                  Còn Phải Thu
                </p>
                <p className="text-base sm:text-xl font-black text-rose-600 mt-1">
                  {formatCurrency(summaryStats.totalUnpaid)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-rose-700 font-semibold mt-0.5">
                  {summaryStats.unpaidCount} bé chưa nộp
                </p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Hoàn Trả Tiền Ăn
                </p>
                <p className="text-base sm:text-xl font-black text-amber-600 mt-1">
                  {formatCurrency(summaryStats.totalRefundMeals)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">
                  Đơn giá: {formatCurrency(dailyMealRate)}/ngày
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Utensils className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Bảng Danh Sách Học Sinh & Hóa Đơn */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-4 sm:px-6">Học Sinh</th>
                    <th className="py-4 px-4 hidden md:table-cell">Các Khoản Thu & Môn Đăng Ký</th>
                    <th className="py-4 px-4 hidden lg:table-cell">Điểm Danh & Hoàn Tiền Ăn</th>
                    <th className="py-4 px-4 text-right">Tổng Tiền</th>
                    <th className="py-4 px-4 text-center">Trạng Thái</th>
                    <th className="py-4 px-4 sm:px-6 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold">Không tìm thấy học sinh nào phù hợp</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const inv = studentInvoicesMap.get(student.id);
                      const att = attendanceStatsMap.get(student.id);
                      const isPaid = inv?.status === "PAID";
                      const breakdown = buildDefaultStudentBreakdown(
                        student,
                        feeItems,
                        inv,
                        att?.absentPermit || 0
                      );
                      const totalAmount = inv?.amount !== undefined ? inv.amount : breakdown.totalAmount;
                      const sName = getStudentFullName(student);
                      const sClass = getStudentClassName(student);

                      const electiveCount = breakdown.items.filter(
                        (i) => i.categoryName !== DEFAULT_CATEGORY_NAMES.STANDARD_PACKAGE
                      ).length;

                      const absentPermitCount = att?.absentPermit || breakdown.refundMealDays || 0;
                      const refundFee = breakdown.refundMealFee || 0;

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Cột Học Sinh */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 shrink-0 text-xs">
                                {sName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                  {sName}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  <span className="font-bold text-indigo-600 bg-indigo-50/80 px-1.5 py-0.5 rounded-md">
                                    Lớp {sClass}
                                  </span>
                                  {student.code && <span>#{student.code}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Cột Chi Tiết Các Mục Đang Áp Dụng */}
                          <td className="py-3.5 px-4 hidden md:table-cell">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {breakdown.packageApplied && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold">
                                  <span>📦</span>
                                  <span>Gói chuẩn</span>
                                </span>
                              )}

                              {electiveCount > 0 ? (
                                <button
                                  onClick={() => handleOpenInvoiceDrawer(student)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                  title="Bấm để xem & sửa môn đăng ký"
                                >
                                  <span>✨</span>
                                  <span>+{electiveCount} môn/dịch vụ</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenInvoiceDrawer(student)}
                                  className="text-[11px] text-slate-400 hover:text-indigo-600 font-semibold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>+ Đăng ký môn</span>
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Cột Điểm Danh & Hoàn Tiền Ăn */}
                          <td className="py-3.5 px-4 hidden lg:table-cell">
                            <div className="space-y-1">
                              {absentPermitCount > 0 ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[11px] font-bold">
                                  <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>
                                    Nghỉ phép {absentPermitCount} ngày (-{formatCurrency(refundFee)})
                                  </span>
                                </div>
                              ) : att?.present ? (
                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                  Đi học đủ {att.present} ngày
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">Chưa có điểm danh</span>
                              )}

                              {breakdown.discountAmount && breakdown.discountAmount > 0 && (
                                <div className="text-rose-600 font-bold text-[11px]">
                                  🎁 Giảm -{formatCurrency(breakdown.discountAmount)}
                                  {breakdown.discountReason && (
                                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                                      ({breakdown.discountReason})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Cột Tổng Tiền */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="font-black text-slate-900 text-sm sm:text-base">
                              {formatCurrency(totalAmount)}
                            </span>
                          </td>

                          {/* Cột Trạng Thái */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleTogglePaymentStatus(student)}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                                isPaid
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                  : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                              )}
                              title="Bấm để đổi trạng thái thanh toán"
                            >
                              {isPaid ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Đã thanh toán</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Chưa thanh toán</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Cột Thao Tác Nhanh */}
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Nút Sửa Hóa Đơn */}
                              <button
                                onClick={() => handleOpenInvoiceDrawer(student)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-colors cursor-pointer"
                                title="Chỉnh sửa hóa đơn của bé"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Nút Phiếu Báo & QR */}
                              <button
                                onClick={() =>
                                  setQrModalData({
                                    isOpen: true,
                                    student,
                                    amount: totalAmount,
                                    breakdown,
                                  })
                                }
                                className="h-8 px-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                                title="Mở phiếu báo học phí & mã VietQR"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Phiếu Báo & QR</span>
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
      {/* TAB 2: QUẢN LÝ DANH MỤC BIỂU PHÍ (NHÓM GÓI & MỤC CON)                     */}
      {/* ========================================================================= */}
      {mainTab === "categories" && (
        <div className="space-y-6">
          {/* Header Quản Lý Danh Mục */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Danh Mục Biểu Phí & Nhóm Dịch Vụ
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu hình 'Gói học phí chuẩn' và các danh mục môn học, tiện ích khác của toàn trường
              </p>
            </div>

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="h-9 px-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Thêm Danh Mục Mới</span>
            </button>
          </div>

          {/* Danh Sách Các Thẻ Danh Mục Lớn */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                {/* Header Danh Mục */}
                <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      {category.icon}
                    </span>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        <span>{category.name}</span>
                        {category.isPackage && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                            GÓI MẶC ĐỊNH
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {category.items.length} mục thu đang cấu hình
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenAddItemModal(category.name)}
                    className="h-8 px-3 inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm mục</span>
                  </button>
                </div>

                {/* Danh Sách Các Mục Con Trong Danh Mục */}
                <div className="p-4 sm:p-5 divide-y divide-slate-100 flex-1">
                  {category.items.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Tag className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                      <p className="text-xs font-medium">Chưa có mục con nào trong danh mục này</p>
                      <button
                        onClick={() => handleOpenAddItemModal(category.name)}
                        className="text-xs text-indigo-600 font-bold hover:underline mt-1 cursor-pointer"
                      >
                        + Thêm mục con đầu tiên
                      </button>
                    </div>
                  ) : (
                    category.items.map((item) => {
                      const isHighlighted = highlightedId === item.id;
                      const isDeleting = deletingId === item.id;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/80 px-2 rounded-xl transition-all duration-300",
                            isHighlighted && (highlightType === "add" ? "animate-row-add" : "animate-row-edit"),
                            isDeleting && "animate-row-delete"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span
                                className={cn(
                                  "px-1.5 py-0.2 rounded-md font-semibold",
                                  item.type === "MONTHLY"
                                    ? "bg-blue-50 text-blue-700"
                                    : item.type === "DAILY"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-emerald-50 text-emerald-700"
                                )}
                              >
                                {item.type === "MONTHLY"
                                  ? "Thu hằng tháng"
                                  : item.type === "DAILY"
                                  ? "Theo ngày ăn"
                                  : "Thu 1 lần đầu năm"}
                              </span>
                              {item.description && (
                                <span className="truncate hidden sm:inline">{item.description}</span>
                              )}
                            </div>
                          </div>

                          {/* Đơn giá & Nút Sửa/Xóa */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-black text-slate-900 text-xs sm:text-sm">
                              {formatCurrency(item.amount)}
                            </span>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEditItemModal(item)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white active:scale-90 rounded-lg transition-all cursor-pointer"
                                title="Sửa mục này"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handlePromptDeleteFee(item)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white active:scale-90 rounded-lg transition-all cursor-pointer"
                                title="Xóa mục này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL CHỈNH SỬA HÓA ĐƠN RIÊNG TỪNG HỌC SINH                     */}
      {/* ========================================================================= */}
      {activeInvoiceStudent && editingBreakdown && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[94vh]">
              {/* Header Drawer */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-white text-sm">
                    {getStudentFullName(activeInvoiceStudent).charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight">
                      Hóa Đơn: {getStudentFullName(activeInvoiceStudent)}
                    </h3>
                    <p className="text-xs text-indigo-200">
                      Lớp {getStudentClassName(activeInvoiceStudent)} • Tháng {selectedMonth}/{selectedYear}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveInvoiceStudent(null)}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thân Drawer: Danh Sách Mục Thu Chọn Lọc Cho Riêng Bé */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
                {/* Thanh Nút Áp Dụng Nhanh */}
                <div className="flex items-center justify-between gap-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <Package className="w-4 h-4 text-indigo-600" />
                    <span>Thao tác nhanh:</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyStandardPackage}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>⚡ Áp dụng Gói chuẩn</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearAllItems}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Bỏ chọn hết
                    </button>
                  </div>
                </div>

                {/* Lựa Chọn Các Mục Theo Từng Danh Mục */}
                <div className="space-y-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {cat.name}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Tick để thêm vào hóa đơn của bé
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {cat.items.map((fee) => {
                          const isSelected = editingBreakdown.items.some(
                            (it) => it.feeId === fee.id || it.name === fee.name
                          );

                          return (
                            <label
                              key={fee.id}
                              className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none",
                                isSelected
                                  ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold"
                                  : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleItemInInvoice(fee)}
                                  className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="text-xs truncate">{fee.name}</span>
                              </div>
                              <span className="text-xs font-black shrink-0 ml-2">
                                {formatCurrency(fee.amount)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Danh Sách Các Khoản Thu Đã Chọn & Cho Phép Sửa Số Tiền */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
                  <h4 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                    📋 Bảng Kê Chi Tiết Hóa Đơn ({editingBreakdown.items.length} mục)
                  </h4>

                  {editingBreakdown.items.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-3">
                      Chưa chọn mục thu nào. Hãy tick chọn các mục ở trên!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {editingBreakdown.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-xs truncate">{item.name}</p>
                            <span className="text-[10px] text-slate-400">
                              {item.categoryName || "Khoản thu"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) =>
                                handleItemAmountChange(idx, parseFloat(e.target.value) || 0)
                              }
                              className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-right text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <span className="text-xs font-bold text-slate-500">đ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thêm mục riêng cho bé */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tên mục phát sinh riêng..."
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <input
                      type="number"
                      placeholder="Số tiền..."
                      value={customItemAmount}
                      onChange={(e) => setCustomItemAmount(e.target.value)}
                      className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomItemToInvoice}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>

                {/* Phần Miễn Giảm Học Phí & Hoàn Tiền Ăn (Liên Kết Điểm Danh) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Miễn giảm */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2.5">
                    <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>🎁</span>
                      <span>Miễn Giảm Học Phí</span>
                    </h5>
                    <div className="flex items-center gap-2">
                      <select
                        value={editingBreakdown.discountPercent || 0}
                        onChange={(e) =>
                          handleDiscountChange(
                            parseInt(e.target.value),
                            0,
                            editingBreakdown.discountReason || "Ưu đãi trường"
                          )
                        }
                        className="w-28 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>Giảm 5%</option>
                        <option value={10}>Giảm 10%</option>
                        <option value={15}>Giảm 15%</option>
                        <option value={20}>Giảm 20%</option>
                        <option value={50}>Giảm 50%</option>
                        <option value={100}>Giảm 100%</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Lý do (VD: Con giáo viên)"
                        value={editingBreakdown.discountReason || ""}
                        onChange={(e) =>
                          setEditingBreakdown({
                            ...editingBreakdown,
                            discountReason: e.target.value,
                          })
                        }
                        className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Hoàn tiền ăn (Tự Động Liên Kết Điểm Danh) */}
                  {(() => {
                    const att = attendanceStatsMap.get(activeInvoiceStudent.id);
                    const detectedAbsentPermit = att?.absentPermit || 0;

                    return (
                      <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                            <Utensils className="w-4 h-4 text-amber-600" />
                            <span>Hoàn Trả Tiền Ăn</span>
                          </h5>
                          {detectedAbsentPermit > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMealRefundChange(detectedAbsentPermit)}
                              className="text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-lg border border-amber-300 transition-colors cursor-pointer"
                            >
                              ⚡ Lấy từ điểm danh ({detectedAbsentPermit} ngày)
                            </button>
                          )}
                        </div>

                        {att && (
                          <p className="text-[11px] text-amber-800 font-medium">
                            💡 Điểm danh tháng {selectedMonth}: Có mặt <strong>{att.present}</strong> ngày • Nghỉ phép <strong>{detectedAbsentPermit}</strong> ngày
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="26"
                            value={editingBreakdown.refundMealDays || 0}
                            onChange={(e) => handleMealRefundChange(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 text-center"
                          />
                          <span className="text-xs text-slate-700 font-semibold">
                            ngày × {formatCurrency(dailyMealRate)} ={" "}
                            <span className="text-rose-600 font-black">
                              -{formatCurrency(editingBreakdown.refundMealFee || 0)}
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Footer Drawer: Tổng Tiền & Lưu */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">
                    Tổng Tiền Hóa Đơn
                  </p>
                  <p className="text-xl font-black text-indigo-700">
                    {formatCurrency(editingBreakdown.totalAmount)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveInvoiceStudent(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveInvoice}
                    disabled={isLoading}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu Hóa Đơn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL THÊM / SỬA MỤC CON TRONG DANH MỤC BIỂU PHÍ                          */}
      {/* ========================================================================= */}
      {isItemModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-modal-backdrop">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-modal-content">
              <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm sm:text-base">
                    {editingItem ? "Sửa Mục Phí" : "Thêm Mục Phí Mới"}
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Danh mục: {targetCategoryForNewItem}
                  </p>
                </div>
                <button
                  onClick={() => setIsItemModalOpen(false)}
                  className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSubItem} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Mục Phí / Dịch Vụ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Toán Tư Duy & Finger Math"
                    value={itemFormName}
                    onChange={(e) => setItemFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thuộc Danh Mục <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={targetCategoryForNewItem}
                    onChange={(e) => setTargetCategoryForNewItem(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Đơn Giá Định Mức (đ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="VD: 350000"
                      value={itemFormAmount}
                      onChange={(e) => setItemFormAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chu Kỳ Thu
                    </label>
                    <select
                      value={itemFormType}
                      onChange={(e) => setItemFormType(e.target.value as FeeType)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="MONTHLY">Hằng tháng</option>
                      <option value="DAILY">Theo ngày ăn</option>
                      <option value="ONE_TIME">Thu 1 lần đầu năm</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ghi Chú / Mô Tả
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Học 2 buổi/tuần, giáo cụ đầy đủ..."
                    value={itemFormDesc}
                    onChange={(e) => setItemFormDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <span>Lưu Mục Phí</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL TẠO DANH MỤC LỚN MỚI                                               */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-modal-backdrop">
            <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-modal-content">
              <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
                <h3 className="font-black text-sm sm:text-base">Tạo Danh Mục Biểu Phí Mới</h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewCategory} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Danh Mục Lớn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Gói Lớp Nhà Trẻ 18-24T, Khóa Học Bán Trú Hè..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    Tiếp Tục
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* VIETQR MODAL: PHIẾU BÁO HỌC PHÍ & QR IN CHUẨN A4/A5                       */}
      {/* ========================================================================= */}
      {qrModalData.isOpen && qrModalData.student && (
        <VietQRModal
          studentName={getStudentFullName(qrModalData.student)}
          className={getStudentClassName(qrModalData.student)}
          parentName={qrModalData.student.parentName}
          amount={qrModalData.amount}
          month={selectedMonth}
          year={selectedYear}
          breakdown={getVietQRBreakdownDetails(
            qrModalData.student,
            feeItems,
            qrModalData.amount,
            qrModalData.breakdown
          )}
          onClose={() => setQrModalData({ isOpen: false, student: null, amount: 0 })}
          onConfirmPayment={() => {
            if (qrModalData.student) {
              handleTogglePaymentStatus(qrModalData.student);
              setQrModalData({ isOpen: false, student: null, amount: 0 });
            }
          }}
        />
      )}
    </div>
  );
}
