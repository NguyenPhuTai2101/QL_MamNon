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
    description: "Lễ khai giảng năm học mới dành cho toàn bộ học sinh và giáo viên toàn trường.",
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
    description: "Triển khai kế hoạch năm học mới và lắng nghe ý kiến đóng góp từ các phụ huynh.",
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
    description: "Toàn trường nghỉ lễ Quốc khánh theo quy định chung của Nhà nước.",
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
    description: "Đề nghị quý phụ huynh hoàn thành đóng học phí tháng 9 trước ngày 10/09.",
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
    description: "Tăng cường vệ sinh, diệt muỗi, lăng quăng tại tất cả các nhóm lớp học.",
    date: "2026-08-15",
    endDate: "2026-08-30",
    type: "ANNOUNCEMENT",
    priority: "URGENT",
    targetClass: null,
    createdBy: "Y tế học đường",
  },
  {
    id: "6",
    title: "Vui hội Tết Trung thu",
    description: "Học sinh tham gia làm đèn ông sao, phá cỗ và xem múa lân tại sân trường.",
    date: "2026-09-25",
    endDate: "2026-09-25",
    type: "EVENT",
    priority: "NORMAL",
    targetClass: null,
    createdBy: "Đoàn Thanh niên",
  },
];

const TYPE_MAP: Record<EventType, { label: string; color: string; icon: any }> = {
  EVENT: { label: "Sự kiện", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: PartyPopper },
  ANNOUNCEMENT: { label: "Thông báo", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Megaphone },
  HOLIDAY: { label: "Nghỉ lễ", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Calendar },
};

const PRIORITY_MAP: Record<Priority, { label: string; color: string }> = {
  URGENT: { label: "Khẩn cấp", color: "bg-rose-50 text-rose-700 border-rose-200" },
  IMPORTANT: { label: "Quan trọng", color: "bg-amber-50 text-amber-700 border-amber-200" },
  NORMAL: { label: "Bình thường", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default function EventsTab() {
  const [events, setEvents] = useState<SchoolEvent[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<EventType | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    type: "EVENT" as EventType,
    priority: "NORMAL" as Priority,
    targetClass: "",
  });

  const filteredEvents = events.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "ALL" || e.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện / thông báo này?")) {
      setEvents(events.filter((item) => item.id !== id));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title) return;

    const newEvent: SchoolEvent = {
      id: Date.now().toString(),
      title: addForm.title,
      description: addForm.description,
      date: addForm.date,
      endDate: addForm.endDate || addForm.date,
      type: addForm.type,
      priority: addForm.priority,
      targetClass: addForm.targetClass || null,
      createdBy: "Admin",
    };

    setEvents([newEvent, ...events]);
    setIsAddModalOpen(false);
    setAddForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      type: "EVENT",
      priority: "NORMAL",
      targetClass: "",
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lịch Sự Kiện & Bảng Thông Báo</h2>
          <p className="text-sm text-slate-500 mt-1">Đăng tải thông báo toàn trường, lên lịch nghỉ lễ và các hoạt động ngoại khóa.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"
              }`}
            >
              <List className="w-3.5 h-3.5" /> Danh sách
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "calendar" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Lịch tháng
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-600/10 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tạo mới
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List / Calendar View (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Type Filter Tabs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  typeFilter === "ALL" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                }`}
              >
                Tất cả ({events.length})
              </button>
              {(Object.keys(TYPE_MAP) as EventType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    typeFilter === type ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {TYPE_MAP[type].label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List View */}
          {viewMode === "list" ? (
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 font-medium">
                  Không tìm thấy thông báo hoặc sự kiện nào.
                </div>
              ) : (
                filteredEvents.map((item) => {
                  const typeInfo = TYPE_MAP[item.type];
                  const priorityInfo = PRIORITY_MAP[item.priority];
                  const Icon = typeInfo.icon;

                  return (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3 relative group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${typeInfo.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 text-base">{item.title}</h4>
                              {item.priority === "URGENT" && (
                                <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                  <AlertTriangle className="w-3 h-3" /> KHẨN CẤP
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                {item.date} {item.endDate !== item.date ? `đến ${item.endDate}` : ""}
                              </span>
                              <span>•</span>
                              <span>Tạo bởi: {item.createdBy}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 pl-12 leading-relaxed">{item.description}</p>

                      <div className="pl-12 pt-1 flex items-center justify-between text-xs text-slate-400">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold">
                          Đối tượng: {item.targetClass || "Toàn trường"}
                        </span>
                        <span className={`font-semibold ${priorityInfo.color} px-2 py-0.5 rounded-md border`}>
                          Ưu tiên: {priorityInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Month Calendar Grid View */
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-base">Tháng 9 / 2026</h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"/> Sự kiện</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"/> Thông báo</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"/> Nghỉ lễ</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase py-1">
                <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }).map((_, idx) => {
                  const day = idx + 1;
                  const dayStr = `2026-09-${day < 10 ? "0" + day : day}`;
                  const dayEvents = events.filter((e) => e.date === dayStr);

                  return (
                    <div
                      key={idx}
                      className="min-h-[70px] bg-slate-50/70 p-1.5 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-100 transition-colors"
                    >
                      <span className="font-bold text-xs text-slate-700">{day}</span>
                      <div className="space-y-1">
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate ${TYPE_MAP[ev.type].color}`}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Urgent Alerts & Next Upcoming Events (1 col) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Thông Báo Nổi Bật</h3>
                <p className="text-xs text-slate-300">Cập nhật tin tức quan trọng nhất</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {events
                .filter((e) => e.priority === "URGENT" || e.priority === "IMPORTANT")
                .slice(0, 3)
                .map((e) => (
                  <div key={e.id} className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-amber-300">{e.title}</h4>
                      <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono">{e.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{e.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Tạo Thông Báo / Sự Kiện Mới</h3>
                  <p className="text-xs text-slate-500">Đăng tải lên bảng tin chung hoặc gửi tới lớp học</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Tiêu đề thông báo / sự kiện *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Họp phụ huynh cuối học kỳ I..."
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Phân loại</label>
                  <select
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value as EventType })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-800"
                  >
                    <option value="EVENT">Sự kiện ngoại khóa</option>
                    <option value="ANNOUNCEMENT">Thông báo chung</option>
                    <option value="HOLIDAY">Nghỉ lễ / Nghỉ phép</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Mức độ ưu tiên</label>
                  <select
                    value={addForm.priority}
                    onChange={(e) => setAddForm({ ...addForm, priority: e.target.value as Priority })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-800"
                  >
                    <option value="NORMAL">Bình thường</option>
                    <option value="IMPORTANT">Quan trọng</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Ngày bắt đầu</label>
                  <input
                    type="date"
                    required
                    value={addForm.date}
                    onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={addForm.endDate}
                    onChange={(e) => setAddForm({ ...addForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Nội dung chi tiết</label>
                <textarea
                  rows={3}
                  placeholder="Nhập nội dung thông báo cho phụ huynh và giáo viên..."
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 text-sm"
                >
                  Đăng thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
