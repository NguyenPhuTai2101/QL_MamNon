"use client";

import React, { useState, useEffect, useMemo } from "react";
import Portal from "@/components/portal";
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Edit,
  Trash2,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  UserCheck,
  Building2,
  FileSpreadsheet,
  FileText,
  X,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  CreditCard,
  Utensils,
  BookOpen,
  Loader2,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { ToastNotification, ConfirmDeleteModal, ToastState } from "@/components/crud-feedback";
import {
  type TuitionFeeItem,
  getStudentFeeBreakdown,
  getStudentEffectiveAmount,
  saveInvoicePaymentToDB,
} from "@/lib/tuitionUtils";

export type StudentAcademicStatus = "STUDYING" | "GRADUATED" | "RESERVED" | "TRANSFERRED" | "DROPPED";

export const STUDENT_STATUS_MAP: Record<
  StudentAcademicStatus,
  { label: string; bg: string; dot: string; icon: string }
> = {
  STUDYING: {
    label: "Đang học",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: "🟢",
  },
  GRADUATED: {
    label: "Đã ra trường",
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    icon: "🎓",
  },
  RESERVED: {
    label: "Bảo lưu",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: "⏸️",
  },
  TRANSFERRED: {
    label: "Chuyển trường",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: "🔄",
  },
  DROPPED: {
    label: "Đã nghỉ học",
    bg: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-500",
    icon: "🔴",
  },
};

interface StudentRecord {
  id: string;
  code?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: "Nam" | "Nữ";
  birthDate?: string;
  ethnicity?: string;
  nationality?: string;
  residence?: string;
  className: string;
  fatherName?: string;
  fatherJob?: string;
  fatherPhone?: string;
  motherName?: string;
  motherJob?: string;
  motherPhone?: string;
  parentName: string;
  parentPhone: string;
  address?: string;
  joinDate?: string;
  enrollmentDate?: string;
  status?: StudentAcademicStatus;
  tuitionStatus: "PAID" | "UNPAID" | "OVERDUE";
  amount: number;
  invoice?: any;
}

interface ClassRecord {
  id: string;
  name: string;
  ageGroup?: string;
  teacherName?: string;
  room?: string;
  capacity?: number;
}

const COMMON_ETHNICITIES = [
  "Kinh", "Tày", "Thái", "Mường", "H'Mông", "Dao", "Khmer", "Hoa", "Nùng", "Gia Rai", "Ê Đê", "Ba Na", "Chăm", "Khác"
];

