"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Megaphone,
  PartyPopper,
  Calendar,
  Clock,
  MapPin,
  X,
  Trash2,
  Bell,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";

type EventType = "EVENT" | "ANNOUNCEMENT" | "HOLIDAY";
type Priority = "URGENT" | "IMPORTANT" | "NORMAL";

interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  type: EventType;
  priority: Priority;
  targetClass: string | null;
  createdBy: string;
}

const initialEvents: SchoolEvent[] = [
  {
    id: "1",
    title: "Khai giảng năm học mới 2026-2027",
    description: "Lễ khai giảng năm học mới dành cho toàn bộ học sinh và giáo viên.",
    date: "2026-09-05",
    endDate: "2026-09-05",
    type: "EVENT",
    priority: "IMPORTANT",
    targetClass: null,
    createdBy: "Ban Giám Hiệu",
  },
  {
    id: "2",
    title: "Họp phụ huynh đầu năm",
    description: "Triển khai kế hoạch năm học mới và các hoạt động của trường.",
    date: "2026-09-12",
    endDate: "2026-09-12",
    type: "EVENT",
    priority: "IMPORTANT",
    targetClass: null,
    createdBy: "Ban Giám Hiệu",
  },
  {
    id: "3",
    title: "Nghỉ lễ Quốc khánh 2/9",
    description: "Toàn trường nghỉ lễ Quốc khánh theo quy định của nhà nước.",
    date: "2026-09-02",
    endDate: "2026-09-03",
    type: "HOLIDAY",
    priority: "NORMAL",
    targetClass: null,
    createdBy: "Phòng Hành chính",
  },
  {
    id: "4",
    title: "Thông báo thu học phí tháng 9",
    description: "Đề nghị quý phụ huynh hoàn thành học phí tháng 9 trước ngày 10/09.",
    date: "2026-09-01",
    endDate: "2026-09-10",
    type: "ANNOUNCEMENT",
    priority: "IMPORTANT",
    targetClass: null,
    createdBy: "Phòng Kế toán",
  },
  {
    id: "5",
    title: "Thông báo phòng dịch Sốt xuất huyết",
    description: "Tăng cường vệ sinh, diệt muỗi, lăng quăng tại các khu vực lớp học.",
    date: "2026-08-15",
    endDate: "2026-08-30",
    type: "ANNOUNCEMENT",
    priority: "URGENT",
    targetClass: null,
    createdBy: "Y tế học đường",
  },
  {
    id: "6",
    title: "Nghỉ Tết Trung thu",
    description: "Học sinh được nghỉ học buổi chiều để tham gia rước đèn.",
    date: "2026-09-25",
    endDate: "2026-09-25",
    type: "HOLIDAY",
    priority: "NORMAL",
    targetClass: null,
    createdBy: "Ban Giám Hiệu",
  },
  {
    id: "7",
    title: "Tham quan dã ngoại Thảo Cầm Viên",
    description: "Chương trình dã ngoại học tập ngoại khóa cho các khối Mầm, Chồi, Lá.",
    date: "2026-10-15",
    endDate: "2026-10-15",
    type: "EVENT",
    priority: "NORMAL",
    targetClass: null,
    createdBy: "Phòng Đào tạo",
  },
  {
    id: "8",
    title: "Thay đổi lịch học thể dục Lớp Chồi 1",
    description: "Lịch học thể dục chuyển từ sáng Thứ 3 sang chiều Thứ 4.",
    date: "2026-08-20",
    endDate: "2026-08-20",
    type: "ANNOUNCEMENT",
    priority: "NORMAL",
    targetClass: "Chồi 1",
    createdBy: "Giáo viên Thể chất",
  },
];

const classes = ["Mầm 1", "Mầm 2", "Chồi 1", "Chồi 2", "Lá 1", "Lá 2"];

