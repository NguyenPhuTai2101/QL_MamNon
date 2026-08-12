"use client";

import React, { useState } from 'react';
import Portal from "@/components/portal";
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
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedRank, setSelectedRank] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEvaluations = () => {
    setLoading(true);
    fetch(`/api/evaluations?month=${selectedMonth}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          const mapped: Evaluation[] = resData.data.map((item: any) => ({
            id: item.id,
            staffId: item.staffId || 'STF-001',
            staffName: item.staffName,
            month: item.month,
            attendancePts: item.attendancePts || 0,
            teachingPts: item.teachingPts || 0,
            feedbackPts: item.feedbackPts || 0,
            totalScore: item.score || item.totalScore || 0,
            rank: item.rank as any,
            notes: item.notes || '',
          }));
          setEvaluations(mapped);
        }
      })
      .catch((err) => console.error("Lỗi khi tải kết quả đánh giá:", err))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    loadEvaluations();
  }, [selectedMonth]);

  const filteredEvaluations = evaluations.filter(evalItem => {
    const matchesSearch = evalItem.staffName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !selectedMonth || evalItem.month === selectedMonth;
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
                className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
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
                  className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
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
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Top Ribbon Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">Thêm Đánh Giá Nhân Sự Mới</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Chấm điểm chuyên cần, giảng dạy và phản hồi phụ huynh</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                setShowAddModal(false);
                loadEvaluations();
              }} className="p-6 pt-0 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Giáo viên</label>
                    <select className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer">
                      <option value="">Chọn giáo viên</option>
                      <option value="STF001">Nguyễn Thị Hương</option>
                      <option value="STF002">Phạm Thị Hoa</option>
                      <option value="STF003">Lê Thị Lan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Tháng đánh giá</label>
                    <input 
                      type="month" 
                      defaultValue="2026-08"
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Điểm chuyên cần (Tối đa 30)</label>
                  <input 
                    type="number" 
                    min="0" max="30" defaultValue="30"
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Điểm giảng dạy (Tối đa 40)</label>
                  <input 
                    type="number" 
                    min="0" max="40" defaultValue="38"
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Điểm phản hồi PH (Tối đa 30)</label>
                  <input 
                    type="number" 
                    min="0" max="30" defaultValue="28"
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Nhận xét chi tiết</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm resize-none"
                    placeholder="Nhập nhận xét chi tiết..."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <Award className="w-4 h-4" />
                    Lưu kết quả đánh giá
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

    </div>
  );
}