export default function StudentsTab() {
  const [subTab, setSubTab] = useState<"students" | "classes">("students");
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [feeItems, setFeeItems] = useState<TuitionFeeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Modals & Forms
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentModalTab, setStudentModalTab] = useState<"student" | "parent">("student");
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentRecord | null>(null);

  // CRUD Animation & Feedback states
  const [toast, setToast] = useState<ToastState | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [highlightType, setHighlightType] = useState<"add" | "edit">("add");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    student: StudentRecord | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    student: null,
    isLoading: false,
  });

  const initialStudentForm = {
    id: "",
    code: "",
    name: "",
    gender: "Nam" as "Nam" | "Nữ",
    birthDate: "2022-01-01",
    ethnicity: "Kinh",
    nationality: "Việt Nam",
    residence: "",
    className: "12 – 24 tháng",
    enrollmentDate: "",
    status: "STUDYING" as StudentAcademicStatus,
    fatherName: "",
    fatherJob: "",
    fatherPhone: "",
    motherName: "",
    motherJob: "",
    motherPhone: "",
    parentName: "",
    parentPhone: "",
    address: "",
  };

  const [studentForm, setStudentForm] = useState(initialStudentForm);

  const [classForm, setClassForm] = useState({
    name: "",
    ageGroup: "3 - 4 tuổi",
    teacherName: "",
    room: "",
    capacity: 25,
  });

  // Tải dữ liệu từ CSDL
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resStudents, resClasses, resInvoices, resFees] = await Promise.all([
        fetch("/api/students").then((r) => r.json()).catch(() => []),
        fetch("/api/classes").then((r) => r.json()).catch(() => []),
        fetch("/api/invoices").then((r) => r.json()).catch(() => []),
        fetch("/api/tuition-fees").then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      const loadedFees = resFees?.data && Array.isArray(resFees.data) ? resFees.data : [];
      setFeeItems(loadedFees);

      if (Array.isArray(resClasses)) {
        setClasses(
          resClasses.map((c: any) => ({
            id: c.id,
            name: c.name,
            ageGroup: c.room || "3 - 4 tuổi",
            teacherName: c.teacher || "Chưa phân công",
            room: c.room || `Phòng ${c.name}`,
            capacity: 25,
          }))
        );
      }

      if (Array.isArray(resStudents)) {
        const invMap: Record<string, any> = {};
        if (Array.isArray(resInvoices)) {
          resInvoices.forEach((inv: any) => {
            invMap[inv.studentId] = inv;
          });
        }

        const mapped: StudentRecord[] = resStudents.map((st: any) => {
          const inv = invMap[st.id] || (st.invoices && st.invoices.length > 0 ? st.invoices[0] : null) || null;
          const className = st.class?.name || "12 – 24 tháng";
          const effAmount = getStudentEffectiveAmount({ className, invoice: inv }, loadedFees, 22);

          const enrollDateStr = st.enrollmentDate
            ? new Date(st.enrollmentDate).toISOString().split("T")[0]
            : "";

          return {
            id: st.id,
            code: st.code || `HS0${st.id.slice(-3)}`,
            name: `${st.lastName} ${st.firstName}`.trim(),
            firstName: st.firstName,
            lastName: st.lastName,
            className: className,
            gender: st.gender || "Nam",
            birthDate: st.birthDate ? new Date(st.birthDate).toISOString().split("T")[0] : "2022-01-01",
            ethnicity: st.ethnicity || "Kinh",
            nationality: st.nationality || "Việt Nam",
            residence: st.residence || st.address || "",
            fatherName: st.fatherName || "",
            fatherJob: st.fatherJob || "",
            fatherPhone: st.fatherPhone || "",
            motherName: st.motherName || "",
            motherJob: st.motherJob || "",
            motherPhone: st.motherPhone || "",
            parentName: st.parentName || st.fatherName || st.motherName || "Phụ huynh",
            parentPhone: st.parentPhone || st.fatherPhone || st.motherPhone || "0900000000",
            address: st.address || st.residence || "TP. Hồ Chí Minh",
            joinDate: enrollDateStr,
            enrollmentDate: enrollDateStr,
            status: (st.status || "STUDYING") as StudentAcademicStatus,
            tuitionStatus: (inv?.status as any) || "UNPAID",
            amount: effAmount,
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

  // Lọc học sinh
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClassFilter === "ALL" || s.className === selectedClassFilter;
      const matchStatus = selectedStatusFilter === "ALL" || (s.status || "STUDYING") === selectedStatusFilter;
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.fatherName && s.fatherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.motherName && s.motherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.parentPhone.includes(searchTerm) ||
        (s.fatherPhone && s.fatherPhone.includes(searchTerm)) ||
        (s.motherPhone && s.motherPhone.includes(searchTerm)) ||
        (s.residence && s.residence.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.ethnicity && s.ethnicity.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchClass && matchStatus && matchSearch;
    });
  }, [students, selectedClassFilter, selectedStatusFilter, searchTerm]);

  // Mở modal thêm học sinh mới
  const handleOpenAddModal = () => {
    setIsEditingStudent(false);
    setStudentModalTab("student");
    setStudentForm({
      ...initialStudentForm,
      enrollmentDate: "",
      status: "STUDYING",
      className: classes[0]?.name || "12 – 24 tháng",
    });
    setShowStudentModal(true);
  };

  // Mở modal sửa học sinh
  const handleOpenEditModal = (st: StudentRecord) => {
    setIsEditingStudent(true);
    setStudentModalTab("student");
    setStudentForm({
      id: st.id,
      code: st.code || "",
      name: st.name || "",
      gender: (st.gender as "Nam" | "Nữ") || "Nam",
      birthDate: st.birthDate || "2022-01-01",
      ethnicity: st.ethnicity || "Kinh",
      nationality: st.nationality || "Việt Nam",
      residence: st.residence || st.address || "",
      className: st.className || "12 – 24 tháng",
      enrollmentDate: st.enrollmentDate || "",
      status: (st.status || "STUDYING") as StudentAcademicStatus,
      fatherName: st.fatherName || "",
      fatherJob: st.fatherJob || "",
      fatherPhone: st.fatherPhone || "",
      motherName: st.motherName || "",
      motherJob: st.motherJob || "",
      motherPhone: st.motherPhone || "",
      parentName: st.parentName || st.fatherName || st.motherName || "",
      parentPhone: st.parentPhone || st.fatherPhone || st.motherPhone || "",
      address: st.address || st.residence || "",
    });
    setShowStudentModal(true);
  };

  // Prompt Delete Confirmation Modal
  const handlePromptDelete = (student: StudentRecord) => {
    setDeleteModal({
      isOpen: true,
      student,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.student) return;
    const studentToDelete = deleteModal.student;
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      await fetch(`/api/students?id=${studentToDelete.id}`, { method: "DELETE" });

      setDeletingId(studentToDelete.id);
      setDeleteModal({ isOpen: false, student: null, isLoading: false });

      setTimeout(() => {
        setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
        setDeletingId(null);
        setToast({
          type: "delete",
          title: "Đã xóa hồ sơ",
          message: `Đã xóa học sinh "${studentToDelete.name}" khỏi hệ thống CSDL.`
        });
      }, 350);
    } catch (e) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      setToast({
        type: "error",
        title: "Lỗi xóa học sinh",
        message: "Không thể xóa hồ sơ học sinh lúc này."
      });
    }
  };

  // Lưu học sinh (Thêm mới hoặc Cập nhật)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim()) {
      setToast({
        type: "error",
        title: "Thiếu thông tin",
        message: "Vui lòng nhập họ và tên của học sinh!"
      });
      return;
    }

    setIsSubmitting(true);

    // Tự động suy ra tên và SĐT liên hệ chính nếu chưa điền
    const finalParentName =
      studentForm.parentName.trim() ||
      studentForm.fatherName.trim() ||
      studentForm.motherName.trim() ||
      "Phụ huynh bé";
    const finalParentPhone =
      studentForm.parentPhone.trim() ||
      studentForm.fatherPhone.trim() ||
      studentForm.motherPhone.trim() ||
      "0900000000";
    const finalAddress =
      studentForm.address.trim() ||
      studentForm.residence.trim() ||
      "TP. Hồ Chí Minh";
    const finalResidence =
      studentForm.residence.trim() ||
      studentForm.address.trim() ||
      "TP. Hồ Chí Minh";

    try {
      const nameParts = studentForm.name.trim().split(" ");
      const lastName = nameParts[0] || "Nguyễn";
      const firstName = nameParts.slice(1).join(" ") || nameParts[0] || "Bé";

      const payload = {
        id: studentForm.id,
        code: studentForm.code.trim() || undefined,
        firstName,
        lastName,
        name: studentForm.name.trim(),
        gender: studentForm.gender,
        birthDate: studentForm.birthDate,
        ethnicity: studentForm.ethnicity.trim() || "Kinh",
        nationality: studentForm.nationality.trim() || "Việt Nam",
        residence: finalResidence,
        className: studentForm.className,
        fatherName: studentForm.fatherName.trim() || undefined,
        fatherJob: studentForm.fatherJob.trim() || undefined,
        fatherPhone: studentForm.fatherPhone.trim() || undefined,
        motherName: studentForm.motherName.trim() || undefined,
        motherJob: studentForm.motherJob.trim() || undefined,
        motherPhone: studentForm.motherPhone.trim() || undefined,
        parentName: finalParentName,
        parentPhone: finalParentPhone,
        address: finalAddress,
        enrollmentDate: studentForm.enrollmentDate,
        status: studentForm.status || "STUDYING",
      };

      const res = await fetch("/api/students", {
        method: isEditingStudent ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.id || data.success || data.data) {
        setShowStudentModal(false);
        const targetId = data.id || data.data?.id || studentForm.id;
        setHighlightType(isEditingStudent ? "edit" : "add");
        setHighlightedId(targetId);

        setToast({
          type: "success",
          title: isEditingStudent ? "Cập nhật hồ sơ thành công" : "Tiếp nhận học sinh mới",
          message: isEditingStudent
            ? `Đã cập nhật hồ sơ học sinh "${studentForm.name}".`
            : `Đã lưu hồ sơ học sinh "${studentForm.name}" vào lớp ${studentForm.className}.`
        });

        setTimeout(() => setHighlightedId(null), 2500);

        if (selectedStudentDetail && selectedStudentDetail.id === studentForm.id) {
          setSelectedStudentDetail((prev) =>
            prev
              ? {
                  ...prev,
                  ...payload,
                  code: payload.code || prev.code,
                  name: studentForm.name.trim(),
                }
              : null
          );
        }
        loadData();
      } else {
        setToast({
          type: "error",
          title: "Lỗi lưu hồ sơ",
          message: data.error || "Không thể lưu thông tin học sinh."
        });
      }
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        title: "Lỗi lưu hồ sơ",
        message: "Không thể lưu thông tin học sinh lên máy chủ."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thêm lớp mới
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name || !classForm.teacherName) return;

    try {
      await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: classForm.name,
          teacher: classForm.teacherName,
          room: `Phòng ${classForm.name}`,
        }),
      });

      alert(`🎉 Đã mở Lớp học mới "${classForm.name}" thành công!`);
      setShowAddClassModal(false);
      setClassForm({
        name: "",
        ageGroup: "3 - 4 tuổi",
        teacherName: "",
        room: "",
        capacity: 25,
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Xóa lớp học
  const handleDeleteClass = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa Lớp học "${name}" này?`)) return;
    try {
      await fetch(`/api/classes?id=${id}`, { method: "DELETE" });
      setClasses((prev) => prev.filter((c) => c.id !== id));
      alert(`Đã xóa Lớp học "${name}" thành công!`);
    } catch (e) {
      alert("Lỗi khi xóa lớp học.");
    }
  };

  // Xuất Excel
  const handleExportExcel = () => {
    const headers = [
      "Mã HS",
      "Họ và Tên",
      "Giới tính",
      "Ngày sinh",
      "Dân tộc",
      "Quốc tịch",
      "Nơi cư trú",
      "Lớp",
      "Ngày nhập học",
      "Họ tên Cha",
      "Nghề nghiệp Cha",
      "SĐT Cha",
      "Họ tên Mẹ",
      "Nghề nghiệp Mẹ",
      "SĐT Mẹ",
      "Liên hệ chính",
      "SĐT Liên hệ",
      "Địa chỉ",
      "Học phí",
      "Trạng thái",
    ];
    const rows = filteredStudents.map((s) => [
      s.code,
      s.name,
      s.gender || "Nam",
      s.birthDate || "",
      s.ethnicity || "Kinh",
      s.nationality || "Việt Nam",
      s.residence || "",
      s.className,
      s.enrollmentDate || s.joinDate || "",
      s.fatherName || "",
      s.fatherJob || "",
      s.fatherPhone || "",
      s.motherName || "",
      s.motherJob || "",
      s.motherPhone || "",
      s.parentName,
      s.parentPhone,
      s.address || "",
      formatCurrency(s.amount),
      STUDENT_STATUS_MAP[s.status || "STUDYING"]?.label || "Đang học",
    ]);
    exportToExcel("Danh_Sach_Hoc_Sinh_Toan_Truong", headers, rows);
  };

  // Xuất PDF
  const handleExportPDF = () => {
    const headers = [
      "Mã HS",
      "Họ và Tên",
      "Lớp",
      "Dân tộc",
      "Cha (SĐT/Nghề)",
      "Mẹ (SĐT/Nghề)",
      "Cư trú",
      "Trạng Thái",
    ];
    const rows = filteredStudents.map((s) => [
      s.code,
      s.name,
      s.className,
      s.ethnicity || "Kinh",
      s.fatherName ? `${s.fatherName} (${s.fatherPhone || s.fatherJob || "---"})` : "---",
      s.motherName ? `${s.motherName} (${s.motherPhone || s.motherJob || "---"})` : "---",
      s.residence || s.address || "---",
      STUDENT_STATUS_MAP[s.status || "STUDYING"]?.label || "Đang học",
    ]);
    exportToPDF("DANH SÁCH HỌC SINH MẦM NON", headers, rows);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Feedback */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Xác nhận xóa học sinh"
        itemName={deleteModal.student ? `${deleteModal.student.name} (${deleteModal.student.code || 'HS'})` : ""}
        itemType="hồ sơ học sinh"
        isLoading={deleteModal.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, student: null, isLoading: false })}
      />

      {/* ========================================================================= */}
      {/* 1. ERP MODULE HEADER BANNER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl text-white shadow-md shadow-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quản Lý Học Sinh & Phụ Huynh
                </h1>
                <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {students.length} học sinh
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Quản trị danh bạ học sinh, hồ sơ phụ huynh (Cha/Mẹ/Nghề nghiệp/SĐT), nơi cư trú và học vụ toàn trường.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-end">
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                onClick={() => setSubTab("students")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  subTab === "students"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Danh Sách Học Sinh</span>
              </button>
              <button
                onClick={() => setSubTab("classes")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  subTab === "classes"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Nhóm Lớp ({classes.length})</span>
              </button>
            </div>

            {subTab === "students" ? (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tiếp Nhận Học Sinh Mới</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddClassModal(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Mở Thêm Lớp Mới</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-TAB 1: DANH SÁCH HỌC SINH */}
      {/* ========================================================================= */}
      {subTab === "students" && (
        <div className="space-y-4">
          {/* Action Bar (Search, Filter, Export) */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên học sinh, cha/mẹ, SĐT, nơi cư trú, mã HS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Tất cả các lớp</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    Lớp {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">Tất cả trạng thái học tập</option>
                <option value="STUDYING">🟢 Đang học</option>
                <option value="GRADUATED">🎓 Đã ra trường</option>
                <option value="RESERVED">⏸️ Bảo lưu</option>
                <option value="TRANSFERRED">🔄 Chuyển trường</option>
                <option value="DROPPED">🔴 Đã nghỉ học</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất Excel</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>Xuất PDF</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Học Sinh</th>
                    <th className="py-3.5 px-4">Lớp Học</th>
                    <th className="py-3.5 px-4">Thông Tin Cha & Mẹ</th>
                    <th className="py-3.5 px-4">Cư Trú & SĐT Liên Hệ</th>
                    <th className="py-3.5 px-4">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        {isLoading ? "Đang tải danh sách học sinh..." : "Chưa có học sinh nào phù hợp bộ lọc."}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const isHighlighted = highlightedId === st.id;
                      const isDeleting = deletingId === st.id;

                      return (
                        <tr
                          key={st.id}
                          className={cn(
                            "hover:bg-slate-50/80 transition-all duration-300",
                            isHighlighted && (highlightType === "add" ? "animate-row-add" : "animate-row-edit"),
                            isDeleting && "animate-row-delete"
                          )}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                                {st.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <span>{st.name}</span>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                    st.gender === "Nữ" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                                  }`}>
                                    {st.gender || "Nam"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono font-medium mt-0.5">
                                  <span>Mã: <strong className="text-indigo-600 font-bold">{st.code}</strong></span>
                                  <span>•</span>
                                  <span>Dân tộc: {st.ethnicity || "Kinh"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-xl text-xs border border-indigo-100">
                              Lớp {st.className}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              {st.fatherName ? (
                                <div className="text-[11px] text-slate-700">
                                  <span className="font-bold text-slate-800">Ba:</span> {st.fatherName}
                                  {st.fatherJob && <span className="text-slate-400 text-[10px]"> ({st.fatherJob})</span>}
                                </div>
                              ) : null}
                              {st.motherName ? (
                                <div className="text-[11px] text-slate-700">
                                  <span className="font-bold text-slate-800">Mẹ:</span> {st.motherName}
                                  {st.motherJob && <span className="text-slate-400 text-[10px]"> ({st.motherJob})</span>}
                                </div>
                              ) : null}
                              {!st.fatherName && !st.motherName && (
                                <div className="text-[11px] font-bold text-slate-800">{st.parentName}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-indigo-600 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {st.parentPhone}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={st.residence || st.address || ""}>
                              {st.residence || st.address || "---"}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {(() => {
                              const currStatus = (st.status || "STUDYING") as StudentAcademicStatus;
                              const conf = STUDENT_STATUS_MAP[currStatus] || STUDENT_STATUS_MAP.STUDYING;
                              return (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${conf.bg}`}>
                                  <span>{conf.icon}</span>
                                  <span>{conf.label}</span>
                                </span>
                              );
                            })()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedStudentDetail(st)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-90 rounded-xl transition-all cursor-pointer"
                                title="Xem hồ sơ 360 độ"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(st)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 active:scale-90 rounded-xl transition-all cursor-pointer"
                                title="Chỉnh sửa thông tin học sinh & phụ huynh"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handlePromptDelete(st)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 rounded-xl transition-all cursor-pointer"
                                title="Xóa học sinh"
                              >
                                <Trash2 className="w-4 h-4" />
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
      {/* 3. SUB-TAB 2: QUẢN LÝ CÁC LỚP HỌC */}
      {/* ========================================================================= */}
      {subTab === "classes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const classStudents = students.filter((s) => s.className === cls.name);
            return (
              <div
                key={cls.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900">Lớp {cls.name}</span>
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {cls.ageGroup}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    GVCN: <strong className="text-slate-800">{cls.teacherName}</strong>
                  </p>
                </div>

                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Sĩ số hiện tại:</span>
                    <span className="text-indigo-600">{classStudents.length} / {cls.capacity || 25} bé</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (classStudents.length / (cls.capacity || 25)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedClassFilter(cls.name);
                      setSubTab("students");
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Xem danh sách lớp →
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Xóa lớp học"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TIẾP NHẬN / CHỈNH SỬA HỒ SƠ HỌC SINH & PHỤ HUYNH */}
      {/* ========================================================================= */}
      {showStudentModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-modal-backdrop">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-modal-content my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {isEditingStudent ? "Chỉnh Sửa Hồ Sơ Học Sinh & Phụ Huynh" : "Tiếp Nhận Hồ Sơ Học Sinh Mới"}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {isEditingStudent
                        ? `Cập nhật thông tin cho học sinh mã ${studentForm.code || studentForm.id}`
                        : "Điền đầy đủ thông tin cá nhân của bé và phụ huynh (Cha, Mẹ, Nghề nghiệp, SĐT)"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Tabs Switcher */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl mt-4">
                <button
                  type="button"
                  onClick={() => setStudentModalTab("student")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    studentModalTab === "student"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>👶 1. Thông Tin Học Sinh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudentModalTab("parent")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    studentModalTab === "parent"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>👨‍👩‍👧 2. Thông Tin Phụ Huynh (Cha & Mẹ)</span>
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className="space-y-4 mt-4 text-xs">
                {/* TAB 1: THÔNG TIN HỌC SINH */}
                {studentModalTab === "student" && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Mã học sinh <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="VD: HS001 (Tự sinh)"
                          value={studentForm.code}
                          onChange={(e) => setStudentForm({ ...studentForm, code: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Xếp vào lớp học <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={studentForm.className}
                          onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                          {classes.map((c) => (
                            <option key={c.id} value={c.name}>
                              Lớp {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Ngày nhập học <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                        </label>
                        <input
                          type="date"
                          value={studentForm.enrollmentDate}
                          onChange={(e) => setStudentForm({ ...studentForm, enrollmentDate: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Trạng thái học tập <span className="text-indigo-600">*</span>
                        </label>
                        <select
                          value={studentForm.status}
                          onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="STUDYING">🟢 Đang học</option>
                          <option value="GRADUATED">🎓 Đã ra trường</option>
                          <option value="RESERVED">⏸️ Bảo lưu</option>
                          <option value="TRANSFERRED">🔄 Chuyển trường</option>
                          <option value="DROPPED">🔴 Đã nghỉ học</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="font-bold text-slate-700 block mb-1">
                          Họ và tên học sinh <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="VD: Nguyễn Bảo An"
                          value={studentForm.name}
                          onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Giới tính</label>
                        <select
                          value={studentForm.gender}
                          onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Nam">Bé Nam</option>
                          <option value="Nữ">Bé Nữ</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Ngày sinh</label>
                        <input
                          type="date"
                          value={studentForm.birthDate}
                          onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Dân tộc</label>
                        <select
                          value={studentForm.ethnicity}
                          onChange={(e) => setStudentForm({ ...studentForm, ethnicity: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                          {COMMON_ETHNICITIES.map((eth) => (
                            <option key={eth} value={eth}>
                              {eth}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Quốc tịch</label>
                        <input
                          type="text"
                          placeholder="VD: Việt Nam"
                          value={studentForm.nationality}
                          onChange={(e) => setStudentForm({ ...studentForm, nationality: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Cư trú: <span className="text-slate-400 font-normal">(Nơi ở hiện tại / Tạm trú / Thường trú của bé)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 123 Nguyễn Trãi, P. Bến Thành, Q.1, TP.HCM"
                        value={studentForm.residence}
                        onChange={(e) => setStudentForm({ ...studentForm, residence: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
                      <span className="text-indigo-800 text-[11px] font-semibold">
                        👉 Tiếp theo: Điền thông tin Cha & Mẹ ở tab Phụ huynh
                      </span>
                      <button
                        type="button"
                        onClick={() => setStudentModalTab("parent")}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        Sang thông tin Phụ huynh →
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: THÔNG TIN PHỤ HUYNH */}
                {studentModalTab === "parent" && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Thông tin Cha */}
                    <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2.5">
                      <div className="font-black text-blue-900 text-xs flex items-center gap-1.5">
                        <span>👨 Thông Tin Cha</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Họ tên cha</label>
                          <input
                            type="text"
                            placeholder="VD: Nguyễn Minh Triết"
                            value={studentForm.fatherName}
                            onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Nghề nghiệp cha</label>
                          <input
                            type="text"
                            placeholder="VD: Kỹ sư CNTT"
                            value={studentForm.fatherJob}
                            onChange={(e) => setStudentForm({ ...studentForm, fatherJob: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Số điện thoại cha</label>
                          <input
                            type="tel"
                            placeholder="VD: 0901234567"
                            value={studentForm.fatherPhone}
                            onChange={(e) => setStudentForm({ ...studentForm, fatherPhone: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Thông tin Mẹ */}
                    <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2.5">
                      <div className="font-black text-rose-900 text-xs flex items-center gap-1.5">
                        <span>👩 Thông Tin Mẹ</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Họ tên mẹ</label>
                          <input
                            type="text"
                            placeholder="VD: Lê Thu Hà"
                            value={studentForm.motherName}
                            onChange={(e) => setStudentForm({ ...studentForm, motherName: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Nghề nghiệp mẹ</label>
                          <input
                            type="text"
                            placeholder="VD: Kế toán trưởng"
                            value={studentForm.motherJob}
                            onChange={(e) => setStudentForm({ ...studentForm, motherJob: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-rose-500"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Số điện thoại mẹ</label>
                          <input
                            type="tel"
                            placeholder="VD: 0907654321"
                            value={studentForm.motherPhone}
                            onChange={(e) => setStudentForm({ ...studentForm, motherPhone: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-rose-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Người đại diện liên hệ chính & Địa chỉ */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                      <div className="font-black text-slate-800 text-xs flex items-center justify-between">
                        <span>📞 Thông Tin Liên Lạc Chính & Địa Chỉ Gia Đình</span>
                        <span className="text-[10px] text-slate-400 font-normal">(Nhận SMS/Zalo thông báo nhà trường)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Người đại diện liên hệ chính <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="VD: Cha hoặc Mẹ (tự động điền nếu để trống)"
                            value={studentForm.parentName}
                            onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Số điện thoại liên hệ chính <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="VD: 0901234567 (Hoặc SĐT Cha / Mẹ)"
                            value={studentForm.parentPhone}
                            onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-indigo-600 focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Địa chỉ gia đình</label>
                        <input
                          type="text"
                          placeholder="VD: 123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM"
                          value={studentForm.address}
                          onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowStudentModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <div className="flex items-center gap-2">
                    {studentModalTab === "student" ? (
                      <button
                        type="button"
                        onClick={() => setStudentModalTab("parent")}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Tiếp: Phụ Huynh →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStudentModalTab("student")}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        ← Quay lại Học Sinh
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <span>{isEditingStudent ? "Cập Nhật Hồ Sơ" : "Lưu Hồ Sơ Hoàn Tất"}</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MỞ LỚP MỚI */}
      {/* ========================================================================= */}
      {showAddClassModal && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-slate-900 text-base">Mở Thêm Lớp Học Mới</h3>
                </div>
                <button
                  onClick={() => setShowAddClassModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddClass} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên lớp học <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Mầm 2, Chồi 3, Lá 2..."
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Giáo viên chủ nhiệm phụ trách <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cô Nguyễn Thị Lan"
                    value={classForm.teacherName}
                    onChange={(e) => setClassForm({ ...classForm, teacherName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddClassModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    Tạo Lớp Mới
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: HỒ SƠ CHI TIẾT 360 ĐỘ CỦA HỌC SINH & PHỤ HUYNH */}
      {/* ========================================================================= */}
      {selectedStudentDetail && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn space-y-4 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-base flex items-center justify-center shadow-md">
                    {selectedStudentDetail.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <span>{selectedStudentDetail.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        selectedStudentDetail.gender === "Nữ" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {selectedStudentDetail.gender || "Nam"}
                      </span>
                      {(() => {
                        const currStatus = (selectedStudentDetail.status || "STUDYING") as StudentAcademicStatus;
                        const conf = STUDENT_STATUS_MAP[currStatus] || STUDENT_STATUS_MAP.STUDYING;
                        return (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border ${conf.bg}`}>
                            {conf.icon} {conf.label}
                          </span>
                        );
                      })()}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mt-0.5">
                      <span className="bg-indigo-50 px-2 py-0.5 rounded-md font-mono">
                        Mã HS: {selectedStudentDetail.code}
                      </span>
                      <span>•</span>
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md">
                        Lớp {selectedStudentDetail.className}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const st = selectedStudentDetail;
                      handleOpenEditModal(st);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Sửa hồ sơ"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Sửa hồ sơ</span>
                  </button>
                  <button
                    onClick={() => setSelectedStudentDetail(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* 1. THÔNG TIN CÁ NHÂN HỌC SINH */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="font-extrabold text-slate-900 pb-1 border-b border-slate-200 text-xs flex items-center gap-1.5">
                    <span>👶 Thông Tin Cá Nhân Học Sinh</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-bold">Mã học sinh:</span>
                      <span className="font-extrabold text-indigo-600 font-mono">{selectedStudentDetail.code}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-bold">Giới tính:</span>
                      <span className="font-extrabold text-slate-900">{selectedStudentDetail.gender || "Nam"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-bold">Ngày sinh:</span>
                      <span className="font-extrabold text-slate-900">{selectedStudentDetail.birthDate || "---"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-bold">Dân tộc:</span>
                      <span className="font-extrabold text-slate-900">{selectedStudentDetail.ethnicity || "Kinh"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-bold">Quốc tịch:</span>
                      <span className="font-extrabold text-slate-900">{selectedStudentDetail.nationality || "Việt Nam"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-bold">Lớp học:</span>
                      <span className="font-extrabold text-indigo-700">{selectedStudentDetail.className}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-bold">Ngày nhập học:</span>
                      <span className="font-extrabold text-emerald-700">{selectedStudentDetail.enrollmentDate || selectedStudentDetail.joinDate || "---"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-bold">Trạng thái:</span>
                      <span className="font-extrabold text-slate-900">
                        {STUDENT_STATUS_MAP[(selectedStudentDetail.status || "STUDYING") as StudentAcademicStatus]?.label || "Đang học"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between pt-1">
                    <span className="text-slate-500 font-bold shrink-0">Cư trú:</span>
                    <span className="font-medium text-slate-800 text-right ml-2">
                      {selectedStudentDetail.residence || selectedStudentDetail.address || "---"}
                    </span>
                  </div>
                </div>

                {/* 2. THÔNG TIN PHỤ HUYNH (CHA & MẸ) */}
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="font-extrabold text-indigo-950 pb-1 border-b border-indigo-100 text-xs flex items-center justify-between">
                    <span>👨‍👩‍👧 Thông Tin Phụ Huynh Theo Từng Bé</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Card Cha */}
                    <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-2xs space-y-1.5">
                      <div className="font-bold text-blue-900 text-[11px] flex items-center gap-1">
                        <span>👨 Thông tin Cha:</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-500">Họ tên:</span>{" "}
                        <strong className="text-slate-900">{selectedStudentDetail.fatherName || "Chưa cập nhật"}</strong>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-500">Nghề nghiệp:</span>{" "}
                        <span className="text-slate-800 font-medium">{selectedStudentDetail.fatherJob || "---"}</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-500">SĐT:</span>{" "}
                        <span className="font-bold text-blue-600 font-mono">{selectedStudentDetail.fatherPhone || "---"}</span>
                      </div>
                    </div>

                    {/* Card Mẹ */}
                    <div className="p-3 bg-white rounded-xl border border-rose-100 shadow-2xs space-y-1.5">
                      <div className="font-bold text-rose-900 text-[11px] flex items-center gap-1">
                        <span>👩 Thông tin Mẹ:</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-500">Họ tên:</span>{" "}
                        <strong className="text-slate-900">{selectedStudentDetail.motherName || "Chưa cập nhật"}</strong>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-500">Nghề nghiệp:</span>{" "}
                        <span className="text-slate-800 font-medium">{selectedStudentDetail.motherJob || "---"}</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-slate-500">SĐT:</span>{" "}
                        <span className="font-bold text-rose-600 font-mono">{selectedStudentDetail.motherPhone || "---"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Liên hệ chính & Địa chỉ */}
                  <div className="p-2.5 bg-white/80 rounded-xl border border-indigo-100/80 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Người liên hệ chính:</span>
                      <span className="font-extrabold text-slate-900">{selectedStudentDetail.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">SĐT liên hệ:</span>
                      <span className="font-extrabold text-indigo-600 font-mono">{selectedStudentDetail.parentPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Địa chỉ gia đình:</span>
                      <span className="font-medium text-slate-800 text-right">{selectedStudentDetail.address || "---"}</span>
                    </div>
                  </div>
                </div>

                {/* 3. CHI TIẾT BÓC TÁCH HỌC PHÍ */}
                {(() => {
                  const breakdown = getStudentFeeBreakdown(
                    selectedStudentDetail,
                    feeItems,
                    selectedStudentDetail.invoice
                  );
                  const itemsToShow = breakdown.items || [];
                  return (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200">
                        <span>Hạng mục thu ({selectedStudentDetail.className})</span>
                        <span>Định mức</span>
                      </div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {itemsToShow.map((item: any, idx: number) => (
                          <div key={item.id || idx} className="flex justify-between items-center text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-600 font-medium">{item.name}:</span>
                              {item.categoryName && item.categoryName !== "Gói học phí chuẩn" && (
                                <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">Tự chọn</span>
                              )}
                            </div>
                            <span className="font-bold text-slate-800">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="font-extrabold text-slate-800 text-xs">Tổng học phí tháng:</span>
                        <span className="font-black text-indigo-600 text-sm">
                          {formatCurrency(selectedStudentDetail.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Trạng thái & Thao tác đóng tiền nhanh */}
                <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">Trạng thái học phí:</span>
                    {selectedStudentDetail.tuitionStatus === "PAID" ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-500 text-white px-3 py-1 rounded-full font-bold text-xs mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã đóng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-500 text-white px-3 py-1 rounded-full font-bold text-xs mt-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Chưa đóng
                      </span>
                    )}
                  </div>
                  <div>
                    {selectedStudentDetail.tuitionStatus !== "PAID" ? (
                      <button
                        onClick={async () => {
                          const stId = selectedStudentDetail.id;
                          const stAmount = selectedStudentDetail.amount;
                          const breakdown = getStudentFeeBreakdown(
                            selectedStudentDetail,
                            feeItems,
                            selectedStudentDetail.invoice
                          );

                          setSelectedStudentDetail((prev) => (prev ? { ...prev, tuitionStatus: "PAID" } : null));
                          setStudents((prev) =>
                            prev.map((s) => (s.id === stId ? { ...s, tuitionStatus: "PAID" } : s))
                          );

                          await saveInvoicePaymentToDB(
                            stId,
                            new Date().getMonth() + 1,
                            new Date().getFullYear(),
                            stAmount,
                            "PAID",
                            "CASH",
                            breakdown
                          );
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Xác nhận đã thu
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          const stId = selectedStudentDetail.id;
                          const stAmount = selectedStudentDetail.amount;

                          setSelectedStudentDetail((prev) => (prev ? { ...prev, tuitionStatus: "UNPAID" } : null));
                          setStudents((prev) =>
                            prev.map((s) => (s.id === stId ? { ...s, tuitionStatus: "UNPAID" } : s))
                          );

                          await saveInvoicePaymentToDB(
                            stId,
                            new Date().getMonth() + 1,
                            new Date().getFullYear(),
                            stAmount,
                            "UNPAID",
                            "CASH"
                          );
                        }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Đổi sang Chưa đóng
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