export default function EventsTab() {
  const [events, setEvents] = useState<SchoolEvent[]>(initialEvents);
  const [activeFilter, setActiveFilter] = useState<EventType | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"LIST" | "CALENDAR">("LIST");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date("2026-08-01"));

  // Form State
  const [formData, setFormData] = useState<Partial<SchoolEvent>>({
    title: "",
    description: "",
    date: "",
    endDate: "",
    type: "EVENT",
    priority: "NORMAL",
    targetClass: "",
    createdBy: "Admin",
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: SchoolEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title || "",
      description: formData.description || "",
      date: formData.date || "",
      endDate: formData.endDate || formData.date || "",
      type: (formData.type as EventType) || "EVENT",
      priority: (formData.priority as Priority) || "NORMAL",
      targetClass: formData.targetClass || null,
      createdBy: formData.createdBy || "Admin",
    };
    setEvents([...events, newEvent]);
    setIsAddModalOpen(false);
    setFormData({
      title: "",
      description: "",
      date: "",
      endDate: "",
      type: "EVENT",
      priority: "NORMAL",
      targetClass: "",
      createdBy: "Admin",
    });
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter((ev) => ev.id !== id));
  };

  const filteredEvents = events.filter((ev) => {
    const matchesFilter = activeFilter === "ALL" || ev.type === activeFilter;
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const upcomingEvents = [...events]
    .filter((ev) => new Date(ev.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const getBadgeColor = (type: EventType) => {
    switch (type) {
      case "EVENT":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "ANNOUNCEMENT":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "HOLIDAY":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const getTypeLabel = (type: EventType) => {
    switch (type) {
      case "EVENT":
        return "Sự kiện";
      case "ANNOUNCEMENT":
        return "Thông báo";
      case "HOLIDAY":
        return "Nghỉ lễ";
    }
  };

  const getTypeIcon = (type: EventType) => {
    switch (type) {
      case "EVENT":
        return <PartyPopper className="w-4 h-4 mr-1" />;
      case "ANNOUNCEMENT":
        return <Megaphone className="w-4 h-4 mr-1" />;
      case "HOLIDAY":
        return <CalendarDays className="w-4 h-4 mr-1" />;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Khẩn cấp
          </span>
        );
      case "IMPORTANT":
        return (
          <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
            <AlertTriangle className="w-3 h-3 mr-1" /> Quan trọng
          </span>
        );
      case "NORMAL":
        return (
          <span className="flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
            Bình thường
          </span>
        );
    }
  };

  // Calendar View Helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">
            Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-medium text-slate-500">
          <div>T2</div>
          <div>T3</div>
          <div>T4</div>
          <div>T5</div>
          <div>T6</div>
          <div>T7</div>
          <div className="text-red-500">CN</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="h-24 rounded-xl bg-slate-50 border border-slate-100 opacity-50"></div>
          ))}
          {days.map((day) => {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(day).padStart(2, "0")}`;
            const dayEvents = events.filter(
              (e) => e.date <= dateStr && e.endDate >= dateStr
            );

            return (
              <div
                key={day}
                className="h-24 rounded-xl border border-slate-100 p-2 hover:border-indigo-200 hover:shadow-sm transition-all relative group overflow-hidden"
              >
                <span className="text-sm font-medium text-slate-700">{day}</span>
                <div className="mt-1 flex flex-col space-y-1">
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className={`text-[10px] leading-tight truncate px-1.5 py-1 rounded border ${getBadgeColor(
                        ev.type
                      )}`}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-slate-500 font-medium pl-1">
                      +{dayEvents.length - 2} thêm
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex gap-6">
      <div className="flex-1">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Sự kiện & Thông báo</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý các hoạt động và thông báo của trường</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm mới
            </button>
          </div>
        </div>

        {/* Filters and View Toggles */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex space-x-2">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: "EVENT", label: "Sự kiện" },
              { id: "ANNOUNCEMENT", label: "Thông báo" },
              { id: "HOLIDAY", label: "Nghỉ lễ" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeFilter === tab.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("LIST")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "LIST" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("CALENDAR")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "CALENDAR" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === "LIST" ? (
          <div className="space-y-4">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(
                        ev.type
                      )}`}
                    >
                      {getTypeIcon(ev.type)}
                      {getTypeLabel(ev.type)}
                    </span>
                    {getPriorityBadge(ev.priority)}
                  </div>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{ev.title}</h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{ev.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                    {ev.date === ev.endDate ? ev.date : `${ev.date} - ${ev.endDate}`}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                    {ev.targetClass ? ev.targetClass : "Toàn trường"}
                  </div>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Không tìm thấy sự kiện hay thông báo nào.</p>
              </div>
            )}
          </div>
        ) : (
          renderCalendar()
        )}
      </div>

      {/* Sidebar - Upcoming Events */}
      <div className="w-80 hidden lg:block shrink-0">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
            Sắp diễn ra
          </h3>
          <div className="space-y-4">
            {upcomingEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-colors"
              >
                <div className="text-xs font-medium text-indigo-600 mb-1">{ev.date}</div>
                <div className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1">
                  {ev.title}
                </div>
                <div className="text-xs text-slate-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {ev.targetClass || "Toàn trường"}
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Không có sự kiện sắp tới.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Thêm mới Sự kiện / Thông báo</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề *</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phân loại</label>
                  <select
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                  >
                    <option value="EVENT">Sự kiện</option>
                    <option value="ANNOUNCEMENT">Thông báo</option>
                    <option value="HOLIDAY">Nghỉ lễ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mức độ</label>
                  <select
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  >
                    <option value="NORMAL">Bình thường</option>
                    <option value="IMPORTANT">Quan trọng</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bắt đầu *</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Đối tượng áp dụng</label>
                <select
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={formData.targetClass || ""}
                  onChange={(e) => setFormData({ ...formData, targetClass: e.target.value || null })}
                >
                  <option value="">Toàn trường</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm font-medium transition-colors"
                >
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
