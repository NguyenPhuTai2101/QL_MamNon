"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Printer, 
  Users, 
  Utensils, 
  PieChart, 
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ReportsTab() {
  const [timeFilter, setTimeFilter] = useState('Tháng này');
  const filters = ['Tuần này', 'Tháng này', 'Quý này', 'Năm học'];

  const handlePrint = () => {
    window.print();
  };

  // Mock data
  const revenueData = [
    { label: 'Tháng 3', total: 130000000, collected: 125000000 },
    { label: 'Tháng 4', total: 125000000, collected: 115000000 },
    { label: 'Tháng 5', total: 140000000, collected: 135000000 },
    { label: 'Tháng 6', total: 135000000, collected: 120000000 },
    { label: 'Tháng 7', total: 145000000, collected: 138000000 },
    { label: 'Tháng 8', total: 150000000, collected: 142000000 },
  ];
  const maxRev = Math.max(...revenueData.map(d => d.total));

  const attendanceData = [
    { label: 'T2', value: 95 },
    { label: 'T3', value: 98 },
    { label: 'T4', value: 92 },
    { label: 'T5', value: 88 },
    { label: 'T6', value: 94 },
    { label: 'T7', value: 90 },
    { label: 'CN', value: 96 },
  ];

  const kitchenCategories = [
    { name: 'Thịt & Hải sản', percentage: 40, color: 'bg-rose-500', value: 16000000 },
    { name: 'Sữa & Bữa phụ', percentage: 25, color: 'bg-amber-500', value: 10000000 },
    { name: 'Rau củ quả', percentage: 20, color: 'bg-emerald-500', value: 8000000 },
    { name: 'Gia vị & Khác', percentage: 15, color: 'bg-indigo-500', value: 6000000 },
  ];

  const classSizes = [
    { label: 'Mầm 1', current: 22, max: 25, color: 'bg-indigo-500' },
    { label: 'Chồi 1', current: 28, max: 30, color: 'bg-purple-500' },
    { label: 'Chồi 2', current: 26, max: 30, color: 'bg-sky-500' },
    { label: 'Lá 1', current: 32, max: 35, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Báo cáo & Thống kê Tổng quan</h2>
          <p className="text-sm text-slate-500 mt-1">Trực quan hóa dữ liệu tài chính, học phí, điểm danh và chi phí bếp ăn nhà trường.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  timeFilter === f 
                    ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">In Báo cáo</span>
          </button>
        </div>
      </div>

      {/* Top Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(150000000)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">+12.5%</span>
            <span className="text-slate-400 ml-2">so với tháng trước</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Chi Phí</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(68000000)}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md">+4.2%</span>
            <span className="text-slate-400 ml-2">bếp & vận hành</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lợi Nhuận Ròng</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(82000000)}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md">54.6%</span>
            <span className="text-slate-400 ml-2">tỷ suất lợi nhuận</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-sky-500" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tỷ Lệ Thu Học Phí</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">94.6%</h3>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-sky-600 font-bold bg-sky-50 px-1.5 py-0.5 rounded-md">Đạt mục tiêu</span>
            <span className="text-slate-400 ml-2">tháng 8</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column Bar Chart: Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Biểu đồ Thu Học Phí theo Tháng</h3>
              <p className="text-xs text-slate-400 mt-0.5">So sánh Học phí Thực tế thu được vs Chỉ tiêu kỳ vọng</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-indigo-600 rounded-sm" />
                <span className="text-slate-600">Đã thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-200 rounded-sm" />
                <span className="text-slate-400">Dự kiến</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
            {revenueData.map((d, idx) => {
              const totalHeight = Math.round((d.total / maxRev) * 100);
              const collectedHeight = Math.round((d.collected / maxRev) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(d.collected / 1000000).toFixed(0)}M
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-t-xl h-full flex items-end p-1 relative overflow-hidden">
                    {/* Background Bar (Total) */}
                    <div 
                      className="w-full bg-slate-200/80 rounded-t-lg transition-all duration-500"
                      style={{ height: `${totalHeight}%` }}
                    />
                    {/* Foreground Bar (Collected) */}
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-lg absolute bottom-0 left-0 right-0 transition-all duration-500 shadow-md"
                      style={{ height: `${collectedHeight}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{d.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Trung bình thu: <strong className="text-slate-800">131.6 triệu VNĐ / tháng</strong></span>
            <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Xem chi tiết báo cáo →</span>
          </div>
        </div>

        {/* Donut Chart: Kitchen Costs Breakdown (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Cơ Cấu Chi Phí Bếp Ăn</h3>
            <p className="text-xs text-slate-400 mt-0.5">Phân bổ thực phẩm tháng này ({formatCurrency(40000000)})</p>
          </div>

          {/* Visual Donut representation */}
          <div className="flex justify-center py-2">
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-500 p-3 shadow-inner">
              <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-md">
                <span className="text-xs font-bold text-slate-400 uppercase">Tổng chi</span>
                <span className="text-base font-extrabold text-slate-800">40 Triệu</span>
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-2.5">
            {kitchenCategories.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="font-semibold text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{formatCurrency(item.value)}</span>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Line/Dots */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Tỷ Lệ Chuyên Cần Trong Tuần</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tỷ lệ đi học thực tế theo từng ngày</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              TB: 93.3%
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 px-4 pt-4 pb-2">
            {attendanceData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {item.value}%
                </span>
                <div className="w-full bg-slate-100 rounded-t-xl h-full flex items-end p-1">
                  <div 
                    className="w-full bg-indigo-500 rounded-t-lg transition-all duration-300 shadow-sm"
                    style={{ height: `${item.value}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Class Capacity Horizontal Progress Bars */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tỷ Lệ Lấp Đầy Sĩ Số Lớp</h3>
            <p className="text-xs text-slate-400 mt-0.5">Số lượng trẻ hiện tại / Sức chứa tối đa từng lớp</p>
          </div>

          <div className="space-y-4 pt-2">
            {classSizes.map((cls, idx) => {
              const percent = Math.round((cls.current / cls.max) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">Lớp {cls.label}</span>
                    <span className="text-slate-500">
                      <strong className="text-indigo-600">{cls.current}</strong> / {cls.max} trẻ ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${cls.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
