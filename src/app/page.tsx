"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import AttendanceTab from "@/components/attendance-tab";
import VietQRModal from "@/components/vietqr-modal";
import MenuTab from "@/components/menu-tab";
import CostTab from "@/components/cost-tab";
import HealthTab from "@/components/health-tab";
import { 
  mockStudents, 
  mockWeeklyMenu, 
  mockIngredients, 
  Student, 
  IngredientCost,
  MenuItem
} from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
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
  Trash2,
  Edit,
  UserPlus,
  Check,
  QrCode
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [weeklyMenu, setWeeklyMenu] = useState<Record<string, MenuItem>>(mockWeeklyMenu);
  const [ingredients, setIngredients] = useState<IngredientCost[]>(mockIngredients);
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
      if (parsed.role) setUserRole(parsed.role);
      setIsAuthenticated(true);
    } catch (e) {
      router.push("/login");
      return;
    }

    const savedStudents = localStorage.getItem("app_students");
    if (savedStudents) {
      try { setStudents(JSON.parse(savedStudents)); } catch (e) {}
    }
    const savedMenu = localStorage.getItem("app_weekly_menu");
    if (savedMenu) {
      try { setWeeklyMenu(JSON.parse(savedMenu)); } catch (e) {}
    }
    const savedIngredients = localStorage.getItem("app_ingredients");
    if (savedIngredients) {
      try { setIngredients(JSON.parse(savedIngredients)); } catch (e) {}
    }
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
  const [selectedQRStudent, setSelectedQRStudent] = useState<Student | null>(null);

  // Class list state
  const [classList, setClassList] = useState([
    { id: "1", name: "Mầm 1", ageGroup: "3 - 4 tuổi", teacherName: "Cô Nguyễn Thị Mai", capacity: 25 },
    { id: "2", name: "Chồi 1", ageGroup: "4 - 5 tuổi", teacherName: "Cô Lê Thị Cúc", capacity: 28 },
    { id: "3", name: "Lá 1", ageGroup: "5 - 6 tuổi", teacherName: "Cô Phạm Thị Trúc", capacity: 30 },
  ]);

  // Form states
  const [newStudent, setNewStudent] = useState({ name: "", className: "Mầm 1", parentName: "", parentPhone: "", amount: 3200000 });
  const [newClass, setNewClass] = useState({ name: "", ageGroup: "3 - 4 tuổi", teacherName: "", capacity: 25 });
  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: 0, unit: "kg", unitPrice: 0 });
  const [selectedDayMenu, setSelectedDayMenu] = useState("Thứ Hai");
  const [editMenuForm, setEditMenuForm] = useState<MenuItem>({ breakfast: "", lunch: "", snack: "", cost: 35000 });

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name || !newClass.teacherName) return;
    const addedClass = {
      id: (classList.length + 1).toString(),
      name: newClass.name,
      ageGroup: newClass.ageGroup,
      teacherName: newClass.teacherName,
      capacity: Number(newClass.capacity) || 25,
    };
    setClassList([...classList, addedClass]);
    setNewClass({ name: "", ageGroup: "3 - 4 tuổi", teacherName: "", capacity: 25 });
    setShowAddClassModal(false);
  };

  // Quick stats
  const totalStudents = students.length;
  const paidCount = students.filter(s => s.tuitionStatus === "PAID").length;
  const unpaidCount = students.filter(s => s.tuitionStatus === "UNPAID").length;
  const overdueCount = students.filter(s => s.tuitionStatus === "OVERDUE").length;

  const totalTuitionExpected = students.reduce((acc, curr) => acc + curr.amount, 0);
  const totalTuitionCollected = students
    .filter(s => s.tuitionStatus === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalIngredientsCost = ingredients.reduce((acc, curr) => acc + curr.total, 0);

  // Mark tuition as paid action
  const handleMarkAsPaid = (studentId: string) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, tuitionStatus: "PAID" } : s));
  };

  // Add Student action
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.parentName || !newStudent.parentPhone) return;

    const added: Student = {
      id: (students.length + 1).toString(),
      name: newStudent.name,
      className: newStudent.className,
      parentName: newStudent.parentName,
      parentPhone: newStudent.parentPhone,
      tuitionStatus: "UNPAID",
      amount: Number(newStudent.amount) || 3200000,
    };

    setStudents([...students, added]);
    setNewStudent({ name: "", className: "Mầm 1", parentName: "", parentPhone: "", amount: 3200000 });
    setShowAddStudentModal(false);
  };

  // Delete Student action
  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter(s => s.id !== studentId));
  };

  // Add Ingredient action
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.name || newIngredient.quantity <= 0 || newIngredient.unitPrice <= 0) return;

    const added: IngredientCost = {
      id: (ingredients.length + 1).toString(),
      name: newIngredient.name,
      quantity: Number(newIngredient.quantity),
      unit: newIngredient.unit,
      unitPrice: Number(newIngredient.unitPrice),
      total: Number(newIngredient.quantity) * Number(newIngredient.unitPrice)
    };

    setIngredients([...ingredients, added]);
    setNewIngredient({ name: "", quantity: 0, unit: "kg", unitPrice: 0 });
    setShowAddIngredientModal(false);
  };

  // Delete Ingredient action
  const handleDeleteIngredient = (ingredientId: string) => {
    setIngredients(ingredients.filter(item => item.id !== ingredientId));
  };

  // Open Edit Menu Modal
  const handleOpenEditMenu = (day: string) => {
    setSelectedDayMenu(day);
    setEditMenuForm(weeklyMenu[day] || { breakfast: "", lunch: "", snack: "", cost: 35000 });
    setShowEditMenuModal(true);
  };

  // Save Edited Menu
  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditMenuModal(false);
  };

  // Filter display students based on role (Parents only see their own children)
  const displayStudents = userRole === "PARENT"
    ? students.filter(s => s.parentName.toLowerCase().includes("triết") || s.parentName.toLowerCase().includes("nguyễn"))
    : students;

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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Trang chủ Quản trị</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Cập nhật nhanh thông tin tài chính, dinh dưỡng và học sinh ngày hôm nay.
                  </p>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10"
                >
                  <Download className="w-4 h-4" />
                  In báo cáo tổng hợp
                </button>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Học sinh</span>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalStudents}</h3>
                    <span className="text-xs text-indigo-600 font-medium flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Đang theo học chính thức
                    </span>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Học phí đã thu</span>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalTuitionCollected)}</h3>
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                      {totalTuitionExpected > 0 ? Math.round((totalTuitionCollected / totalTuitionExpected) * 100) : 0}% chỉ tiêu đã thu
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chi phí Thực phẩm</span>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(totalIngredientsCost)}</h3>
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                      <TrendingDown className="w-3.5 h-3.5" /> Tổng chi nhập kho
                    </span>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl text-amber-600">
                    <Calculator className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Học phí Chưa thu</span>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(totalTuitionExpected - totalTuitionCollected)}</h3>
                    <span className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                      Còn {unpaidCount + overdueCount} học sinh chưa nộp
                    </span>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-xl text-rose-600">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Secondary Layout Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Quick Menu list */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-indigo-600" /> Thực đơn ngày hôm nay (Thứ Ba)
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-sm font-semibold text-slate-700">Bữa Sáng</span>
                      <span className="text-sm text-slate-600">{weeklyMenu["Thứ Ba"]?.breakfast}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-sm font-semibold text-slate-700">Bữa Trưa</span>
                      <span className="text-sm text-slate-600">{weeklyMenu["Thứ Ba"]?.lunch}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-700">Bữa Xế (Phụ)</span>
                      <span className="text-sm text-slate-600">{weeklyMenu["Thứ Ba"]?.snack}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Tuition Progress */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Trạng thái Tiền học</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Đã thu ({paidCount}/{totalStudents})</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(totalTuitionCollected)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${totalTuitionExpected > 0 ? (totalTuitionCollected / totalTuitionExpected) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-rose-500 font-bold block text-sm">{overdueCount} Trẻ</span>
                        <span className="text-slate-400">Trễ hạn đóng</span>
                      </div>
                      <div>
                        <span className="text-amber-500 font-bold block text-sm">{unpaidCount} Trẻ</span>
                        <span className="text-slate-400">Chờ thu học phí</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tuition Management Tab */}
          {activeTab === "tuition" && (
            <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {userRole === "PARENT" ? "Học phí & Thanh toán VietQR cho con" : "Quản lý đóng học phí"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {userRole === "PARENT" ? "Tra cứu học phí và quét mã VietQR chuyển khoản 1-click." : "Danh sách chi tiết học phí và nút xác nhận đóng tiền tức thì."}
                    </p>
                  </div>
                  {userRole === "ADMIN" && (
                    <button 
                      onClick={() => setShowAddStudentModal(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10"
                    >
                      <UserPlus className="w-4 h-4" />
                      Thêm học sinh mới
                    </button>
                  )}
                </div>

                {/* Student table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Họ và tên học sinh</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Lớp học</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Tên Phụ huynh</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Số điện thoại</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Học phí</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Trạng thái</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">{student.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{student.className}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.parentName}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{student.parentPhone}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{formatCurrency(student.amount)}</td>
                        <td className="px-6 py-4">
                          {student.tuitionStatus === "PAID" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã đóng
                            </span>
                          )}
                          {student.tuitionStatus === "UNPAID" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
                              <AlertTriangle className="w-3.5 h-3.5" /> Chưa đóng
                            </span>
                          )}
                          {student.tuitionStatus === "OVERDUE" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-100 animate-pulse">
                              <XCircle className="w-3.5 h-3.5" /> Trễ hạn
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {student.tuitionStatus !== "PAID" && (
                            <>
                              <button
                                onClick={() => setSelectedQRStudent(student)}
                                className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm"
                              >
                                <QrCode className="w-3.5 h-3.5" /> Quét VietQR
                              </button>
                              {userRole === "ADMIN" && (
                                <button
                                  onClick={() => handleMarkAsPaid(student.id)}
                                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5" /> Đã nộp
                                </button>
                              )}
                            </>
                          )}
                          {userRole === "ADMIN" && (
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                              title="Xóa học sinh"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Attendance Management Tab */}
          {activeTab === "attendance" && (
            <AttendanceTab />
          )}

          {/* Daily Menu Management Tab */}
          {activeTab === "menu" && (
            <MenuTab />
          )}

          {/* Ingredient Food Cost Tracking Tab */}
          {activeTab === "cost" && (
            <CostTab />
          )}

          {/* Health Records & Digital Diary Tab */}
          {activeTab === "health" && (
            <HealthTab />
          )}

          {/* Students & Classes Tab */}
          {activeTab === "students" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Thông tin Học sinh & Quản lý Lớp học</h2>
                  <p className="text-sm text-slate-500 mt-1">Quản lý danh sách lớp học, giáo viên phụ trách và hồ sơ từng trẻ.</p>
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
                  const studentCount = students.filter(s => s.className.toLowerCase() === cls.name.toLowerCase() || s.className.includes(cls.name)).length;
                  return (
                    <div key={cls.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">Lớp {cls.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">GV phụ trách: {cls.teacherName}</p>
                        </div>
                        <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full">
                          {cls.ageGroup}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                        <span className="text-sm font-semibold text-slate-700">
                          Sĩ số: <strong className="text-indigo-600">{studentCount}</strong> / {cls.capacity} trẻ
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Năm học 2026-2027</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Student Modal - Premium UI */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative border border-slate-100 overflow-hidden">
            {/* Top Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

            <div className="flex justify-between items-start pt-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">Thêm học sinh mới</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Khai báo hồ sơ trẻ và thông tin liên hệ của phụ huynh</p>
                </div>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">✕</button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Họ và tên học sinh</label>
                <input 
                  type="text" 
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="Nguyễn Văn A..."
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold placeholder:text-slate-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Lớp học</label>
                  <select 
                    value={newStudent.className}
                    onChange={(e) => setNewStudent({...newStudent, className: e.target.value})}
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold transition-all cursor-pointer"
                  >
                    <option value="Mầm 1">Mầm 1</option>
                    <option value="Chồi 1">Chồi 1</option>
                    <option value="Chồi 2">Chồi 2</option>
                    <option value="Lá 1">Lá 1</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Học phí (VND)</label>
                  <input 
                    type="number" 
                    required
                    value={newStudent.amount}
                    onChange={(e) => setNewStudent({...newStudent, amount: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Họ và tên Phụ huynh</label>
                <input 
                  type="text" 
                  required
                  value={newStudent.parentName}
                  onChange={(e) => setNewStudent({...newStudent, parentName: e.target.value})}
                  placeholder="Nguyễn Văn B..."
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold placeholder:text-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Số điện thoại liên hệ</label>
                <input 
                  type="text" 
                  required
                  value={newStudent.parentPhone}
                  onChange={(e) => setNewStudent({...newStudent, parentPhone: e.target.value})}
                  placeholder="0912345678..."
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold placeholder:text-slate-400 transition-all"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Lưu thông tin học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Class Modal - Ultra Premium UI */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative border border-slate-100 overflow-hidden">
            {/* Top Ribbon Accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

            <div className="flex justify-between items-start pt-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">Thêm Lớp học mới</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Mở lớp học mới, phân công giáo viên phụ trách & chỉ tiêu sĩ số</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddClassModal(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Tên lớp học</label>
                <input 
                  type="text" 
                  required
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  placeholder="Ví dụ: Mầm 2, Chồi 2, Lá 2, Nhà Trẻ 1..."
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold placeholder:text-slate-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Khối độ tuổi</label>
                  <select 
                    value={newClass.ageGroup}
                    onChange={(e) => setNewClass({...newClass, ageGroup: e.target.value})}
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold transition-all cursor-pointer"
                  >
                    <option value="18 - 36 tháng">18 - 36 tháng (Nhà trẻ)</option>
                    <option value="3 - 4 tuổi">3 - 4 tuổi (Khối Mầm)</option>
                    <option value="4 - 5 tuổi">4 - 5 tuổi (Khối Chồi)</option>
                    <option value="5 - 6 tuổi">5 - 6 tuổi (Khối Lá)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Sĩ số tối đa</label>
                  <input 
                    type="number" 
                    required
                    min="5"
                    max="50"
                    value={newClass.capacity}
                    onChange={(e) => setNewClass({...newClass, capacity: Number(e.target.value)})}
                    placeholder="25"
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Giáo viên chủ nhiệm phụ trách</label>
                <input 
                  type="text" 
                  required
                  value={newClass.teacherName}
                  onChange={(e) => setNewClass({...newClass, teacherName: e.target.value})}
                  placeholder="Ví dụ: Cô Nguyễn Thu Hà..."
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold placeholder:text-slate-400 transition-all"
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
      )}

      {/* Add Ingredient Modal */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Nhập thực phẩm mới</h3>
              <button onClick={() => setShowAddIngredientModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Tên nguyên liệu</label>
                <input 
                  type="text" 
                  required
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                  placeholder="Ví dụ: Thịt bò, Bắp cải..."
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Số lượng</label>
                  <input 
                    type="number" 
                    required
                    min="0.1"
                    step="any"
                    value={newIngredient.quantity || ""}
                    onChange={(e) => setNewIngredient({...newIngredient, quantity: Number(e.target.value)})}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Đơn vị</label>
                  <input 
                    type="text" 
                    required
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                    placeholder="kg / lít..."
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Đơn giá (VND)</label>
                <input 
                  type="number" 
                  required
                  min="1000"
                  step="1000"
                  value={newIngredient.unitPrice || ""}
                  onChange={(e) => setNewIngredient({...newIngredient, unitPrice: Number(e.target.value)})}
                  placeholder="80000"
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/10"
              >
                Thêm vào danh sách
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Modal */}
      {showEditMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa thực đơn - {selectedDayMenu}</h3>
              <button onClick={() => setShowEditMenuModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Món ăn Bữa Sáng</label>
                <input 
                  type="text" 
                  required
                  value={editMenuForm.breakfast}
                  onChange={(e) => setEditMenuForm({...editMenuForm, breakfast: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Món ăn Bữa Trưa</label>
                <input 
                  type="text" 
                  required
                  value={editMenuForm.lunch}
                  onChange={(e) => setEditMenuForm({...editMenuForm, lunch: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Món ăn Bữa Xế (Phụ)</label>
                <input 
                  type="text" 
                  required
                  value={editMenuForm.snack}
                  onChange={(e) => setEditMenuForm({...editMenuForm, snack: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Chi phí ước tính / trẻ (VND)</label>
                <input 
                  type="number" 
                  required
                  value={editMenuForm.cost}
                  onChange={(e) => setEditMenuForm({...editMenuForm, cost: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-600/10"
              >
                Cập nhật thực đơn
              </button>
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
    </div>
  );
}
