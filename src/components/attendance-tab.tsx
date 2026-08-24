"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Save,
  Filter,
  CheckCheck,
  Search,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Award,
  CalendarDays,
  RefreshCw,
  Sparkles,
  CalendarRange,
  Table,
  LayoutGrid,
  Coins,
  AlertTriangle,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { formatCurrency, cn } from "@/lib/utils";

// Đơn giá tiền ăn hoàn trả cho ngày nghỉ có phép (theo quy định nhà trường: 30.000đ/ngày)
const DAILY_MEAL_RATE = 30000;

interface StudentItem {
  id: string;
  code?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  className: string;
  classId?: string;
  parentName?: string;
  parentPhone?: string;
}

interface DailyAttendanceItem {
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  status: "PRESENT" | "ABSENT_PERMIT" | "ABSENT_NO_PERMIT";
  pickupPerson: string;
  notes: string;
}

interface RawAttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: "PRESENT" | "ABSENT_PERMIT" | "ABSENT_NO_PERMIT";
  pickupPerson?: string | null;
  notes?: string | null;
  student?: {
    id: string;
    code?: string | null;
    firstName: string;
    lastName: string;
    class?: {
      id: string;
      name: string;
    } | null;
  };
}

// ===== HELPER FUNCTIONS FOR DATE & WEEK =====

// Lấy ngày Thứ Hai của tuần chứa ngày d
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Lấy danh sách 5 ngày học trong tuần (Thứ 2 đến Thứ 6)
function getWeekDays(monday: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    days.push(nextDay);
  }
  return days;
}

