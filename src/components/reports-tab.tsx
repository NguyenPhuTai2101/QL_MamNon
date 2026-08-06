"use client"

import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Printer, 
  Filter, 
  Users, 
  Utensils, 
  PieChart, 
  Calendar 
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function ReportsTab() {
  const [timeFilter, setTimeFilter] = useState('Tháng này')
  const filters = ['Tuần này', 'Tháng này', 'Quý này', 'Năm học']

  const handlePrint = () => {
    window.print()
  }

  // Mock data
  const revenueData = [
    { label: 'Tháng 1', total: 120000000, collected: 110000000 },
    { label: 'Tháng 2', total: 115000000, collected: 100000000 },
    { label: 'Tháng 3', total: 130000000, collected: 125000000 },
    { label: 'Tháng 4', total: 125000000, collected: 115000000 },
    { label: 'Tháng 5', total: 140000000, collected: 135000000 },
    { label: 'Tháng 6', total: 135000000, collected: 120000000 },
  ]
  const maxRev = Math.max(...revenueData.map(d => d.total))

  const attendanceData = [
    { label: 'T2', value: 95 },
    { label: 'T3', value: 98 },
    { label: 'T4', value: 92 },
    { label: 'T5', value: 88 },
    { label: 'T6', value: 85 },
    { label: 'T7', value: 90 },
    { label: 'CN', value: 96 },
  ]

  const classSizes = [
    { label: 'Mầm 1', current: 20, max: 25 },
    { label: 'Chồi 1', current: 28, max: 30 },
    { label: 'Chồi 2', current: 25, max: 30 },
    { label: 'Lá 1', current: 32, max: 35 },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                timeFilter === f 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Printer className="h-4 w-4" />
          <span>In báo cáo</span>
        </button>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Tổng Doanh thu</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(450000000)}</h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-emerald-600 font-medium">+12.5%</span>
            <span className="text-slate-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Tổng Chi phí</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(280000000)}</h3>
            </div>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-rose-600 font-medium">+5.2%</span>
            <span className="text-slate-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Lợi nhuận ròng</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(170000000)}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-blue-600 font-medium">+15.3%</span>
            <span className="text-slate-500 ml-2">so với tháng trước</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Tỷ lệ Thu học phí</p>
              <h3 className="text-2xl font-bold text-slate-900">85%</h3>
            </div>
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="100" strokeDashoffset="15" className="text-indigo-600" />
              </svg>
            </div>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            Còn lại {formatCurrency(45000000)} chưa thu
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900">Doanh thu Học phí theo tháng</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-600 rounded-sm"></div>Đã thu</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-200 rounded-sm"></div>Chưa thu</div>
            </div>
          </div>
          <div className="h-64 flex items-end gap-2 sm:gap-6 mt-8 overflow-x-auto pb-2">
            {revenueData.map((item, idx) => (
              <div key={idx} className="flex-1 min-w-[40px] flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-[80%] relative">
                  <div className="group w-full max-w-[20px] bg-indigo-600 rounded-t-md relative" style={{ height: `${(item.collected / maxRev) * 100}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                      {formatCurrency(item.collected)}
                    </div>
                  </div>
                  <div className="group w-full max-w-[20px] bg-slate-200 rounded-t-md relative" style={{ height: `${((item.total - item.collected) / maxRev) * 100}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                      {formatCurrency(item.total - item.collected)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Xu hướng Điểm danh 7 ngày</h3>
          </div>
          <div className="h-64 flex flex-col justify-end relative pt-10">
            {/* Y Axis labels */}
            <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[10px] text-slate-400">
              <span>100%</span>
              <span>90%</span>
              <span>80%</span>
            </div>
            
            <div className="ml-10 h-full flex items-end justify-between relative pb-8 border-b border-l border-slate-100">
              {/* Connecting line pseudo-element would be complex in pure inline CSS for dynamic points, using a simpler visual representation */}
              <div className="absolute inset-0 flex items-center justify-between px-4 pb-8 pointer-events-none">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                   {/* We simulate a line chart by drawing paths between points */}
                   <path d="M 0,5% L 16%,2% L 33%,8% L 50%,12% L 66%,15% L 83%,10% L 100%,4%" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke"/>
                </svg>
              </div>

              {attendanceData.map((d, i) => (
                <div key={i} className="flex flex-col items-center relative z-10 h-full justify-end w-full" style={{ height: '100%' }}>
                  <div className="absolute bottom-0 w-full flex justify-center items-end" style={{ height: `${(d.value - 80) * 5}%` }}>
                    <div className="relative group">
                      <div className={`w-3 h-3 rounded-full ${d.value >= 90 ? 'bg-emerald-500' : d.value >= 85 ? 'bg-amber-500' : 'bg-rose-500'} ring-4 ring-white shadow-sm cursor-pointer`}></div>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 bg-white shadow-sm px-2 py-0.5 rounded-md border border-slate-100">{d.value}%</span>
                    </div>
                  </div>
                  <span className="absolute -bottom-6 text-xs text-slate-500">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Expenses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900">Chi phí Bếp ăn theo Danh mục</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <div 
              className="w-48 h-48 rounded-full relative shadow-inner"
              style={{
                background: `conic-gradient(
                  #4f46e5 0% 40%, 
                  #10b981 40% 60%, 
                  #f59e0b 60% 85%, 
                  #f43f5e 85% 100%
                )`
              }}
            >
              <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <Utensils className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-lg font-bold text-slate-800">100%</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4f46e5]"></div>
                <span className="text-sm text-slate-600">Thịt & Hải sản (40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                <span className="text-sm text-slate-600">Rau củ quả (20%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                <span className="text-sm text-slate-600">Sữa & Bữa phụ (25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f43f5e]"></div>
                <span className="text-sm text-slate-600">Gia vị & Lương thực (15%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Bar Chart - Class Size */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Sĩ số Lớp học</h3>
          </div>
          <div className="flex flex-col gap-6 py-2">
            {classSizes.map((c, i) => {
              const percent = Math.round((c.current / c.max) * 100);
              return (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-slate-700">{c.label}</span>
                    <span className="text-xs font-semibold text-slate-500">{c.current} / {c.max} bé ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${percent >= 90 ? 'bg-rose-500' : percent >= 75 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
