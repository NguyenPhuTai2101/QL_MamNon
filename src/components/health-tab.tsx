"use client";

import React, { useState } from "react";
import { 
  HeartPulse, 
  Activity, 
  Smile, 
  AlertTriangle, 
  Star, 
  Edit3, 
  CheckCircle2, 
  Filter, 
  Moon, 
  Utensils, 
  Award,
  Save
} from "lucide-react";

interface StudentHealth {
  id: string;
  name: string;
  className: string;
  heightCm: number;
  weightKg: number;
  allergies: string;
  bloodType: string;
  napTime: string;
  mealRating: "EXCELLENT" | "GOOD" | "POOR";
  starsCount: number;
  teacherNote: string;
}

export default function HealthTab() {
  const [selectedClass, setSelectedClass] = useState("Mầm 1");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentHealth | null>(null);
  const [saveNotification, setSaveNotification] = useState(false);

  const availableClasses = ["Mầm 1", "Chồi 1", "Chồi 2", "Lá 1"];

  // Mock initial dataset for health records & digital diary
  const [records, setRecords] = useState<StudentHealth[]>([
    {
      id: "1",
      name: "Nguyễn Minh Khang",
      className: "Mầm 1",
      heightCm: 98,
      weightKg: 15.2,
      allergies: "Dị ứng hải sản (tôm, cua)",
      bloodType: "O+",
      napTime: "2 tiếng 15 phút",
      mealRating: "EXCELLENT",
      starsCount: 5,
      teacherNote: "Khang hôm nay rất ngoan, tự giác ăn hết suất và hăng hái phát biểu.",
    },
    {
      id: "4",
      name: "Phạm Mai Chi",
      className: "Mầm 1",
      heightCm: 96,
      weightKg: 14.5,
      allergies: "Không có",
      bloodType: "A+",
      napTime: "2 tiếng",
      mealRating: "EXCELLENT",
      starsCount: 5,
      teacherNote: "Bé Chi ngoan, múa hát rất đẹp cùng các bạn.",
    },
    {
      id: "6",
      name: "Trần Đức Anh",
      className: "Mầm 1",
      heightCm: 101,
      weightKg: 16.0,
      allergies: "Nhạy cảm với bụi mịn",
      bloodType: "B+",
      napTime: "1 tiếng 45 phút",
      mealRating: "GOOD",
      starsCount: 4,
      teacherNote: "Đức Anh hơi ho nhẹ buổi sáng, đã cho bé uống nước ấm.",
    },
    {
      id: "2",
      name: "Lê Vy Anh",
      className: "Chồi 1",
      heightCm: 106,
      weightKg: 17.8,
      allergies: "Dị ứng đậu phụng",
      bloodType: "AB+",
      napTime: "2 tiếng",
      mealRating: "EXCELLENT",
      starsCount: 5,
      teacherNote: "Bé Vy Anh chơi hòa đồng với các bạn trong giờ vẽ tranh.",
    },
    {
      id: "3",
      name: "Trần Bảo Nam",
      className: "Lá 1",
      heightCm: 114,
      weightKg: 20.5,
      allergies: "Không có",
      bloodType: "O+",
      napTime: "2 tiếng 30 phút",
      mealRating: "EXCELLENT",
      starsCount: 5,
      teacherNote: "Bảo Nam là lớp trưởng gương mẫu, giúp cô xếp lại đồ chơi.",
    },
  ]);

  // Filter students based on Class and Search Query
  const filteredStudents = records.filter(
    (s) => s.className === selectedClass && s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to calculate BMI & growth classification
  const calculateBMI = (heightCm: number, weightKg: number) => {
    if (!heightCm || !weightKg) return { bmi: 0, status: "Chưa rõ", color: "slate" };
    const heightM = heightCm / 100;
    const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

    if (bmi < 13.5) return { bmi, status: "Suy dinh dưỡng nhẹ", color: "rose" };
    if (bmi >= 13.5 && bmi <= 17.5) return { bmi, status: "Chuẩn phát triển WHO", color: "emerald" };
    return { bmi, status: "Thừa cân nhẹ", color: "amber" };
  };

  const handleOpenEdit = (student: StudentHealth) => {
    setSelectedStudent({ ...student });
    setShowEditModal(true);
  };

  const handleSaveStudentHealth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setRecords(records.map((r) => (r.id === selectedStudent.id ? selectedStudent : r)));
    setShowEditModal(false);
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sức khỏe Dinh dưỡng & Sổ Bé Ngoan Điện tử</h2>
          <p className="text-sm text-slate-500 mt-1">Theo dõi chỉ số chiều cao, cân nặng, BMI chuẩn WHO và nhật ký chăm sóc trẻ hàng ngày.</p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl text-xs font-bold text-indigo-700 shadow-sm">
          <Award className="w-4 h-4 text-indigo-600" />
          Tổng hợp Sổ Bé Ngoan Tháng 08/2026
        </div>
      </div>

      {saveNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Đã cập nhật hồ sơ sức khỏe và nhật ký Sổ Bé Ngoan thành công!
        </div>
      )}

      {/* Class selector & Search bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lớp:
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

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm tên bé..."
          className="w-full sm:w-64 px-3.5 py-2 border border-slate-200 bg-white text-slate-900 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        />
      </div>

      {/* Health & Diary Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStudents.map((item) => {
          const bmiInfo = calculateBMI(item.heightCm, item.weightKg);
          return (
            <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-5 relative">
              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    {item.name}
                    <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
                      Lớp {item.className}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Nhóm máu: <strong className="text-slate-600">{item.bloodType}</strong></span>
                    <span>•</span>
                    <span className={item.allergies.includes("Dị ứng") ? "text-rose-600 font-bold flex items-center gap-1" : "text-slate-500"}>
                      {item.allergies.includes("Dị ứng") && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 inline" />}
                      {item.allergies}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  title="Cập nhật sức khỏe & Sổ bé ngoan"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Physical Growth & BMI Metrics */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Chiều cao</span>
                  <span className="text-base font-extrabold text-slate-800 mt-0.5 block">{item.heightCm} cm</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Cân nặng</span>
                  <span className="text-base font-extrabold text-slate-800 mt-0.5 block">{item.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Chỉ số BMI</span>
                  <span className={`text-xs font-extrabold mt-1 inline-block px-2 py-0.5 rounded-full ${
                    bmiInfo.color === "emerald" ? "bg-emerald-100 text-emerald-800" :
                    bmiInfo.color === "amber" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {bmiInfo.bmi} ({bmiInfo.status})
                  </span>
                </div>
              </div>

              {/* Daily Digital Diary Section */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> Giấc ngủ trưa:
                  </span>
                  <span className="font-bold text-slate-700">{item.napTime}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-500" /> Sức ăn bữa trưa:
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {item.mealRating === "EXCELLENT" ? "Ăn hết sạch suất" : "Ăn khá tốt"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Đánh giá Bé ngoan:
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(item.starsCount)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-xs text-slate-700 font-medium">
                  <strong className="text-amber-800 block mb-0.5">Nhận xét của giáo viên chủ nhiệm:</strong>
                  "{item.teacherNote}"
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Health Record Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 relative border border-slate-100 overflow-hidden">
            {/* Top Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

            <div className="flex justify-between items-start pt-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md shadow-emerald-500/30">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">Cập nhật Sức khỏe & Bé ngoan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedStudent.name} - Lớp {selectedStudent.className}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudentHealth} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Chiều cao (cm)</label>
                  <input 
                    type="number" 
                    required
                    step="0.5"
                    value={selectedStudent.heightCm}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, heightCm: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Cân nặng (kg)</label>
                  <input 
                    type="number" 
                    required
                    step="0.1"
                    value={selectedStudent.weightKg}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, weightKg: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Cảnh báo dị ứng thực phẩm / thuốc</label>
                <input 
                  type="text" 
                  value={selectedStudent.allergies}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, allergies: e.target.value })}
                  placeholder="Ví dụ: Dị ứng hải sản, dị ứng đậu phụng..."
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Giờ ngủ trưa</label>
                  <input 
                    type="text" 
                    value={selectedStudent.napTime}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, napTime: e.target.value })}
                    placeholder="2 tiếng..."
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Đánh giá Sao Bé ngoan</label>
                  <select 
                    value={selectedStudent.starsCount}
                    onChange={(e) => setSelectedStudent({ ...selectedStudent, starsCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold cursor-pointer"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (Xuất sắc)</option>
                    <option value={4}>⭐⭐⭐⭐ (Rất ngoan)</option>
                    <option value={3}>⭐⭐⭐ (Khá ngoan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Nhận xét của giáo viên chủ nhiệm</label>
                <textarea 
                  rows={3}
                  value={selectedStudent.teacherNote}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, teacherNote: e.target.value })}
                  placeholder="Nhập nhận xét ngày cho phụ huynh..."
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold transition-all"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  Lưu nhật ký Sổ Bé Ngoan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