// Định dạng YYYY-MM-DD
function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Định dạng dd/MM
function formatDateShort(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${month}`;
}

// Định dạng dd/MM/YYYY
function formatDateFull(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
}

// Lấy số tuần trong năm (ISO Week Number)
function getWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

// Lấy số ngày trong tháng
function getDaysInMonthArray(year: number, month: number): Date[] {
  const date = new Date(year, month - 1, 1);
  const days: Date[] = [];
  while (date.getMonth() === month - 1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

const WEEKDAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function AttendanceTab() {
  // 1. View Mode: daily (Theo ngày) | weekly (Theo tuần) | monthly (Theo tháng)
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");

  // Dữ liệu học sinh & lớp học từ DB
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classList, setClassList] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ===== TAB 1: STATE ĐIỂM DANH THEO NGÀY =====
  const [selectedDate, setSelectedDate] = useState<string>(formatDateISO(new Date()));
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [dailySearchQuery, setDailySearchQuery] = useState<string>("");
  const [dailyAttendanceList, setDailyAttendanceList] = useState<DailyAttendanceItem[]>([]);
  const [isDailySaving, setIsDailySaving] = useState<boolean>(false);
  const [isDailyLoading, setIsDailyLoading] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // ===== TAB 2: STATE THỐNG KÊ THEO TUẦN =====
  const [currentMonday, setCurrentMonday] = useState<Date>(getMonday(new Date()));
  const [weeklyClass, setWeeklyClass] = useState<string>("ALL");
  const [weeklySearchQuery, setWeeklySearchQuery] = useState<string>("");
  const [weeklyAttendanceRecords, setWeeklyAttendanceRecords] = useState<RawAttendanceRecord[]>([]);
  const [isWeeklyLoading, setIsWeeklyLoading] = useState<boolean>(false);

  // ===== TAB 3: STATE THỐNG KÊ THEO THÁNG =====
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [monthlyClass, setMonthlyClass] = useState<string>("ALL");
  const [monthlySearchQuery, setMonthlySearchQuery] = useState<string>("");
  const [monthlySubView, setMonthlySubView] = useState<"summary" | "grid">("summary");
  const [monthlyAttendanceRecords, setMonthlyAttendanceRecords] = useState<RawAttendanceRecord[]>([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Tải danh sách lớp và học sinh ban đầu
  useEffect(() => {
    async function loadInitData() {
      try {
        setIsInitialLoading(true);
        // Tải danh sách lớp
        const resClasses = await fetch("/api/classes");
        const dbClasses = await resClasses.json();
        let loadedClasses: string[] = [];
        if (Array.isArray(dbClasses) && dbClasses.length > 0) {
          loadedClasses = dbClasses.map((c: any) => c.name);
          setClassList(loadedClasses);
        }

        // Tải danh sách học sinh
        const resStudents = await fetch("/api/students");
        const dbStudents = await resStudents.json();
        if (Array.isArray(dbStudents)) {
          const mapped: StudentItem[] = dbStudents.map((st: any) => ({
            id: st.id,
            code: st.code || `HS${st.id.slice(-3)}`,
            firstName: st.firstName || "",
            lastName: st.lastName || "",
            fullName: `${st.lastName || ""} ${st.firstName || ""}`.trim() || "Học sinh",
            className: st.class?.name || (loadedClasses[0] || "Mầm 1"),
            classId: st.classId,
            parentName: st.parentName || st.motherName || st.fatherName || "Phụ huynh",
            parentPhone: st.parentPhone || st.motherPhone || st.fatherPhone || "",
          }));
          setStudents(mapped);
        }
      } catch (error) {
        console.error("Lỗi tải danh mục lớp & học sinh:", error);
      } finally {
        setIsInitialLoading(false);
      }
    }
    loadInitData();
  }, []);

  // Thống kê sĩ số học sinh của từng lớp
  const classStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const cls = s.className || "Khác";
      counts[cls] = (counts[cls] || 0) + 1;
    });
    return counts;
  }, [students]);

  // Mảng danh sách tất cả các tùy chọn lớp (gồm ALL và các lớp)
  const allClassesOptions = useMemo(() => ["ALL", ...classList], [classList]);

  const handlePrevClass = (current: string, setter: (val: string) => void) => {
    const idx = allClassesOptions.indexOf(current);
    if (idx > 0) {
      setter(allClassesOptions[idx - 1]);
    }
  };

  const handleNextClass = (current: string, setter: (val: string) => void) => {
    const idx = allClassesOptions.indexOf(current);
    if (idx !== -1 && idx < allClassesOptions.length - 1) {
      setter(allClassesOptions[idx + 1]);
    }
  };

  // 2. Tải dữ liệu điểm danh theo ngày khi selectedDate thay đổi
  const fetchDailyAttendance = useCallback(async () => {
    if (!selectedDate || students.length === 0) return;
    setIsDailyLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${selectedDate}`);
      const data = await res.json();
      const records: RawAttendanceRecord[] = Array.isArray(data) ? data : [];

      const mappedList: DailyAttendanceItem[] = students.map((st) => {
        const found = records.find((r) => r.studentId === st.id);
        return {
          studentId: st.id,
          studentName: st.fullName,
          studentCode: st.code || `HS${st.id.slice(-3)}`,
          className: st.className,
          status: found ? found.status : "PRESENT",
          pickupPerson: found?.pickupPerson || "Bố / Mẹ",
          notes: found?.notes || "Bình thường",
        };
      });

      setDailyAttendanceList(mappedList);
    } catch (err) {
      console.error("Lỗi tải điểm danh ngày:", err);
    } finally {
      setIsDailyLoading(false);
    }
  }, [selectedDate, students]);

  useEffect(() => {
    if (students.length > 0) {
      fetchDailyAttendance();
    }
  }, [fetchDailyAttendance]);

  // 3. Tải dữ liệu điểm danh theo TUẦN khi currentMonday thay đổi
  const weekDays = useMemo(() => getWeekDays(currentMonday), [currentMonday]);
  const weekStartDateStr = useMemo(() => formatDateISO(weekDays[0]), [weekDays]);
  const weekEndDateStr = useMemo(() => formatDateISO(weekDays[4]), [weekDays]);

  const fetchWeeklyAttendance = useCallback(async () => {
    setIsWeeklyLoading(true);
    try {
      const res = await fetch(
        `/api/attendance?startDate=${weekStartDateStr}&endDate=${weekEndDateStr}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setWeeklyAttendanceRecords(data);
      } else {
        setWeeklyAttendanceRecords([]);
      }
    } catch (err) {
      console.error("Lỗi tải điểm danh tuần:", err);
      setWeeklyAttendanceRecords([]);
    } finally {
      setIsWeeklyLoading(false);
    }
  }, [weekStartDateStr, weekEndDateStr]);

  useEffect(() => {
    if (viewMode === "weekly") {
      fetchWeeklyAttendance();
    }
  }, [viewMode, fetchWeeklyAttendance]);

  // 4. Tải dữ liệu điểm danh theo THÁNG khi selectedMonth / selectedYear thay đổi
  const fetchMonthlyAttendance = useCallback(async () => {
    setIsMonthlyLoading(true);
    try {
      const res = await fetch(`/api/attendance?month=${selectedMonth}&year=${selectedYear}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMonthlyAttendanceRecords(data);
      } else {
        setMonthlyAttendanceRecords([]);
      }
    } catch (err) {
      console.error("Lỗi tải điểm danh tháng:", err);
      setMonthlyAttendanceRecords([]);
    } finally {
      setIsMonthlyLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (viewMode === "monthly") {
      fetchMonthlyAttendance();
    }
  }, [viewMode, fetchMonthlyAttendance]);

  // ===== XỬ LÝ ĐIỂM DANH THEO NGÀY (DAILY ACTIONS) =====
  const handleDailyStatusChange = (
    studentId: string,
    status: "PRESENT" | "ABSENT_PERMIT" | "ABSENT_NO_PERMIT"
  ) => {
    setDailyAttendanceList((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
    setSavedSuccess(false);
  };

  const handleDailyNotesChange = (studentId: string, notes: string) => {
    setDailyAttendanceList((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, notes } : item))
    );
    setSavedSuccess(false);
  };

  const handleDailyPickupChange = (studentId: string, pickupPerson: string) => {
    setDailyAttendanceList((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, pickupPerson } : item))
    );
    setSavedSuccess(false);
  };

  const handleMarkAllPresent = () => {
    setDailyAttendanceList((prev) =>
      prev.map((item) =>
        selectedClass === "ALL" || item.className === selectedClass
          ? { ...item, status: "PRESENT" }
          : item
      )
    );
    setSavedSuccess(false);
    showToast(
      selectedClass === "ALL"
        ? "Đã đánh dấu toàn bộ học sinh toàn trường Có mặt!"
        : `Đã đánh dấu toàn bộ học sinh lớp ${selectedClass} Có mặt!`
    );
  };

  const handleSaveDailyAttendance = async () => {
    setIsDailySaving(true);
    try {
      const recordsToSave = currentClassDailyList.map((item) => ({
        studentId: item.studentId,
        status: item.status,
        pickupPerson: item.pickupPerson,
        notes: item.notes,
        date: selectedDate,
      }));

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendances: recordsToSave }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        const classNameLabel = selectedClass === "ALL" ? "toàn trường" : `lớp ${selectedClass}`;
        showToast(`Đã lưu điểm danh ${classNameLabel} ngày ${formatDateFull(new Date(selectedDate))} thành công!`);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        showToast("Lỗi khi lưu điểm danh!");
      }
    } catch (err) {
      console.error("Lỗi lưu điểm danh:", err);
      showToast("Lỗi kết nối máy chủ khi lưu điểm danh!");
    } finally {
      setIsDailySaving(false);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateISO(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDateISO(d));
  };

  const handleToday = () => {
    setSelectedDate(formatDateISO(new Date()));
  };

  // Danh sách học sinh theo lớp đã chọn cho Tab Ngày
  const currentClassDailyList = useMemo(() => {
    if (selectedClass === "ALL") return dailyAttendanceList;
    return dailyAttendanceList.filter((s) => s.className === selectedClass);
  }, [dailyAttendanceList, selectedClass]);

  const dailyFilteredList = useMemo(() => {
    return currentClassDailyList.filter((item) =>
      item.studentName.toLowerCase().includes(dailySearchQuery.toLowerCase()) ||
      item.studentCode.toLowerCase().includes(dailySearchQuery.toLowerCase()) ||
      item.pickupPerson.toLowerCase().includes(dailySearchQuery.toLowerCase())
    );
  }, [currentClassDailyList, dailySearchQuery]);

  const dailyPresentCount = currentClassDailyList.filter((a) => a.status === "PRESENT").length;
  const dailyAbsentPermitCount = currentClassDailyList.filter((a) => a.status === "ABSENT_PERMIT").length;
  const dailyAbsentNoPermitCount = currentClassDailyList.filter((a) => a.status === "ABSENT_NO_PERMIT").length;
  const dailyTotalCount = currentClassDailyList.length;
  const dailyAttendanceRate = dailyTotalCount > 0 ? Math.round((dailyPresentCount / dailyTotalCount) * 100) : 0;

  // Xuất Excel Điểm danh ngày
  const handleExportDailyExcel = () => {
    const headers = ["STT", "Mã HS", "Họ và tên học sinh", "Lớp", "Trạng thái điểm danh", "Người đưa/đón", "Ghi chú sức khỏe"];
    const statusMap = {
      PRESENT: "Có mặt",
      ABSENT_PERMIT: "Vắng có phép",
      ABSENT_NO_PERMIT: "Vắng không phép",
    };
    const rows = dailyFilteredList.map((item, idx) => [
      idx + 1,
      item.studentCode,
      item.studentName,
      item.className,
      statusMap[item.status] || item.status,
      item.pickupPerson || "Bố/Mẹ",
      item.notes || "Bình thường",
    ]);
    const classNameLabel = selectedClass === "ALL" ? "Toàn trường" : `Lớp ${selectedClass}`;
    const summary = [
      { label: "Ngày điểm danh", value: formatDateFull(new Date(selectedDate)) },
      { label: "Lớp học", value: classNameLabel },
      { label: "Sĩ số có mặt", value: `${dailyPresentCount}/${dailyTotalCount} trẻ (${dailyAttendanceRate}%)` },
      { label: "Vắng có phép (hoàn tiền ăn)", value: `${dailyAbsentPermitCount} trẻ` },
      { label: "Vắng không phép", value: `${dailyAbsentNoPermitCount} trẻ` },
    ];
    exportToExcel(`Diem_Danh_${selectedClass}_Ngay_${selectedDate}`, headers, rows, summary);
  };

  // In PDF Điểm danh ngày
  const handleExportDailyPDF = () => {
    const headers = ["STT", "Mã HS", "Họ và tên học sinh", "Lớp", "Trạng thái", "Người đưa/đón", "Ghi chú"];
    const statusMap = {
      PRESENT: "Có mặt",
      ABSENT_PERMIT: "Vắng có phép (Hoàn ăn)",
      ABSENT_NO_PERMIT: "Vắng không phép",
    };
    const rows = dailyFilteredList.map((item, idx) => [
      idx + 1,
      item.studentCode,
      item.studentName,
      item.className,
      statusMap[item.status] || item.status,
      item.pickupPerson || "Bố/Mẹ",
      item.notes || "Bình thường",
    ]);
    const classNameLabel = selectedClass === "ALL" ? "TOÀN TRƯỜNG" : `LỚP ${selectedClass.toUpperCase()}`;
    const summary = [
      { label: "Ngày điểm danh", value: formatDateFull(new Date(selectedDate)) },
      { label: "Phạm vi", value: classNameLabel },
      { label: "Sĩ số có mặt", value: `${dailyPresentCount}/${dailyTotalCount} trẻ (${dailyAttendanceRate}%)` },
      { label: "Vắng có phép", value: `${dailyAbsentPermitCount} trẻ` },
      { label: "Vắng không phép", value: `${dailyAbsentNoPermitCount} trẻ` },
    ];
    exportToPDF(`BẢNG ĐIỂM DANH HỌC SINH ${classNameLabel} - NGÀY ${formatDateFull(new Date(selectedDate))}`, headers, rows, summary);
  };

  // ===== XỬ LÝ THỐNG KÊ THEO TUẦN (WEEKLY COMPUTATIONS) =====
  const handlePrevWeek = () => {
    const newMon = new Date(currentMonday);
    newMon.setDate(newMon.getDate() - 7);
    setCurrentMonday(newMon);
  };

  const handleNextWeek = () => {
    const newMon = new Date(currentMonday);
    newMon.setDate(newMon.getDate() + 7);
    setCurrentMonday(newMon);
  };

  const handleThisWeek = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  // Map điểm danh tuần theo từng học sinh và từng ngày (Key: `${studentId}_${YYYY-MM-DD}`)
  const weeklyAttendanceMap = useMemo(() => {
    const map = new Map<string, RawAttendanceRecord>();
    weeklyAttendanceRecords.forEach((rec) => {
      if (!rec.studentId || !rec.date) return;
      const dateStr = formatDateISO(new Date(rec.date));
      map.set(`${rec.studentId}_${dateStr}`, rec);
    });
    return map;
  }, [weeklyAttendanceRecords]);

  // Lọc danh sách học sinh cho Tab Tuần
  const weeklyFilteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = weeklyClass === "ALL" || s.className === weeklyClass;
      const matchSearch =
        s.fullName.toLowerCase().includes(weeklySearchQuery.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(weeklySearchQuery.toLowerCase()));
      return matchClass && matchSearch;
    });
  }, [students, weeklyClass, weeklySearchQuery]);

  // Tổng hợp thống kê từng học sinh trong tuần
  const weeklyStudentStats = useMemo(() => {
    return weeklyFilteredStudents.map((st) => {
      let presentDays = 0;
      let absentPermitDays = 0;
      let absentNoPermitDays = 0;
      let recordedDays = 0;

      const dayStatuses = weekDays.map((day) => {
        const dateStr = formatDateISO(day);
        const record = weeklyAttendanceMap.get(`${st.id}_${dateStr}`);
        if (record) {
          recordedDays++;
          if (record.status === "PRESENT") presentDays++;
          else if (record.status === "ABSENT_PERMIT") absentPermitDays++;
          else if (record.status === "ABSENT_NO_PERMIT") absentNoPermitDays++;
        }
        return {
          date: day,
          dateStr,
          status: record?.status || null,
          pickupPerson: record?.pickupPerson || null,
          notes: record?.notes || null,
        };
      });

      const expectedDays = 5;
      const rate = expectedDays > 0 ? Math.round((presentDays / expectedDays) * 100) : 0;

      let rank = "Cần lưu ý";
      let rankBadge = "bg-rose-50 text-rose-700 border-rose-200";
      if (rate === 100) {
        rank = "Xuất sắc ⭐";
        rankBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
      } else if (rate >= 80) {
        rank = "Tốt";
        rankBadge = "bg-blue-50 text-blue-700 border-blue-200";
      }

      return {
        student: st,
        dayStatuses,
        presentDays,
        absentPermitDays,
        absentNoPermitDays,
        recordedDays,
        rate,
        rank,
        rankBadge,
      };
    });
  }, [weeklyFilteredStudents, weekDays, weeklyAttendanceMap]);

  // Tổng hợp KPI toàn bộ theo Tuần
  const weeklyKpis = useMemo(() => {
    let totalPresent = 0;
    let totalAbsentPermit = 0;
    let totalAbsentNoPermit = 0;

    weeklyStudentStats.forEach((s) => {
      totalPresent += s.presentDays;
      totalAbsentPermit += s.absentPermitDays;
      totalAbsentNoPermit += s.absentNoPermitDays;
    });

    const totalRecords = totalPresent + totalAbsentPermit + totalAbsentNoPermit;
    const totalExpectedSlots = weeklyStudentStats.length * 5;
    const avgAttendanceRate =
      totalExpectedSlots > 0 ? Math.round((totalPresent / totalExpectedSlots) * 100) : 0;

    const dayStats = weekDays.map((day, idx) => {
      const dateStr = formatDateISO(day);
      let dayPresent = 0;
      let dayPermit = 0;
      let dayNoPermit = 0;

      weeklyStudentStats.forEach((s) => {
        const stDay = s.dayStatuses[idx];
        if (stDay.status === "PRESENT") dayPresent++;
        else if (stDay.status === "ABSENT_PERMIT") dayPermit++;
        else if (stDay.status === "ABSENT_NO_PERMIT") dayNoPermit++;
      });

      const dayTotal = weeklyStudentStats.length;
      const dayRate = dayTotal > 0 ? Math.round((dayPresent / dayTotal) * 100) : 0;

      return {
        day,
        dateStr,
        weekdayName: `Thứ ${idx + 2}`,
        shortDate: formatDateShort(day),
        present: dayPresent,
        absentPermit: dayPermit,
        absentNoPermit: dayNoPermit,
        total: dayTotal,
        rate: dayRate,
      };
    });

    return {
      totalPresent,
      totalAbsentPermit,
      totalAbsentNoPermit,
      totalRecords,
      avgAttendanceRate,
      dayStats,
    };
  }, [weeklyStudentStats, weekDays]);

  // Xuất Excel Thống kê tuần
  const handleExportWeeklyExcel = () => {
    const headers = [
      "STT",
      "Mã HS",
      "Họ và tên học sinh",
      "Lớp",
      `T2 (${formatDateShort(weekDays[0])})`,
      `T3 (${formatDateShort(weekDays[1])})`,
      `T4 (${formatDateShort(weekDays[2])})`,
      `T5 (${formatDateShort(weekDays[3])})`,
      `T6 (${formatDateShort(weekDays[4])})`,
      "Có mặt (ngày)",
      "Có phép (ngày)",
      "K.phép (ngày)",
      "Tỷ lệ chuyên cần",
      "Xếp loại",
    ];

    const statusShortMap: Record<string, string> = {
      PRESENT: "Có mặt",
      ABSENT_PERMIT: "Nghỉ phép",
      ABSENT_NO_PERMIT: "Không phép",
    };

    const rows = weeklyStudentStats.map((item, idx) => [
      idx + 1,
      item.student.code || `HS0${idx + 1}`,
      item.student.fullName,
      item.student.className,
      item.dayStatuses[0]?.status ? statusShortMap[item.dayStatuses[0].status] : "—",
      item.dayStatuses[1]?.status ? statusShortMap[item.dayStatuses[1].status] : "—",
      item.dayStatuses[2]?.status ? statusShortMap[item.dayStatuses[2].status] : "—",
      item.dayStatuses[3]?.status ? statusShortMap[item.dayStatuses[3].status] : "—",
      item.dayStatuses[4]?.status ? statusShortMap[item.dayStatuses[4].status] : "—",
      item.presentDays,
      item.absentPermitDays,
      item.absentNoPermitDays,
      `${item.rate}%`,
      item.rank,
    ]);

    const weekNumber = getWeekNumber(currentMonday);
    const summary = [
      { label: "Tuần học", value: `Tuần ${weekNumber} (${formatDateShort(weekDays[0])} - ${formatDateShort(weekDays[4])}/${currentMonday.getFullYear()})` },
      { label: "Lớp áp dụng", value: weeklyClass === "ALL" ? "Toàn trường (Tất cả các lớp)" : `Lớp ${weeklyClass}` },
      { label: "Tổng sĩ số", value: `${weeklyStudentStats.length} học sinh` },
      { label: "Tỷ lệ chuyên cần TB", value: `${weeklyKpis.avgAttendanceRate}%` },
      { label: "Tổng lượt Có mặt", value: `${weeklyKpis.totalPresent} lượt` },
      { label: "Vắng có phép (hoàn ăn)", value: `${weeklyKpis.totalAbsentPermit} lượt` },
      { label: "Vắng không phép", value: `${weeklyKpis.totalAbsentNoPermit} lượt` },
    ];

    exportToExcel(`Thong_Ke_Chuyen_Can_Tuan_${weekNumber}_Nam_${currentMonday.getFullYear()}`, headers, rows, summary);
  };

  // In PDF Thống kê tuần
  const handleExportWeeklyPDF = () => {
    const headers = [
      "STT",
      "Mã HS",
      "Họ và tên",
      "Lớp",
      `T2 (${formatDateShort(weekDays[0])})`,
      `T3 (${formatDateShort(weekDays[1])})`,
      `T4 (${formatDateShort(weekDays[2])})`,
      `T5 (${formatDateShort(weekDays[3])})`,
      `T6 (${formatDateShort(weekDays[4])})`,
      "Có mặt",
      "Phép",
      "K.Phép",
      "Tỷ lệ",
      "Xếp loại",
    ];

    const statusShortMap: Record<string, string> = {
      PRESENT: "✓",
      ABSENT_PERMIT: "P",
      ABSENT_NO_PERMIT: "K",
    };

    const rows = weeklyStudentStats.map((item, idx) => [
      idx + 1,
      item.student.code || `HS0${idx + 1}`,
      item.student.fullName,
      item.student.className,
      item.dayStatuses[0]?.status ? statusShortMap[item.dayStatuses[0].status] : "-",
      item.dayStatuses[1]?.status ? statusShortMap[item.dayStatuses[1].status] : "-",
      item.dayStatuses[2]?.status ? statusShortMap[item.dayStatuses[2].status] : "-",
      item.dayStatuses[3]?.status ? statusShortMap[item.dayStatuses[3].status] : "-",
      item.dayStatuses[4]?.status ? statusShortMap[item.dayStatuses[4].status] : "-",
      item.presentDays,
      item.absentPermitDays,
      item.absentNoPermitDays,
      `${item.rate}%`,
      item.rank,
    ]);

    const weekNumber = getWeekNumber(currentMonday);
    const summary = [
      { label: "Kỳ báo cáo tuần", value: `Tuần ${weekNumber} (${formatDateShort(weekDays[0])} đến ${formatDateShort(weekDays[4])})` },
      { label: "Lớp", value: weeklyClass === "ALL" ? "Tất cả các lớp" : `Lớp ${weeklyClass}` },
      { label: "Sĩ số", value: `${weeklyStudentStats.length} học sinh` },
      { label: "Tỷ lệ chuyên cần tuần", value: `${weeklyKpis.avgAttendanceRate}%` },
      { label: "Lượt vắng có phép", value: `${weeklyKpis.totalAbsentPermit} lượt` },
      { label: "Lượt vắng không phép", value: `${weeklyKpis.totalAbsentNoPermit} lượt` },
    ];

    exportToPDF(
      `BẢNG TỔNG HỢP ĐIỂM DANH CHUYÊN CẦN THEO TUẦN - TUẦN ${weekNumber}`,
      headers,
      rows,
      summary
    );
  };

  // ===== XỬ LÝ THỐNG KÊ THEO THÁNG (MONTHLY COMPUTATIONS) =====
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleThisMonth = () => {
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
  };

  // Danh sách các ngày trong tháng
  const monthDaysArray = useMemo(() => {
    return getDaysInMonthArray(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Map điểm danh tháng (Key: `${studentId}_${YYYY-MM-DD}`)
  const monthlyAttendanceMap = useMemo(() => {
    const map = new Map<string, RawAttendanceRecord>();
    monthlyAttendanceRecords.forEach((rec) => {
      if (!rec.studentId || !rec.date) return;
      const dateStr = formatDateISO(new Date(rec.date));
      map.set(`${rec.studentId}_${dateStr}`, rec);
    });
    return map;
  }, [monthlyAttendanceRecords]);

  // Lọc học sinh cho Tab Tháng
  const monthlyFilteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = monthlyClass === "ALL" || s.className === monthlyClass;
      const matchSearch =
        s.fullName.toLowerCase().includes(monthlySearchQuery.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(monthlySearchQuery.toLowerCase()));
      return matchClass && matchSearch;
    });
  }, [students, monthlyClass, monthlySearchQuery]);

  // Thống kê chi tiết tháng từng học sinh
  const monthlyStudentStats = useMemo(() => {
    // Tập hợp các ngày có điểm danh trong tháng (để xác định số ngày học thực tế)
    const distinctRecordedDates = new Set<string>();
    monthlyAttendanceRecords.forEach((r) => {
      if (r.date) distinctRecordedDates.add(formatDateISO(new Date(r.date)));
    });
    const totalRecordedDaysInMonth = Math.max(distinctRecordedDates.size, 1);

    return monthlyFilteredStudents.map((st) => {
      let presentDays = 0;
      let absentPermitDays = 0;
      let absentNoPermitDays = 0;

      const dailyRecords = monthDaysArray.map((day) => {
        const dateStr = formatDateISO(day);
        const rec = monthlyAttendanceMap.get(`${st.id}_${dateStr}`);
        if (rec) {
          if (rec.status === "PRESENT") presentDays++;
          else if (rec.status === "ABSENT_PERMIT") absentPermitDays++;
          else if (rec.status === "ABSENT_NO_PERMIT") absentNoPermitDays++;
        }
        return {
          day,
          dateStr,
          status: rec?.status || null,
        };
      });

      const totalActiveDays = presentDays + absentPermitDays + absentNoPermitDays;
      const rateBasis = totalActiveDays > 0 ? totalActiveDays : totalRecordedDaysInMonth;
      const attendanceRate = rateBasis > 0 ? Math.round((presentDays / rateBasis) * 100) : 0;
      const mealRefundEstimate = absentPermitDays * DAILY_MEAL_RATE;

      let diligenceRank = "Cần theo dõi";
      let rankBadge = "bg-rose-50 text-rose-700 border-rose-200";
      if (absentNoPermitDays === 0 && absentPermitDays === 0 && presentDays > 0) {
        diligenceRank = "Bé ngoan chuyên cần ⭐⭐⭐";
        rankBadge = "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold";
      } else if (attendanceRate >= 85) {
        diligenceRank = "Đạt chuẩn";
        rankBadge = "bg-blue-50 text-blue-700 border-blue-200";
      }

      return {
        student: st,
        presentDays,
        absentPermitDays,
        absentNoPermitDays,
        totalActiveDays,
        attendanceRate,
        mealRefundEstimate,
        diligenceRank,
        rankBadge,
        dailyRecords,
      };
    });
  }, [monthlyFilteredStudents, monthDaysArray, monthlyAttendanceMap, monthlyAttendanceRecords]);

  // Thống kê KPI tháng
  const monthlyKpis = useMemo(() => {
    let totalPresent = 0;
    let totalAbsentPermit = 0;
    let totalAbsentNoPermit = 0;
    let totalMealRefund = 0;

    monthlyStudentStats.forEach((s) => {
      totalPresent += s.presentDays;
      totalAbsentPermit += s.absentPermitDays;
      totalAbsentNoPermit += s.absentNoPermitDays;
      totalMealRefund += s.mealRefundEstimate;
    });

    const totalRecords = totalPresent + totalAbsentPermit + totalAbsentNoPermit;
    const avgRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    // Top các bé chuyên cần 100%
    const topDiligenceStudents = monthlyStudentStats.filter(
      (s) => s.presentDays > 0 && s.absentPermitDays === 0 && s.absentNoPermitDays === 0
    );

    // Danh sách các bé vắng nhiều (>= 3 buổi nghỉ không phép hoặc >= 4 buổi tổng)
    const alertStudents = monthlyStudentStats.filter(
      (s) => s.absentNoPermitDays >= 2 || s.absentPermitDays + s.absentNoPermitDays >= 4
    );

    // Tính tỷ lệ chuyên cần theo từng lớp để tìm lớp cao nhất
    const classRateMap: Record<string, { present: number; total: number }> = {};
    monthlyStudentStats.forEach((s) => {
      const cls = s.student.className;
      if (!classRateMap[cls]) classRateMap[cls] = { present: 0, total: 0 };
      classRateMap[cls].present += s.presentDays;
      classRateMap[cls].total += s.presentDays + s.absentPermitDays + s.absentNoPermitDays;
    });

    let topClassName = "—";
    let highestClassRate = 0;
    Object.entries(classRateMap).forEach(([cName, val]) => {
      const r = val.total > 0 ? Math.round((val.present / val.total) * 100) : 0;
      if (r > highestClassRate) {
        highestClassRate = r;
        topClassName = cName;
      }
    });

    return {
      totalPresent,
      totalAbsentPermit,
      totalAbsentNoPermit,
      totalMealRefund,
      avgRate,
      topDiligenceStudents,
      alertStudents,
      topClassName,
      highestClassRate,
    };
  }, [monthlyStudentStats]);

  // Xuất Excel Thống kê tháng
  const handleExportMonthlyExcel = () => {
    const headers = [
      "STT",
      "Mã HS",
      "Họ và tên học sinh",
      "Lớp",
      "Số ngày đi học (Có mặt)",
      "Nghỉ có phép (ngày)",
      "Nghỉ không phép (ngày)",
      "Tỷ lệ chuyên cần",
      "Tiền ăn hoàn trả (VNĐ)",
      "Đánh giá chuyên cần",
    ];

    const rows = monthlyStudentStats.map((item, idx) => [
      idx + 1,
      item.student.code || `HS0${idx + 1}`,
      item.student.fullName,
      item.student.className,
      item.presentDays,
      item.absentPermitDays,
      item.absentNoPermitDays,
      `${item.attendanceRate}%`,
      item.mealRefundEstimate,
      item.diligenceRank,
    ]);

    const classNameLabel = monthlyClass === "ALL" ? "Toàn trường" : `Lớp ${monthlyClass}`;
    const summary = [
      { label: "Kỳ báo cáo", value: `Tháng ${selectedMonth}/${selectedYear}` },
      { label: "Lớp học", value: classNameLabel },
      { label: "Tổng sĩ số", value: `${monthlyStudentStats.length} học sinh` },
      { label: "Tỷ lệ chuyên cần TB toàn tháng", value: `${monthlyKpis.avgRate}%` },
      { label: "Tổng lượt Có mặt", value: `${monthlyKpis.totalPresent} lượt` },
      { label: "Tổng lượt Nghỉ có phép", value: `${monthlyKpis.totalAbsentPermit} lượt` },
      { label: "Tổng tiền ăn hoàn lại", value: formatCurrency(monthlyKpis.totalMealRefund) },
    ];

    exportToExcel(`Bao_Cao_Chuyen_Can_Thang_${selectedMonth}_${selectedYear}`, headers, rows, summary);
  };

  // In PDF Thống kê tháng
  const handleExportMonthlyPDF = () => {
    const headers = [
      "STT",
      "Mã HS",
      "Họ và tên học sinh",
      "Lớp",
      "Có mặt",
      "Nghỉ phép",
      "K.Phép",
      "Tỷ lệ",
      "Hoàn tiền ăn (đ)",
      "Đánh giá",
    ];

    const rows = monthlyStudentStats.map((item, idx) => [
      idx + 1,
      item.student.code || `HS0${idx + 1}`,
      item.student.fullName,
      item.student.className,
      `${item.presentDays} ngày`,
      `${item.absentPermitDays} ngày`,
      `${item.absentNoPermitDays} ngày`,
      `${item.attendanceRate}%`,
      formatCurrency(item.mealRefundEstimate),
      item.diligenceRank,
    ]);

    const classNameLabel = monthlyClass === "ALL" ? "Toàn trường" : `Lớp ${monthlyClass}`;
    const summary = [
      { label: "Kỳ báo cáo", value: `Tháng ${selectedMonth}/${selectedYear}` },
      { label: "Lớp", value: classNameLabel },
      { label: "Tổng sĩ số", value: `${monthlyStudentStats.length} học sinh` },
      { label: "Tỷ lệ chuyên cần", value: `${monthlyKpis.avgRate}%` },
      { label: "Tổng lượt vắng có phép", value: `${monthlyKpis.totalAbsentPermit} lượt` },
      { label: "Tổng tiền ăn hoàn trả cho PH", value: formatCurrency(monthlyKpis.totalMealRefund) },
    ];

    exportToPDF(
      `BÁO CÁO ĐIỂM DANH CHUYÊN CẦN & HOÀN TIỀN ĂN - THÁNG ${selectedMonth}/${selectedYear}`,
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 font-sans">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-slideDown">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. ERP MODULE HEADER & VIEW MODE SELECTOR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Module Title */}
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-600 rounded-2xl text-white shadow-md shadow-emerald-500/20 shrink-0">
              <CheckCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Điểm Danh Chuyên Cần & Thống Kê
                </h1>
                <span className="text-xs font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Tự động đối soát học phí & tiền ăn
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Theo dõi chuyên cần theo ngày, tuần, tháng. Trẻ nghỉ có phép tự động được hoàn tiền ăn (30.000đ/ngày).
              </p>
            </div>
          </div>

          {/* View Mode Switcher: Ngày / Tuần / Tháng */}
          <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70 w-full sm:w-auto shadow-2xs">
            <button
              onClick={() => setViewMode("daily")}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer",
                viewMode === "daily"
                  ? "bg-white text-emerald-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <span>Điểm danh ngày</span>
            </button>

            <button
              onClick={() => setViewMode("weekly")}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer",
                viewMode === "weekly"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <CalendarRange className="w-4 h-4 text-indigo-600" />
              <span>Thống kê Tuần</span>
            </button>

            <button
              onClick={() => setViewMode("monthly")}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer",
                viewMode === "monthly"
                  ? "bg-white text-purple-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Thống kê Tháng</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHẾ ĐỘ 1: ĐIỂM DANH THEO NGÀY (DAILY VIEW)                             */}
      {/* ========================================================================= */}
      {viewMode === "daily" && (
        <div className="space-y-6">
          {/* Action Toolbar Gọn Gàng: Chọn Ngày, Dropdown Chọn Lớp, Tìm Kiếm & Các Nút Hành Động */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Nhóm Trái: Chọn Ngày & Dropdown Chọn Lớp */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Bộ chọn Ngày */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-2xs">
                  <button
                    onClick={handlePrevDay}
                    className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Ngày trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 px-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer text-xs sm:text-sm"
                    />
                  </div>

                  <button
                    onClick={handleNextDay}
                    className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Ngày sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleToday}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Hôm nay
                </button>

                <button
                  onClick={fetchDailyAttendance}
                  disabled={isDailyLoading}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Tải lại dữ liệu ngày"
                >
                  <RefreshCw className={cn("w-4 h-4", isDailyLoading && "animate-spin text-emerald-600")} />
                </button>

                {/* Hộp Dropdown Chọn Lớp Học (Hỗ trợ không giới hạn số lượng lớp) */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-2xs">
                  <button
                    onClick={() => handlePrevClass(selectedClass, setSelectedClass)}
                    disabled={selectedClass === "ALL"}
                    className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Lớp trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 px-2">
                    <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer text-xs sm:text-sm max-w-[220px] truncate"
                    >
                      <option value="ALL">🏫 Tất cả lớp ({students.length} trẻ)</option>
                      {classList.map((cls) => {
                        const count = classStudentCounts[cls] || 0;
                        return (
                          <option key={cls} value={cls}>
                            Lớp {cls} ({count} trẻ)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    onClick={() => handleNextClass(selectedClass, setSelectedClass)}
                    disabled={allClassesOptions.indexOf(selectedClass) === allClassesOptions.length - 1}
                    className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Lớp sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nhóm Phải: Tìm kiếm & Các nút hành động */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Ô tìm kiếm học sinh */}
                <div className="relative w-full sm:w-56 shrink-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm tên trẻ, mã HS..."
                    value={dailySearchQuery}
                    onChange={(e) => setDailySearchQuery(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                <button
                  onClick={handleMarkAllPresent}
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-extrabold rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">Điểm danh cả lớp</span>
                  <span className="sm:hidden">Có mặt hết</span>
                </button>

                <button
                  onClick={handleExportDailyExcel}
                  className="h-9 px-3 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="Xuất file Excel"
                >
                  <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">Xuất Excel</span>
                </button>

                <button
                  onClick={handleExportDailyPDF}
                  className="h-9 px-3 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="In PDF sổ điểm danh"
                >
                  <Printer className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="hidden sm:inline">In PDF</span>
                </button>

                <button
                  onClick={handleSaveDailyAttendance}
                  disabled={isDailySaving}
                  className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 shrink-0" />
                  <span>{isDailySaving ? "Đang lưu..." : "Lưu Điểm Danh"}</span>
                </button>
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Đã lưu thông tin điểm danh {selectedClass === "ALL" ? "toàn trường" : `lớp ${selectedClass}`} ngày{" "}
                {formatDateFull(new Date(selectedDate))} vào CSDL thành công!
              </span>
            </div>
          )}

          {/* 3 KPI Thẻ tóm tắt Sĩ số Ngày */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sĩ số có mặt ({selectedClass === "ALL" ? "Toàn trường" : `Lớp ${selectedClass}`})
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-600">
                    {dailyPresentCount} <span className="text-sm font-bold text-slate-500">/ {dailyTotalCount} trẻ</span>
                  </h3>
                  <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {dailyAttendanceRate}%
                  </span>
                </div>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Vắng có phép (Hoàn tiền ăn)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-600">
                    {dailyAbsentPermitCount} <span className="text-sm font-bold text-slate-500">trẻ</span>
                  </h3>
                  <span className="text-xs font-bold text-amber-700">
                    ({formatCurrency(dailyAbsentPermitCount * DAILY_MEAL_RATE)})
                  </span>
                </div>
              </div>
              <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600 border border-amber-100">
                <AlertCircle className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Vắng không phép
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-rose-600">
                    {dailyAbsentNoPermitCount} <span className="text-sm font-bold text-slate-500">trẻ</span>
                  </h3>
                </div>
              </div>
              <div className="bg-rose-50 p-3.5 rounded-2xl text-rose-600 border border-rose-100">
                <XCircle className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Bảng điểm danh danh sách học sinh */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
              <span className="text-xs font-extrabold text-slate-700">
                Danh sách: <strong className="text-indigo-600">{selectedClass === "ALL" ? "Toàn trường" : `Lớp ${selectedClass}`}</strong> ({dailyFilteredList.length} trẻ)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl border border-emerald-200">
                  Có mặt: {dailyPresentCount}
                </span>
                <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl border border-amber-200">
                  Có phép: {dailyAbsentPermitCount}
                </span>
                <span className="text-[11px] font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-xl border border-rose-200">
                  Không phép: {dailyAbsentNoPermitCount}
                </span>
              </div>
            </div>

            {dailyFilteredList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Họ và tên trẻ</th>
                      <th className="py-3 px-4">Lớp học</th>
                      <th className="py-3 px-4 text-center">Trạng thái điểm danh</th>
                      <th className="py-3 px-4">Người đưa / đón trẻ</th>
                      <th className="py-3 px-4">Ghi chú sức khỏe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                    {dailyFilteredList.map((item) => {
                      const initials = item.studentName
                        ? item.studentName.split(" ").slice(-2).map((n) => n[0]).join("").toUpperCase()
                        : "HS";
                      return (
                        <tr key={item.studentId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-[11px] shadow-2xs">
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{item.studentName}</div>
                                <span className="text-[10px] text-slate-400 font-bold">Mã: {item.studentCode}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-block bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-lg text-xs border border-indigo-100">
                              Lớp {item.className}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
                              <button
                                onClick={() => handleDailyStatusChange(item.studentId, "PRESENT")}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer",
                                  item.status === "PRESENT"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "text-slate-600 hover:text-emerald-700"
                                )}
                              >
                                ✓ Có mặt
                              </button>

                              <button
                                onClick={() => handleDailyStatusChange(item.studentId, "ABSENT_PERMIT")}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer",
                                  item.status === "ABSENT_PERMIT"
                                    ? "bg-amber-500 text-white shadow-xs"
                                    : "text-slate-600 hover:text-amber-700"
                                )}
                              >
                                Có phép
                              </button>

                              <button
                                onClick={() => handleDailyStatusChange(item.studentId, "ABSENT_NO_PERMIT")}
                                className={cn(
                                  "px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer",
                                  item.status === "ABSENT_NO_PERMIT"
                                    ? "bg-rose-600 text-white shadow-xs"
                                    : "text-slate-600 hover:text-rose-700"
                                )}
                              >
                                Không phép
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={item.pickupPerson}
                              onChange={(e) => handleDailyPickupChange(item.studentId, e.target.value)}
                              placeholder="Người đón..."
                              className="w-36 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                            />
                          </td>

                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={item.notes}
                              onChange={(e) => handleDailyNotesChange(item.studentId, e.target.value)}
                              placeholder="Ghi chú sức khỏe..."
                              className="w-48 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 font-medium">
                Không tìm thấy trẻ nào phù hợp với tìm kiếm.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CHẾ ĐỘ 2: THỐNG KÊ THEO TUẦN (WEEKLY VIEW & MATRIX)                     */}
      {/* ========================================================================= */}
      {viewMode === "weekly" && (
        <div className="space-y-6">
          {/* Week Selector & Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Nhóm Trái: Điều hướng Tuần & Dropdown Chọn Lớp */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Điều hướng Tuần */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-2xs">
                  <button
                    onClick={handlePrevWeek}
                    className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Tuần trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 px-3">
                    <CalendarRange className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      Tuần {getWeekNumber(currentMonday)}: {formatDateShort(weekDays[0])} ➔ {formatDateShort(weekDays[4])}/{currentMonday.getFullYear()}
                    </span>
                  </div>

                  <button
                    onClick={handleNextWeek}
                    className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Tuần sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleThisWeek}
                  className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-extrabold transition-all cursor-pointer border border-indigo-200"
                >
                  Tuần này
                </button>

                <button
                  onClick={fetchWeeklyAttendance}
                  disabled={isWeeklyLoading}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Tải lại dữ liệu tuần"
                >
                  <RefreshCw className={cn("w-4 h-4", isWeeklyLoading && "animate-spin text-indigo-600")} />
                </button>

                {/* Dropdown Chọn Lớp */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-2xs">
                  <button
                    onClick={() => handlePrevClass(weeklyClass, setWeeklyClass)}
                    disabled={weeklyClass === "ALL"}
                    className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Lớp trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 px-2">
                    <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
                    <select
                      value={weeklyClass}
                      onChange={(e) => setWeeklyClass(e.target.value)}
                      className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer text-xs sm:text-sm max-w-[220px] truncate"
                    >
                      <option value="ALL">🏫 Tất cả lớp ({students.length} trẻ)</option>
                      {classList.map((cls) => {
                        const count = classStudentCounts[cls] || 0;
                        return (
                          <option key={cls} value={cls}>
                            Lớp {cls} ({count} trẻ)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    onClick={() => handleNextClass(weeklyClass, setWeeklyClass)}
                    disabled={allClassesOptions.indexOf(weeklyClass) === allClassesOptions.length - 1}
                    className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Lớp sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nhóm Phải: Tìm kiếm & Nút Xuất Báo Cáo Tuần */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Ô tìm kiếm */}
                <div className="relative w-full sm:w-56 shrink-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm học sinh theo tên, mã HS..."
                    value={weeklySearchQuery}
                    onChange={(e) => setWeeklySearchQuery(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                <button
                  onClick={handleExportWeeklyExcel}
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="Xuất file Excel thống kê tuần"
                >
                  <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Xuất Excel Tuần</span>
                </button>

                <button
                  onClick={handleExportWeeklyPDF}
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="In PDF báo cáo tuần"
                >
                  <Printer className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>In PDF Tuần</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Thẻ KPI Tuần */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tỷ lệ chuyên cần tuần
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
                  {weeklyKpis.avgAttendanceRate}%
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Tổng {weeklyStudentStats.length} học sinh
                </span>
              </div>
              <div className="bg-indigo-50 p-3.5 rounded-2xl text-indigo-600 border border-indigo-100">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tổng lượt Có mặt
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                  {weeklyKpis.totalPresent} <span className="text-xs font-bold text-slate-400">lượt</span>
                </h3>
                <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                  Trung bình {(weeklyKpis.totalPresent / 5).toFixed(1)} bé/ngày
                </span>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Lượt nghỉ có phép
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                  {weeklyKpis.totalAbsentPermit} <span className="text-xs font-bold text-slate-400">lượt</span>
                </h3>
                <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
                  Hoàn ăn: {formatCurrency(weeklyKpis.totalAbsentPermit * DAILY_MEAL_RATE)}
                </span>
              </div>
              <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600 border border-amber-100">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Lượt nghỉ không phép
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
                  {weeklyKpis.totalAbsentNoPermit} <span className="text-xs font-bold text-slate-400">lượt</span>
                </h3>
                <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">
                  Cần giáo viên thăm hỏi
                </span>
              </div>
              <div className="bg-rose-50 p-3.5 rounded-2xl text-rose-600 border border-rose-100">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Biểu đồ thanh tiến độ chuyên cần theo từng thứ trong tuần (T2 ➔ T6) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Tỷ lệ chuyên cần các ngày trong tuần (Thứ 2 đến Thứ 6)</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                Quy mô: {weeklyStudentStats.length} học sinh
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {weeklyKpis.dayStats.map((d) => (
                <div key={d.dateStr} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">{d.weekdayName}</span>
                    <span className="text-[11px] font-bold text-slate-400">{d.shortDate}</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-900">{d.rate}%</span>
                    <span className="text-[11px] font-bold text-emerald-600">{d.present}/{d.total} bé</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        d.rate >= 90
                          ? "bg-emerald-500"
                          : d.rate >= 75
                          ? "bg-indigo-500"
                          : "bg-amber-500"
                      )}
                      style={{ width: `${Math.min(d.rate, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-0.5">
                    <span className="text-amber-600">Phép: {d.absentPermit}</span>
                    <span className="text-rose-600">K.phép: {d.absentNoPermit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BẢNG MA TRẬN CHUYÊN CẦN THEO TUẦN (WEEKLY MATRIX TABLE) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-700">
                  Ma Trận Chuyên Cần Tuần • {weeklyStudentStats.length} học sinh
                </span>
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {weeklyClass === "ALL" ? "Toàn trường" : `Lớp ${weeklyClass}`}
                </span>
              </div>

              {/* Chú giải trạng thái */}
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Có mặt
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Nghỉ phép
                </span>
                <span className="flex items-center gap-1 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> K.phép
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Chưa ĐD
                </span>
              </div>
            </div>

            {weeklyStudentStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3 text-center w-12">STT</th>
                      <th className="py-3 px-4">Họ và tên trẻ</th>
                      <th className="py-3 px-3">Lớp</th>
                      {weekDays.map((d, idx) => (
                        <th key={d.toISOString()} className="py-3 px-2 text-center w-24">
                          <div>Thứ {idx + 2}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{formatDateShort(d)}</div>
                        </th>
                      ))}
                      <th className="py-3 px-3 text-center">Có mặt</th>
                      <th className="py-3 px-3 text-center">Có phép</th>
                      <th className="py-3 px-3 text-center">K.phép</th>
                      <th className="py-3 px-3 text-center">Tỷ lệ</th>
                      <th className="py-3 px-4 text-center">Xếp loại</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                    {weeklyStudentStats.map((item, idx) => (
                      <tr key={item.student.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.student.fullName}</div>
                          <span className="text-[10px] text-slate-400 font-bold">Mã: {item.student.code}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                            {item.student.className}
                          </span>
                        </td>

                        {/* 5 ngày T2 ➔ T6 */}
                        {item.dayStatuses.map((ds) => {
                          if (ds.status === "PRESENT") {
                            return (
                              <td key={ds.dateStr} className="py-2 px-2 text-center">
                                <span
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs shadow-2xs"
                                  title={`Có mặt (${ds.pickupPerson || "Bố/Mẹ"}) - ${ds.notes || ""}`}
                                >
                                  ✓
                                </span>
                              </td>
                            );
                          }
                          if (ds.status === "ABSENT_PERMIT") {
                            return (
                              <td key={ds.dateStr} className="py-2 px-2 text-center">
                                <span
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-black text-xs shadow-2xs"
                                  title={`Vắng có phép (Hoàn tiền ăn) - ${ds.notes || ""}`}
                                >
                                  P
                                </span>
                              </td>
                            );
                          }
                          if (ds.status === "ABSENT_NO_PERMIT") {
                            return (
                              <td key={ds.dateStr} className="py-2 px-2 text-center">
                                <span
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-black text-xs shadow-2xs"
                                  title={`Vắng không phép - ${ds.notes || ""}`}
                                >
                                  ✕
                                </span>
                              </td>
                            );
                          }
                          return (
                            <td key={ds.dateStr} className="py-2 px-2 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs">
                                —
                              </span>
                            </td>
                          );
                        })}

                        <td className="py-3 px-3 text-center font-extrabold text-emerald-600">
                          {item.presentDays} / 5
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-amber-600">
                          {item.absentPermitDays}
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-rose-600">
                          {item.absentNoPermitDays}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={cn(
                              "font-black text-xs px-2 py-0.5 rounded-full",
                              item.rate >= 90
                                ? "bg-emerald-100 text-emerald-800"
                                : item.rate >= 75
                                ? "bg-blue-100 text-blue-800"
                                : "bg-rose-100 text-rose-800"
                            )}
                          >
                            {item.rate}%
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-xl border", item.rankBadge)}>
                            {item.rank}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 font-medium">
                Không tìm thấy dữ liệu chuyên cần tuần phù hợp.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CHẾ ĐỘ 3: THỐNG KÊ THEO THÁNG (MONTHLY VIEW & HEATMAP)                 */}
      {/* ========================================================================= */}
      {viewMode === "monthly" && (
        <div className="space-y-6">
          {/* Card Toolbar: Tháng / Năm, Dropdown Chọn Lớp, Sub-view Switcher & Nút Xuất */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Nhóm Trái: Chọn Tháng/Năm & Dropdown Chọn Lớp */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Bộ chọn Tháng & Năm */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-2xs">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Tháng trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 px-2">
                    <CalendarDays className="w-4 h-4 text-purple-600 shrink-0" />
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer text-xs sm:text-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          Tháng {m < 10 ? `0${m}` : m}
                        </option>
                      ))}
                    </select>

                    <span className="text-slate-300 font-bold">/</span>

                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer text-xs sm:text-sm"
                    >
                      {[2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Tháng sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleThisMonth}
                  className="px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-extrabold transition-all cursor-pointer border border-purple-200"
                >
                  Tháng này
                </button>

                <button
                  onClick={fetchMonthlyAttendance}
                  disabled={isMonthlyLoading}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Tải lại dữ liệu tháng"
                >
                  <RefreshCw className={cn("w-4 h-4", isMonthlyLoading && "animate-spin text-purple-600")} />
                </button>

                {/* Dropdown Chọn Lớp */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-2xs">
                  <button
                    onClick={() => handlePrevClass(monthlyClass, setMonthlyClass)}
                    disabled={monthlyClass === "ALL"}
                    className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Lớp trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 px-2">
                    <Filter className="w-4 h-4 text-purple-600 shrink-0" />
                    <select
                      value={monthlyClass}
                      onChange={(e) => setMonthlyClass(e.target.value)}
                      className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer text-xs sm:text-sm max-w-[220px] truncate"
                    >
                      <option value="ALL">🏫 Tất cả lớp ({students.length} trẻ)</option>
                      {classList.map((cls) => {
                        const count = classStudentCounts[cls] || 0;
                        return (
                          <option key={cls} value={cls}>
                            Lớp {cls} ({count} trẻ)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    onClick={() => handleNextClass(monthlyClass, setMonthlyClass)}
                    disabled={allClassesOptions.indexOf(monthlyClass) === allClassesOptions.length - 1}
                    className="p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Lớp sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nhóm Phải: Tìm kiếm, Chuyển đổi Sub-view & Nút Xuất Báo Cáo Tháng */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Ô tìm kiếm */}
                <div className="relative w-full sm:w-56 shrink-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm học sinh, mã HS..."
                    value={monthlySearchQuery}
                    onChange={(e) => setMonthlySearchQuery(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                {/* Switcher Bảng Tổng Hợp vs Lưới Toàn Tháng */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setMonthlySubView("summary")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer",
                      monthlySubView === "summary" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-600"
                    )}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Tổng hợp</span>
                  </button>

                  <button
                    onClick={() => setMonthlySubView("grid")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer",
                      monthlySubView === "grid" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-600"
                    )}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Lưới 31 ngày</span>
                  </button>
                </div>

                <button
                  onClick={handleExportMonthlyExcel}
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="Xuất file Excel tháng"
                >
                  <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Xuất Excel Tháng</span>
                </button>

                <button
                  onClick={handleExportMonthlyPDF}
                  className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="In PDF báo cáo tháng"
                >
                  <Printer className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>In PDF Tháng</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Thẻ KPI Tháng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tỷ lệ chuyên cần tháng
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">
                  {monthlyKpis.avgRate}%
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
                  Lớp cao nhất: {monthlyKpis.topClassName} ({monthlyKpis.highestClassRate}%)
                </span>
              </div>
              <div className="bg-purple-50 p-3.5 rounded-2xl text-purple-600 border border-purple-100">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tổng lượt Có mặt
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                  {monthlyKpis.totalPresent} <span className="text-xs font-bold text-slate-400">lượt</span>
                </h3>
                <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                  Quy mô {monthlyStudentStats.length} học sinh
                </span>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hoàn tiền ăn dự kiến
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
                  {formatCurrency(monthlyKpis.totalMealRefund)}
                </h3>
                <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
                  {monthlyKpis.totalAbsentPermit} lượt nghỉ có phép (30k/buổi)
                </span>
              </div>
              <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600 border border-amber-100">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Bé ngoan chuyên cần
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
                  {monthlyKpis.topDiligenceStudents.length} <span className="text-xs font-bold text-slate-400">bé</span>
                </h3>
                <span className="text-[11px] text-indigo-700 font-semibold mt-0.5 block">
                  100% đi học đầy đủ cả tháng
                </span>
              </div>
              <div className="bg-indigo-50 p-3.5 rounded-2xl text-indigo-600 border border-indigo-100">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Hộp Vinh Danh & Cảnh Báo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top bé chuyên cần 100% */}
            <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-50 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                    Bảng Vinh Danh Bé Chăm Ngoan (Chuyên cần 100%)
                  </h3>
                </div>
                <span className="text-xs font-black text-emerald-700">
                  {monthlyKpis.topDiligenceStudents.length} trẻ
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {monthlyKpis.topDiligenceStudents.length > 0 ? (
                  monthlyKpis.topDiligenceStudents.map((st, i) => (
                    <div
                      key={st.student.id}
                      className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-[10px]">
                          {i + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{st.student.fullName}</div>
                          <span className="text-[10px] text-slate-500">Lớp {st.student.className}</span>
                        </div>
                      </div>
                      <span className="font-black text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
                        {st.presentDays} buổi đi học
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    Chưa có bé nào đạt 100% chuyên cần trong tháng này.
                  </div>
                )}
              </div>
            </div>

            {/* Trẻ vắng nhiều cần lưu ý */}
            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-rose-50 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-100 text-rose-800 rounded-xl">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-rose-900 uppercase tracking-wider">
                    Danh Sách Học Sinh Vắng Nhiều Cần Thăm Hỏi
                  </h3>
                </div>
                <span className="text-xs font-black text-rose-700">
                  {monthlyKpis.alertStudents.length} trẻ
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {monthlyKpis.alertStudents.length > 0 ? (
                  monthlyKpis.alertStudents.map((st) => (
                    <div
                      key={st.student.id}
                      className="flex items-center justify-between p-2.5 bg-rose-50/50 rounded-2xl border border-rose-100/60 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{st.student.fullName}</div>
                        <span className="text-[10px] text-slate-500">
                          Lớp {st.student.className} • Phụ huynh: {st.student.parentPhone || "—"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-rose-700 block">
                          Vắng: {st.absentPermitDays + st.absentNoPermitDays} ngày
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (Phép: {st.absentPermitDays} | K.phép: {st.absentNoPermitDays})
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    Tất cả học sinh đều duy trì chuyên cần tốt trong tháng này!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SUB-VIEW 1: BẢNG TỔNG HỢP HỌC SINH TOÀN THÁNG */}
          {monthlySubView === "summary" && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
                <span className="text-xs font-extrabold text-slate-700">
                  Bảng Tổng Hợp Chuyên Cần Tháng {selectedMonth}/{selectedYear} • {monthlyStudentStats.length} học sinh
                </span>
                <span className="text-[11px] font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {monthlyClass === "ALL" ? "Toàn trường" : `Lớp ${monthlyClass}`}
                </span>
              </div>

              {monthlyStudentStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3 text-center w-12">STT</th>
                        <th className="py-3 px-4">Họ và tên trẻ</th>
                        <th className="py-3 px-3">Lớp học</th>
                        <th className="py-3 px-3 text-center">Có mặt (buổi)</th>
                        <th className="py-3 px-3 text-center">Nghỉ phép</th>
                        <th className="py-3 px-3 text-center">K.phép</th>
                        <th className="py-3 px-3 text-center">Tỷ lệ chuyên cần</th>
                        <th className="py-3 px-4 text-right">Hoàn tiền ăn</th>
                        <th className="py-3 px-4 text-center">Đánh giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                      {monthlyStudentStats.map((item, idx) => (
                        <tr key={item.student.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.student.fullName}</div>
                            <span className="text-[10px] text-slate-400 font-bold">Mã: {item.student.code}</span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                              {item.student.className}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center font-black text-emerald-600">
                            {item.presentDays} ngày
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-amber-600">
                            {item.absentPermitDays}
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-rose-600">
                            {item.absentNoPermitDays}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={cn(
                                "font-black text-xs px-2.5 py-0.5 rounded-full",
                                item.attendanceRate >= 90
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.attendanceRate >= 75
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-rose-100 text-rose-800"
                              )}
                            >
                              {item.attendanceRate}%
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-extrabold text-amber-700">
                            {item.mealRefundEstimate > 0 ? formatCurrency(item.mealRefundEstimate) : "—"}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-xl border", item.rankBadge)}>
                              {item.diligenceRank}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 font-medium">
                  Không tìm thấy dữ liệu thống kê tháng phù hợp.
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: LƯỚI ĐIỂM DANH TOÀN BỘ CÁC NGÀY TRONG THÁNG (DAILY GRID MATRIX) */}
          {monthlySubView === "grid" && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
                <span className="text-xs font-extrabold text-slate-700">
                  Lưới Chi Tiết Điểm Danh Tất Cả Các Ngày • Tháng {selectedMonth}/{selectedYear}
                </span>

                {/* Chú giải */}
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Có mặt
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Nghỉ phép
                  </span>
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> K.phép
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Nghỉ/Chưa ĐD
                  </span>
                </div>
              </div>

              {monthlyStudentStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200/80 font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3 sticky left-0 bg-slate-50 z-10 w-44 shadow-xs">
                          Họ và tên trẻ
                        </th>
                        {monthDaysArray.map((day) => {
                          const dayNr = day.getDate();
                          const weekdayIdx = day.getDay();
                          const isWeekend = weekdayIdx === 0 || weekdayIdx === 6;
                          return (
                            <th
                              key={day.toISOString()}
                              className={cn(
                                "py-2 px-1 text-center min-w-[28px]",
                                isWeekend ? "bg-slate-100/70 text-slate-300" : "text-slate-600"
                              )}
                            >
                              <div className="font-extrabold">{dayNr}</div>
                              <div className="text-[9px] font-medium">{WEEKDAY_NAMES[weekdayIdx]}</div>
                            </th>
                          );
                        })}
                        <th className="py-2.5 px-3 text-center bg-slate-50 font-extrabold text-emerald-700">
                          Đi học
                        </th>
                        <th className="py-2.5 px-3 text-center bg-slate-50 font-extrabold text-amber-700">
                          Phép
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {monthlyStudentStats.map((item) => (
                        <tr key={item.student.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3 sticky left-0 bg-white z-10 shadow-xs">
                            <div className="font-bold text-slate-900 truncate max-w-[150px]">
                              {item.student.fullName}
                            </div>
                            <span className="text-[10px] text-slate-400">Lớp {item.student.className}</span>
                          </td>

                          {item.dailyRecords.map((dr) => {
                            const weekdayIdx = dr.day.getDay();
                            const isWeekend = weekdayIdx === 0 || weekdayIdx === 6;

                            if (dr.status === "PRESENT") {
                              return (
                                <td key={dr.dateStr} className="p-0.5 text-center">
                                  <span
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500 text-white font-bold text-[10px]"
                                    title={`Ngày ${formatDateFull(dr.day)}: Có mặt`}
                                  >
                                    ✓
                                  </span>
                                </td>
                              );
                            }
                            if (dr.status === "ABSENT_PERMIT") {
                              return (
                                <td key={dr.dateStr} className="p-0.5 text-center">
                                  <span
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-400 text-amber-950 font-bold text-[10px]"
                                    title={`Ngày ${formatDateFull(dr.day)}: Nghỉ có phép`}
                                  >
                                    P
                                  </span>
                                </td>
                              );
                            }
                            if (dr.status === "ABSENT_NO_PERMIT") {
                              return (
                                <td key={dr.dateStr} className="p-0.5 text-center">
                                  <span
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500 text-white font-bold text-[10px]"
                                    title={`Ngày ${formatDateFull(dr.day)}: Nghỉ không phép`}
                                  >
                                    ✕
                                  </span>
                                </td>
                              );
                            }
                            return (
                              <td
                                key={dr.dateStr}
                                className={cn("p-0.5 text-center", isWeekend && "bg-slate-50/50")}
                              >
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-200" />
                              </td>
                            );
                          })}

                          <td className="py-2 px-3 text-center font-extrabold text-emerald-600">
                            {item.presentDays}
                          </td>

                          <td className="py-2 px-3 text-center font-extrabold text-amber-600">
                            {item.absentPermitDays}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 font-medium">
                  Không có dữ liệu lưới điểm danh tháng.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
