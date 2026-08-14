"use client";

import React, { useState } from "react";
import Portal from "@/components/portal";
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
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<EventType | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tải danh sách sự kiện & thông báo từ CSDL PostgreSQL qua API
  const loadEvents = () => {
    setLoading(true);
    fetch("/api/events")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          const mapped: SchoolEvent[] = resData.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || "",
            date: item.date ? item.date.split("T")[0] : new Date().toISOString().split("T")[0],
            endDate: item.endDate ? item.endDate.split("T")[0] : item.date ? item.date.split("T")[0] : new Date().toISOString().split("T")[0],
            type: item.type as EventType,
            priority: item.priority as Priority,
            targetClass: item.targetClass || null,
            createdBy: item.createdBy || "Ban Giám Hiệu",
          }));
          setEvents(mapped);
        }
      })
      .catch((err) => console.error("Lỗi khi tải sự kiện từ DB:", err))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    loadEvents();
  }, []);

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
      (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = typeFilter === "ALL" || e.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện / thông báo này?")) {
      try {
        const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
        const result = await res.json();
        if (result.success) {
          setEvents(events.filter((item) => item.id !== id));
        } else {
          alert("Không thể xóa sự kiện: " + result.error);
        }
      } catch (err) {
        console.error("Lỗi khi xóa sự kiện:", err);
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title) return;

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: addForm.title,
          description: addForm.description,
          date: addForm.date,
          endDate: addForm.endDate || addForm.date,
          type: addForm.type,
          priority: addForm.priority,
          targetClass: addForm.targetClass || null,
          createdBy: "Ban Giám Hiệu",
        }),
      });

      const result = await res.json();
      if (result.success) {
        loadEvents();
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
      } else {
        alert("Lỗi khi tạo sự kiện: " + result.error);
      }
    } catch (err) {
      console.error("Lỗi khi tạo sự kiện:", err);
    }
  };


  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. ERP MODULE HEADER BANNER */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl text-white shadow-md shadow-amber-500/20 shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Lịch Sự Kiện & Bảng Thông Báo Trường
                </h1>
                <span className="text-xs font-extrabold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {events.length} sự kiện
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Đăng tải thông báo toàn trường, lên lịch nghỉ lễ và các hoạt động ngoại khóa cho học sinh & phụ huynh.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto justify-start sm:justify-end">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 w-full sm:w-auto">
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === "calendar" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Lịch tháng</span>
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-600/20 transition-all whitespace-nowrap w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tạo Sự Kiện Mới</span>
            </button>
          </div>
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
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
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
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Top Ribbon Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0" />

              <div className="flex justify-between items-start p-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/30">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">Tạo Thông Báo / Sự Kiện Mới</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Đăng tải tin tức lên bảng tin chung hoặc phân gửi theo nhóm lớp</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 pt-0 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Tiêu đề thông báo / sự kiện *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Họp phụ huynh đầu năm học mới..."
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Phân loại</label>
                    <select
                      value={addForm.type}
                      onChange={(e) => setAddForm({ ...addForm, type: e.target.value as EventType })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      <option value="EVENT">Sự kiện ngoại khóa</option>
                      <option value="ANNOUNCEMENT">Thông báo chung</option>
                      <option value="HOLIDAY">Nghỉ lễ / Nghỉ phép</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Mức độ ưu tiên</label>
                    <select
                      value={addForm.priority}
                      onChange={(e) => setAddForm({ ...addForm, priority: e.target.value as Priority })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      <option value="NORMAL">Bình thường</option>
                      <option value="IMPORTANT">Quan trọng</option>
                      <option value="URGENT">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Ngày bắt đầu</label>
                    <input
                      type="date"
                      required
                      value={addForm.date}
                      onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Ngày kết thúc</label>
                    <input
                      type="date"
                      value={addForm.endDate}
                      onChange={(e) => setAddForm({ ...addForm, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 block mb-1.5 uppercase tracking-wider">Nội dung chi tiết</label>
                  <textarea
                    rows={3}
                    placeholder="Nhập nội dung thông báo cho phụ huynh và giáo viên..."
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 text-slate-900 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all shadow-sm resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Lưu & Đăng thông báo
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
