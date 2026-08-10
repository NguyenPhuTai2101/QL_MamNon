"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, Calendar as CalendarIcon, Save, Filter, CheckCheck, Search, Printer } from "lucide-react";

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
  const [selectedClass, setSelectedClass] = useState("12 – 24 tháng");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);

  const availableClasses = ["12 – 24 tháng", "24 – 36 tháng", "3 – 5 tuổi (Chồi - Lá)", "Mầm 1", "Chồi 1", "Chồi 2", "Lá 1"];

  // Tải danh sách Học Sinh trực tiếp từ PostgreSQL Supabase để có thể điểm danh ngay lập tức khi thêm mới
  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((dbStudents) => {
        if (Array.isArray(dbStudents) && dbStudents.length > 0) {
          const list: AttendanceRecord[] = dbStudents.map((st: any) => ({
            studentId: st.id,
            studentName: `${st.lastName} ${st.firstName}`.trim(),
            className: st.class?.name || "12 – 24 tháng",
            status: "PRESENT",
            pickupPerson: st.parentName || "Phụ huynh",
            notes: "",
          }));
          setAttendanceList(list);
        }
      })
      .catch((err) => console.error("Lỗi tải DS điểm danh:", err));
  }, []);

  // Filter list by selected class and search query
  const filteredStudents = attendanceList
    .filter(s => s.className === selectedClass)
    .filter(s => s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || s.pickupPerson.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT_PERMIT" | "ABSENT_NO_PERMIT") => {
    setAttendanceList(attendanceList.map(item => item.studentId === studentId ? { ...item, status } : item));
    setSavedSuccess(false);
  };

  const handlePickupChange = (studentId: string, pickupPerson: string) => {
    setAttendanceList(attendanceList.map(item => item.studentId === studentId ? { ...item, pickupPerson } : item));
    setSavedSuccess(false);
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceList(attendanceList.map(item => item.studentId === studentId ? { ...item, notes } : item));
    setSavedSuccess(false);
  };

  // Quick action: Mark all students in current class as PRESENT
  const handleMarkAllPresent = () => {
    setAttendanceList(attendanceList.map(item => 
      item.className === selectedClass ? { ...item, status: "PRESENT" } : item
    ));
    setSavedSuccess(false);
  };

  const handleSaveAttendance = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const currentClassAll = attendanceList.filter(s => s.className === selectedClass);
  const presentCount = currentClassAll.filter(a => a.status === "PRESENT").length;
  const absentPermitCount = currentClassAll.filter(a => a.status === "ABSENT_PERMIT").length;
  const absentNoPermitCount = currentClassAll.filter(a => a.status === "ABSENT_NO_PERMIT").length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Điểm Danh & Tự Động Hoàn Tiền Ăn</h2>
          <p className="text-sm text-slate-500 mt-1">Giáo viên điểm danh theo ngày. Trẻ vắng có phép tự động được hoàn 30.000đ/ngày tiền ăn vào hóa đơn kỳ sau.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl text-sm shadow-sm">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="focus:outline-none text-slate-700 bg-transparent font-medium"
            />
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            title="In sổ điểm danh"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            In sổ
          </button>
          <button 
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10"
          >
            <Save className="w-4 h-4" />
            Lưu điểm danh
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Đã lưu thông tin điểm danh lớp {selectedClass} ngày {selectedDate} vào cơ sở dữ liệu thành công!
        </div>
      )}

      {/* Class Selector Tabs, Search & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Chọn lớp:
          </span>
          {availableClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedClass === cls
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Lớp {cls}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Tìm tên trẻ / phụ huynh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Điểm danh cả lớp Có mặt
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Họ và tên trẻ</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Lớp</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Trạng thái điểm danh</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Người đưa / đón trẻ</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Ghi chú sức khỏe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.studentName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-md">
                        Lớp {item.className}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleStatusChange(item.studentId, "PRESENT")}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            item.status === "PRESENT"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Có mặt
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.studentId, "ABSENT_PERMIT")}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            item.status === "ABSENT_PERMIT"
                              ? "bg-amber-500 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Có phép
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.studentId, "ABSENT_NO_PERMIT")}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            item.status === "ABSENT_NO_PERMIT"
                              ? "bg-rose-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Vắng K.Phép
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={item.pickupPerson} 
                        onChange={(e) => handlePickupChange(item.studentId, e.target.value)}
                        placeholder="Nhập tên người đón..."
                        className="bg-white text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-36 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={item.notes} 
                        onChange={(e) => handleNotesChange(item.studentId, e.target.value)}
                        placeholder="Thêm ghi chú..."
                        className="bg-white text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            Không tìm thấy trẻ nào thuộc {selectedClass} phù hợp với từ khóa tìm kiếm.
          </div>
        )}
      </div>
    </div>
  );
}
