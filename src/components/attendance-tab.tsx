"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, Calendar as CalendarIcon, Save, Filter, CheckCheck, Search, Printer, Download } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  className: string;
  status: "PRESENT" | "ABSENT_PERMIT" | "ABSENT_NO_PERMIT";
  pickupPerson: string;
  notes: string;
}

export default function AttendanceTab() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

  // Tải danh sách Lớp học thực tế & Học sinh trực tiếp từ CSDL PostgreSQL Supabase
  useEffect(() => {
    // 1. Tải danh sách các Lớp học đang tồn tại trong DB
    fetch("/api/classes")
      .then((res) => res.json())
      .then((dbClasses) => {
        if (Array.isArray(dbClasses) && dbClasses.length > 0) {
          const classNames = dbClasses.map((c: any) => c.name);
          setClassList(classNames);
          setSelectedClass(classNames[0]);
        }
      })
      .catch((err) => console.error("Lỗi tải DS lớp:", err));

    // 2. Tải danh sách Học sinh
    fetch("/api/students")
      .then((res) => res.json())
      .then((dbStudents) => {
        if (Array.isArray(dbStudents) && dbStudents.length > 0) {
          const mappedList: AttendanceRecord[] = dbStudents.map((st: any) => ({
            studentId: st.id,
            studentName: `${st.lastName} ${st.firstName}`.trim(),
            className: st.class?.name || "Mầm 1",
            status: "PRESENT",
            pickupPerson: "Bố / Mẹ",
            notes: "Bình thường",
          }));
          setAttendanceList(mappedList);
        }
      })
      .catch((err) => console.error("Lỗi tải DS học sinh:", err));
  }, []);

  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT_PERMIT" | "ABSENT_NO_PERMIT") => {
    setAttendanceList(attendanceList.map(item => 
      item.studentId === studentId ? { ...item, status } : item
    ));
    setSavedSuccess(false);
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceList(attendanceList.map(item => 
      item.studentId === studentId ? { ...item, notes } : item
    ));
    setSavedSuccess(false);
  };

  const handlePickupChange = (studentId: string, pickupPerson: string) => {
    setAttendanceList(attendanceList.map(item => 
      item.studentId === studentId ? { ...item, pickupPerson } : item
    ));
    setSavedSuccess(false);
  };

  const handleMarkAllPresent = () => {
    setAttendanceList(attendanceList.map(item => 
      item.className === selectedClass ? { ...item, status: "PRESENT" } : item
    ));
    setSavedSuccess(false);
  };

  const handleSaveAttendance = async () => {
    try {
      const recordsToSave = currentClassAll.map((item) => ({
        studentId: item.studentId,
        status: item.status,
        pickupPerson: item.pickupPerson,
        notes: item.notes,
        date: selectedDate,
      }));

      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendances: recordsToSave }),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Lỗi lưu điểm danh:", err);
    }
  };

  const currentClassAll = attendanceList.filter(s => s.className === selectedClass);
  const presentCount = currentClassAll.filter(a => a.status === "PRESENT").length;
  const absentPermitCount = currentClassAll.filter(a => a.status === "ABSENT_PERMIT").length;
  const absentNoPermitCount = currentClassAll.filter(a => a.status === "ABSENT_NO_PERMIT").length;

  const filteredList = currentClassAll.filter(item => 
    item.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    const headers = ["STT", "Họ và tên học sinh", "Lớp", "Trạng thái điểm danh", "Người đưa/đón", "Ghi chú sức khỏe"];
    const statusMap = {
      PRESENT: "Có mặt",
      ABSENT_PERMIT: "Vắng có phép",
      ABSENT_NO_PERMIT: "Vắng không phép"
    };
    const rows = filteredList.map((item, idx) => [
      idx + 1,
      item.studentName,
      item.className,
      statusMap[item.status] || item.status,
      item.pickupPerson || "Bố/Mẹ",
      item.notes || "Bình thường"
    ]);
    exportToExcel(`Diem_Danh_Lop_${selectedClass}_Ngay_${selectedDate}`, headers, rows);
  };

  const handleExportPDF = () => {
    const headers = ["STT", "Họ và tên học sinh", "Lớp", "Trạng thái", "Người đưa/đón", "Ghi chú"];
    const statusMap = {
      PRESENT: "Có mặt",
      ABSENT_PERMIT: "Vắng có phép (Hoàn tiền ăn)",
      ABSENT_NO_PERMIT: "Vắng không phép"
    };
    const rows = filteredList.map((item, idx) => [
      idx + 1,
      item.studentName,
      item.className,
      statusMap[item.status] || item.status,
      item.pickupPerson || "Bố/Mẹ",
      item.notes || "Bình thường"
    ]);
    const summary = [
      { label: "Ngày điểm danh", value: selectedDate },
      { label: "Lớp học", value: selectedClass },
      { label: "Tổng số sĩ số", value: `${currentClassAll.length} học sinh` },
      { label: "Có mặt", value: `${presentCount} trẻ (${Math.round((presentCount / (currentClassAll.length || 1)) * 100)}%)` },
      { label: "Vắng có phép", value: `${absentPermitCount} trẻ` },
      { label: "Vắng không phép", value: `${absentNoPermitCount} trẻ` }
    ];
    exportToPDF(`BẢNG ĐIỂM DANH HỌC SINH LỚP ${selectedClass.toUpperCase()} - NGÀY ${selectedDate}`, headers, rows, summary);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. ERP MODULE HEADER BANNER */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-600 rounded-2xl text-white shadow-md shadow-emerald-500/20 shrink-0">
              <CheckCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Điểm Danh Chuyên Cần & Hoàn Tiền Ăn
                </h1>
                <span className="text-xs font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Tự động đối soát
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Giáo viên điểm danh theo ngày. Trẻ vắng có phép tự động được hoàn tiền ăn vào hóa đơn tháng sau.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end">
            <div className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 inline-flex items-center gap-2 flex-1 sm:flex-initial shadow-2xs">
              <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-extrabold text-slate-800 focus:outline-none cursor-pointer text-xs"
              />
            </div>

            <button
              onClick={handleExportExcel}
              className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex-1 sm:flex-initial cursor-pointer"
              title="Xuất file Excel CSV"
            >
              <Download className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex-1 sm:flex-initial cursor-pointer"
              title="In PDF sổ điểm danh"
            >
              <Printer className="w-4 h-4 text-slate-500 shrink-0" />
              <span>In PDF</span>
            </button>

            <button
              onClick={handleSaveAttendance}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all whitespace-nowrap w-full sm:w-auto cursor-pointer"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span>Lưu Điểm Danh</span>
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Đã lưu thông tin điểm danh lớp {selectedClass} ngày {selectedDate} vào CSDL thành công!</span>
        </div>
      )}

      {/* 2. CLASS SELECTOR, SEARCH & ACTION TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Lớp:
          </span>
          {classList.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`h-8 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                selectedClass === cls
                  ? "bg-indigo-600 text-white shadow-sm font-extrabold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Lớp {cls}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên trẻ, phụ huynh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="h-8 px-3.5 inline-flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Điểm danh cả lớp Có mặt</span>
          </button>
        </div>
      </div>

      {/* Summary stats for the selected class */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Sĩ số có mặt (Lớp {selectedClass})</span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{presentCount} / {currentClassAll.length} trẻ</h3>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Vắng có phép</span>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{absentPermitCount} trẻ</h3>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-xl text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Vắng không phép</span>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{absentNoPermitCount} trẻ</h3>
          </div>
          <div className="bg-rose-50 p-3.5 rounded-xl text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Attendance table filtered by class */}
      <div className="table-pro-container">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-bold text-slate-600">
            Sĩ số Lớp <strong className="text-indigo-600">{selectedClass}</strong>: {filteredList.length} trẻ
          </span>
          <div className="flex items-center gap-2">
            <span className="badge-pill badge-pill-emerald">Có mặt: {presentCount}</span>
            <span className="badge-pill badge-pill-amber">Có phép: {absentPermitCount}</span>
            <span className="badge-pill badge-pill-rose">Không phép: {absentNoPermitCount}</span>
          </div>
        </div>

        {filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-pro">
              <thead>
                <tr>
                  <th>Họ và tên trẻ</th>
                  <th>Lớp học</th>
                  <th>Trạng thái điểm danh</th>
                  <th>Người đưa / đón trẻ</th>
                  <th>Ghi chú sức khỏe</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item: AttendanceRecord) => {
                  const initials = item.studentName ? item.studentName.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase() : "HS";
                  return (
                    <tr key={item.studentId}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm ring-2 ring-indigo-50">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{item.studentName}</div>
                            <span className="text-[10px] text-slate-400 font-medium">Mã: HS0{item.studentId.slice(-3)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="inline-block bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-indigo-100/60">
                          Lớp {item.className}
                        </span>
                      </td>
                      <td>
                        <div className="inline-flex gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                          <button
                            onClick={() => handleStatusChange(item.studentId, "PRESENT")}
                            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                              item.status === "PRESENT"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-slate-600 hover:text-emerald-700"
                            }`}
                          >
                            ✓ Có mặt
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.studentId, "ABSENT_PERMIT")}
                            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                              item.status === "ABSENT_PERMIT"
                                ? "bg-amber-500 text-white shadow-sm"
                                : "text-slate-600 hover:text-amber-700"
                            }`}
                          >
                            Có phép
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.studentId, "ABSENT_NO_PERMIT")}
                            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                              item.status === "ABSENT_NO_PERMIT"
                                ? "bg-rose-600 text-white shadow-sm"
                                : "text-slate-600 hover:text-rose-700"
                            }`}
                          >
                            Không phép
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.pickupPerson}
                          onChange={(e) => handlePickupChange(item.studentId, e.target.value)}
                          placeholder="Người đón..."
                          className="w-36 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleNotesChange(item.studentId, e.target.value)}
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
            Không tìm thấy trẻ nào thuộc lớp {selectedClass} phù hợp với tìm kiếm.
          </div>
        )}
      </div>
    </div>
  );
}
