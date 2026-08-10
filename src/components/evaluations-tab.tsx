"use client";

import React, { useState } from 'react';
import { 
  Award, Plus, Search, Filter, Star, CheckCircle2, 
  Trophy, Medal, AlertCircle, Trash2, X, TrendingUp, Calendar
} from 'lucide-react';

interface Evaluation {
  id: string;
  staffId: string;
  staffName: string;
  month: string;
  attendancePts: number;
  teachingPts: number;
  feedbackPts: number;
  totalScore: number;
  rank: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  notes: string;
}

const mockEvaluations: Evaluation[] = [
  {
    id: '1',
    staffId: 'STF001',
    staffName: 'Nguyễn Thị Hoa',
    month: '2026-08',
    attendancePts: 30,
    teachingPts: 38,
    feedbackPts: 28,
    totalScore: 96,
    rank: 'EXCELLENT',
    notes: 'Hoàn thành xuất sắc nhiệm vụ, được phụ huynh khen ngợi.'
  },
  {
    id: '2',
    staffId: 'STF002',
    staffName: 'Trần Văn An',
    month: '2026-08',
    attendancePts: 28,
    teachingPts: 35,
    feedbackPts: 25,
    totalScore: 88,
    rank: 'GOOD',
    notes: 'Giảng dạy tốt, cần cải thiện tương tác phụ huynh.'
  },
  {
    id: '3',
    staffId: 'STF003',
    staffName: 'Lê Thu Hương',
    month: '2026-08',
    attendancePts: 30,
    teachingPts: 39,
    feedbackPts: 29,
    totalScore: 98,
    rank: 'EXCELLENT',
    notes: 'Giáo án sáng tạo, luôn đi làm đúng giờ.'
  },
  {
    id: '4',
    staffId: 'STF004',
    staffName: 'Phạm Minh Đức',
    month: '2026-08',
    attendancePts: 25,
    teachingPts: 30,
    feedbackPts: 20,
    totalScore: 75,
    rank: 'FAIR',
    notes: 'Thường xuyên đi muộn, cần chú ý giờ giấc.'
  },
  {
    id: '5',
    staffId: 'STF005',
    staffName: 'Hoàng Thị Lan',
    month: '2026-08',
    attendancePts: 30,
    teachingPts: 36,
    feedbackPts: 26,
    totalScore: 92,
    rank: 'GOOD',
    notes: 'Hoàn thành tốt nhiệm vụ.'
  },
  {
    id: '6',
    staffId: 'STF006',
    staffName: 'Vũ Ngọc Hùng',
    month: '2026-08',
    attendancePts: 20,
    teachingPts: 25,
    feedbackPts: 15,
    totalScore: 60,
    rank: 'POOR',
    notes: 'Nhiều phụ huynh phàn nàn, cần họp nhắc nhở.'
  }
];

export default function EvaluationsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedRank, setSelectedRank] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredEvaluations = mockEvaluations.filter(evalItem => {
    const matchesSearch = evalItem.staffName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = evalItem.month === selectedMonth;
    const matchesRank = selectedRank === 'ALL' || evalItem.rank === selectedRank;
    return matchesSearch && matchesMonth && matchesRank;
  });

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'EXCELLENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
            <Trophy className="w-3.5 h-3.5" /> Xuất sắc
          </span>
        );
      case 'GOOD':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Tốt
          </span>
        );
      case 'FAIR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200">
            <Star className="w-3.5 h-3.5" /> Khá
          </span>
        );
      case 'POOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> Cần cố gắng
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Đánh giá & Hiệu suất</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý hiệu suất làm việc và khen thưởng giáo viên</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Thêm đánh giá</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-amber-500 border-t border-r border-b border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Giáo viên xuất sắc</p>
            <p className="text-2xl font-bold text-slate-800">2</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-indigo-500 border-t border-r border-b border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Điểm TB toàn trường</p>
            <p className="text-2xl font-bold text-slate-800">84.8</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-emerald-500 border-t border-r border-b border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tỷ lệ đạt chuẩn</p>
            <p className="text-2xl font-bold text-slate-800">83%</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-purple-500 border-t border-r border-b border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Medal className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Số lượt khen thưởng</p>
            <p className="text-2xl font-bold text-slate-800">12</p>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm giáo viên..."
                className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-40">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedRank('ALL')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedRank === 'ALL' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedRank('EXCELLENT')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedRank === 'EXCELLENT' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Xuất sắc
            </button>
            <button
              onClick={() => setSelectedRank('GOOD')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedRank === 'GOOD' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tốt
            </button>
            <button
              onClick={() => setSelectedRank('FAIR')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedRank === 'FAIR' 
                  ? 'bg-sky-100 text-sky-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Khá
            </button>
            <button
              onClick={() => setSelectedRank('POOR')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedRank === 'POOR' 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cần cố gắng
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="py-3 px-5 font-medium">Giáo viên</th>
                <th className="py-3 px-5 font-medium">Tháng đánh giá</th>
                <th className="py-3 px-5 font-medium">Điểm chuyên cần (30%)</th>
                <th className="py-3 px-5 font-medium">Điểm giảng dạy (40%)</th>
                <th className="py-3 px-5 font-medium">Phản hồi PH (30%)</th>
                <th className="py-3 px-5 font-medium">Tổng điểm</th>
                <th className="py-3 px-5 font-medium">Xếp loại</th>
                <th className="py-3 px-5 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvaluations.map((evalItem) => (
                <tr key={evalItem.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-5">
                    <div className="font-medium text-slate-900">{evalItem.staffName}</div>
                    <div className="text-xs text-slate-500">{evalItem.staffId}</div>
                  </td>
                  <td className="py-3 px-5 text-slate-600">{evalItem.month}</td>
                  <td className="py-3 px-5 text-slate-600">{evalItem.attendancePts}/30</td>
                  <td className="py-3 px-5 text-slate-600">{evalItem.teachingPts}/40</td>
                  <td className="py-3 px-5 text-slate-600">{evalItem.feedbackPts}/30</td>
                  <td className="py-3 px-5">
                    <span className="font-bold text-slate-900">{evalItem.totalScore}</span>
                  </td>
                  <td className="py-3 px-5">
                    {getRankBadge(evalItem.rank)}
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => {
                          setShowAddModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Sửa phiếu đánh giá"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEvaluations.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Không tìm thấy đánh giá nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Evaluation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Thêm đánh giá mới</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Giáo viên</label>
                  <select className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
                    <option value="">Chọn giáo viên</option>
                    <option value="STF001">Nguyễn Thị Hoa</option>
                    <option value="STF002">Trần Văn An</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tháng đánh giá</label>
                  <input 
                    type="month" 
                    defaultValue="2026-08"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Điểm chuyên cần (Tối đa 30)</label>
                <input 
                  type="number" 
                  min="0" max="30"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Điểm giảng dạy (Tối đa 40)</label>
                <input 
                  type="number" 
                  min="0" max="40"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Điểm phản hồi PH (Tối đa 30)</label>
                <input 
                  type="number" 
                  min="0" max="30"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nhận xét</label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  placeholder="Nhập nhận xét..."
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
                onClick={() => setShowAddModal(false)}
              >
                Lưu đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
